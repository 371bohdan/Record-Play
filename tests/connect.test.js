const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

//тест для перевірки запуску БД, серверу та стартвої сторінки /login

describe('Test server startup', () => {
  let server;
  let url = 'mongodb+srv://magpie:123@cluster0.dtqc6ct.mongodb.net/data'
  beforeAll(async () => {
    await mongoose.connect(process.url, {
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