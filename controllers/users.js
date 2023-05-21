const verifyToken = require("../middleware/verifyToken");
const usersRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// regex pattern to match an email structure
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

usersRouter.post("/api/users", async (request, response) => {
  const { name, lastname, password, email } = request.body;
  const checkuser = await User.findOne({ email });
  if (checkuser){
    return response.status(409).send({ error: "Email is already registered", status: 409 });
  }
  
  if (!email || !password || !lastname || !name) {
    return response.status(400).send({ error: "Missing user info", status: 400 });
  }

  const isValidEmail = emailPattern.test(email);
  if (!isValidEmail){
    return response.status(400).send({ error: "Wrong Email format", status: 400 });
  }

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

usersRouter.put(
  "/api/users/:id",
  verifyToken,
  async (request, response, next) => {
    const body = request.body;
    let passwordHash;

    // asuming that is not necesary to update your pfp 

    if (!body.name && !body.password && !body.lastname) {
      return response.status(400).send({ error: "Missing Attribute(s)", status: 400 });
    }


    if (body.password) {
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(body.password, saltRounds);
    }

    const newUser = {
      name: body.name,
      lastname: body.lastname,
      password: passwordHash,
      photo: body.photo,
    };

    Object.keys(newUser).forEach((k) => newUser[k] == "" && delete newUser[k]);

    User.findByIdAndUpdate(request.params.id, newUser, { new: true })
      .then((updatedUser) => {
        response.json(updatedUser);
      })
      .catch((error) => next(error));
  }
);

usersRouter.post("/api/login", async (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  if (!email || !password) {
    return response.status(400).send({ error: "Missing Input", status: 400 });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return response
      .status(401)
      .send({ error: "Invalid Credentials", status: 401 });
  }

  const checkPassword = await bcrypt.compare(password, user.password);
  if (checkPassword) {
    //creacion de token con atributos usuarios
    const token = await jwt.sign(
      {
        name: user.name,
        id: user.id,
      },
      //token_secret is a variable define in .env
      process.env.TOKEN_SECRET,
      {
        expiresIn: "2h",
      }
    );

    response.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
      auth_token: token,
    });
  } else {
    return response
      .status(401)
      .send({ error: "Invalid Credentials", status: 401 });
  }
});

module.exports = usersRouter;
