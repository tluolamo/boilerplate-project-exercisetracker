const mongoose = require('mongoose')

// Create a simple User's schema
const users = new mongoose.Schema({
  username: { type: String, required: true, unique: true }
})

const Users = new mongoose.model('Users', users)
module.exports = Users
