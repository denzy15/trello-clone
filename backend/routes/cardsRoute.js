import express from "express";
import {
  createDirectories,
  decodeString,
  deleteFile,
  isAuth,
} from "../utils.js";
import Board from "../models/board.js";
import List from "../models/list.js";
import Card from "../models/card.js";
import User from "../models/user.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename).slice(0, -7);

const router = express.Router();

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const boardId = req.params.boardId;
    const dirPath = path.join(__dirname, "uploads", boardId);

    // Создаем директории при их отсутствии
    try {
      await createDirectories(dirPath);
      cb(null, dirPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const timestamp = new Date().getTime();
    const decodedFilename = decodeString(file.originalname);

    cb(null, `${timestamp}_${decodedFilename}`);
  },
});

const upload = multer({ storage });

// Поиск всех карточек доски
router.get("/:boardId", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    // Проверяем доступ пользователя к этой доске перед получением карточек
    if (
      board.creator.toString() !== req.user._id &&
      !board.users.includes(req.user._id)
    ) {
      return res.status(403).json({
        message: "У вас нет доступа к просмотру карточек на этой доске",
      });
    }

    // const cards = [];
    // for (const listId of board.lists) {
    //   const list = await List.findById(listId);
    //   if (list) {
    //     for (const cardId of list.cards) {
    //       cards.push(await Card.findById(cardId));
    //     }
    //   }
    // }

    const listIds = board.lists; // Получаем массив ID листов
    const lists = await List.find({ _id: { $in: listIds } }); // Находим все листы в одном запросе

    const cardIds = lists.flatMap((list) => list.cards); // Получаем массив ID карточек
    const cards = await Card.find({ _id: { $in: cardIds } });

    res.json(cards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

//Получение информации о карточке
router.get("/:boardId/:cardId", isAuth, async (req, res) => {
  try {
    const { boardId, cardId } = req.params;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    // Проверяем доступ пользователя к этой доске перед получением карточек
    if (
      board.creator.toString() !== req.user._id &&
      !board.users.includes(req.user._id)
    ) {
      return res.status(403).json({
        message: "У вас нет доступа к просмотру карточек на этой доске",
      });
    }

    const card = await Card.findById(cardId)
      .populate("assignedUsers", "username email _id")
      .populate("attachments.creator", "username email _id")
      .exec();

    res.json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Добавление карточки в определенный список
router.post("/:boardId/:listId/", isAuth, async (req, res) => {
  try {
    const { boardId, listId } = req.params;
    const { title } = req.body;

    const board = await Board.findById(boardId);
    const list = await List.findById(listId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (!list) {
      return res.status(404).json({ message: "Список не найден" });
    }

    // Проверяем доступ пользователя к этой доске и списку перед добавлением карточки
    if (
      board.creator.toString() !== req.user._id &&
      !board.users.includes(req.user._id)
    ) {
      return res.status(403).json({
        message: "У вас нет доступа к добавлению карточек в этот список",
      });
    }

    // Создаем новую карточку и добавляем в список
    const newCard = await Card.create({ title, order: list.cards.length });
    list.cards.push(newCard._id);
    await list.save();

    res.status(201).json(newCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Удаление карточки из списка на доске
router.delete("/:boardId/:listId/:cardId", isAuth, async (req, res) => {
  try {
    const { boardId, listId, cardId } = req.params;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (
      board.creator.toString() !== req.user._id &&
      !board.users.includes(req.user._id)
    ) {
      return res.status(403).json({
        message: "У вас нет доступа к удалению карточек из этого списка",
      });
    }

    const list = await List.findById(listId);

    if (!list) {
      return res.status(404).json({ message: "Список не найден" });
    }

    const card = await Card.findById(cardId);

    if (!card) {
      return res.status(404).json({ message: "Карточка не найдена" });
    }

    const deletedCardOrder = card.order;

    list.cards = list.cards.filter((c) => c._id.toString() !== cardId);

    for (const cardId of list.cards) {
      const remainingCard = await Card.findById(cardId);
      if (remainingCard && remainingCard.order > deletedCardOrder) {
        remainingCard.order--;
        await remainingCard.save();
      }
    }

    await Card.deleteOne(card);
    await list.save();

    res.json({ message: "Карточка успешно удалена" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Изменение списка, в котором находится карточка
router.put("/:boardId/:cardId/move", isAuth, async (req, res) => {
  try {
    const { boardId, cardId } = req.params;
    const { from, to, newOrder } = req.body;

    if (from === to) {
      return res
        .status(400)
        .json({ message: "Карточка уже находится в этом списке" });
    }

    const board = await Board.findById(boardId);
    const sourceList = await List.findById(from);
    const assignedList = await List.findById(to);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (
      board.creator.toString() !== req.user._id &&
      !board.users.includes(req.user._id)
    ) {
      return res.status(403).json({
        message: "У вас нет доступа к перемещению карточек на этой доске",
      });
    }

    const card = await Card.findById(cardId);

    if (!card) {
      return res.status(404).json({ message: "Карточка не найдена" });
    }

    sourceList.cards = sourceList.cards.filter(
      (sourceListCardId) => sourceListCardId.toString() !== cardId
    );

    const targetOrder = parseInt(newOrder);

    if (isNaN(targetOrder)) {
      return res.status(400).json({ message: "Некорректный новый порядок" });
    }

    const sourceCards = await Card.find({ _id: { $in: sourceList.cards } });

    // Сортируем объекты карточек по порядку
    sourceCards
      .sort((a, b) => a.order - b.order)
      .forEach(async (sourceCard, idx) => {
        sourceCard.order = idx;
        await sourceCard.save();
      });

    // Обновляем массив ID карточек в списках
    sourceList.cards = sourceCards.map((card) => card._id);

    for (const assignedCardId of assignedList.cards) {
      const assignedCard = await Card.findById(assignedCardId);
      if (assignedCard) {
        if (assignedCard.order >= targetOrder) {
          assignedCard.order++;
          await assignedCard.save();
        }
      }
    }

    card.order = assignedList.cards.length === 0 ? 0 : targetOrder;

    assignedList.cards.push(cardId);

    await card.save();
    await sourceList.save();
    await assignedList.save();

    res.json({ message: "Карточка успешно перемещена в новый список" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Изменение порядка внутри списка
router.put("/:boardId/:cardId/change-order", isAuth, async (req, res) => {
  try {
    const { boardId, cardId } = req.params;
    const { newOrder } = req.body;
    const { listId } = req.query;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    // Проверяем доступ пользователя к этой доске перед перемещением карточки
    if (
      board.creator.toString() !== req.user._id &&
      !board.users.includes(req.user._id)
    ) {
      return res.status(403).json({
        message: "У вас нет доступа к перемещению карточек на этой доске",
      });
    }

    const list = await List.findById(listId);

    if (!list) {
      return res.status(404).json({ message: "Список не найден" });
    }

    const card = await Card.findById(cardId);

    if (!card) {
      return res.status(404).json({ message: "Карточка не найдена" });
    }

    const targetOrder = parseInt(newOrder);

    if (isNaN(targetOrder)) {
      return res.status(400).json({ message: "Некорректный новый порядок" });
    }

    for (const cardIdToUpdate of list.cards) {
      const cardToUpdate = await Card.findById(cardIdToUpdate);

      if (!cardToUpdate)
        return res.status(404).json({ message: "Что то пошло не так" });

      if (card.order < targetOrder) {
        if (
          card.order < cardToUpdate.order &&
          cardToUpdate.order <= targetOrder
        ) {
          cardToUpdate.order--;
          await cardToUpdate.save();
        }
      } else {
        if (
          cardToUpdate.order >= targetOrder &&
          card.order > cardToUpdate.order
        ) {
          cardToUpdate.order++;
          await cardToUpdate.save();
        }
      }
    }

    card.order = targetOrder;

    await card.save();
    await list.save();

    res.json({ message: "Порядок изменён успешно" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Изменение списка пользователей
router.put("/:boardId/:cardId/users", isAuth, async (req, res) => {
  try {
    const { boardId, cardId } = req.params;
    const { type, userId } = req.body;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (
      board.creator.toString() !== req.user._id &&
      !board.users.includes(req.user._id)
    ) {
      return res.status(403).json({
        message: "У вас нет доступа к изменению данных карточек в этом списке",
      });
    }

    const updatedCard = await Card.findById(cardId);
    if (!updatedCard) {
      return res.status(404).json({ message: "Карточка не найдена" });
    }

    const user = await User.findById(userId);

    if (type === "add") {
      if (updatedCard.assignedUsers.some((uId) => uId.toString() === userId)) {
        return res
          .status(400)
          .json({ message: "Пользователь уже добавлен в список" });
      }
      updatedCard.assignedUsers.push(user._id);
    } else if (type === "remove") {
      updatedCard.assignedUsers = updatedCard.assignedUsers.filter(
        (u) => u._id.toString() !== userId
      );
    }

    await updatedCard.save();
    res.json(updatedCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.put(
  "/:boardId/:cardId/remove-deleted-label",
  isAuth,
  async (req, res) => {
    try {
      const { boardId, cardId } = req.params;
      const { label } = req.body;

      const board = await Board.findById(boardId);

      if (!board) {
        return res.status(404).json({ message: "Доска не найдена" });
      }

      if (
        board.creator.toString() !== req.user._id &&
        !board.users.includes(req.user._id)
      ) {
        return res.status(403).json({
          message:
            "У вас нет доступа к изменению данных карточек в этом списке",
        });
      }

      // Удаляем метку label из каждой карточки, если она есть
      for (const list of board.lists) {
        for (const card of list.cards) {
          if (card._id.toString() === cardId) {
            const updatedLabels = card.labels.filter(
              (lbl) => lbl.title !== label.title
            );
            card.labels = updatedLabels;
            await card.save();
          }
        }
      }

      res.status(200).json({ message: "Метка успешно удалена из карточки" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
);

// Обновление данных о карточке
router.put("/:boardId/:cardId", isAuth, async (req, res) => {
  try {
    const { boardId, cardId } = req.params;
    const {
      title,
      description,
      dueDate,
      attachments,
      assignedUsers,
      labels,
      startDate,
    } = req.body;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (
      board.creator.toString() !== req.user._id &&
      !board.users.includes(req.user._id)
    ) {
      return res.status(403).json({
        message: "У вас нет доступа к изменению данных карточек в этом списке",
      });
    }

    // Изменяем данные карточки
    const updatedCard = await Card.findById(cardId);
    updatedCard.title = title || updatedCard.title;
    updatedCard.description = description || updatedCard.description;
    updatedCard.attachments = attachments || updatedCard.attachments;
    updatedCard.assignedUsers = assignedUsers || updatedCard.assignedUsers;
    updatedCard.labels = labels || updatedCard.labels;
    updatedCard.startDate =
      startDate !== undefined ? startDate : updatedCard.startDate;
    updatedCard.dueDate = dueDate !== undefined ? dueDate : updatedCard.dueDate;

    await updatedCard.save();

    const card = await Card.findById(cardId)
      .populate("assignedUsers", "username email _id")
      .populate("attachments.creator", "username email _id")
      .exec();

    res.json(card);

    // res.json(updatedCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Загрузка файлов
router.post(
  "/:boardId/:cardId/upload-files",
  isAuth,
  upload.single("file"),
  async (req, res) => {
    try {
      const { boardId, cardId } = req.params;
      const file = req.file;

      const board = await Board.findById(boardId);

      if (!board) {
        return res.status(404).json({ message: "Доска не найдена" });
      }

      if (
        board.creator.toString() !== req.user._id &&
        !board.users.includes(req.user._id)
      ) {
        return res.status(403).json({
          message:
            "У вас нет доступа к изменению данных карточек в этом списке",
        });
      }

      const updatedCard = await Card.findById(cardId);

      const uploadsPath = path.join(__dirname, "uploads");
      const relativePath = path.relative(uploadsPath, file.path);

      updatedCard.attachments.push({
        createdAt: Date.now(),
        type: file.mimetype,
        path: relativePath,
        creator: req.user._id,
        name: decodeString(file.originalname),
      });

      updatedCard.attachments.sort((a, b) => b.createdAt - a.createdAt);

      await updatedCard.save();

      res.json(updatedCard.attachments[updatedCard.attachments.length - 1]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
);

//Переименовать файл вложения
router.put("/:boardId/:cardId/attach", isAuth, async (req, res) => {
  try {
    const { boardId, cardId } = req.params;
    const { attachId, name } = req.body;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (
      board.creator.toString() !== req.user._id &&
      !board.users.includes(req.user._id)
    ) {
      return res.status(403).json({
        message: "У вас нет доступа к изменению данных карточек в этом списке",
      });
    }

    const updatedCard = await Card.findById(cardId);

    const idx = updatedCard.attachments.findIndex(
      (att) => att._id.toString() === attachId
    );
    if (idx === -1) {
      return res.status(404).json({ message: "Вложение не найдено" });
    }

    if (!name) {
      const filePath = path.join(
        __dirname,
        "uploads",
        updatedCard.attachments[idx].path
      );
      await deleteFile(filePath);
      updatedCard.attachments.splice(idx, 1);
    } else {
      updatedCard.attachments[idx].name = name;
    }

    await updatedCard.save();

    const card = await Card.findById(cardId)
      .populate("assignedUsers", "username email _id")
      .populate("attachments.creator", "username email _id")
      .exec();

    res.json(card);

    // res.json(updatedCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
