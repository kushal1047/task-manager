require("./setup");
const request = require("supertest");
const app = require("../index");
const User = require("../models/User");
const Task = require("../models/Task");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const getToken = async () => {
  const user = await User.create({
    firstName: "testFirst",
    lastName: "testLast",
    username: "tester",
    password: "hash",
  });
  return {
    token: jwt.sign({ id: user._id }, process.env.JWT_SECRET),
    userId: user._id,
  };
};

describe("Task Routes", () => {
  it("creates a task for logged-in user", async () => {
    const { token } = await getToken();

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

  it("updates a task's completion status", async () => {
    const { token, userId } = await getToken();
    const task = await Task.create({
      title: "Test task",
      completed: false,
      user: userId,
    });
    let taskId = task._id;
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ completed: true });

    expect(res.statusCode).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it("returns 404 if task not found", async () => {
    const { token } = await getToken();
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/tasks/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ completed: true });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Task not found");
  });

  it("deletes a task", async () => {
    const { token, userId } = await getToken();
    const task = await Task.create({
      title: "Test task",
      completed: false,
      user: userId,
    });
    let taskId = task._id;
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(204);

    const deleted = await Task.findById(taskId);
    expect(deleted).toBeNull();
  });
});
