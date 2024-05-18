import express from "express";
import { isAuth, isUserOnBoard, sendBoardUpdate } from "../utils.js";
import Board from "../models/board.js";
import List from "../models/list.js";
import Card from "../models/card.js";

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
    if (!isUserOnBoard(board, req.user._id)) {
      return res.status(403).json({
        message: "У вас нет доступа к добавлению списка на эту доску",
      });
    }

    // Создаем новый список и добавляем в доску

    const newList = await List.create({
      title,
      cards: [],
      order: board.lists.length,
    });

    board.lists.push(newList._id);
    await board.save();

    res.status(201).json(newList);

    await sendBoardUpdate(boardId, req.user._id);
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
    if (!isUserOnBoard(board, req.user._id)) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к удалению списка на этой доске" });
    }

    const list = await List.findById(listId).populate("cards").exec();

    if (!list) {
      return res.status(404).json({ message: "Список не найден" });
    }

    const orderToDelete = list.order;

    await Card.deleteMany({ _id: { $in: list.cards } });

    // Удаление листа из базы данных
    await List.findByIdAndDelete(listId);

    for (const listId of board.lists) {
      const remainingList = await List.findById(listId);
      if (remainingList && remainingList.order > orderToDelete) {
        remainingList.order--;
        await remainingList.save();
      }
    }

    await Board.findByIdAndUpdate(boardId, {
      $pull: { lists: listId },
    });

    res.json({ message: "Список успешно удален" });
    await sendBoardUpdate(boardId, req.user._id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Обновление заголовка списка на доске
router.put("/:boardId/rename/:listId", isAuth, async (req, res) => {
  try {
    const { boardId, listId } = req.params;
    const { title } = req.body;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    // Проверяем доступ пользователя к этой доске перед обновлением списка
    if (!isUserOnBoard(board, req.user._id)) {
      return res.status(403).json({
        message: "У вас нет доступа к обновлению списка на этой доске",
      });
    }

    const updatedList = await List.findById(listId);

    updatedList.title = title || updatedList.title;

    await updatedList.save();

    res.json(updatedList);
    await sendBoardUpdate(boardId, req.user._id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Изменение порядка отображения списка
router.put("/:boardId/move/:listId", isAuth, async (req, res) => {
  try {
    const { boardId, listId } = req.params;

    const { newOrder } = req.query;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    // Проверяем доступ пользователя к этой доске перед обновлением списка
    if (!isUserOnBoard(board, req.user._id)) {
      return res.status(403).json({
        message: "У вас нет доступа к обновлению списка на этой доске",
      });
    }

    const targetOrder = parseInt(newOrder);

    if (isNaN(targetOrder)) {
      return res.status(400).json({ message: "Некорректный новый порядок" });
    }

    const list = await List.findById(listId);

    if (!list) {
      return res.status(404).json({ message: "Список не найден" });
    }

    // for (const listIdToUpdate of board.lists) {
    //   if (listIdToUpdate === listId) continue;

    //   const listToUpdate = await List.findById(listIdToUpdate);

    //   if (!listToUpdate) {
    //     return res.status(404).json({ message: "Что то пошло не так" });
    //   }

    //   if (list.order < targetOrder) {
    //     if (
    //       list.order < listToUpdate.order &&
    //       listToUpdate.order <= targetOrder
    //     ) {
    //       listToUpdate.order--;
    //       await listToUpdate.save();
    //     }
    //   } else {
    //     if (
    //       list.order > listToUpdate.order &&
    //       listToUpdate.order >= targetOrder
    //     ) {
    //       listToUpdate.order++;
    //       await listToUpdate.save();
    //     }
    //   }
    // }

    await Promise.all(
      board.lists.map(async (listIdToUpdate) => {
        if (listIdToUpdate !== listId) {
          const listToUpdate = await List.findById(listIdToUpdate);

          if (!listToUpdate) {
            return res.status(404).json({ message: "Что-то пошло не так" });
          }

          if (list.order < targetOrder) {
            if (
              list.order < listToUpdate.order &&
              listToUpdate.order <= targetOrder
            ) {
              listToUpdate.order--;
              await listToUpdate.save();
            }
          } else {
            if (
              listToUpdate.order >= targetOrder &&
              list.order > listToUpdate.order
            ) {
              listToUpdate.order++;
              await listToUpdate.save();
            }
          }
        }
      })
    );

    list.order = targetOrder;

    await list.save();

    res.json({ message: "Список перемещён успешно" });
    await sendBoardUpdate(boardId, req.user._id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Копировние существующего списка
router.put("/:boardId/copy/:listId", isAuth, async (req, res) => {
  const { boardId, listId } = req.params;
  const { title } = req.body;

  try {
    const board = await Board.findById(boardId).populate("lists").exec();

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (!isUserOnBoard(board, req.user._id)) {
      return res.status(403).json({
        message: "У вас нет доступа к обновлению списка на этой доске",
      });
    }

    const sourceList = await List.findById(listId)
      .populate({
        path: "cards",
        populate: [
          {
            path: "assignedUsers",
            select: "username email _id",
          },
          {
            path: "attachments.creator",
            select: "username email _id",
          },
        ],
      })
      .exec();

    if (!sourceList) {
      return res.status(404).json({ message: "Список не найден" });
    }

    const newCards = await Promise.all(
      sourceList.cards.map(async (card) => {
        const { _id, createdAt, ...rest } = card.toObject();
        const newCard = await Card.create(rest);
        return newCard._id;
      })
    );

    const newList = await List.create({
      title,
      cards: newCards,
      order: board.lists.length,
    });

    board.lists.push(newList._id);
    await board.save();

    const responseList = await List.findById(newList._id)
      .populate({
        path: "cards",
        populate: [
          {
            path: "assignedUsers",
            select: "username email _id",
          },
          {
            path: "attachments.creator",
            select: "username email _id",
          },
        ],
      })
      .exec();

    res.json(responseList);
    await sendBoardUpdate(boardId, req.user._id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

//Перемещение всех карточек из одного списка в другой
router.put("/:boardId/move-cards", isAuth, async (req, res) => {
  const { boardId } = req.params;
  const { sourceListId, resultListId } = req.body;

  try {
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (!isUserOnBoard(board, req.user._id)) {
      return res.status(403).json({
        message: "У вас нет доступа к обновлению списка на этой доске",
      });
    }

    const sourceList = await List.findById(sourceListId)
      .populate("cards")
      .exec();
    const resultList = await List.findById(resultListId)
      .populate("cards")
      .exec();

    if (!sourceList || !resultList) {
      return res.status(404).json({ message: "Один из списков не найден" });
    }

    // Сортировка карточек по параметру order
    sourceList.cards.sort((a, b) => a.order - b.order);
    resultList.cards.sort((a, b) => a.order - b.order);

    // Перемещение карточек из исходного списка в целевой список
    resultList.cards.push(...sourceList.cards);
    sourceList.cards = [];

    // Сохранение изменений в базе данных
    await resultList.save();
    await sourceList.save();

    const resultBoard = await Board.findById(boardId)
      .populate({
        path: "lists",
        populate: {
          path: "cards",
          populate: {
            path: "assignedUsers",
          },
        },
      })
      .exec();

    res.json(resultBoard.lists.sort((a, b) => a.order - b.order));
    await sendBoardUpdate(boardId, req.user._id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
