const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  lastname: String,
  password: String,
  email: String,
  photo: String,
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // Don't show password hash on response!
    delete returnedObject.password;
  },
});

module.exports = mongoose.model("User", userSchema);
