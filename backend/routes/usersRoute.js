import express from "express";
import { isAuth } from "../utils.js";
import User from "../models/user.js";
import Invitation from "../models/invitation.js";

const router = express.Router();

// Получение всех пользователей
router.get("/", isAuth, async (req, res) => {
  const { search } = req.query;
  try {
    if (!!search) {
      const users = await User.find(
        {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
        "-password"
      );

      res.json(users);
    } else res.status(404).json({ message: "Не найдено" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/notifications", isAuth, async (req, res) => {
  try {
    const invitations = await Invitation.find({ invitedUser: req.user._id })
      .populate("inviter", "username email")
      .populate("board", "title");
    // .populate("invitedUser", "username email");

    res.json(invitations.sort((a, b) => b.createdAt - a.createdAt));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
