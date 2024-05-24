import { Schema, model } from "mongoose";

// Определяем схему для пользователя
const userSchema = new Schema({
  // Имя пользователя
  username: {
    type: String,
    required: true,
  },
  // Email пользователя (долже быть уникальным)
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // Пароль, который будет храниться в виде хеша
  password: {
    type: String,
    required: true,
  },
  // Токен для восстановления пароля
  resetPasswordToken: String,
  // Срок действия токена восстановления пароля
  resetPasswordExpires: Date,
});

// Создаем модель пользователя (User) на основе схемы userSchema
const User = model("User", userSchema);

// Экспортируем модель User для использования в других частях приложения
export default User;
