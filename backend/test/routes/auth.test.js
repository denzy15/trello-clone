import User from "../../models/user.js";
import app from "../../server.js";
import request from "supertest";

describe("Auth routes", () => {
  test("Регистрация", (done) => {
    request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser",
        email: "test@example.com",
        password: "testpassword",
      })
      .end((err, res) => {
        if (err) return done(err);

        console.log(res.body.message);

        done();
      });
  });

  test("Вход в аккаунт", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "testpassword",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  test("Регистрация с некорректными данными", async () => {
    const response = await request(app).post("/api/auth/register").send({
      username: "",
      email: "test",
      password: "123",
    });

    expect(response.statusCode).toBe(400);
  });

  test("Вход в аккаунт с некорректными данными", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "nonexistent@example.com",
      password: "wrongpassword",
    });

    expect(response.statusCode).toBe(401);
  });

  afterAll(async () => {
    await User.deleteOne({ email: "test@example.com" });
  });
});
