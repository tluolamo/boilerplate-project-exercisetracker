/* eslint-env jest */
const request = require('supertest')
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer
const mongoose = require('mongoose')
const App = require('../app')
const app = App.app

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
  await mongoose.connect(mongoUri, {}, (err) => {
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
  test('SHould be able to post form data and it should return an object with username and _id', async done => {
    const response = await request(app).post('/api/exercise/new-user').send('username=unittestuser')
    expect(response.statusCode).toBe(200)
    expect(response.body.username).toBe('unittestuser')
    expect(typeof response.body._id).toBe('string')
    done()
  })
})
