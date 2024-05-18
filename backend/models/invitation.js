import mongoose, { Schema } from "mongoose";

// Определяем схему для модели приглашения
const InvitationSchema = new Schema({
  // Ссылка на доску, к которой относится приглашение
  board: { 
    type: Schema.Types.ObjectId, 
    ref: "Board" 
  },
  // Ссылка на приглашенного пользователя
  invitedUser: { 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  },
  // Ссылка на пользователя, который отправил приглашение
  inviter: { 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  },
  // Статус приглашения: может быть "pending" (ожидает), "accepted" (принято) или "declined" (отклонено), по умолчанию "pending"
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  // Дата создания приглашения, по умолчанию текущая дата
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Создаем модель Invitation из схемы
const Invitation = mongoose.model("Invitation", InvitationSchema);

// Экспортируем модель Invitation для использования в других частях приложения
export default Invitation;
