const usersRouter = require('express').Router()
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

usersRouter.post('/login', async (request,response)=>{
    const email = request.body.email
    const password = request.body.password
    const user = await User.findOne({email})
    if (!user){
        return response.status(401).send({error: "Invalid credentials", status: 401})
    }

    const checkPassword = await bcrypt.compare(password, user.password)
    console.log(checkPassword)
    if (checkPassword){
        //creacion de token con atributos usuarios
        const token = await jwt.sign({
            name: user.name,
            id: user.id
            }, process.env.TOKEN_SECRET,
            {
                expiresIn: "2h"
            }
        )

        response.status(200).send({id: user.id,name: user.name, email: user.email, auth_token: token})
    }
    else{
        return response.status(401).send({error: "Invalid credentials", status: 401})
    }
})

module.exports = usersRouter