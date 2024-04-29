import { createSlice } from "@reduxjs/toolkit";

// Определение начального состояния для режима темы
const initialState = {
  mode: "dark", // Значение по умолчанию
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    // Экшн для смены режима темы
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
  },
});

// Экспорт экшнов
export const { toggleTheme } = themeSlice.actions;

// Экспорт редьюсера
export default themeSlice.reducer;
