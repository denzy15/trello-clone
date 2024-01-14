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
    const newCard = await Card.create({ title, order: list.cards.length + 1 });
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

// Обновление данных о карточке
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
        sourceCard.order = idx + 1;
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

    card.order = assignedList.cards.length === 0 ? 1 : targetOrder;

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


export default router;
