import fs from "fs";
import jwt from "jsonwebtoken";
import Board from "./models/board.js";
import sse from "./sse.js";

// Функция для генерации JWT токена
export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

// Middleware для проверки авторизации пользователя
export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Берем токен без 'Bearer '
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          res.status(403).send({ message: "Срок действия токена истек" });
        } else {
          res.status(401).send({ message: "Неверный токен" });
        }
      } else {
        req.user = decode; // Декодируем токен и сохраняем данные пользователя в req.user
        next();
      }
    });
  } else {
    res.status(401).send({ message: "Не авторизован" });
  }
};

// Функция для конвертации данных пользователя в нужный формат
export const convertUsersResponse = (userData) => {
  if (Array.isArray(userData)) {
    return userData.map((user) => {
      const { username, email, _id } = user;
      return { _id, username, email };
    });
  }

  const { username, email, _id } = userData;
  return { _id, username, email };
};

// Функция для создания директорий
export const createDirectories = (dirPath) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(dirPath, { recursive: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Функция для декодирования строки
export const decodeString = (str) => {
  const byteArray = Array.from(str).map((char) => char.charCodeAt(0));
  const decodedString = new TextDecoder("utf-8").decode(
    new Uint8Array(byteArray)
  );

  return decodedString;
};

// Функция для удаления файла
export const deleteFile = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    console.error(`Ошибка при удалении файла ${filePath}: ${error}`);
    throw error;
  }
};

// Функция для проверки, является ли пользователь администратором доски
export const isUserAdmin = (board, reqUserId) => {
  if (board.creator._id.toString() === reqUserId) return true;

  const u = board.users.find(
    (user) => user.userId._id.toString() === reqUserId
  );

  if (u && u.role === "ADMIN") return true;

  return false;
};

// Функция для проверки, находится ли пользователь на доске
export const isUserOnBoard = (board, reqUserId) => {
  return (
    board.users.some((user) => user.userId._id.toString() === reqUserId) ||
    board.creator._id.toString() === reqUserId
  );
};

// Функция для отправки обновления доски через SSE
export const sendBoardUpdate = async (boardId, initiator) => {
  const board = await Board.findById(boardId)
    .populate("creator", "username email")
    .populate("users.userId", "username email")
    .populate({
      path: "lists",
      populate: {
        path: "cards",
        populate: [
          {
            path: "assignedUsers",
          },
          {
            path: "attachments.creator",
            select: "username email _id",
          },
          {
            path: "comments.author",
            select: "username email _id",
          },
        ],
      },
    })
    .lean();

  // Форматируем пользователей
  const formattedUsers = board.users.map((user) => ({
    _id: user.userId._id,
    role: user.role,
    username: user.userId.username,
    email: user.userId.email,
  }));

  board.users = formattedUsers;

  // Сортируем списки и карточки внутри них
  board.lists.sort((a, b) => a.order - b.order);
  board.lists.forEach((list) => {
    list.cards.sort((a, b) => a.order - b.order);
  });

  // Отправляем обновление доски через SSE
  sse.send({ boardId, board, initiator }, "boardUpdate");
};
