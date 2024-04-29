import dayjs from "dayjs";
import md5 from "md5";

export const convertUsernameForAvatar = (username) => {
  if (!username) return "";

  const arr = username.split(" ");

  if (arr.length < 2) {
    return username.slice(0, 1).toUpperCase();
  }

  return arr[0].slice(0, 1).toUpperCase() + arr[1].slice(0, 1).toUpperCase();
};

export const getUserColor = (userId) => {
  const hash = md5(userId);
  const colorCode = parseInt(hash.substring(0, 6), 16);
  const color = "#" + colorCode.toString(16).padStart(6, "0");
  return color;
};

// delete and replace with getContrastColor
export const colorIsDark = (color) => {
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

  // Возвращение значения: true для темного фона, false для светлого
  return brightness < 128;
};

export const getContrastColor = (backgroundColor) => {
  const brightness = parseInt(backgroundColor.substring(1), 16);
  const r = (brightness >> 16) & 255;
  const g = (brightness >> 8) & 255;
  const b = brightness & 255;

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (luminance > 0.5) {
    return "#000000";
  } else {
    return "#ffffff";
  }
};

export const getFileType = (type) => {
  if (type.includes("image")) {
    return "image";
  } else {
    return "other";
  }
};

export const getFileExtension = (path) => {
  const index = path.lastIndexOf(".");
  return index === -1 ? "file" : path.slice(index + 1);
};

export const formatDateWithourYear = (date) => {
  const currentDate = dayjs();
  const targetDate = dayjs(date);

  if (targetDate.get("year") === currentDate.get("year")) {
    return targetDate.format("DD MMM HH:mm");
  }

  return targetDate.format("DD MMM YYYY HH:mm");
};

export const isExpired = (date) => {
  const dueDate = dayjs(date);
  const currentDate = dayjs();

  const daysUntilDue = dueDate.diff(currentDate, "days");

  return daysUntilDue < 0 ? true : false;
};

export const isUserOnBoard = (userId, board) => {
  if (board.creator._id === userId) return true;

  for (const user of board.users) {
    if (user._id === userId) return true;
  }

  return false;
};
