import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { generateToken } from "../utils.js";

const router = express.Router();

// Регистрация нового пользователя
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Проверка, что пользователь с таким email еще не зарегистрирован
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Пользователь с таким email уже зарегистрирован" });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Сохранение пользователя в базе данных
    await newUser.save();

    res.status(201).json({ message: "Пользователь успешно зарегистрирован" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Вход в систему
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя по email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email,
      token: generateToken(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
