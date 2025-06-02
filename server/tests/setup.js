const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Set test environment
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri, {
    maxPoolSize: 1,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
}, 30000);

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let c of collections) await c.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
}, 30000);
