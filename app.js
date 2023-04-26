const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const errorHandler = require('./middleware/errorHandler')
const mongoose = require('mongoose')
const unknownEndpoint = require('./middleware/unknownEndpoint')
mongoose.set('strictQuery', false)

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        console.log("connected to MongoDB")
    })
    .catch((error) => {
        console.error("error connecting to MongoDB:", error.message)
    })

app.use(cors())
app.use(express.json())

// Endpoints
// Para crear un endpoint, crear el handler en la carpeta controllers
// luego importarlo y usarlo como middleware
// ej: const taskRouter = require('./controllers/taskRouter')



// Otros middleware que deben cargarse al final
app.use(unknownEndpoint)
app.use(errorHandler)

module.exports(app)