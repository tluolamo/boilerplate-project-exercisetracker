const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const asyncHandler = require('express-async-handler')
const Users = require('./users')

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'))

app.get('/', asyncHandler(async (req, res, next) => {
  res.sendFile(path.join(__dirname, '/views/index.html'))
}))

app.post('/api/exercise/new-user', asyncHandler(async (req, res, next) => {
  console.log(req.body)
  const username = req.body.username
  const user = await Users.findOneAndUpdate(
    { username: req.body.username },
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
