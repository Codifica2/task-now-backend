const jwt = require("jsonwebtoken");

const verifyToken = (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      if (err) {
        return response.status(403).json("Token is not valid");
      }

      request.user = user;
      next();
    });
  } else {
    response.status(401).json("You are not authenticated");
  }
};

module.exports = verifyToken;
