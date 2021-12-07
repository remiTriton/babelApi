const mongoose = require('mongoose')

module.exports = (uri, callback) => {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017', {useNewUrlParser: true})
  mongoose.connection.on('open', () => {
    console.log('MongoDB : Connected successfully');
  })
  mongoose.connection.on('error', (err) => {
    console.log(`MongoDB ERROR : ${err}`);
  })
}

