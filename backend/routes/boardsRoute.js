import express from "express";
import Board from "../models/board.js"; // Путь к модели доски
import { isAuth } from "../utils.js";
const router = express.Router();

// Создание новой доски
router.post("/", isAuth, async (req, res) => {
  try {
    const { title } = req.body; // Предполагается, что данные передаются в теле запроса
    // Создаем доску, указывая создателя из информации о пользователе
    const newBoard = await Board.create({
      title,
      creator: req.user._id,
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

router.put("/:boardId", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description } = req.body; // Предполагается, что данные передаются в теле запроса

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

// Изменить списки
// MAYBE НЕ НУЖНО
router.put("/:boardId/lists", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { lists } = req.body;

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
        .json({ message: "У вас нет доступа к изменению этой доски" });
    }

    board.lists = lists;
    await board.save();

    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
