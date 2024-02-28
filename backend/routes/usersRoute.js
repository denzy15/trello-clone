import express from "express";
import { convertUsersResponse, isAuth } from "../utils.js";
import User from "../models/user.js";

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
    const user = await User.findById(req.user._id).populate([
      {
        path: "invitations",
        populate: [
          {
            path: "board",
            select: "title",
          },
          {
            path: "inviter",
            select: "username email",
          },
        ],
      },
    ]);

    res.json(user.invitations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
