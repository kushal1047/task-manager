require("./setup");
const request = require("supertest");
const app = require("../server");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const getToken = async () => {
  const user = await User.create({
    firstName: "testFirst",
    lastName: "testLast",
    username: "tester",
    password: "hash",
  });
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
};

describe("Task Routes", () => {
  it("creates a task for logged-in user", async () => {
    const token = await getToken();

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Write tests" });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Write tests");
  });

  it("denies access without token", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.statusCode).toBe(401);
  });
});
