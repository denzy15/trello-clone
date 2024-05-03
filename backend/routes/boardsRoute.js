import express from "express";
import Board from "../models/board.js";
import List from "../models/list.js";
import Card from "../models/card.js";
import {
  createDirectories,
  decodeString,
  deleteFile,
  isAuth,
  isUserAdmin,
  isUserOnBoard,
  sendBoardUpdate,
} from "../utils.js";
import sse from "../sse.js";
import multer from "multer";
import { fileURLToPath } from "url";
import path from "path";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename).slice(0, -7);

const boardBackgroundStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const boardId = req.params.boardId;
    const dirPath = path.join(__dirname, "backgrounds", boardId);

    try {
      await createDirectories(dirPath);
      cb(null, dirPath);
    } catch (error) {
      cb(error);
    }

    // fs.access(dirPath, (error) => {
    //   if (error) {
    //     return fs.mkdir(dirPath, { recursive: true }, (error) =>
    //       cb(error, dirPath)
    //     );
    //   }
    //   return cb(null, dirPath);
    // });
  },
  filename: function (req, file, cb) {
    const timestamp = new Date().getTime();
    const decodedFilename = decodeString(file.originalname);

    cb(null, `${timestamp}_${decodedFilename}`);
  },
});

const uploadBoardBackground = multer({ storage: boardBackgroundStorage });

// Получение списка всех досок
router.get("/", isAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const boards = await Board.find({
      $or: [{ creator: userId }, { users: { $elemMatch: { userId: userId } } }],
    })
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
      .lean()
      .exec();

    // Преобразование данных пользователей для каждой доски
    const formattedBoards = boards.map((board) => {
      const formattedUsers = board.users.map((user) => ({
        _id: user.userId._id,
        role: user.role,
        username: user.userId.username,
        email: user.userId.email,
      }));

      return {
        ...board,
        users: formattedUsers,
      };
    });

    // Отправка преобразованных данных
    res.json(formattedBoards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Создание новой доски
router.post("/", isAuth, async (req, res) => {
  try {
    const { title } = req.body; // Предполагается, что данные передаются в теле запроса

    const labels = [];

    labels.push(
      {
        color: "#4bce97",
        title: "",
      },
      {
        color: "#f5cd47",
        title: "",
      },
      {
        color: "#f87168",
        title: "",
      },
      {
        color: "#579dff",
        title: "",
      },
      {
        color: "#579dff",
        title: "",
      }
    );

    // Создаем доску, указывая создателя из информации о пользователе
    const newBoard = await Board.create({
      title,
      creator: req.user._id,
      labels,
    });

    res.status(201).json(newBoard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Удаление доски
router.delete("/:boardId", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    // Проверяем доступ пользователя к доске перед удалением
    if (!isUserAdmin(board, req.user._id)) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к удалению этой доски" });
    }

    // Получаем все списки на доске
    const lists = await List.find({ _id: { $in: board.lists } });

    // Получаем все ID карточек в этих списках
    const cardIds = lists.reduce((acc, list) => [...acc, ...list.cards], []);

    // Удаляем все карточки, которые принадлежат спискам на доске
    await Card.deleteMany({ _id: { $in: cardIds } });

    // Удаляем все списки на доске
    await List.deleteMany({ _id: { $in: board.lists } });

    // Удаляем саму доску
    await Board.deleteOne({ _id: boardId });

    res.json({ message: "Доска и все ее списки и карточки успешно удалены" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Получение полной информации о конкретной доске
router.get("/:boardId", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;

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

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (!isUserOnBoard(board, req.user._id)) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к этой доске" });
    }

    const formattedUsers = board.users.map((user) => ({
      _id: user.userId._id,
      role: user.role,
      username: user.userId.username,
      email: user.userId.email,
    }));

    board.users = formattedUsers;

    board.lists.sort((a, b) => a.order - b.order);

    board.lists.forEach((list) => {
      list.cards.sort((a, b) => a.order - b.order);
    });

    res.json(board);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Изменение названия и описания доски
router.put("/:boardId", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description, labels } = req.body;

    let board = await Board.findById(boardId)
      .populate("users.userId", "username email")
      .exec();

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    // Проверяем доступ пользователя к этой доске перед изменением
    if (!isUserAdmin(board, req.user._id)) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к изменению этой доски" });
    }

    // Обновление данных доски
    board.title = title || board.title;
    board.description = description || board.description;
    board.labels = labels || board.labels;

    await board.save();

    // Форматирование пользователей для отправки
    const formattedUsers = board.users.map((user) => ({
      _id: user.userId._id,
      role: user.role,
      username: user.userId.username,
      email: user.userId.email,
    }));

    // Отправка данных доски с отформатированными пользователями
    res.json({
      ...board.toObject(), // Преобразование документа Mongoose в объект
      users: formattedUsers,
    });

    sse.send(
      {
        ...board.toObject(), // Преобразование документа Mongoose в объект
        users: formattedUsers,
      },
      "boardUpdate"
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

//Покинуть доску
router.put("/:boardId/leave", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findById(boardId).populate("lists").exec();

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (!isUserOnBoard(board, req.user._id)) {
      return res
        .status(403)
        .json({ message: "Вы не являетесь участником данной доски" });
    }

    board.users = board.users.filter(
      (u) => u.userId.toString() !== req.user._id
    );

    for (const list of board.lists) {
      for (const cardId of list.cards) {
        const card = await Card.findById(cardId);
        card.assignedUsers = card.assignedUsers.filter(
          (u) => u._id.toString() !== req.user._id
        );
        await card.save();
      }
    }

    await board.save();

    res.json({ message: `Вы успешно покинули доску ` });
    await sendBoardUpdate(boardId, req.user._id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Кикнуть пользователя
router.put("/:boardId/kick-user", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { userId } = req.body;

    const board = await Board.findById(boardId)
      .populate("lists")
      .populate("users.userId", "username email")
      .exec();

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (!isUserAdmin(board, req.user._id)) {
      return res
        .status(403)
        .json({ message: "У вас нет прав удалять участников доски" });
    }

    if (board.creator.toString() === userId) {
      return res
        .status(403)
        .json({ message: "Вы не можете удалить админа с доски" });
    }

    board.users = board.users.filter((u) => u.userId._id.toString() !== userId);

    for (const list of board.lists) {
      for (const cardId of list.cards) {
        const card = await Card.findById(cardId);
        card.assignedUsers = card.assignedUsers.filter(
          (u) => u._id.toString() !== userId
        );
        await card.save();
      }
    }

    await board.save();

    const formattedUsers = board.users.map((user) => ({
      _id: user.userId._id,
      role: user.role,
      username: user.userId.username,
      email: user.userId.email,
    }));

    res.json(formattedUsers);

    sse.send({ userId, boardId, boardTitle: board.title }, "kickUser");
    await sendBoardUpdate(boardId, req.user._id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

//Изменить роль пользователя
router.put("/:boardId/change-user-role", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { userId, newRole } = req.body;

    const board = await Board.findById(boardId).populate(
      "users.userId",
      "username email"
    );

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (!isUserAdmin(board, req.user._id)) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к изменению ролей" });
    }

    for (const user of board.users) {
      if (user.userId._id.toString() === userId) {
        if (
          user.role === "ADMIN" &&
          newRole === "USER" &&
          req.user._id !== board.creator._id
        ) {
          return res.status(403).json({
            message: "Вы не можете сделать другого администратора участником",
          });
        }

        user.role = newRole;
        break;
      }
    }

    await board.save();

    const formattedUsers = board.users.map((user) => ({
      _id: user.userId._id,
      role: user.role,
      username: user.userId.username,
      email: user.userId.email,
    }));

    res.json(formattedUsers);
    await sendBoardUpdate(boardId, req.user._id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.put("/:boardId/add-label", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { label } = req.body;

    if (
      Object.keys(label).length !== 2 ||
      (!label.title && label.title !== "") ||
      !label.color
    ) {
      return res.status(400).json({ message: "Неверные данные метки" });
    }

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (!isUserOnBoard(board, req.user._id)) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к изменению этой доски" });
    }

    delete label._id;

    board.labels.push(label);
    await board.save();

    res.json(board.labels.pop());
    await sendBoardUpdate(boardId, req.user._id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.put("/:boardId/update-label", isAuth, async (req, res) => {
  try {
    debugger;
    const { boardId } = req.params;
    const { label } = req.body;

    if (
      Object.keys(label).length !== 3 ||
      (!label.title && label.title !== "") ||
      !label.color
    ) {
      return res.status(400).json({ message: "Неверные данные метки" });
    }

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (!isUserOnBoard(board, req.user._id)) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к изменению этой доски" });
    }

    board.labels = board.labels.map((lbl) =>
      lbl._id.toString() === label._id ? label : lbl
    );

    const listIds = board.lists;
    const lists = await List.find({ _id: { $in: listIds } });
    const cardIds = lists.flatMap((list) => list.cards);
    const cards = await Card.find({ _id: { $in: cardIds } });

    for (const card of cards) {
      card.labels = card.labels.map((l) =>
        l._id.toString() === label._id ? label : l
      );
      await card.save();
    }

    await board.save();
    res.json(board.labels);
    await sendBoardUpdate(boardId, req.user._id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.put("/:boardId/delete-label", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { label } = req.body;

    if (
      Object.keys(label).length !== 3 ||
      (!label.title && label.title !== "") ||
      !label.color
    ) {
      return res.status(400).json({ message: "Неверные данные метки" });
    }

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (!isUserOnBoard(board, req.user._id)) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к изменению этой доски" });
    }

    board.labels = board.labels.filter((lbl) => lbl.title !== label.title);

    const listIds = board.lists;
    const lists = await List.find({ _id: { $in: listIds } });
    const cardIds = lists.flatMap((list) => list.cards);
    const cards = await Card.find({ _id: { $in: cardIds } });

    for (const card of cards) {
      card.labels = card.labels.filter((l) => l._id.toString() !== label._id);
      await card.save();
    }

    await board.save();

    res.json(board);
    await sendBoardUpdate(boardId, req.user._id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Загрузка пользовательского фона
router.post(
  "/:boardId/upload-background",
  isAuth,
  uploadBoardBackground.single("background"),
  async (req, res) => {
    try {
      const { boardId } = req.params;
      const file = req.file;

      const board = await Board.findById(boardId);

      if (!board) {
        return res.status(404).json({ message: "Доска не найдена" });
      }

      if (!isUserAdmin(board, req.user._id)) {
        return res.status(403).json({
          message:
            "У вас нет доступа к изменению данных карточек в этом списке",
        });
      }

      const relativePath = path.join("backgrounds", boardId, file.filename);

      const background = {
        path: relativePath.replace(/\\/g, "/"),
        name: decodeString(file.originalname),
      };

      board.backgrounds.push(background);
      await board.save();

      res.send(board.backgrounds);
      await sendBoardUpdate(boardId, req.user._id);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
);

// Изменение фона доски
router.put("/:boardId/change-background", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { backgroundPath } = req.body;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (!isUserOnBoard(board, req.user._id)) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к изменению этой доски" });
    }

    board.currentBackground = backgroundPath;

    await board.save();

    res.json({ message: "Фон изменён" });
    await sendBoardUpdate(boardId, req.user._id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Удаление фона
router.put("/:boardId/delete-background", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { background } = req.body;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (!isUserOnBoard(board, req.user._id)) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к изменению этой доски" });
    }

    board.backgrounds = board.backgrounds.filter(
      (b) => b._id.toString() !== background._id
    );

    const filePath = path.join(__dirname, background.path);
    await deleteFile(filePath);

    if (board.currentBackground === background.path) {
      board.currentBackground = "backgrounds/common/snow.svg";
    }

    await board.save();

    res.json({
      backgrounds: board.backgrounds,
      newbg: board.currentBackground,
    });
    await sendBoardUpdate(boardId, req.user._id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
