import { createSlice } from "@reduxjs/toolkit";

// Начальное состояние хранилища для метаданных
const initialState = {
  // Состояние редактирования карточки
  cardEditing: {
    isEditing: false, // Флаг редактирования карточки
    card: null, // Текущая редактируемая карточка
  },
  extendedLabels: false, // Флаг расширенных меток
  editableDraft: false, // Флаг редактируемого черновика
  role: null, // Роль пользователя на текущей доске
};

// Создание среза состояния и редукторов для управления метаданными
export const metadataSlice = createSlice({
  name: "metadata",
  initialState,
  reducers: {
    // Установка роли пользователя на текущей доске
    setMyRoleOnCurrentBoard: (state, action) => {
      state.role = action.payload;
    },
    // Начало редактирования карточки
    startCardEdit: (state, action) => {
      state.cardEditing = {
        card: action.payload, // Установка текущей редактируемой карточки
        isEditing: true, // Установка флага редактирования карточки в true
      };
    },
    // Остановка редактирования карточки
    stopCardEdit: (state, action) => {
      state.cardEditing = {
        card: null, // Сброс текущей редактируемой карточки
        isEditing: false, // Установка флага редактирования карточки в false
      };
      state.editableDraft = false; // Сброс флага редактируемого черновика
    },
    // Добавление пользователя к карточке
    addUserToCard: (state, action) => {
      state.cardEditing.card.assignedUsers.push(action.payload);
    },
    // Удаление пользователя из карточки
    removeUserFromCard: (state, action) => {
      state.cardEditing.card.assignedUsers = state.cardEditing.card.assignedUsers.filter(
        (u) => u._id !== action.payload
      );
    },
    // Добавление метки к карточке
    addLabelToCard: (state, action) => {
      state.cardEditing.card.labels.push(action.payload);
    },
    // Удаление метки из карточки
    removeLabelFromCard: (state, action) => {
      state.cardEditing.card.labels = state.cardEditing.card.labels.filter(
        (l) => l._id !== action.payload._id
      );
    },
    // Обновление метки карточки
    updateCardLabel: (state, action) => {
      state.cardEditing.card.labels = state.cardEditing.card.labels.map((l) =>
        l._id === action.payload._id ? action.payload : l
      );
    },
    // Обновление даты карточки
    updateCardDates: (state, action) => {
      state.cardEditing.card.dueDate = action.payload.dueDate;
      state.cardEditing.card.startDate = action.payload.startDate;
    },
    // Обновление описания карточки
    updateCardDescription: (state, action) => {
      state.cardEditing.card.description = action.payload;
    },
    // Обновление вложений карточки
    updateCardAttachments: (state, action) => {
      state.cardEditing.card.attachments = action.payload;
    },
    // Обновление имени вложения карточки
    updateCardAttachName: (state, action) => {
      state.cardEditing.card.attachments[action.payload.index].name =
        action.payload.name;
    },
    // Удаление вложения из карточки
    deleteAttach: (state, action) => {
      state.cardEditing.card.attachments.splice(action.payload.index, 1);
    },
    // Обновление комментариев карточки
    updateComments: (state, action) => {
      state.cardEditing.card.comments = action.payload;
    },
    // Переключение расширенных меток
    toggleExtendedLabels: (state, action) => {
      state.extendedLabels = !state.extendedLabels;
    },
    // Переключение редактируемого черновика
    toggleEditableDraft: (state, action) => {
      state.editableDraft = !state.editableDraft;
    },
  },
});

// Экспорт действий и редуктора из среза состояния метаданных
export const {
  setMyRoleOnCurrentBoard,
  updateComments,
  deleteAttach,
  updateCardAttachName,
  updateCardAttachments,
  toggleEditableDraft,
  updateCardDescription,
  toggleExtendedLabels,
  updateCardDates,
  addLabelToCard,
  updateCardLabel,
  removeLabelFromCard,
  addUserToCard,
  removeUserFromCard,
  startCardEdit,
  stopCardEdit,
  updateCardEditingInfo,
} = metadataSlice.actions;
export default metadataSlice.reducer;
