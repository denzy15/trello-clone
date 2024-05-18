import { Schema, model } from "mongoose";

// Определяем схему для модели списка
const listSchema = new Schema({
  // Заголовок списка, обязательное поле
  title: {
    type: String,
    required: true,
  },
  // Порядок списка в доске, обязательное поле
  order: { 
    type: Number, 
    required: true 
  },
  // Массив карточек, связанных со списком, каждая ссылается на модель Card
  cards: [
    {
      type: Schema.Types.ObjectId,
      ref: "Card",
    },
  ],
});

// Создаем модель List из схемы
const List = model("List", listSchema);

// Экспортируем модель List для использования в других частях приложения
export default List;
