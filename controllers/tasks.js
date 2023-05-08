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

tasksRouter.put('/api/tasks/:id', (request, response, next) => {

    const taskId = request.params.id;
    const updateFields = request.body;
  
    if (Object.keys(updateFields).length === 0) {
      return response.status(400).json({ error: 'No Data To Update' });
    }
  
    Task.findByIdAndUpdate(
      taskId,
      updateFields,
      { new: true, runValidators: true },
      (error, updatedTask) => {
        if (error) {
          if (error.name === 'CastError') {
            return response.status(400).json({ error: 'Incorrect Data Format' });

          } else if (error.name === 'UnauthorizedError'){
            return response.status(401).json({ error: 'Invalid credentials' });

          }else {
            return response.status(500).json({ error: 'Internal Server' });
          }
        }
        if (!updatedTask) {
          return response.status(404).end();
        }

        response.status(200).json(updatedTask);
      }
    );
  });

module.exports = tasksRouter