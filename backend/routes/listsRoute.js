import express from "express";
import { isAuth } from "../utils.js"; // Middleware для авторизации
import Board from "../models/board.js";
import List from "../models/list.js";

const router = express.Router();

// Получение всех списков на доске
router.get("/:boardId", isAuth, async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findById(boardId)
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

    board.lists.sort((a, b) => a.order - b.order);

    board.lists.forEach((list) => {
      list.cards.sort((a, b) => a.order - b.order);
    });

    res.json(board.lists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

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

    const newList = await List.create({
      title,
      cards: [],
      order: board.lists.length,
    });
    board.lists.push(newList._id);
    await board.save();

    res.status(201).json(newList);
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

    const list = await List.findById(listId);

    if (!list) {
      return res.status(404).json({ message: "Список не найден" });
    }

    const orderToDelete = list.order;

    // Удаление листа из базы данных
    await List.findByIdAndDelete(listId);

    // Обновление порядка оставшихся листов
    for (const listId of board.lists) {
      const remainingList = await List.findById(listId);
      if (remainingList && remainingList.order > orderToDelete) {
        remainingList.order--;
        await remainingList.save();
      }
    }

    // Удаление листа из списка листов на доске
    board.lists = board.lists.filter((id) => id.toString() !== listId);
    await board.save();

    res.json({ message: "Список успешно удален" });
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

    await updatedList.save();

    res.json(updatedList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.put("/:boardId/move/:listId", isAuth, async (req, res) => {
  try {
    const { boardId, listId } = req.params;

    const { newOrder } = req.query;

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
