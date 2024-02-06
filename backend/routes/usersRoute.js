import express from "express";
import { convertUsersResponse, isAuth } from "../utils.js";
import User from "../models/user.js";

const router = express.Router();

// Получение всех пользователей
router.get("/", isAuth, async (req, res) => {
  const { search } = req.query;
  try {
    if (!!search) {
      const users = await User.find({
        $or: [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      });

      res.json(users);
    }
    res.status(404).json({ message: "Не найдено" });
    //   const { email, userId } = req.query;

    //   if (userId) {
    //     // Поиск пользователя по id
    //     const userById = await User.findById(userId);

    //     if (!userById) {
    //       return res.status(404).json({ message: "Пользователь не найден" });
    //     }

    //     res.json(convertUsersResponse(userById));
    //   } else if (email) {
    //     // Поиск пользователей по email
    //     const usersByEmail = await User.find({
    //       email: { $regex: new RegExp(email, "i") },
    //     });
    //     if (!usersByEmail) {
    //       return res.status(404).json({ message: "Пользователь не найден" });
    //     }
    //     res.json(convertUsersResponse(usersByEmail));
    //   } else {
    // const allUsers = await User.find();
    // res.json(convertUsersResponse(allUsers));
    // }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
