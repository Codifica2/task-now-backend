const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: String,
    lastname: String,
    password: String,
    email: String,
    photo: String,
  })
  
  const User = mongoose.model('User', userSchema)

  userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })
  
  module.exports = mongoose.model('User', userSchema)