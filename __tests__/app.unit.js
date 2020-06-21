/* eslint-env jest */
const request = require('supertest')
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer
const mongoose = require('mongoose')
const App = require('../app')
const app = App.app

const primaryUser = 'unittestuser'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000

let mongoServer

beforeAll(async () => {
  // jest.resetModules()
  mongoServer = new MongoMemoryServer({
    binary: {
      version: 'latest' // or you use process.env.MONGOMS_VERSION = '4.0.0'
    }
  })

  const mongoUri = await mongoServer.getUri()
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) console.error(err)
  })
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('Test Homepage', () => {
  test('It should respond to the GET method', async done => {
    const response = await request(app).get('/')
    expect(response.statusCode).toBe(200)
    done()
  })
})

// /api/exercise/new-user

describe('Test new user API', () => {
  test('Should be able to post form data and it should return an object with username and _id', async done => {
    const response = await request(app).post('/api/exercise/new-user').send(`username=${primaryUser}`)
    expect(response.statusCode).toBe(200)
    expect(response.body.username).toBe(primaryUser)
    expect(typeof response.body._id).toBe('string')
    done()
  })
})

// api/exercise/users
describe('Test user list API', () => {
  test('Should be able to do get with username and it should return an array of objects with username and _id', async done => {
    const response = await request(app).get('/api/exercise/users').query({ username: primaryUser })
    const firstRec = response.body[0]
    expect(response.statusCode).toBe(200)
    expect(firstRec.username).toBe(primaryUser)
    expect(typeof firstRec._id).toBe('string')
    done()
  })
})

// /api/exercise/add
describe('Test exercise add API', () => {
  test('Should be able to post exercise data from a form', async done => {
    const description = 'Weightlifting'
    const duration = 60
    const userId = (await request(app)
      .post('/api/exercise/new-user').type('form').send({ username: primaryUser })).body._id
    const response = await request(app)
      .post('/api/exercise/add').type('form').send({ userId, description, duration })
    const rec = response.body

    expect(response.statusCode).toBe(200)
    expect(typeof rec._id).toBe('string')
    expect(rec.userId).toBe(userId)
    expect(rec.description).toBe(description)
    expect(rec.duration).toBe(duration)
    done()
  })

  test('SHould be able to post with a defined date too', async done => {
    const description = 'Weightlifting'
    const duration = 60
    const userId = (await request(app)
      .post('/api/exercise/new-user').type('form').send({ username: primaryUser })).body._id
    const response = await request(app)
      .post('/api/exercise/add').type('form').send({ userId, description, duration })
    const rec = response.body

    expect(response.statusCode).toBe(200)
    expect(typeof rec._id).toBe('string')
    expect(rec.userId).toBe(userId)
    expect(rec.description).toBe(description)
    expect(rec.duration).toBe(duration)
    done()
  })
})
