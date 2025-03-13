require("./setup");
const request = require("supertest");
const app = require("../server");
const User = require("../models/User");

describe("Auth Routes", () => {
  it("registers a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "testFirst",
      lastName: "testLast",
      username: "tester12",
      password: "secret123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.username).toBe("tester12");
  });

  it("rejects duplicate username", async () => {
    await User.create({
      firstName: "testFirst",
      lastName: "testLast",
      username: "tester12",
      password: "secret",
    });

    const res = await request(app).post("/api/auth/register").send({
      username: "tester12",
      password: "secret123",
    });

    expect(res.statusCode).toBe(400);
  });
});
