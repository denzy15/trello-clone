import fs from "fs";
import jwt from "jsonwebtoken";
("jsonwebtoken");

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

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length);
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          res.status(403).send({ message: "Срок действия токена истек" });
        } else {
          res.status(401).send({ message: "Неверный токен" });
        }
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: "Не авторизован" });
  }
};

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

export const decodeString = (str) => {
  const byteArray = Array.from(str).map((char) => char.charCodeAt(0));
  const decodedString = new TextDecoder("utf-8").decode(
    new Uint8Array(byteArray)
  );

  return decodedString;
};

export const deleteFile = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    console.error(`Ошибка при удалении файла ${filePath}: ${error}`);
    throw error;
  }
};

export const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

export const isUserAdmin = (board, reqUserId) => {
  if (board.creator._id.toString() === reqUserId) return true;

  const u = board.users.find(
    (user) => user.userId._id.toString() === reqUserId
  );

  if (u && u.role === "ADMIN") return true;

  return false;

  // return (
  //   board.users.find((user) => user.userId._id.toString() === reqUserId)
  //     .role === "ADMIN" || board.creator._id.toString() === reqUserId
  // );
};

export const isUserOnBoard = (board, reqUserId) => {
  return (
    board.users.some((user) => user.userId._id.toString() === reqUserId) ||
    board.creator._id.toString() === reqUserId
  );
};
