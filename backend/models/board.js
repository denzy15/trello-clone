import { Schema, model } from "mongoose";

// Определяем схему для модели доски
const boardSchema = new Schema({
  // Заголовок доски, обязательное поле
  title: {
    type: String,
    required: true,
  },
  // Описание доски, необязательное поле с пустой строкой по умолчанию
  description: { 
    type: String, 
    default: "" 
  },
  // Ссылка на пользователя, который создал доску, обязательное поле
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Массив пользователей, связанных с доской, каждый с userId и ролью
  users: [
    {
      // Ссылка на пользователя, обязательное поле
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      // Роль пользователя на доске, может быть ADMIN или MEMBER, по умолчанию MEMBER
      role: {
        type: String,
        enum: ["ADMIN", "MEMBER"],
        default: "MEMBER",
      },
    },
  ],
  // Массив списков, связанных с доской, каждый ссылается на модель List
  lists: [
    {
      type: Schema.Types.ObjectId,
      ref: "List",
    },
  ],
  // Массив меток, связанных с доской, каждая с заголовком и цветом
  labels: [
    {
      // Заголовок метки, необязательное поле с пустой строкой по умолчанию
      title: { 
        type: String, 
        default: "" 
      },
      // Цвет метки, необязательное поле с цветом по умолчанию
      color: { 
        type: String, 
        default: "#FAFAFA" 
      },
    },
  ],
  // Массив доступных фонов для доски
  backgrounds: [
    {
      // Путь к фоновому изображению или файлу
      path: String,
      // Название фона
      name: String,
    },
  ],
  // Текущий фон доски, обязательное поле со значением по умолчанию
  currentBackground: {
    type: String,
    required: true,
    default: "backgrounds/common/snow.svg",
  },
});

// Создаем модель Board из схемы
const Board = model("Board", boardSchema);

// Экспортируем модель Board для использования в других частях приложения
export default Board;
