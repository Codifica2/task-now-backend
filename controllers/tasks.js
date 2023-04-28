const tasksRouter = require('express').Router()
const Task = require('../models/Task')

tasksRouter.post('/api/tasks', (request, response, next) =>{
    const body = request.body
    
    const task = new Task({
        titulo: body.titulo,
        descripcion: body.descripcion,
        fecha_vencimiento: body.fecha_vencimiento,
        categoria: body.categoria,
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

module.exports = tasksRouter
