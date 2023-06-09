const verifyToken = require("../middleware/verifyToken");
const tasksRouter = require("express").Router();
const Task = require("../models/Task");

tasksRouter.get("/api/tasks", verifyToken, (request, response, next) => {
  Task.find({})
    .then((tasks) => {
      if (tasks) {
        response.json(tasks);
      } else {
        response.status(404).end;
      }
    })
    .catch((error) => next(error));
});

tasksRouter.get("/api/tasks/:id", verifyToken, (request, response, next) => {
  Task.findById(request.params.id)
    .then((task) => {
      if (task) {
        response.json(task);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

tasksRouter.delete("/api/tasks/:id", verifyToken, async (request, res) => {
  const taskId = request.params.id;

  try {
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ error: "Task Not Found" });
    }
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

tasksRouter.post("/api/tasks", verifyToken, (request, response, next) => {
  const body = request.body;

  if(!body.title && !body.description && !body.due_date && !body.category){
    return response.status(400).json({ error: "Missing Attribute(s)" });
  }

  const task = new Task({
    title: body.title,
    description: body.description,
    due_date: body.due_date,
    category: body.category,
    status: "pending",
    creator: body.creator,
  });

  task
    .save()
    .then((savedTask) => {
      response.status(201).json(savedTask);
    })
    .catch((error) => next(error));
});

tasksRouter.put("/api/tasks/:id", verifyToken, (request, response, next) => {
  const body = request.body;

  Task.findByIdAndUpdate(request.params.id, body, { new: true })
    .then((updatedTask) => {
      if (!updatedTask) {
        response.status(404).json({ error: "Task not found" }).end();
      }

      response.status(200).json(updatedTask);
    })
    .catch((error) => next(error));
});

module.exports = tasksRouter;
