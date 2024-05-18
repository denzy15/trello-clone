import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  boards: [], // Инициализация массива досок
  currentBoard: {}, // Инициализация объекта текущей доски
};

// Создание среза состояния для управления досками
export const boardsSlice = createSlice({
  name: "boards", // Уникальное имя среза состояния
  initialState, // Начальное состояние среза
  reducers: {
    // Определение редукторов для обновления состояния
    setBoards: (state, action) => {
      // Редуктор для установки досок
      state.boards = action.payload; // Обновление списка досок
    },
    addBoard: (state, action) => {
      // Редуктор для добавления новой доски
      state.boards.push(action.payload); // Добавление новой доски в массив
    },
    pickBoard: (state, action) => {
      // Редуктор для выбора текущей доски
      state.currentBoard = action.payload; // Обновление текущей доски
    },
    quitBoard: (state) => {
      // Редуктор для выхода из текущей доски
      state.currentBoard = {}; // Сброс текущей доски
    },

    // ВОзникает в случае если текущего пользователя удалили с доски
    getKickedFromBoard: (state, action) => {
      state.boards = state.boards.filter((b) => b._id !== action.payload);
    },

    // Обновление порядка списка
    updateListOrder: (state, action) => {
      state.currentBoard.lists = action.payload;
    },

    // Переименовать список
    renameList: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex].title =
        action.payload.title;
    },

    // Переименовать карточку
    renameCard: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex].cards[
        action.payload.cardIndex
      ].title = action.payload.title;
    },

    // Изменение порядка карточек
    updateCardOrder: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex].cards =
        action.payload.cards;
    },

    // Создание карточки
    createCard: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex].cards.push(
        action.payload.card
      );
    },
    // Создание списка
    createList: (state, action) => {
      state.currentBoard.lists.push(action.payload);
    },

    // Изменение назначенных пользователей на карточку
    changeCardAssignedUsers: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex].cards[
        action.payload.cardIndex
      ].assignedUsers = action.payload.assignedUsers;
    },

    // Изменение меток на карточке
    changeCardLabels: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex].cards[
        action.payload.cardIndex
      ].labels = action.payload.labels;
    },

    // Изменение метки
    updateLabel: (state, action) => {
      state.currentBoard.labels = state.currentBoard.labels.map((l) =>
        l._id === action.payload._id ? action.payload : l
      );
    },

    // Добавление метки
    addLabel: (state, action) => {
      state.currentBoard.labels.push(action.payload);
    },

    // Удаление метки
    deleteLabel: (state, action) => {
      state.currentBoard.labels = state.currentBoard.labels.filter(
        (l) => l._id !== action.payload._id
      );
    },

    // Обновление дат на карточке
    updateBoardCardDates: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex].cards[
        action.payload.cardIndex
      ].startDate = action.payload.startDate;
      state.currentBoard.lists[action.payload.listIndex].cards[
        action.payload.cardIndex
      ].dueDate = action.payload.dueDate;
    },

    // Обновление целой карточки
    updateCard: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex].cards[
        action.payload.cardIndex
      ] = action.payload.card;
    },

    // Обновление списков
    updateLists: (state, action) => {
      state.currentBoard.lists = action.payload;
    },

    // Обновление целого списка
    updateList: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex] = action.payload.list;
    },

    // Удаление списка
    deleteList: (state, action) => {
      state.currentBoard.lists.splice(action.payload.listIndex, 1);
    },

    // Изменение пользователей на доске
    updateUsers: (state, action) => {
      state.currentBoard.users = action.payload;
    },

    // Измененеие описания доски
    updateBoardDescription: (state, action) => {
      state.currentBoard.description = action.payload;
    },
    // Обновление заголовка доски
    updateBoardTitle: (state, action) => {
      state.currentBoard.title = action.payload;
    },
    // Изменение фонов
    updateBoardBackgrounds: (state, action) => {
      state.currentBoard.backgrounds = action.payload;
    },
    // Установка фона
    setBoardBackground: (state, action) => {
      state.currentBoard.currentBackground = action.payload;
    },
  },
});

// Экспорт action creators и редуктора
export const {
  // Action creators для каждого редуктора
  setBoardBackground,
  updateBoardBackgrounds,
  getKickedFromBoard,
  updateBoardTitle,
  updateUsers,
  updateBoardDescription,
  updateList,
  deleteList,
  updateCard,
  updateBoardCardDates,
  updateLists,
  updateLabel,
  addLabel,
  deleteLabel,
  changeCardAssignedUsers,
  changeCardLabels,
  setBoards,
  renameCard,
  createCard,
  createList,
  updateCardOrder,
  addBoard,
  pickBoard,
  quitBoard,
  updateListOrder,
  renameList,
} = boardsSlice.actions; // Экспорт action creators
export default boardsSlice.reducer; // Экспорт редуктора
