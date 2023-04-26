const express = require('express')
const app = express()
const cors = require('cors')
const errorHandler = require('./middleware/errorHandler')
require('dotenv').config()


app.get("/", (req, res) => {
    response.send('<h1>Hello world!</h1>')
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})