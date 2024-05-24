import User from "../../models/user.js";
import app from "../../server.js";
import request from "supertest";

// Описание группы тестов для маршрутов аутентификации
describe("Auth routes", () => {
  // Тест для маршрута регистрации пользователя
  test("Регистрация", async () => {
    // Отправляем POST-запрос на маршрут /api/auth/register с данными нового пользователя
    const response = await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "testpassword",
    });

    // Ожидаем, что статус ответа будет 201 (Создано)
    expect(response.statusCode).toBe(201);
    // Ожидаем, что в теле ответа будет свойство message со значением "Пользователь успешно зарегистрирован"
    expect(response.body).toHaveProperty(
      "message",
      "Пользователь успешно зарегистрирован"
    );
  });

  // Тест для маршрута входа в аккаунт
  test("Вход в аккаунт", async () => {
    // Отправляем POST-запрос на маршрут /api/auth/login с данными для входа
    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "testpassword",
    });

    // Ожидаем, что статус ответа будет 200 (ОК)
    expect(response.statusCode).toBe(200);
    // Ожидаем, что в теле ответа будет свойство token
    expect(response.body).toHaveProperty("token");
  });

  // Тест для регистрации с некорректными данными
  test("Регистрация с некорректными данными", async () => {
    // Отправляем POST-запрос на маршрут /api/auth/register с некорректными данными
    const response = await request(app).post("/api/auth/register").send({
      username: "",
      email: "test",
      password: "123",
    });

    // Ожидаем, что статус ответа будет 400 (Некорректный запрос)
    expect(response.statusCode).toBe(400);
  });

  // Тест для входа в аккаунт с некорректными данными
  test("Вход в аккаунт с некорректными данными", async () => {
    // Отправляем POST-запрос на маршрут /api/auth/login с некорректными данными для входа
    const response = await request(app).post("/api/auth/login").send({
      email: "nonexistent@example.com",
      password: "wrongpassword",
    });

    // Ожидаем, что статус ответа будет 404 (Не найдено)
    expect(response.statusCode).toBe(404);
  });

  // После выполнения всех тестов удаляем тестового пользователя из базы данных
  afterAll(async () => {
    await User.deleteOne({ email: "test@example.com" });
  });
});

