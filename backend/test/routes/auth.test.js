import app from "../../server.js";
import request from "supertest";

//reset password token
//da961beae7718ad60a0f1b68050e0e0421d852dd
describe("Auth routes", () => {
  test("registers a new user", (done) => {
    request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser",
        email: "test@example.com",
        password: "testpassword",
      })
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toHaveProperty(
          "message",
          "Пользователь успешно зарегистрирован"
        );
        done();
      });
  });

  test("logs in a user", (done) => {
    request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "testpassword" })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toHaveProperty("message");
        done();
      });
  });

  test("sends a password reset email", (done) => {
    request(app)
      .post("/api/auth/forgotPassword")
      .send({ email: "test@example.com" })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toHaveProperty("message");
        done();
      });
  });

  test("resets the password for a user", (done) => {
    // Здесь вы должны предоставить действительный токен сброса пароля для существующего пользователя
    const token = "your-reset-token";

    request(app)
      .post(`/api/auth/reset/${token}`)
      .send({ password: "newpassword" })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toHaveProperty(
          "message",
          "Пароль успешно изменен"
        );
        done();
      });
  });
});
