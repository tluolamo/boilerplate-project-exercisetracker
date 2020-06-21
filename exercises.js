const mongoose = require('mongoose')

// Create a simple User's schema
const exercises = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  userId: { type: mongoose.ObjectId, required: true }
})

module.exports = new mongoose.model('Exercises', exercises)
