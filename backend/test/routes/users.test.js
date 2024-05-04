import request from "supertest";
import app from "../../server.js";
import User from "../../models/user.js";
import Invitation from "../../models/invitation.js";
import bcrypt from "bcryptjs";

const setAuthToken = async (data) => {
  const response = await request(app).post("/api/auth/login").send(data);
  return response.body.token;
};

describe("User routes", () => {
  let token1;
  let user2Id;
  let token2;
  let boardId;

  beforeAll(async () => {
    await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "testpassword",
    });

    token1 = await setAuthToken({
      email: "dmirshanov@mail.ru",
      password: "123",
    });

    let uResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "testpassword" });

    token2 = uResponse.body.token;
    user2Id = uResponse.body._id;

    const boardResponse = await request(app)
      .get("/api/boards/65ba1a49e2aef2a321f69cf6")
      .set("Authorization", `Bearer ${token1}`);
    boardId = boardResponse.body._id;
  });

  test("Получение всех пользователей", async () => {
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token1}`)
      .query({ search: "test" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].username).toBe("testuser");
  });

  test("Получение уведомлений пользователя", async () => {
    await request(app)
      .post("/api/invite")
      .set("Authorization", `Bearer ${token1}`)
      .send({ boardId, invitedUser: user2Id });

    const response = await request(app)
      .get("/api/users/notifications")
      .set("Authorization", `Bearer ${token2}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test("Обновление пользователя", async () => {
    const response = await request(app)
      .put(`/api/users/${user2Id}`)
      .set("Authorization", `Bearer ${token2}`)
      .send({ password: "testpassword", newPassword: "1234" });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Пароль успешно обновлён");

    // Проверяем, что пароль действительно обновлен
    const user = await User.findById(user2Id);
    const isPasswordValid = await bcrypt.compare("1234", user.password);
    expect(isPasswordValid).toBe(true);
  });

  afterAll(async () => {
    await User.deleteOne({ email: "test@example.com" });
    await Invitation.deleteOne({ invitedUser: user2Id });
  });
});
