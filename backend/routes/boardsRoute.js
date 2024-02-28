import express from "express";
import Board from "../models/board.js";
import List from "../models/list.js";
import Card from "../models/card.js";
import { isAuth } from "../utils.js";

const router = express.Router();

// Получение списка всех досок
router.get("/", isAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const boards = await Board.find({
      $or: [{ creator: userId }, { users: { $elemMatch: { userId: userId } } }],
    });

    res.json(boards);
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
    if (board.creator.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к удалению этой доски" });
    }

    const deletedBoard = await Board.findByIdAndDelete(boardId);

    res.json(deletedBoard);
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
      .populate("creator", "username email") // Популируем создателя доски и выбираем только username
      .populate("users", "username email")
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

      .exec();

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    const isUserInBoard = board.users.some(
      (user) => user._id.toString() === req.user._id
    );

    if (board.creator._id.toString() !== req.user._id && !isUserInBoard) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к этой доске" });
    }

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

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    // Проверяем доступ пользователя к этой доске перед изменением
    if (board.creator.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к изменению этой доски" });
    }

    const updatedBoard = await Board.findByIdAndUpdate(boardId);
    updatedBoard.title = title || updatedBoard.title;
    updatedBoard.description = description || updatedBoard.description;
    updatedBoard.labels = labels || updatedBoard.labels;

    await updatedBoard.save();
    // const updatedBoard = await Board.findByIdAndUpdate(
    //   boardId,
    //   { title, description },
    //   { new: true }
    // );

    res.json(updatedBoard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Изменить список пользователей
router.put("/:boardId/users", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { users } = req.body;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (board.creator.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к изменению этой доски" });
    }

    board.users = users;
    await board.save();

    res.json(board);
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

    if (board.creator.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к изменению этой доски" });
    }

    delete label._id;

    board.labels.push(label);
    await board.save();

    res.json(board.labels.pop());
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

    if (board.creator.toString() !== req.user._id) {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.put("/:boardId/delete-label", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { label } = req.body;

    // console.log(label);

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

    if (board.creator.toString() !== req.user._id) {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
