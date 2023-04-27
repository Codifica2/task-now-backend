const tasksRouter = require('express').Router()
const Task = require('../models/Task')

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
                response.status(201).json(savedTask)
            } else { 
                response.status(401).json({error: "Invalid credentials", status: 401})
            }
        })
        .catch(error => next(error))
})

tasksRouter.get('/:id', (request, response, next) => {
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

module.exports = tasksRouter