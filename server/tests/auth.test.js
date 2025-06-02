require("./setup");
const request = require("supertest");
const app = require("../index");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
      firstName: "testFirst",
      lastName: "testLast",
      username: "tester12",
      password: "secret123",
    });

    expect(res.statusCode).toBe(400);
  });

  it("logs in a user", async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("secret", salt);
    await User.create({
      firstName: "testFirst",
      lastName: "testLast",
      username: "tester12",
      password: hash,
    });

    const res = await request(app).post("/api/auth/login").send({
      username: "tester12",
      password: "secret",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe("tester12");
  });

  it("validates login", async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("secret", salt);
    await User.create({
      firstName: "testFirst",
      lastName: "testLast",
      username: "tester12",
      password: hash,
    });

    const res = await request(app).post("/api/auth/login").send({
      username: "tester12",
      password: "secret12",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("returns valid: true for valid token", async () => {
    // Create a test user
    const user = await User.create({
      firstName: "testFirst",
      lastName: "testLast",
      username: "authTester",
      password: "secret123",
    });

    // Create a valid JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Call the protected route
    const res = await request(app)
      .get("/api/auth/validate-token")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.valid).toBe(true);
  });

  it("rejects request with no token", async () => {
    const res = await request(app).get("/api/auth/validate-token");

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("No token, authorization denied");
  });

  it("rejects request with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/validate-token")
      .set("Authorization", `Bearer invalidtoken123`);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Token invalid");
  });
});
