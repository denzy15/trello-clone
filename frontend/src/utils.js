import dayjs from "dayjs";
import md5 from "md5";

// Функция для преобразования имени пользователя в инициалы для аватара
export const convertUsernameForAvatar = (username) => {
  if (!username) return "";

  const arr = username.split(" ");

  if (arr.length < 2) {
    return username.slice(0, 1).toUpperCase();
  }

  return arr[0].slice(0, 1).toUpperCase() + arr[1].slice(0, 1).toUpperCase();
};

// Функция для получения цвета пользователя на основе его идентификатора
export const getUserColor = (userId) => {
  const hash = md5(userId);
  const colorCode = parseInt(hash.substring(0, 6), 16);
  const color = "#" + colorCode.toString(16).padStart(6, "0");
  return color;
};

// Функция для получения контрастного цвета по отношению к заданному цвету
export const getContrastColor = (color) => {
  let hexColor = color;

  // Проверка формата цвета и преобразование в hex-формат
  if (color.startsWith("#")) {
    // hex-формат
    hexColor = color;
  } else if (color.startsWith("rgb")) {
    // rgb или rgba формат
    const rgba = color
      .substring(color.indexOf("(") + 1, color.lastIndexOf(")"))
      .split(",");
    const r = parseInt(rgba[0]);
    const g = parseInt(rgba[1]);
    const b = parseInt(rgba[2]);
    // Преобразование в hex-формат
    hexColor = "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  } else {
    // Неизвестный формат цвета
    hexColor = "#ffffff";
  }

  // Вычисление яркости цвета
  const rgb = parseInt(hexColor.substring(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  if (brightness > 128) {
    return "#000000";
  } else {
    return "#ffffff";
  }
};

// Функция для определения типа файла
export const getFileType = (type) => {
  if (type.includes("image")) {
    return "image";
  } else {
    return "other";
  }
};

// Функция для получения расширения файла
export const getFileExtension = (path) => {
  const index = path.lastIndexOf(".");
  return index === -1 ? "file" : path.slice(index + 1);
};

// Функция для форматирования даты без учета года
export const formatDateWithourYear = (date) => {
  const currentDate = dayjs();
  const targetDate = dayjs(date);

  if (targetDate.get("year") === currentDate.get("year")) {
    return targetDate.format("DD MMM HH:mm");
  }

  return targetDate.format("DD MMM YYYY HH:mm");
};

// Функция для проверки истекшей ли дата
export const isExpired = (date) => {
  const dueDate = dayjs(date);
  const currentDate = dayjs();

  const daysUntilDue = dueDate.diff(currentDate, "days");

  return daysUntilDue < 0 ? true : false;
};

// Функция для проверки, находится ли пользователь на доске
export const isUserOnBoard = (userId, board) => {
  if (board.creator._id === userId) return true;

  for (const user of board.users) {
    if (user._id === userId) return true;
  }

  return false;
};
