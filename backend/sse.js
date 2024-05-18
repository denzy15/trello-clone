import SSE from "express-sse";

// Создаем новый экземпляр SSE (Server-Sent Events) для работы с серверными событиями
const sse = new SSE();

// Экспортируем экземпляр SSE для использования в других частях приложения
export default sse;
