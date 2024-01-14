import express from "express";
import Board from "../models/board.js";
import { isAuth } from "../utils.js";

const router = express.Router();

// Получение списка всех досок
router.get("/", isAuth, async (req, res) => {
  try {
    const userId = req.user._id; // ID пользователя из информации о пользователе

    const boards = await Board.find({
      $or: [{ creator: userId }, { users: userId }],
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

// Получение информации о конкретной доске
router.get("/:boardId", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (
      board.creator.toString() !== req.user._id &&
      !board.users.includes(req.user._id)
    ) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к этой доске" });
    }

    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Изменение названия и описания доски
router.put("/:boardId", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description } = req.body;

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

    const updatedBoard = await Board.findByIdAndUpdate(
      boardId,
      { title, description },
      { new: true }
    );

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

    if (Object.keys(label).length !== 2 || !label.title || !label.color) {
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

    board.labels.push(label);
    await board.save();

    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.put("/:boardId/delete-label", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { label } = req.body;

    if (Object.keys(label).length !== 2 || !label.title || !label.color) {
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
    await board.save();

    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
