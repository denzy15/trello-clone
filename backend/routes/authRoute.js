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
    const user = await User.findOne({ email }).populate([
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

    if (!user) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    // const result = await User.findById(user._id, "-password").populate(
    //   "invitations"
    // );

    const result = { ...user.toObject(), token: generateToken(user) };

    delete result.password;

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
