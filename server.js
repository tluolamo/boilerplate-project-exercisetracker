require('dotenv').config()
const mongoose = require('mongoose')
const app = require('./app').app

// mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track')
mongoose.connect(process.env.MLAB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
