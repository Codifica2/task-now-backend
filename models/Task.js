const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    "title": String,
    "description": String,
    "expiry-date": Date,
    "category": String,
    "status": String,
    "creator": String, // should be a users id
});

taskSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})

module.exports = mongoose.model('Task', taskSchema)
