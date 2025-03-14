const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
require("dotenv").config({ path: ".env.test" });

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let c of collections) await c.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
});
