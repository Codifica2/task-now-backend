const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    "title": String,
    "description": String,
    "due_date": Date,
    "category": String,
    "status": String,
    "creador": String, // should be a user's id
    "assigned": [] // should be one or many user ids
});

taskSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})

module.exports = mongoose.model('Task', taskSchema)
