import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import boardsRouter from "./routes/boardsRoute.js";
import authRouter from "./routes/authRoute.js";
import listsRouter from "./routes/listsRoute.js";
import cardsRouter from "./routes/cardsRoute.js";
import usersRouter from "./routes/usersRoute.js";
import invitationsRouter from "./routes/invitationsRoute.js";
import path from "path";
import sse from "./sse.js";
import { __dirname } from "./common.js";

// Порт, на котором будет запущен сервер
const PORT = 5000;

// Инициализация конфигурации из файла .env
dotenv.config();

// Определение строки подключения к базе данных в зависимости от среды (тестовая или рабочая)
const dbConnection =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DB_URI
    : process.env.MONGODB_URI;

// Подключение к базе данных MongoDB
mongoose
  .connect(dbConnection)
  .then(() => console.log("SUCCESSFULLY CONNECTED TO DB"))
  .catch((err) => console.log(err.message));

const app = express();

// Настройка статической директории для загрузок
app.use(express.static(path.join(__dirname, "uploads")));
// Настройка статической директории для общих фонов
app.use(
  "/backgrounds/common",
  express.static(path.join(__dirname, "backgrounds", "common"))
);

// Настройка статической директории для фонов
app.use("/backgrounds", express.static(path.join(__dirname, "backgrounds")));

// Включение CORS для разрешения междоменных запросов
app.use(cors());
// Включение парсинга JSON для обработки JSON-запросов
app.use(express.json());

// Настройка маршрута для SSE (серверные события)
app.get(
  "/sse",
  (req, res, next) => {
    res.flush = () => {}; 
    next();
  },
  sse.init
);

// Настройка маршрутов приложения
app.use("/api/auth", authRouter);           // Маршруты аутентификации
app.use("/api/boards", boardsRouter);       // Маршруты досок
app.use("/api/cards", cardsRouter);         // Маршруты карточек
app.use("/api/lists", listsRouter);         // Маршруты списков
app.use("/api/users", usersRouter);         // Маршруты пользователей
app.use("/api/invite", invitationsRouter);  // Маршруты приглашений

// Запуск сервера на указанном порту
app.listen(PORT, (error) => {
  if (!error) {
    console.log("Server is Running on port " + PORT);
  } else {
    console.log("Error occurred, server can't start", error);
  }
});

// Экспорт приложения для использования в других частях проекта (например, для тестирования)
export default app;
