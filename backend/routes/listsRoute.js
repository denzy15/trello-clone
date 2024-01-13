import express from "express";
import { isAuth } from "../utils.js"; // Middleware для авторизации
import Board from "../models/board.js";
import List from "../models/list.js";

const router = express.Router();

// Создание нового списка на доске
router.post("/:boardId", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    // Проверяем доступ пользователя к этой доске перед добавлением списка
    if (
      board.creator.toString() !== req.user._id &&
      !board.users.includes(req.user._id)
    ) {
      return res.status(403).json({
        message: "У вас нет доступа к добавлению списка на эту доску",
      });
    }

    // Создаем новый список и добавляем в доску

    const newList = await List.create({ title, cards: [] });
    board.lists.push(newList._id);
    await board.save();

    res.status(201).json(newList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Получение списка всех списков на доске
router.get("/:boardId", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    // Проверяем доступ пользователя к этой доске перед получением списков
    if (
      board.creator.toString() !== req.user._id &&
      !board.users.includes(req.user._id)
    ) {
      return res.status(403).json({
        message: "У вас нет доступа к просмотру списков на этой доске",
      });
    }

    const lists = board.lists;
    res.json(lists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Удаление списка из доски
router.delete("/:boardId/:listId", isAuth, async (req, res) => {
  try {
    const { boardId, listId } = req.params;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    // Проверяем доступ пользователя к этой доске перед удалением списка
    if (
      board.creator.toString() !== req.user._id &&
      !board.users.includes(req.user._id)
    ) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к удалению списка на этой доске" });
    }

    await List.findByIdAndDelete(listId);
    board.lists = board.lists.filter((list) => list !== listId);
    await board.save();

    res.json({ message: "Список успешно удален" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Обновление данных списка на доске
router.put("/:boardId/:listId", isAuth, async (req, res) => {
  try {
    const { boardId, listId } = req.params;
    const { title, order } = req.body;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    // Проверяем доступ пользователя к этой доске перед обновлением списка
    if (
      board.creator.toString() !== req.user._id &&
      !board.users.includes(req.user._id)
    ) {
      return res.status(403).json({
        message: "У вас нет доступа к обновлению списка на этой доске",
      });
    }

    const updatedList = await List.findById(listId);

    updatedList.title = title || updatedList.title;
    updatedList.order = order || updatedList.order;

    await updatedList.save();

    res.json(updatedList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
