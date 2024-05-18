import { createSlice } from "@reduxjs/toolkit";

// Начальное состояние хранилища для темы
const initialState = {
  mode: "light",
};

// Создание среза состояния и редукторов для управления темой
export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    // Редуктор для переключения темы между светлой и темной
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    // Редуктор для установки темы
    setTheme: (state, action) => {
      state.mode = action.payload;
    },
  },
});

// Экспорт действий и редуктора из среза состояния темы
export const { toggleTheme, setTheme } = themeSlice.actions;

// Экспорт редуктора среза состояния темы
export default themeSlice.reducer;
