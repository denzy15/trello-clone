import express from "express";
import {
  isAuth,
  isUserAdmin,
  isUserOnBoard,
  sendBoardUpdate,
} from "../utils.js";
import Board from "../models/board.js";
import User from "../models/user.js";
import Invitation from "../models/invitation.js";
import sse from "../sse.js";

const router = express.Router();

// Поиск приглашений пользователя
router.get("/", isAuth, async (req, res) => {
  try {
    const invitations = await Invitation.find({ invitedUser: req.user._id })
      .populate("inviter", "username email")
      .populate("board", "title");
    res.json(invitations.sort((a, b) => b.createdAt - a.createdAt));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Создание приглашения
router.post("/", isAuth, async (req, res) => {
  try {
    const { boardId, invitedUser } = req.body;

    const board = await Board.findById(boardId);

    if (!isUserAdmin(board, req.user._id)) {
      return res
        .status(403)
        .json({ message: "У вас нет прав приглашать пользователей" });
    }

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    const user = await User.findById(invitedUser);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    if (isUserOnBoard(board, user._id.toString())) {
      return res
        .status(400)
        .json({ message: "Пользователь уже является участником доски" });
    }

    const pendingInvitation = await Invitation.findOne({
      invitedUser: user._id,
      board: board._id,
      status: "pending",
    });

    if (!!pendingInvitation) {
      return res
        .status(400)
        .json({ message: "Приглашение данному пользователю уже отправлено" });
    }

    const invitation = await Invitation.create({
      board: boardId,
      invitedUser,
      inviter: req.user._id,
    });

    const SSEinvitation = await Invitation.findById(invitation._id)
      .populate("inviter", "username email")
      .populate("board", "title");

    sse.send(SSEinvitation, "invitation");

    res.json(invitation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Принятие приглашений
router.put("/accept", isAuth, async (req, res) => {
  try {
    const { boardId, invitationId } = req.body;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ message: "Приглашение не найдено" });
    }

    if (invitation.invitedUser.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "Вы не можете принять чужое приглашение" });
    }

    invitation.status = "accepted";

    if (board.users.includes(invitation.invitedUser)) {
      await invitation.save();
      return res
        .status(400)
        .json({ message: "Вы уже являетесь участником этой доски" });
    }

    board.users.push({
      role: "MEMBER",
      userId: invitation.invitedUser,
    });

    await board.save();
    await invitation.save();

    res.json(invitation);

    await sendBoardUpdate(boardId, req.user._id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Отклонение приглашения
router.put("/decline", isAuth, async (req, res) => {
  try {
    const { invitationId } = req.body;

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ message: "Приглашение не найдено" });
    }

    if (invitation.invitedUser.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "Вы не можете отклонить чужое приглашение" });
    }

    invitation.status = "declined";

    await invitation.save();

    res.json(invitation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Удаление приглашения
router.delete("/:invitationId", isAuth, async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ message: "Приглашение не найдено" });
    }

    if (invitation.invitedUser.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "Вы не можете удалить чужое приглашениe" });
    }

    await Invitation.deleteOne({ _id: invitationId });

    res.json(invitation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
