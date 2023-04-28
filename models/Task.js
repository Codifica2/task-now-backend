const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    "titulo": String,
    "descripcion": String,
    "fecha_vencimiento": Date,
    "categoria": String,
    "status": String,
    "creador": String, // should be a users id
});

taskSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})

module.exports = mongoose.model('Task', taskSchema)
