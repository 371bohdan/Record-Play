const request = require("supertest");
const {app, startServer} = require("../app");
const User = require('../models/user');
const {AnalysWater} = require('../models/water');
const bcrypt = require('bcrypt');
const router = require('../routes/start');
const axios = require('axios');
const chai = require('chai');
const httpMocks = require('node-mocks-http');
const chaiHttp = require('chai-http');
const flash = require('connect-flash');
chai.use(chaiHttp);
app.use(router);



describe('Test the routes', () => {
  beforeAll(async ()=>{
    User.deleteMany({username: 'com'})
    // Create a test user
    const user = new User({
      username: "test",
      password: await bcrypt.hash('12345678', 10),
      email: "tokenVeks@gmail.com"
    })
    await user.save();
  });

  test('fail to register with mismatched passwords', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
        password2: 'password456'
      });
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Passwords do not match');
  });

  test('fail to register with invalid email format', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'invalid-email-format',
        password: 'password123',
        password2: 'password123'
      });
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Invalid email format');
  });

  test('fail to register with mismatched passwords', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
        password2: 'password456'
      });
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Passwords do not match');
  });

  test('fail to register with not all data', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'tokenVeks@gmail.com',
        password: 'password123',
        password2: ''
      });
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Please fill in all fields!');
  })

  test('fail to register with without 8 character symbol', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'tokenVeks@gmail.com',
        password: 'passt',
        password2: 'passt'
      });
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Password should be at least 8 characters');
  })

  test('fail to register with repeated email', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'tokenVeks@gmail.com',
        password: 'password123',
        password2: 'password123'
      });
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('User with this email already exists');
  });


  test('should return a 200 status code and render registration page', async () => {
    const response = await request(app).get('/register');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('registration');
  });

  test('success redirect register', async () => {
    const res = await request(app).post('/register').send({
      username: 'com',
      email: 'tok@gmail.com',
      password: '12345678',
      password2: '12345678'
    });
    expect(res.statusCode).toBe(302);
    expect(res.header['location']).toBe('/login');
  });


  test('should return a 200 status code and render registration page', async () => {
    const response = await request(app).get('/register');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('registration');
  });

  test('test get allow go to account via login', async ()=>{
    const agent = request.agent(app);
    await agent.post('/login').send({ username: 'test', password: '12345678' });
    // Then request the profile page
    const response = await agent.get('/profile');
    expect(response.statusCode).toBe(200);
  });

  test('test get not allow go to account via login', async ()=> {
    const agent = request.agent(app);
    await agent.post('/login').send({ username: 'fake', password: 'fake' });
    const response = await agent.get('/profile');
    expect(response.statusCode).toBe(302);
  })


  test('should return a 200 status code and render login page', async () => {
    const response = await request(app).get('/login');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Login');
  });

  test('should logout user and redirect to login page', async () => {
    const agent = request.agent(app);
    await agent.get('/login');
    await agent.post('/login')
      .send({username: 'testuser', password: 'testpassword'});

    const response = await agent.get('/logout');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/login');
  });


  test('should redirect to login page if user is not authenticated', async () => {
    const res = await request(app).get('/water');
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/login');
  });

  test('should render the water page if user is authenticated', async () => {
    const agent = request.agent(app);
    await agent.post('/login').send({ username: 'test', password: '12345678' });
    const res = await agent.get('/water');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('New record about water');
  });

  test('success add data water', async () => {
    const res = await request(app).post('/water').send({
      name_place: 'Test place',
      coordinateX: '123.456',
      coordinateY: '78.90',
      year: '2022',
      season: 'spring',
      chemical_index: 'pH',
      result: "7.021",
      comment: ''
    });
    expect(res.statusCode).toBe(302);
    expect(res.header['location']).toBe('/profile');
  });

  afterAll(async () =>{
  //Remove our recrods
  await User.deleteMany({username: 'test' });
  await User.deleteMany({username: 'testuser'});
  await User.deleteMany({username: 'com'});
  await AnalysWater.deleteMany({name_place: 'Test place'})
  });
});


describe('own', () => {
  test('should return errors when required fields are missing', async () => {
    const res = await request(app).post('/water').send({});
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Please fill in all fields!');
  });
  test('should return an error when coordinateX is in the wrong format', async () => {
    const res = await request(app).post('/water').send({
      name_place: 'Test place',
      coordinateX: 'invalid',
      coordinateY: '78.90',
      year: '2022',
      season: 'spring',
      chemical_index: 'pH',
      result: 7.011,
      comment: ''
    });
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Incorrect enter coordinateX');
  });
  test('should return an error when coordinateY is in the wrong format', async () => {
    const res = await request(app).post('/water').send({
      name_place: 'Test place',
      coordinateX: '123.456',
      coordinateY: 'invalid',
      year: '2022',
      season: 'spring',
      chemical_index: 'pH',
      result: 7.011,
      comment: ''
    });
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Incorrect enter coordinateY');
  });
});




describe('GET /water', () => {
  it('should return 200 OK', async () => {
    const agent = request.agent(app);

    // Log in first
    await agent.post('/login').send({ username: 'rasty', password: '123' });

    // Request the water page
    const response = await agent.get('/water');

    expect(response.statusCode).toBe(200);
  });
});


test('POST /set_water/:id should update data successfully', async () => {
  const agent = request.agent(app);
  await agent.post('/login').send({ username: 'rasty', password: '123' });
  const id = '644a51068e302f92463b8115'; // Replace with valid ID
  const response = await request(app)
    .post(`/set_water/${id}`)
    .send({
      name_place: 'Sumka',
      coordinateX: 22.111,
      coordinateY: 33.101,
      year: '2020',
      season: 'winter',
      chemical_index: 'Fosafty',
      result: 0.21,
      comment: 'Normal result'
    });
  expect(response.statusCode).toBe(302); // Redirect to /profile
  expect(response.header.location).toBe('/profile');
});


describe('own', () => {
  let water;
  let id;
  let agent;
  beforeAll(async () => {
  water = await AnalysWater.create({
    name_place: 'Test Place',
    coordinateX: '22.111',
    coordinateY: '33.101',
    year: '2020',
    season: 'winter',
    chemical_index: 'Fosafty',
    result: '0.21',
    comment: 'Normal result',
    });
    agent = request.agent(app);
    await agent.post('/login').send({ username: 'rasty', password: '123' });
    id = water._id;
  })



  it('should render set_water page with data', async () => {
    const response = await agent.get(`/set_water/${id}`);
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Test Place');
    expect(response.text).toContain('22.111');
    expect(response.text).toContain('33.101');
    expect(response.text).toContain('2020');
    expect(response.text).toContain('winter');
    expect(response.text).toContain('Fosafty');
    expect(response.text).toContain('0.21');
    expect(response.text).toContain('Normal result');
  });

  it('should redirect back to the form page with an error message when coordinateX is not a number with a period', async () => {
    const res = await request(app)
      .post(`/set_water/123`)
      .send({
        name_place: 'Lake',
        coordinateX: 'invalid',
        coordinateY: '112.1',
        year: '2022',
        season: 'Summer',
        chemical_index: 'pH',
        result: '7.4',
        comment: 'Test comment',
      });

    expect(res.status).toBe(302);
    expect(res.header.location).toBe(`/set_water/123`);

  });

  it('should redirect back to the form page with an error message when coordinateY is not a number with a period', async () => {
    const res = await request(app)
      .post(`/set_water/123`)
      .send({
        name_place: 'Lake',
        coordinateX: '112.1',
        coordinateY: 'fake',
        year: '2022',
        season: 'Summer',
        chemical_index: 'pH',
        result: '7.4',
        comment: 'Test comment',
      });

    expect(res.status).toBe(302);
    expect(res.header.location).toBe(`/set_water/123`);

  });


  afterAll(async () => {
    // Remove test data from the collection
    await AnalysWater.deleteMany({name_place:'Test Place'});
  });
})

describe('GET /reset-password/:token', () => {
  test('should redirect to forgot-password page if the token is invalid or expired', async () => {
    const res = await request(app).get('/reset-password/invalidtoken');
    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/forgot-password');
    expect(res.text).not.toContain('reset your password');
  });

  test('should render the reset page if the token is valid and not expired', async () => {
    const user = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'testpassword',
      resetPasswordToken: 'validtoken',
      resetPasswordExpires: Date.now() + 3600000, // 1 hour from now
    });
    await user.save();

    const res = await request(app).get('/reset-password/validtoken');
    expect(res.status).toBe(200);
    expect(res.text).toContain('reset your password testuser');

    await User.deleteOne({ _id: user._id });
  });

  test('should redirect to forgot-password page if an error occurs while finding the user', async () => {
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const res = await request(app).get('/reset-password/validtoken');
    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/forgot-password');
    expect(res.text).not.toContain('reset your password');

    jest.spyOn(User, 'findOne').mockRestore();
  });
});



/*test('adds a new analysis to the database', async () => {
  const req = {
  body: {
    name_place: 'Test place',
    coordinateX: '123.456',
    coordinateY: '78.90',
    year: '2022',
    season: 'spring',
    chemical_index: 'pH',
    result: '7.0',
    comment: ''
  }
  };
  const res = {
    render: jest.fn(),
    redirect: jest.fn(),
  };
  const testPostWater = async (req, res) => {
    await router.post('/water', (req, res) => {
    });
  };
  await testPostWater(req, res);
  expect(res.redirect).toHaveBeenCalledWith('/profile');
});*/




















/*test('handles server error', async () => {
  const req = { body: {username: 'test',
    email: 'fake@gmail.com',
    password: '12345678'
  }};
  const res = {
    render: jest.fn(),
  };
  const mockError = new Error('Something went wrong');
  const spy = jest.spyOn(User.prototype, 'save').mockRejectedValue(mockError);

  await routes.additional.registerPost;

  expect(spy).toHaveBeenCalled();
  expect(res.render).toHaveBeenCalledWith('register', {
    errors: [{ msg: 'Server Error' }],
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    password2: req.body.password2,
  });

  spy.mockRestore();
});
*/











