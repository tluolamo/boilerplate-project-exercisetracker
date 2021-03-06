const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const asyncHandler = require('express-async-handler')
const Users = require('./users')
const Exercises = require('./exercises')

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'))

app.get('/', asyncHandler(async (req, res, next) => {
  res.sendFile(path.join(__dirname, '/views/index.html'))
}))

app.post('/api/exercise/add', asyncHandler(async (req, res, next) => {
  // console.log(req.body)
  const exercise = await Exercises.create(req.body)
  const user = await (Users.findById(req.body.userId))
  // console.log(user)
  res.json({
    _id: user._id,
    username: user.username,
    date: new Date(exercise.date).toDateString(),
    description: exercise.description,
    duration: exercise.duration
  })
}))

app.get('/api/exercise/log', asyncHandler(async (req, res, next) => {
  // console.log(req.query)
  const query = req.query
  const userId = query.userId
  const limit = +query.limit || 0
  const from = query.from || '0000-01-01'
  const to = query.to || '9999-12-31'
  const filters = { userId, date: { $gte: from, $lte: to } }

  const user = await Users.findById(userId)

  // console.log(filters)
  const log = await Exercises.find(filters).limit(limit)
  // console.log(log)
  user.log = log
  // console.log(user)
  const final = {
    _id: user._id,
    username: user.username,
    log: log
  }
  // console.log(final)
  res.json(final)
}))

app.post('/api/exercise/new-user', asyncHandler(async (req, res, next) => {
  // console.log(req.body)
  const username = req.body.username
  const user = await Users.findOneAndUpdate(
    { username: username },
    {
      $setOnInsert: {
        username: username
      }
    },
    {
      new: true, // return new doc if one is upserted
      upsert: true // insert the document if it does not exist
    }
  )
  res.json(user)
}))

app.get('/api/exercise/users', asyncHandler(async (req, res, next) => {
  // console.log(req.query)
  const users = await Users.find({ username: req.query.username })
  // console.log(users)
  res.json(users)
}))

// Not found middleware
app.use(async (req, res, next) => {
  return next({ status: 404, message: 'not found' })
})

// Error Handling middleware
app.use(async (err, req, res, next) => {
  let errCode, errMessage
  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

module.exports = {
  app
}
