import express from "express";
import { isAuth } from "../utils.js";
import Board from "../models/board.js";
import User from "../models/user.js";
import Invitation from "../models/invitation.js";

const router = express.Router();

router.post("/", isAuth, async (req, res) => {
  try {
    const { boardId, invitedUser } = req.body;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    const user = await User.findById(invitedUser);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const invitation = await Invitation.create({
      board: boardId,
      invitedUser,
      inviter: req.user._id,
    });

    user.invitations.push(invitation._id);
    await user.save();

    res.json(invitation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.put("/accept", isAuth, async (req, res) => {
  try {
    const { boardId, invitationId } = req.body;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    const invitation = await Invitation.findById(invitationId);

    if (invitation.invitedUser.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "Вы не можете изменить статус приглашения" });
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.put("/decline", isAuth, async (req, res) => {
  try {
    const { invitationId } = req.body;

    const invitation = await Invitation.findById(invitationId);

    if (invitation.invitedUser.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "Вы не можете изменить статус приглашения" });
    }

    invitation.status = "declined";

    await invitation.save();

    res.json(invitation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.delete("/:invitationId", isAuth, async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await Invitation.findById(invitationId);

    if (invitation.invitedUser.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "Вы не можете удалить приглашениe" });
    }

    await Invitation.deleteOne({ _id: invitationId });

    res.json(invitation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
