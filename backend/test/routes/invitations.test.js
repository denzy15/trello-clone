import request from "supertest";
import app from "../../server.js";
import Board from "../../models/board.js";
import Invitation from "../../models/invitation.js";
import User from "../../models/user.js";

const setAuthToken = async (data) => {
  const response = await request(app).post("/api/auth/login").send(data);
  return response.body.token;
};

describe("Invitation routes", () => {
  let token;
  let boardId;
  let invitedUserId = "65bc81683d07858fcab31e01";
  let invitedUserToken;

  beforeAll(async () => {
    token = await setAuthToken({
      email: "dmirshanov@mail.ru",
      password: "123",
    });

    invitedUserToken = await setAuthToken({
      email: "alya.sapukova@mail.ru",
      password: "123",
    });

    // Получаем идентификатор доски из базы данных
    const boardResponse = await request(app)
      .get("/api/boards/65ba1a49e2aef2a321f69cf6")
      .set("Authorization", `Bearer ${token}`);
    boardId = boardResponse.body._id;
  });

  test("Отправка приглашения на доску", async () => {
    const response = await request(app)
      .post("/api/invite")
      .set("Authorization", `Bearer ${token}`)
      .send({ boardId, invitedUser: invitedUserId });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("_id");
    expect(response.body).toHaveProperty("board", boardId);
    expect(response.body).toHaveProperty("invitedUser", invitedUserId);
    expect(response.body).toHaveProperty("status", "pending");
  });

  test("Принятие приглашения на доску", async () => {
    // Создаем новое приглашение для принятия
    const invitationResponse = await request(app)
      .post("/api/invite")
      .set("Authorization", `Bearer ${token}`)
      .send({ boardId, invitedUser: invitedUserId });

    const invitationId = invitationResponse.body._id;

    const response = await request(app)
      .put("/api/invite/accept")
      .set("Authorization", `Bearer ${invitedUserToken}`)
      .send({ boardId, invitationId });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status", "accepted");

    const board = await Board.findById(boardId);

    board.users = board.users.filter(
      (user) => user.userId.toString() !== invitedUserId
    );
    await board.save();
  });

  test("Отклонение приглашения на доску", async () => {
    const invitationResponse = await request(app)
      .post("/api/invite")
      .set("Authorization", `Bearer ${token}`)
      .send({ boardId, invitedUser: invitedUserId });

    console.log(invitationResponse.body);

    const invitationId = invitationResponse.body._id;

    const response = await request(app)
      .put("/api/invite/decline")
      .set("Authorization", `Bearer ${invitedUserToken}`)
      .send({ invitationId });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status", "declined");
  });

  test("Удаление приглашения на доску", async () => {
    // Создаем новое приглашение для удаления
    const invitationResponse = await request(app)
      .post("/api/invite")
      .set("Authorization", `Bearer ${token}`)
      .send({ boardId, invitedUser: invitedUserId });

    const invitationId = invitationResponse.body._id;

    const response = await request(app)
      .delete(`/api/invite/${invitationId}`)
      .set("Authorization", `Bearer ${invitedUserToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("_id", invitationId);
  });

  afterEach(async () => {
    await Invitation.deleteMany({ board: boardId });
  });
});
