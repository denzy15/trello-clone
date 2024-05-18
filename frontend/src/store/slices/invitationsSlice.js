import { createSlice } from "@reduxjs/toolkit";

// Начальное состояние хранилища для приглашений
const initialState = {
  invitations: [],
};

// Создание среза состояния и редукторов для управления приглашениями
export const invitationsSlice = createSlice({
  name: "invitations",
  initialState,
  reducers: {
    // Редуктор для установки списка приглашений
    setInvitations: (state, action) => {
      state.invitations = action.payload;
    },
    // Редуктор для изменения статуса приглашения
    changeInvitationStatus: (state, action) => {
      for (const inv of state.invitations) {
        if (inv._id === action.payload._id) {
          inv.status = action.payload.status;
          break;
        }
      }
    },
    // Редуктор для удаления приглашения
    deleteInvitation: (state, action) => {
      state.invitations = state.invitations.filter(
        (inv) => inv._id !== action.payload._id
      );
    },
    // Редуктор для добавления нового приглашения в начало списка
    setNewInvitation: (state, action) => {
      state.invitations.unshift(action.payload);
    },
  },
});

// Экспорт действий и редуктора из среза состояния приглашений
export const {
  changeInvitationStatus,
  setNewInvitation,
  deleteInvitation,
  setInvitations,
} = invitationsSlice.actions;

// Экспорт редуктора среза состояния приглашений
export default invitationsSlice.reducer;
