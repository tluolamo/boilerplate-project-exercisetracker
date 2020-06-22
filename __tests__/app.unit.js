/* eslint-env jest */
const request = require('supertest')
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer
const mongoose = require('mongoose')
const App = require('../app')
const app = App.app
const Users = require('../users')
const Exercises = require('../exercises')

const primaryUser = 'unittestuser'

const firstUserId = '000000000000000000000001'
const secondUserId = '000000000000000000000002'
const thirdUserId = '000000000000000000000003'

const firstUserName = 'unittest1'
const secondUserName = 'unittest2'
const thirdUserName = 'unittest3'

const firstDate = '2020-03-21'
const secondDate = '2020-04-21'
const thirdDate = '2020-05-21'

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

  const users = [
    { _id: firstUserId, username: firstUserName },
    { _id: secondUserId, username: secondUserName },
    { _id: thirdUserId, username: thirdUserName }
  ]
  const exercises = [
    { userId: firstUserId, description: 'Run', duration: 60, date: firstDate },
    { userId: firstUserId, description: 'Run', duration: 60, date: secondDate },
    { userId: firstUserId, description: 'Run', duration: 60, date: thirdDate },
    { userId: secondUserId, description: 'Weghtlifting', duration: 45, date: firstDate },
    { userId: secondUserId, description: 'Weghtlifting', duration: 45, date: secondDate },
    { userId: secondUserId, description: 'Weghtlifting', duration: 45, date: thirdDate },
    { userId: thirdUserId, description: 'Swimming', duration: 30, date: firstDate },
    { userId: thirdUserId, description: 'Swimming', duration: 30, date: secondDate },
    { userId: thirdUserId, description: 'Swimming', duration: 30, date: thirdDate }
  ]
  await Users.create(users)
  await Exercises.create(exercises)
  // console.log(await Users.find())
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

describe('Test Bad page', () => {
  test('It should return 404', async done => {
    const response = await request(app).get('/doesnotexists')
    expect(response.statusCode).toBe(404)
    done()
  })
})

// /api/exercise/new-user

describe('Test new user API', () => {
  test('Should be able to post form data and it should return an object with username and _id', async done => {
    const response = await request(app)
      .post('/api/exercise/new-user').type('form').send({ username: primaryUser })
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
    const userId = firstUserId
    const response = await request(app)
      .post('/api/exercise/add').type('form').send({ userId, description, duration })
    const rec = response.body

    expect(response.statusCode).toBe(200)
    expect(rec._id).toBe(userId)
    expect(rec.username).toBe(firstUserName)
    expect(rec.description).toBe(description)
    expect(rec.duration).toBe(duration)
    expect(typeof rec.date).toBe('string')
    done()
  })

  test('Should be able to post with a defined date too', async done => {
    const date = '2020-06-21'
    const description = 'Weightlifting'
    const duration = 60
    const userId = firstUserId

    const response = await request(app)
      .post('/api/exercise/add').type('form').send({ userId, description, duration, date })
    const rec = response.body

    expect(response.statusCode).toBe(200)
    expect(rec._id).toBe(userId)
    expect(rec.username).toBe(firstUserName)
    expect(rec.description).toBe(description)
    expect(rec.duration).toBe(duration)
    expect(rec.date).toBe('Sat Jun 20 2020')
    done()
  })

  test('Should cause validation error if invalid data is passed in', async done => {
    const date = '2020-06-41'
    const description = 'Weightlifting'
    const duration = 'Error'
    const userId = firstUserId

    const response = await request(app)
      .post('/api/exercise/add').type('form').send({ userId, description, duration, date })

    expect(response.statusCode).toBe(400)
    done()
  })
})

// 4. I can retrieve a full exercise log of any user by getting /api/exercise/log with a parameter of userId(_id). Return will be the user object with added array log and count (total exercise count).

describe('Test exercise log API', () => {
  test('Should be able to get with user id and return user object with log array of exercises', async done => {
    const userId = secondUserId
    // console.log(userId)
    const response = await request(app)
      .get('/api/exercise/log').query({ userId })
    const rec = response.body

    expect(response.statusCode).toBe(200)
    expect(rec.username).toBe(secondUserName)
    expect(rec._id).toBe(userId)
    expect(typeof rec.log).toBe('object')
    expect(rec.log.length).toBe(3)

    const firstLog = rec.log[0]

    expect(typeof firstLog._id).toBe('string')
    expect(firstLog.userId).toBe(userId)
    expect(typeof firstLog.description).toBe('string')
    expect(typeof firstLog.duration).toBe('number')
    expect(firstLog.date).toMatch(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T/ig)
    done()
  })

  // 5. I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)
  test('Should be able to get with user id and "to" to limit by date', async done => {
    const userId = secondUserId
    const response = await request(app)
      .get('/api/exercise/log').query({ userId, to: secondDate })
    const rec = response.body
    // console.log(rec)

    expect(response.statusCode).toBe(200)
    expect(rec.log.length).toBe(2)

    done()
  })

  test('Should be able to get with user id and "from" to limit by date', async done => {
    const userId = secondUserId
    const response = await request(app)
      .get('/api/exercise/log').query({ userId, from: secondDate })
    const rec = response.body
    // console.log(rec)

    expect(response.statusCode).toBe(200)
    expect(rec.log.length).toBe(2)

    done()
  })

  test('Should be able to get with user id, "to" and "from" to limit by date', async done => {
    const userId = secondUserId
    const response = await request(app)
      .get('/api/exercise/log').query({ userId, from: secondDate, to: secondDate })
    const rec = response.body
    // console.log(rec)

    expect(response.statusCode).toBe(200)
    expect(rec.log.length).toBe(1)

    done()
  })

  test('Should be able to get with user id limting log entries by number', async done => {
    const userId = secondUserId
    const response = await request(app)
      .get('/api/exercise/log').query({ userId, limit: 2 })
    const rec = response.body
    // console.log(rec)

    expect(response.statusCode).toBe(200)
    expect(rec.log.length).toBe(2)
    done()
  })

  test('Should be able to cause error with bad entries', async done => {
    const userId = secondUserId
    const response = await request(app)
      .get('/api/exercise/log').query({ userId, from: 'a' })

    expect(response.statusCode).toBe(500)
    expect(response.text).toBe('Cast to date failed for value "a" at path "date" for model "Exercises"')
    expect(response.res.statusMessage).toBe('Internal Server Error')
    done()
  })
})
