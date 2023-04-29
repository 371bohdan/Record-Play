const mongoose = require('mongoose');
require('dotenv').config();

async function setupDB() {
  await mongoose.connect(MONGO_DATABASE_URL_TEST, { useNewUrlParser: true, useUnifiedTopology: true });
}

async function teardownDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}

module.exports = { setupDB, teardownDB };