import { createTheme } from "@mui/material/styles";

// Светлая тема
const lightTheme = createTheme({
  typography: {
    fontFamily: ["Montserrat", "sans-serif"].join(","),
  },
  palette: {
    mode: "light",
    background: {
      default: "#ffffff",
      paper: "#f7f7f7",
    },
    text: {
      primary: "#000000",
      secondary: "#555555",
    },
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  // Другие стили...
});

// Темная тема
const darkTheme = createTheme({
  typography: {
    fontFamily: ["Montserrat", "sans-serif"].join(","),
  },
  palette: {
    mode: "dark",
    background: {
      default: "#172b4d",
      paper: "#121212",
    },
    text: {
      primary: "#eeeeee",
      secondary: "#f5f5f5",
    },
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
  },
});

// Функция для выбора темы
export const getTheme = (mode) => {
  return mode === "light" ? lightTheme : darkTheme;
};
