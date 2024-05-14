import express from "express";
import { isAuth } from "../utils.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

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


router.put("/:userId", isAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const { password, username, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    if (user._id.toString() !== req.user._id) {
      return res.status(403).json({ message: "Нет доступа" });
    }

    if (!!username) {
      user.username = username;
      await user.save();
      return res.json({ message: "Имя пользователя успешно обновлено" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Неверный пароль" });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = newHashedPassword;

    await user.save();

    res.json({ message: "Пароль успешно обновлён" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});
export default router;
