import express from "express";
import Board from "../models/board.js";
import List from "../models/list.js";
import Card from "../models/card.js";
import { isAuth, isUserAdmin, isUserOnBoard } from "../utils.js";

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
    if (!isUserAdmin(board, req.user._id)) {
      return res
        .status(403)
        .json({ message: "У вас нет доступа к удалению этой доски" });
    }

    const lists = await List.find({ _id: { $in: board.lists } });

    // Удалить каждую карточку в этих списках
    for (const list of lists) {
      await Card.deleteMany({ _id: { $in: list.cards } });
    }

    // Удалить каждый список
    await List.deleteMany({ _id: { $in: board.lists } });

    // Удалить саму доску
    await Board.deleteOne(board);

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
      .populate("creator", "username email") // Популируем создателя доски и выбираем только username
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

      .exec();

    if (!board) {
      return res.status(404).json({ message: "Доска не найдена" });
    }

    if (!isUserOnBoard(board, req.user._id)) {
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
    if (!isUserAdmin(board, req.user._id)) {
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

    const board = await Board.findById(boardId).populate("lists").exec();

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

    board.users = board.users.filter((u) => u.userId.toString() !== userId);

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

    res.json({ message: `Пользователь успешно удалён` });
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

    res.json(board.users);
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
