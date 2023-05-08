const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/User");
const jwt = require('jsonwebtoken');

usersRouter.post("/api/users", async (request, response) => {
  const { name, lastname, password, email } = request.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    name,
    lastname,
    password: passwordHash,
    email,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

usersRouter.post('/api/login', async (request,response)=>{
    const email = request.body.email
    const password = request.body.password
    const user = await User.findOne({email})
    if (!user){
        return response.status(401).send({error: "Invalid credentials", status: 401})
    }

    const checkPassword = await bcrypt.compare(password, user.password)
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

module.exports = usersRouter;