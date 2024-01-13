import express from "express";
import { isAuth } from "../utils.js";
import Board from "../models/board.js";
import List from "../models/list.js";
import Card from "../models/card.js";

const router = express.Router();

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

    const cards = [];

    for (const listId of board.lists) {
      const list = await List.findById(listId);
      if (list) {
        cards.push(...list.cards);
      }
    }

    res.json(cards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Добавление карточки в определенный список
router.post("/:boardId/:listId/", isAuth, async (req, res) => {
  try {
    const { boardId, listId } = req.params;
    const { title, order } = req.body;

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
    const newCard = await Card.create({ title, order });
    list.cards.push(newCard._id);
    await list.save();
    // await List.updateOne(listId, {
    //   cards: [...list.cards, newCard._id],
    // });

    res.status(201).json(newCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Поиск карточек доски по нужному списку
router.get("/:boardId/:listId", isAuth, async (req, res) => {
  try {
    const { boardId, listId } = req.params;

    const board = await Board.findById(boardId);
    const list = await List.findById(listId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (!list) {
      return res.status(404).json({ message: "Список не найден" });
    }

    if (
      board.creator.toString() !== req.user._id &&
      !board.users.includes(req.user._id)
    ) {
      return res.status(403).json({
        message: "У вас нет доступа к просмотру карточек в этом списке",
      });
    }

    const cards = board.lists[listIndex].cards;
    res.json(cards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Удаление карточки из списка на доске
router.delete("/:boardId/:cardId", isAuth, async (req, res) => {
  try {
    const { boardId, cardId } = req.params;

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
    //
    // ВОЗМОЖНО НАДО ТАКЖЕ ОБНОВИТЬ LIST
    //
    await Card.findByIdAndDelete(cardId);

    res.json({ message: "Карточка успешно удалена" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.put("/:boardId/:cardId", isAuth, async (req, res) => {
  try {
    const { boardId, cardId } = req.params;
    const { title, description, dueDate, attachments, assignedUsers, labels } =
      req.body;

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

    // Изменяем данные карточки, включая метки
    const updatedCard = await Card.findById(cardId);
    updatedCard.title = title || updatedCard.title;
    updatedCard.description = description || updatedCard.description;
    updatedCard.dueDate = dueDate || updatedCard.dueDate;
    updatedCard.attachments = attachments || updatedCard.attachments;
    updatedCard.assignedUsers = assignedUsers || updatedCard.assignedUsers;
    updatedCard.labels = labels || updatedCard.labels;

    await updatedCard.save();
    res.json(updatedCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Изменение списка, в котором находится карточка
router.put("/:boardId/:cardId/move", isAuth, async (req, res) => {
  try {
    const { boardId, cardId } = req.params;
    const { from, to } = req.body;

    const board = await Board.findById(boardId);
    const sourceList = await List.findById(from);
    const assignedList = await List.findById(to);

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

    sourceList.cards = sourceList.cards.filter((card) => card._id !== cardId);
    assignedList.cards.push(cardId);

    await sourceList.save();
    await assignedList.save();

    res.json({ message: "Карточка успешно перемещена в новый список" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
