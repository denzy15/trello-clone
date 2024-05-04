import request from "supertest";
import app from "../../server.js";
import Card from "../../models/card.js";
import List from "../../models/list.js";
import Board from "../../models/board.js";

const setAuthToken = async (data) => {
  const response = await request(app).post("/api/auth/login").send(data);
  return response.body.token;
};

describe("List routes", () => {
  let token;
  let boardId;

  beforeAll(async () => {
    token = await setAuthToken({
      email: "dmirshanov@mail.ru",
      password: "123",
    });

    const boardResponse = await request(app)
      .get("/api/boards/65ba1a49e2aef2a321f69cf6")
      .set("Authorization", `Bearer ${token}`);
    boardId = boardResponse.body._id;
  });

  test("Создание нового списка", async () => {
    const title = "New list";

    const response = await request(app)
      .post(`/api/lists/${boardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.title).toBe(title);
  });

  test("Удаление списка", async () => {
    const title = "New list";

    const listResponse = await request(app)
      .post(`/api/lists/${boardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title });
    const listToDeleteId = listResponse.body._id;

    const card1Response = await request(app)
      .post(`/api/cards/${boardId}/${listToDeleteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Card 1" });
    const card2Response = await request(app)
      .post(`/api/cards/${listToDeleteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Card 2" });

    const deleteListResponse = await request(app)
      .delete(`/api/lists/${boardId}/${listToDeleteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteListResponse.statusCode).toBe(200);
    expect(deleteListResponse.body).toHaveProperty(
      "message",
      "Список успешно удален"
    );

    const deletedList = await List.findById(listToDeleteId);
    expect(deletedList).toBeNull();

    // Проверяем, что в массиве lists у модели Board нет удаленного списка
    const updatedBoard = await Board.findById(boardId, "lists").lean();
    updatedBoard.lists = updatedBoard.lists.map((list) => list.toString());
    expect(updatedBoard.lists).not.toContain(listToDeleteId);

    // Проверяем, что все созданные карточки также удалены из БД
    const deletedCard1 = await Card.findById(card1Response.body._id);
    const deletedCard2 = await Card.findById(card2Response.body._id);
    expect(deletedCard1).toBeNull();
    expect(deletedCard2).toBeNull();
  });

  test("Обновление заголовка списка", async () => {
    // Создаем новый список для теста
    const listResponse = await request(app)
      .post(`/api/lists/${boardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New list" });

    const updatedTitle = "Updated list title";

    // Отправляем запрос на обновление заголовка списка
    const response = await request(app)
      .put(`/api/lists/${boardId}/rename/${listResponse.body._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: updatedTitle });

    expect(response.statusCode).toBe(200);
    // Проверяем, что заголовок списка был обновлен
    expect(response.body.title).toBe(updatedTitle);
  });

  test("Перемещение списка", async () => {
    const initialBoard = await Board.findById(boardId).populate("lists").lean();
    const initialOrderedLists = initialBoard.lists.sort(
      (a, b) => a.order - b.order
    );

    // Создаем новый список для теста
    const listResponse = await request(app)
      .post(`/api/lists/${boardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New list" });

    // Отправляем запрос на перемещение списка
    const response = await request(app)
      .put(`/api/lists/${boardId}/move/${listResponse.body._id}`)
      .set("Authorization", `Bearer ${token}`)
      .query({ newOrder: 1 });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Список перемещён успешно");

    const updatedBoard = await Board.findById(boardId).populate("lists").lean();
    let updatedOrderedLists = updatedBoard.lists.sort(
      (a, b) => a.order - b.order
    );

    updatedOrderedLists.splice(1, 1);

    for (let i = 0; i < updatedOrderedLists.length; i++) {
      expect(updatedOrderedLists[i]._id === initialOrderedLists[i]._id);
    }
  });

  test("Копирование списка", async () => {
    const sourceListResponse = await request(app)
      .post(`/api/lists/${boardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New list" });

    // Добавляем несколько карточек в исходный список
    const sourceCard1Response = await request(app)
      .post(`/api/cards/${boardId}/${sourceListResponse.body._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Source Card 1" });

    const sourceCard2Response = await request(app)
      .post(`/api/cards/${boardId}/${sourceListResponse.body._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Source Card 2" });

    const board = await Board.findById(boardId);

    const sourceList = await List.findById(sourceListResponse.body._id);

    // Отправляем запрос на копирование списка
    const copyListResponse = await request(app)
      .put(`/api/lists/${boardId}/copy/${sourceListResponse.body._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Copied List" });

    // Проверяем, что статус код равен 200
    expect(copyListResponse.statusCode).toBe(200);

    // Проверяем, что в доске появился новый список
    const updatedBoard = await Board.findById(boardId);
    expect(updatedBoard.lists.length).toBe(board.lists.length + 1);

    // Проверяем, что создалась сущность List с новыми данными
    const newList = await List.findById(copyListResponse.body._id);
    expect(newList).toBeDefined();
    expect(newList.title).toBe("Copied List");

    // Проверяем, что в новом списке столько же карточек, сколько и в исходном
    expect(newList.cards.length).toBe(sourceList.cards.length);

    // Проверяем, что создались новые карточки на основе карточек из исходного списка
    const copiedCard1 = await Card.findById(copyListResponse.body.cards[0]._id);
    const copiedCard2 = await Card.findById(copyListResponse.body.cards[1]._id);
    expect(copiedCard1).toBeDefined();
    expect(copiedCard2).toBeDefined();

    // Проверяем, что _id карточек в новом списке не равны _id карточек в исходном списке
    expect(copiedCard1._id.toString()).not.toEqual(
      sourceCard1Response.body._id.toString()
    );
    expect(copiedCard2._id.toString()).not.toEqual(
      sourceCard2Response.body._id.toString()
    );
  });

  test("Перемещение карточек", async () => {
    // Создаем два списка
    const sourceListResponse = await request(app)
      .post(`/api/lists/${boardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New list" });

    const resultListResponse = await request(app)
      .post(`/api/lists/${boardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Result list" });

    // Добавляем карточку в исходный список
    const cardResponse = await request(app)
      .post(`/api/cards/${boardId}/${sourceListResponse.body._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New card" });

    // Перемещаем карточки
    const response = await request(app)
      .put(`/api/lists/${boardId}/move-cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        sourceListId: sourceListResponse.body._id,
        resultListId: resultListResponse.body._id,
      });

    // Проверяем, что статус код равен 200
    expect(response.statusCode).toBe(200);

    // Проверяем, что в исходном списке нет карточек
    const updatedSourceList = await List.findById(sourceListResponse.body._id);
    expect(updatedSourceList.cards.length).toBe(0);

    // Проверяем, что в целевом списке есть карточка
    const updatedResultList = await List.findById(resultListResponse.body._id);
    expect(updatedResultList.cards.length).toBe(1);
    expect(updatedResultList.cards[0].toString()).toBe(cardResponse.body._id);
  });

  afterEach(async () => {
    await List.deleteMany({
      $or: [
        { title: "Updated list title" },
        { title: "New list" },
        { title: "Copied List" },
        { title: "Result list" },
      ],
    });

    await Card.deleteMany({
      $or: [
        { title: "Source Card 1" },
        { title: "Source Card 2" },
        { title: "New card" },
      ],
    });

    const board = await Board.findById(boardId);
    board.lists.splice(4);
    await board.save();
  });
});
