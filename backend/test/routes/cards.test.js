import request from "supertest";
import app from "../../server.js";
import User from "../../models/user.js";
import Card from "../../models/card.js";

const setAuthToken = async (data) => {
  const response = await request(app).post("/api/auth/login").send(data);
  return response.body.token;
};

const createTempCard = async (boardId, listId, token, title) => {
  const newCardResponse = await request(app)
    .post(`/api/cards/${boardId}/${listId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title });

  return newCardResponse.body;
};

describe("Card routes", () => {
  let token;
  let boardId;
  let listId;

  beforeAll(async () => {
    token = await setAuthToken({
      email: "dmirshanov@mail.ru",
      password: "123",
    });

    // Получаем идентификаторы доски и списка из базы данных
    const boardResponse = await request(app)
      .get("/api/boards/65ba1a49e2aef2a321f69cf6")
      .set("Authorization", `Bearer ${token}`);
    boardId = boardResponse.body._id;

    listId = boardResponse.body.lists[0]._id;
  });

  test("Создание новой карточки", async () => {
    const title = "New Card";

    const response = await request(app)
      .post(`/api/cards/${boardId}/${listId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.title).toBe(title);
  });

  test("Попытка создания карточки с недопустимым списком", async () => {
    const title = "New Card";

    const response = await request(app)
      .post(`/api/cards/${boardId}/123456789012345678901234`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "Список не найден");
  });

  test("Попытка создания карточки на несуществующей доске", async () => {
    const title = "New Card";

    const response = await request(app)
      .post(`/api/cards/123456789012345678901234/${listId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "Доска не найдена");
  });

  test("Удаление карточки", async () => {
    const title = "New Card";

    let card = await createTempCard(boardId, listId, token, title);
    let cardId = card._id;

    const response = await request(app)
      .delete(`/api/cards/${boardId}/${listId}/${cardId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("cards");
    expect(response.body.cards).not.toContain(cardId);
  });

  test("Попытка удаления карточки с недопустимой доской", async () => {
    const title = "New Card";

    let card = await createTempCard(boardId, listId, token, title);
    let cardId = card._id;

    const response = await request(app)
      .delete(`/api/cards/123456789012345678901234/${listId}/${cardId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "Доска не найдена");
  });

  test("Попытка удаления карточки с недопустимым списком", async () => {
    const title = "New Card";

    let card = await createTempCard(boardId, listId, token, title);
    let cardId = card._id;

    const response = await request(app)
      .delete(`/api/cards/${boardId}/123456789012345678901234/${cardId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "Список не найден");
  });

  test("Попытка удаления несуществующей карточки", async () => {
    const response = await request(app)
      .delete(`/api/cards/${boardId}/${listId}/123456789012345678901234`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "Карточка не найдена");
  });

  test("Изменение списка карточки", async () => {
    const toListId = "65e5561fd4dd2815b1f794af";
    const newOrder = 0;

    const title = "New Card";
    let card = await createTempCard(boardId, listId, token, title);
    let cardId = card._id;

    const response = await request(app)
      .put(`/api/cards/${boardId}/${cardId}/move`)
      .set("Authorization", `Bearer ${token}`)
      .send({ from: listId, to: toListId, newOrder });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Карточка успешно перемещена в новый список"
    );
  });

  test("Попытка перемещения карточки на доске с неверными списками", async () => {
    const fromListId = "123456789012345678901234"; // неверный список
    const toListId = "123456789012345678901235"; // неверный список
    const newOrder = 0;

    const title = "New Card";
    let card = await createTempCard(boardId, fromListId, token, title);
    let cardId = card._id;

    const response = await request(app)
      .put(`/api/cards/${boardId}/${cardId}/move`)
      .set("Authorization", `Bearer ${token}`)
      .send({ from: fromListId, to: toListId, newOrder });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "Неверные списки");
  });

  test("Попытка перемещения карточки на доске, где один из списков не принадлежит", async () => {
    const toListId = "65e5bc82682e91caddd93174"; // не принадлежит доске
    const newOrder = 0;

    const title = "New Card";
    let card = await createTempCard(boardId, listId, token, title);
    let cardId = card._id;

    const response = await request(app)
      .put(`/api/cards/${boardId}/${cardId}/move`)
      .set("Authorization", `Bearer ${token}`)
      .send({ from: listId, to: toListId, newOrder });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty(
      "message",
      "Один из списков не находится на данной доске"
    );
  });

  test("Попытка перемещения карточки на доске с некорректным новым порядком", async () => {
    const toListId = "65e5561fd4dd2815b1f794af";
    const newOrder = "invalid";

    const title = "New Card";
    let card = await createTempCard(boardId, listId, token, title);
    let cardId = card._id;

    const response = await request(app)
      .put(`/api/cards/${boardId}/${cardId}/move`)
      .set("Authorization", `Bearer ${token}`)
      .send({ from: listId, to: toListId, newOrder });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Некорректный новый порядок"
    );
  });

  test("Изменение порядка карточки внутри списка", async () => {
    const newOrder = 0;

    const title = "New Card";
    let card = await createTempCard(boardId, listId, token, title);
    let cardId = card._id;

    const response = await request(app)
      .put(`/api/cards/${boardId}/${cardId}/change-order?listId=${listId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ newOrder });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message", "Порядок изменён успешно");
  });

  test("Изменение списка пользователей карточки", async () => {
    const title = "New Card";
    let card = await createTempCard(boardId, listId, token, title);
    let cardId = card._id;

    const user = await User.findById("65bc81683d07858fcab31e01");

    // Добавление пользователя в список
    let response = await request(app)
      .put(`/api/cards/${boardId}/${cardId}/users`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "add", userId: user._id });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("assignedUsers");
    expect(response.body.assignedUsers).toContain(String(user._id));

    // Удаление пользователя из списка
    response = await request(app)
      .put(`/api/cards/${boardId}/${cardId}/users`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "remove", userId: user._id });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("assignedUsers");
    expect(response.body.assignedUsers).not.toContain(String(user._id));
  });

  test("Обновление данных о карточке", async () => {
    const title = "New Card";
    let card = await createTempCard(boardId, listId, token, title);
    let cardId = card._id;

    const newTitle = "Updated Card Title";
    const newDescription = "Updated card description";
    const newDueDate = new Date().toISOString();
    const newStartDate = new Date().toISOString();
    const newComments = [
      { author: "65b9ddcee2aef2a321f69cb9", message: "Updated comment" },
    ];

    const response = await request(app)
      .put(`/api/cards/${boardId}/${cardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: newTitle,
        description: newDescription,
        dueDate: newDueDate,
        startDate: newStartDate,
        comments: newComments,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe(newTitle);
    expect(response.body.description).toBe(newDescription);
    expect(response.body.dueDate).toBe(newDueDate);
    expect(response.body.startDate).toBe(newStartDate);
    expect(response.body.comments).toHaveLength(1);
    expect(response.body.comments[0]).toHaveProperty(
      "author._id",
      newComments[0].author
    );
    expect(response.body.comments[0]).toHaveProperty(
      "message",
      newComments[0].message
    );
  });

  afterAll(async () => {
    await Card.deleteMany({
      $or: [{ title: "New Card" }, { title: "Updated Card Title" }],
    });
  });
});
