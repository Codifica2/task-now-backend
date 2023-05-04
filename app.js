require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");

const errorHandler = require("./middleware/errorHandler");
const unknownEndpoint = require("./middleware/unknownEndpoint");
const requestLogger = require("./middleware/requestLogger");
const tasksRouter = require("./controllers/tasks");
const usersRouter = require("./controllers/users");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.error("error connecting to MongoDB:", error.message);
  });

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Endpoints
// Para crear un endpoint, crear el handler en la carpeta controllers
// luego importarlo y usarlo como middleware
// ej: const taskRouter = require('./controllers/taskRouter')
app.use(tasksRouter);
app.use(usersRouter);

// Otros middleware que deben cargarse al final
app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
