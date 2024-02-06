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
