import request from "supertest";
import app from "../../server.js";
import Board from "../../models/board.js";

const setAuthToken = async (data) => {
  const response = await request(app).post("/api/auth/login").send(data);

  return { token: response.body.token, userId: response.body._id };
};

describe("Board routes", () => {
  let token;
  let userId;
  let createdBoardId;

  let secondUserId;
  let secondUserToken;

  beforeAll(async () => {
    const mainUserInfo = await setAuthToken({
      email: "dmirshanov@mail.ru",
      password: "123",
    });
    userId = mainUserInfo.userId;
    token = mainUserInfo.token;

    const secondUserInfo = await setAuthToken({
      email: "dmirshanov2002@mail.ru",
      password: "123",
    });

    secondUserId = secondUserInfo.userId;
    secondUserToken = secondUserInfo.token;
  });

  test("Получение списка всех досок", async () => {
    const expectedBoardIds = [
      "65ba1a49e2aef2a321f69cf6",
      "65e5b8a1f6061fcea6f38046",
      "6634d62f1fe8fdf397321ec2",
    ];

    const response = await request(app)
      .get("/api/boards")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    const boardIds = response.body.map((board) => board._id);
    expect(boardIds).toEqual(expect.arrayContaining(expectedBoardIds));
  });

  test("Создание новой доски", async () => {
    const response = await request(app)
      .post("/api/boards")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "TESTING BOARD" });

    createdBoardId = response.body._id;

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.title).toBe("TESTING BOARD");
    expect(response.body.creator).toBe(userId);
    expect(response.body.labels).toHaveLength(5);
  });

  test("Удаление доски", async () => {
    const newBoard = await Board.create({
      title: "Тестовая доска",
      creator: userId,
      labels: [],
    });

    const response = await request(app)
      .delete(`/api/boards/${newBoard._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Доска и все ее списки и карточки успешно удалены"
    );

    const deletedBoard = await Board.findById(newBoard._id);
    expect(deletedBoard).toBeNull();
  });

  test("Попытка удаления несуществующей доски", async () => {
    const response = await request(app)
      .delete("/api/boards/123456789012345678901234")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "Доска не найдена");
  });

  test("Получение полной информации о доске", async () => {
    const response = await request(app)
      .get("/api/boards/65ba1a49e2aef2a321f69cf6")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("DIPLOMA");
    expect(response.body.users).toHaveLength(1);
    expect(response.body.users[0]._id).toBe("662cf4b18e715fcbc8577c62");
    expect(response.body.lists).toHaveLength(4);
    expect(response.body.lists.map((list) => list._id)).toEqual([
      "65bcab12e1089d54efd90a58",
      "65ba1d31e2aef2a321f69d42",
      "65ba1d42e2aef2a321f69d54",
      "65e5561fd4dd2815b1f794af",
    ]);

    expect(response.body.creator._id).toBe(userId);
  });

  test("Попытка получения информации о несуществующей доске", async () => {
    const response = await request(app)
      .get("/api/boards/123456789012345678901234")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "Доска не найдена");
  });

  test("Обновление данных о доске", async () => {
    const updatedTitle = "New Title";
    const updatedDescription = "New Description";

    const response = await request(app)
      .put(`/api/boards/${createdBoardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: updatedTitle,
        description: updatedDescription,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe(updatedTitle);
    expect(response.body.description).toBe(updatedDescription);
  });

  test("Покинуть доску", async () => {
    const board = await Board.findById(createdBoardId);
    board.users.push({
      role: "MEMBER",
      userId: secondUserId,
    });

    await board.save();

    const response = await request(app)
      .put(`/api/boards/${createdBoardId}/leave`)
      .set("Authorization", `Bearer ${secondUserToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Вы успешно покинули доску"
    );

    const updatedBoard = await Board.findById(createdBoardId);
    expect(updatedBoard.users).toHaveLength(0);
  });

  test("Кикнуть пользователя с доски", async () => {
    const board = await Board.findById(createdBoardId);
    board.users.push({
      role: "MEMBER",
      userId: secondUserId,
    });

    const response = await request(app)
      .put(`/api/boards/${createdBoardId}/kick-user`)
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: secondUserId });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);

    const updatedBoard = await Board.findById(createdBoardId);
    expect(
      updatedBoard.users.map((user) => user.userId.toString())
    ).not.toContain(secondUserId);
  });

  test("Попытка кикнуть пользователя из несуществующей доски", async () => {
    const response = await request(app)
      .put("/api/boards/123456789012345678901234/kick-user")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: secondUserId });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "Доска не найдена");
  });

  test("Изменение роли пользователя на доске", async () => {
    const board = await Board.findById(createdBoardId);
    board.users.push({
      role: "MEMBER",
      userId: secondUserId,
    });

    await board.save();

    const newRole = "ADMIN";

    const response = await request(app)
      .put(`/api/boards/${createdBoardId}/change-user-role`)
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: secondUserId, newRole });

    expect(response.statusCode).toBe(200);
    const updatedUsers = response.body;
    const user = updatedUsers.find((u) => u._id === secondUserId);
    expect(user.role).toBe(newRole);
  });

  //   Labels
  let newLabel;

  test("Добавление метки на доску", async () => {
    const label = { title: "New Label", color: "#FF5733" };
    const response = await request(app)
      .put(`/api/boards/${createdBoardId}/add-label`)
      .set("Authorization", `Bearer ${token}`)
      .send({ label });

    expect(response.statusCode).toBe(200);
    newLabel = response.body;
    expect(newLabel.title).toBe(label.title);
    expect(newLabel.color).toBe(label.color);
  });

  test("Обновление метки на доске", async () => {
    const labelToUpdate = {
      _id: newLabel._id,
      title: "Updated Label",
      color: "#3366FF",
    };
    const response = await request(app)
      .put(`/api/boards/${createdBoardId}/update-label`)
      .set("Authorization", `Bearer ${token}`)
      .send({ label: labelToUpdate });

    expect(response.statusCode).toBe(200);
    const updatedLabels = response.body;
    const updatedLabel = updatedLabels.find((l) => l._id === labelToUpdate._id);
    expect(updatedLabel.title).toBe(labelToUpdate.title);
    expect(updatedLabel.color).toBe(labelToUpdate.color);
    newLabel = labelToUpdate;
  });

  test("Удаление метки с доски", async () => {
    const response = await request(app)
      .put(`/api/boards/${createdBoardId}/delete-label`)
      .set("Authorization", `Bearer ${token}`)
      .send({ label: newLabel });

    expect(response.statusCode).toBe(200);
    const updatedBoard = response.body;
    const deletedLabel = updatedBoard.labels.find(
      (l) => l.title === newLabel.title
    );
    expect(deletedLabel).toBeUndefined();
  });

  afterAll(async () => {
    await Board.findByIdAndDelete(createdBoardId);
  });
});
