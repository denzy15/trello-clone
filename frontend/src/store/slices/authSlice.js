import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: null, // Инициализация идентификатора пользователя
  username: null, // Инициализация имени пользователя
  email: null, // Инициализация электронной почты пользователя
  token: null, // Инициализация токена аутентификации пользователя
};

// Создание среза состояния для аутентификации с начальным состоянием initialState
export const authSlice = createSlice({
  name: "auth", // Уникальное имя среза состояния
  initialState, // Начальное состояние среза
  reducers: {
    // Определение редукторов для обновления состояния
    login: (state, action) => {
      // Редуктор для входа пользователя
      state._id = action.payload._id; // Обновление идентификатора пользователя
      state.username = action.payload.username; // Обновление имени пользователя
      state.email = action.payload.email; // Обновление электронной почты пользователя
      state.token = action.payload.token; // Обновление токена аутентификации пользователя
    },
    signOut: (state) => {
      // Редуктор для выхода пользователя
      state._id = null; // Сброс идентификатора пользователя
      state.username = null; // Сброс имени пользователя
      state.email = null; // Сброс электронной почты пользователя
      state.token = null; // Сброс токена аутентификации пользователя
    },
    changeUsername: (state, action) => {
      // Редуктор для изменения имени пользователя
      state.username = action.payload; // Обновление имени пользователя
    },
  },
});

// Экспорт action creators и редуктора
export const { login, signOut, changeUsername } = authSlice.actions; // Экспорт action creators
export default authSlice.reducer; // Экспорт редуктора
