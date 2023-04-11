const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

//тест для перевірки запуску БД, серверу та стартвої сторінки /login

describe('Test server startup', () => {
  let server;
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    server = app.listen(4000);
  });

  afterAll(async () => {
    await server.close();
    await mongoose.disconnect();
  });

  it('should start the server', async () => {
    const response = await request(server).get('/login');
    expect(response.status).toEqual(200);
  });
});