import axios from "axios";
import { store } from "./store/index";
import { toast } from "react-toastify";
import { signOut } from "./store/slices/authSlice";

// Этот код использует Axios для отправки HTTP-запросов и 
// добавляет интерцепторы для добавления токена аутентификации 
// к запросам и для обработки ошибок, связанных с истекшим токеном

// Создание экземпляра axios с базовыми настройками
const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json", // Установка заголовка Content-Type для всех запросов
  },
});

// Интерцептор запросов
axiosInstance.interceptors.request.use(
  (config) => {
    const { auth } = store.getState(); // Получение данных аутентификации из Redux store

    // Если есть токен аутентификации, добавляем его в заголовок запроса
    if (auth && !!auth.token) {
      config.headers["Authorization"] = `Bearer ${auth.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор ответов
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Если токен истек, показываем уведомление и выходим из системы
    if (
      error.response.data.message === "Срок действия токена истек" &&
      error.response.status === 403
    ) {
      toast.warn("Ваш сеанс истек, пожалуйста, выполните вход заново"); // Показываем уведомление пользователю
      store.dispatch(signOut()); // Выходим из системы
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;