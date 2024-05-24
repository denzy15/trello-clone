import request from "supertest";
import app from "../../server.js";
import User from "../../models/user.js";
import Invitation from "../../models/invitation.js";
import bcrypt from "bcryptjs";

const setAuthToken = async (data) => {
  // Функция для установки JWT-токена для авторизации
  const response = await request(app).post("/api/auth/login").send(data);
  return response.body.token;
};

describe("User routes", () => {
  // Описание блока тестов пользовательских маршрутов
  let token1; // Токен пользователя 1
  let user2Id; // Идентификатор пользователя 2
  let token2; // Токен пользователя 2
  let boardId; // Идентификатор доски

  beforeAll(async () => {
    // Выполняется перед началом всех тестов
    // Регистрация нового пользователя и получение токена для пользователя 1
    await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "testpassword",
    });

    token1 = await setAuthToken({
      email: "dmirshanov@mail.ru",
      password: "123",
    });

    // Авторизация и получение токена для пользователя 2
    let uResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "testpassword" });

    token2 = uResponse.body.token; // Получение токена пользователя 2
    user2Id = uResponse.body._id; // Получение идентификатора пользователя 2

    // Получение идентификатора доски
    const boardResponse = await request(app)
      .get("/api/boards/65ba1a49e2aef2a321f69cf6")
      .set("Authorization", `Bearer ${token1}`);
    boardId = boardResponse.body._id; // Получение идентификатора доски
  });

  test("Получение всех пользователей", async () => {
    // Тест для получения всех пользователей
    const response = await request(app) // Выполнение запроса на получение всех пользователей
      .get("/api/users")
      .set("Authorization", `Bearer ${token1}`)
      .query({ search: "test" }); // Поиск по ключевому слову "test"

    expect(response.statusCode).toBe(200); // Проверка статуса кода ответа
    expect(response.body).toHaveLength(1); // Проверка количества пользователей в ответе
    expect(response.body[0].username).toBe("testuser"); // Проверка имени пользователя
  });

  test("Получение уведомлений пользователя", async () => {
    // Тест для получения уведомлений пользователя
    // Отправка приглашения пользователю 2
    await request(app)
      .post("/api/invite")
      .set("Authorization", `Bearer ${token1}`)
      .send({ boardId, invitedUser: user2Id });

    // Получение уведомлений для пользователя 2
    const response = await request(app)
      .get("/api/users/notifications")
      .set("Authorization", `Bearer ${token2}`);

    expect(response.statusCode).toBe(200); // Проверка статуса кода ответа
    expect(response.body.length).toBe(1); // Проверка количества уведомлений
  });

  test("Обновление пользователя", async () => {
    // Тест для обновления пользователя
    const response = await request(app) // Выполнение запроса на обновление пользователя
      .put(`/api/users/${user2Id}`)
      .set("Authorization", `Bearer ${token2}`)
      .send({ password: "testpassword", newPassword: "1234" }); // Обновление пароля

    expect(response.statusCode).toBe(200); // Проверка статуса кода ответа
    expect(response.body.message).toBe("Пароль успешно обновлён"); // Проверка сообщения об успешном обновлении

    // Проверка, что пароль действительно обновлен
    const user = await User.findById(user2Id); // Поиск пользователя в базе данных
    const isPasswordValid = await bcrypt.compare("1234", user.password); // Проверка хешированного пароля
    expect(isPasswordValid).toBe(true); // Ожидание, что пароль соответствует новому паролю
  });

  afterAll(async () => {
    // Выполняется после всех тестов
    await User.deleteOne({ email: "test@example.com" }); // Удаление созданного пользователя
    await Invitation.deleteOne({ invitedUser: user2Id }); // Удаление приглашения для пользователя 2
  });
});
