import { Schema, model } from "mongoose";

// Определяем схему для модели карточки
const cardSchema = new Schema({
  // Заголовок карточки, обязательное поле
  title: {
    type: String,
    required: true,
  },
  // Описание карточки, необязательное поле с пустой строкой по умолчанию
  description: { 
    type: String, 
    default: "" 
  },
  // Дата создания карточки, по умолчанию текущая дата
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Дата начала, необязательное поле, по умолчанию null
  startDate: { 
    type: Date, 
    default: null 
  },
  // Срок выполнения, необязательное поле, по умолчанию null
  dueDate: { 
    type: Date, 
    default: null 
  },
  // Массив вложений, связанных с карточкой
  attachments: [
    {
      // Дата создания вложения, по умолчанию текущая дата в формате ISO
      createdAt: {
        type: Date,
        default: () => new Date().toISOString(),
      },
      // Тип вложения (например, изображение, документ и т.д.)
      type: { 
        type: String 
      },
      // Путь к вложению
      path: String,
      // Ссылка на пользователя, который создал вложение
      creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      // Название вложения
      name: String,
    },
  ],
  // Массив пользователей, назначенных на карточку
  assignedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  // Массив меток, связанных с карточкой, каждая с заголовком и цветом
  labels: [
    {
      // Заголовок метки
      title: String,
      // Цвет метки
      color: String,
    },
  ],
  // Порядок карточки в списке, обязательное поле
  order: {
    type: Number,
    required: true,
  },
  // Массив комментариев, связанных с карточкой
  comments: [
    {
      // Сообщение комментария, обязательное поле
      message: {
        type: String,
        required: true,
      },
      // Ссылка на автора комментария, обязательное поле
      author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      // Дата создания комментария, по умолчанию текущая дата в формате ISO
      createdAt: {
        type: Date,
        default: () => new Date().toISOString(),
      },
      // Дата обновления комментария, необязательное поле, по умолчанию null
      updatedAt: {
        type: Date,
        default: null,
      },
    },
  ],
});

// Создаем модель Card из схемы
const Card = model("Card", cardSchema);

// Экспортируем модель Card для использования в других частях приложения
export default Card;
