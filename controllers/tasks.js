const tasksRouter = require('express').Router()
const Task = require('../models/Task')

tasksRouter.get('/api/tasks', (request, response) => {
    Task.find({}).then(tasks => {
      response.json(tasks)
    })
  })

tasksRouter.post('/api/tasks', (request, response, next) =>{
    const body = request.body
    
    const task = new Task({
        title: body.title,
        description: body.description,
        due_date: body.due_date,
        category: body.category,
        status: "pending",
    })

    task.save()
        .then(savedTask => {
            if (savedTask){
                response.status(201).json({id: savedTask.id,title: savedTask.title, description: savedTask.description, due_date: savedTask.due_date, category: savedTask.category, status: savedTask.status})
            } else { 
                response.status(401).json({error: "Invalid credentials", status: 401})
            }
        })
        .catch(error => next(error))
})

tasksRouter.get('/api/tasks/:id', (request, response, next) => {
    Task.findById(request.params.id)
        .then(task => {
            if(task) {
                response.json(task)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

tasksRouter.delete('/api/tasks/:id', async (request, res) => {
    const taskId = request.params.id;

    try {
      const deletedTask = await Task.findByIdAndDelete(taskId);
  
      if (!deletedTask) {
        return res.status(404).json({ error: 'Task Not Found' });
      }
      res.status(200).end();

    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

tasksRouter.put('/api/tasks/:id', (request, response, next) => {
  const body = request.body

  Task.findByIdAndUpdate(request.params.id, body, { new: true })
    .then(updatedTask => {
      if(!updatedTask) {
        response.status(404).json({error: "Task not found"}).end()
      }
      response.status(200).json(updatedTask)
    })
    .catch(error => {
      if(error.name === "UnauthorizedError") {
        response.status(401).json({error: "Invalid credentials"})
      }
      else if(error.name === "CastError") {
        response.status(400).json({error: "Incorrect Data format"})
      }
      else {
        response.status(500).json({error: "Internal Server Error"})
      }
    })

})

module.exports = tasksRouter