import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

import { generateToken } from "../utils.js";

const router = express.Router();

// Регистрация нового пользователя
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || username.length < 3) {
      return res
        .status(400)
        .json({
          message: "Имя пользователя должно содержать минимум 3 символа",
        });
    }

    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Введите валидный email" });
    }

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Пароль должен содержать минимум 6 символов" });
    }

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

    const result = { ...user.toObject(), token: generateToken(user) };

    delete result.password;

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Запрос на восстановление пароля
router.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Пользователь с таким email не найден" });
  }

  const token = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;

  await user.save();

  const transporter = nodemailer.createTransport({
    host: "smtp.mail.ru",
    port: 465,
    secure: true,
    auth: {
      user: "dmirshanov@mail.ru",
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    to: email,
    from: "dmirshanov@mail.ru",
    subject: "Сброс пароля",
    html: `Вы получили это письмо, потому что вы (или кто-то другой) запросили сброс пароля для вашей учетной записи.<br><br>
           Пожалуйста, <a href="http://192.168.8.194:3000/reset/${token}">перейдите по следующей ссылке</a>, или вставьте ее в адресную строку вашего браузера, чтобы завершить процесс:<br><br>
           Если вы не запрашивали сброс пароля, проигнорируйте это письмо, и ваш пароль останется без изменений.`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json({
      message: "Письмо для сброса пароля отправлено на " + email + ".",
    });
  });
});

router.post("/reset/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Токен сброса пароля недействителен или истек" });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.status(200).json({ message: "Пароль успешно изменен" });
});

export default router;

// router.post("/forgotPassword", async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });

//   if (!user) {
//     return res
//       .status(400)
//       .json({ message: "Пользователь с таким email не найден" });
//   }

//   const token = crypto.randomBytes(20).toString("hex");
//   user.resetPasswordToken = token;
//   user.resetPasswordExpires = Date.now() + 3600000;

//   await user.save();

//   const transporter = nodemailer.createTransport({
//     host: "smtp.mail.ru",
//     port: 465,
//     secure: true,
//     auth: {
//       user: "mail@mail.ru",
//       pass: "password",
//     },
//   });

//   const mailOptions = {
//     to: email,
//     from: "mail@mail.ru",
//     subject: "Сброс пароля",
//     html: `Вы получили это письмо, потому что вы (или кто-то другой) запросили сброс пароля для вашей учетной записи.<br><br>
//            Пожалуйста, <a href="http://192.168.8.194:3000/reset/${token}">перейдите по следующей ссылке</a>, или вставьте ее в адресную строку вашего браузера, чтобы завершить процесс:<br><br>
//            Если вы не запрашивали сброс пароля, проигнорируйте это письмо, и ваш пароль останется без изменений.`,
//   };

//   transporter.sendMail(mailOptions, (err) => {
//     if (err) return res.status(500).json({ message: err.message });
//     res.status(200).json({
//       message: "Письмо для сброса пароля отправлено на " + email + ".",
//     });
//   });
// });
