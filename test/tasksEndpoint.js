const request = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Task = require("../models/Task");
const Category = require("../models/Category");
const assert = require("chai").assert;
const expect = require("chai").expect;
const { after } = require("mocha");

// Generate a fake verification token
const generateFakeToken = (payload) => {
  const secret = process.env.TOKEN_SECRET; // Replace with your own secret key
  const options = { expiresIn: "1h" }; // Set the token expiration time as needed
  return jwt.sign(payload, secret, options);
};

const generateInvalidToken = (payload) => {
  const secret = "not_token"; // Replace with your own secret key
  const options = { expiresIn: "1h" }; // Set the token expiration time as needed
  return jwt.sign(payload, secret, options);
};

// Describe the test suite
describe("Login test case", () => {
  // Test case 1: Successful login
  it("should return 200 status and have 4 elements in its response", async () => {
    try {
      const user = new User({
        name: "Diego",
        lastName: "Aguilera",
        email: "diego.aguileram@usm.cl",
        password: "contraseña",
      });
      await user.save();
    } catch (error) {
      console.error("Failed to create user", error);
    }

    const credentials = {
      email: "diego.aguileram@sansano.usm.cl",
      password: "contraseña",
    };

    // Make a POST request to the login endpoint
    request(app)
      .post("/api/login")
      .send(credentials)
      .expect(200)
      .end((err, res) => {
        if (err) return err;
        expect(Object.keys(res.body).length).to.equal(4);
      });
  });
  // Test case 2: Failed login
  it("should return 401 status and an error message for invalid credentials", (done) => {
    const credentials = {
      email: "invalid@example.com",
      password: "invalidpassword",
    };

    // Make a POST request to the login endpoint
    request(app)
      .post("/api/login")
      .send(credentials)
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.body.error, "Invalid credentials");
        done();
      });
  });

  // Test case 3: Missing email or password
  it("should return 400 status and an error message for missing email or password", (done) => {
    const credentials = {
      email: "diego.aguileram@sansano.usm.cl",
    };

    // Make a POST request to the login endpoint
    request(app)
      .post("/api/login")
      .send({ email: credentials.email, password: "" })
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.body.error, "Missing Input");
        done();
      });
  });
});

describe("Create Task Endpoint Test Case", () => {
  // Test case 1: Create a Task
  it("should save a task in the database", (done) => {
    const task = {
      title: "tarea 1",
      description: "primera tarea",
      due_date: "12-05-2023",
      category: "categoria 1",
      status: "pending",
    };

    const fakeToken = generateFakeToken({ name: "fulanito", id: "123123123" });

    request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${fakeToken}`)
      .send(task)
      .expect(201) // Assuming 201 is the status code for a successful creation
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        // Assert that the task was saved in the database
        assert.strictEqual(res.body.title, task.title);
        assert.strictEqual(res.body.description, task.description);
        assert.strictEqual(res.body.category, task.category);
        assert.strictEqual(res.body.status, task.status);
        assert.ok(res.body.id); // Assuming the created task has an "id" property

        done();
      });
  });

  //Test Case 2: Invalid Token
  it("should return a 403 status and an error message for an invalid token", (done) => {
    const task = {
      title: "invalid task",
      description: "invalid task",
      due_date: "12-05-2023",
      category: "categoria 1",
      status: "pending",
    };

    const invalidtoken = generateInvalidToken({
      name: "fulanito",
      id: "123123123",
    });
    request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${invalidtoken}`)
      .send(task)
      .expect(403)
      .expect((res) => {
        // Check the response message
        if (res.body !== "Token is not valid") {
          throw new Error("Unexpected response message");
        }
      })
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });
  // Test case 3: Token not provided
  it("should return a 401 error if token is not provided", (done) => {
    const task = {
      title: "invalid task",
      description: "invalid task",
      due_date: "12-05-2023",
      category: "categoria 1",
      status: "pending",
    };

    request(app)
      .post("/api/tasks")
      .send(task)
      .expect(401)
      .expect((res) => {
        // Check the response message
        if (res.body !== "You are not authenticated") {
          throw new Error("Unexpected response message");
        }
      })
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });
});

describe("Category Endpoint Test Case", () => {
  // Test case 1: Save a new category
  it("should save a category in the database and return a 200 status", (done) => {
    const category = {
      name: "Pruebas de Software",
      user: "Oscar Reyes",
      color: "Rojo",
    };

    request(app)
      .post("/api/categories")
      .send(category)
      .expect(201) // Assuming 201 is the status code for a successful creation
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        // Assert that the task was saved in the database
        assert.strictEqual(res.body.title, category.title);
        assert.strictEqual(res.body.description, category.description);
        assert.strictEqual(res.body.category, category.category);
        assert.strictEqual(res.body.status, category.status);
        assert.ok(res.body.id); // Assuming the created task has an "id" property
        done();
      });
  });

  // Test case 2: Create a new category with empty fields
  it("should return 400 status and an error message for any missing attributes", (done) => {
    const category = {
      name: "",
      user: "Oscar Reyes",
      color: "",
    };

    request(app)
      .post("/api/categories")
      .send(category)
      .expect(400) // Assuming 201 is the status code for a successful creation
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.body.error, "Missing Attribute(s)");
        done();
      });
  });

  // Test Case 3: Edit successfully an existing category
  it("should return a 200 status and save an edited category", async () => {
    const newCategory = {
      name: "Pruebas de Hardware",
      color: "verde",
    };

    const category = new Category({
      name: "Pruebas de Software",
      user: "Fulanito",
      color: "Azul",
    });
    await category.save();

    request(app)
      .put(`/api/categories/${category._id}`) //Should work on any known ID
      .send(newCategory)
      .expect(200) // Assuming 200 is the status code for a OK
      .end((err, res) => {
        if (err) {
          return err;
        }
        // Assert that the task was saved in the database
        assert.strictEqual(res.body.name, newCategory.name);
        assert.strictEqual(res.body.color, newCategory.color);
        assert.ok(res.body.id); // Assuming the created task has an "id" property
      });
  });

  // Test Case 4: Trying to edit empty attributes on an existing category
  it("should return a 400 status and an error message for missing attributes", async () => {
    const category = new Category({
      name: "Pruebas de Software",
      user: "Fulanito",
      color: "Azul",
    });
    await category.save();
    const newCategory = {
      name: "Pruebas de Hardware",
      color: "",
    };

    request(app)
      .put(`/api/categories/${category._id}`) //Should work on any known ID
      .send(newCategory)
      .expect(400) // Assuming 200 is the status code for a OK
      .end((err, res) => {
        if (err) {
          return err;
        }
        // Assert that the task was saved in the database
        assert.strictEqual(res.body.error, "Missing Attribute(s)");
      });
  });

  // Test Case 5:  Trying to update an nonexistent category
  it("should return a 404 status and an Category not found message ", (done) => {
    //const category = new Category({ name: 'Pruebas de Software', user: 'Fulanito', color: "Azul" });
    //await category.save();
    const newCategory = {
      name: "Pruebas de Hardware",
      color: "Amarillo",
    };

    request(app)
      .put("/api/categories/507f1f77bcf86cd799439011") // nonexistent ID
      .send(newCategory)
      .expect(404)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        // Assert that the task was saved in the database
        assert.strictEqual(res.body.error, "Category not found");
        done();
      });
  });

  // Test Case 6: Trying to update with a wrong id format
  it("should return a 400 status and a Invalid ID format message ", (done) => {
    const newCategory = {
      name: "Pruebas de Hardware",
      color: "Amarillo",
    };

    request(app)
      .put("/api/categories/asdjiqwey18923792183712789euiwjlejqiejiwqojd81") // invalid ID
      .send(newCategory)
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        assert.strictEqual(res.body.error, "Invalid ID format");
        done();
      });
  });

  // Test Case 7: Delete a existing Category
  it("should return a 204 status and delete a category", async () => {
    const category = new Category({
      name: "Pruebas de Software",
      user: "Fulanito",
      color: "Azul",
    });
    await category.save();
    request(app)
      .delete(`/api/categories/${category._id}`) // Any known existing ID
      .expect(204)
      .end((err, res) => {
        if (err) {
          return err;
        }
      });
  });
  // Test case 8: Get the list of categories
  it("should get the list of all categories and get a 200 status", (done) => {
    request(app)
      .get("/api/categories")
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        expect(res.body).to.be.an("array");
        done();
      });
  });
});

describe("#register", async () => {
  it("should create a new user in the database", async () => {
    const user = {
      name: "Pedro",
      lastname: "Yáñez",
      password: "123456",
      email: "pedro.yanez@sansano.usm.cl",
    };

    const response = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.name, user.name);
    assert.strictEqual(response.body.lastname, user.lastname);
    assert.strictEqual(response.body.email, user.email);
  });

  after(async () => {
    await User.deleteMany({});
  });
});

describe("#edit profile", async () => {
  let user;
  let token;

  beforeEach(async () => {
    user = new User({
      name: "Pedro",
      lastname: "Yáñez",
      password: "123456",
      email: "pedro.yanez@sansano.usm.cl",
    });

    await user.save();

    user = await User.find({});
    user = user[0];

    token = jwt.sign(
      {
        name: user.name,
        id: user.id,
      },
      process.env.TOKEN_SECRET
    );
  });

  it("should return the edited user in the database", async () => {
    const newLastname = "Piedra";
    const newUser = { ...user, lastname: newLastname };

    const response = await request(app)
      .put(`/api/users/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json")
      .send(newUser);

    const updatedUser = response.body;

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(updatedUser.lastname, newLastname);
  });

  it("should update only changed fields", async () => {
    const newLastname = "Yáñez";
    const newUser = { ...user, lastname: newLastname };

    const response = await request(app)
      .put(`/api/users/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json")
      .send(newUser);

    const updatedUser = response.body;

    // What we wanted to change, changed
    assert.strictEqual(updatedUser.lastname, newLastname);

    // What we didn't change, stays the same
    assert.strictEqual(updatedUser.name, user.name);
    assert.strictEqual(updatedUser.email, user.email);
  });

  after(async () => {
    await User.deleteMany({});
  });
});

describe("#protected endpoints", async () => {
  it("should raise an error if the authorization header is not set", async () => {
    const response = await request(app)
      .get(`/api/tasks`)
      .set("Accept", "application/json");

    assert.strictEqual(response.statusCode, 401);
  });

  let user;
  let token;
  let task;

  before(async () => {
    // Create user to generate jwt
    user = new User({
      name: "Pedro",
      lastname: "Yáñez",
      password: "123456",
      email: "pedro.yanez@sansano.usm.cl",
    });

    await user.save();

    token = jwt.sign(
      {
        id: user.id,
      },
      process.env.TOKEN_SECRET
    );

    // Create task to check if response is correct
    task = new Task({
      title: "Dummy note",
    });

    await task.save();
  });

  it("should send a response if the authorization header is correctly set", async () => {
    const response = await request(app)
      .get(`/api/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    assert.strictEqual(response.statusCode, 200);
    assert.isTrue(response.body.length > 0);
  });
});

describe("Unit test for task endpoints", () => {
  let token;
  beforeEach(async () => {
    try {
      const user = new User({
        name: "Sebita",
        lastName: "Sebita",
        email: "sebita@usm.cl",
        password: "123456",
      });
      await user.save();

      token = jwt.sign(
        {
          name: user.name,
          id: user.id,
        },
        process.env.TOKEN_SECRET
      );
    } catch (error) {
      console.error("Error en beforeEach:", error);
    }
  });

  it("GET /api/tasks returns all existing tasks", async () => {
    const task1 = new Task({
      title: "Tarea 1",
      description: "Descripción 1",
      due_date: "2025-05-05",
      category: "category",
      status: "status",
    });
    const task2 = new Task({
      title: "Tarea 2",
      description: "Descripción 2",
      due_date: "2025-05-06",
      category: "category2",
      status: "status2",
    });

    Promise.all([task1.save(), task2.save()]) // Promise.all para esperar a que se guarden ambas tareas
      .then(() => {
        return request(app)
          .get("/api/tasks")
          .set("Authorization", `Bearer ${token}`)
          .expect(200)
          .expect((res) => {
            assert.strictEqual(res.body.status, 200);
            assert.strictEqual(res.body.length, 2);
          });
      })
      .then(() => {
        done();
      })
      .catch((error) => {
        done(error);
      });
  }).timeout(5000); // Aumentar el timeout a 5 segundos para que alcance a guardar las tareas

  it("POST /api/tasks create a new task", async () => {
    const newTask = {
      title: "Nueva tarea",
      description: "Descripción de la nueva tarea",
    };

    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send(newTask)
      .set("Accept", "application/json");

    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.title, newTask.title);
    assert.strictEqual(response.body.description, newTask.description);

    const createdTask = await Task.findById(response.body.id);
    assert.strictEqual(createdTask.title, newTask.title);
    assert.strictEqual(createdTask.description, newTask.description);
  });

  it("GET /api/tasks/:id returns a task", async () => {
    const task = new Task({ title: "Tarea", description: "Descripción" });
    await task.save();

    const response = await request(app)
      .get(`/api/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`);

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.title, task.title);
    assert.strictEqual(response.body.description, task.description);
  });

  it("DELETE /api/tasks/:id delete a task", async () => {
    const task = new Task({ title: "Tarea", description: "Descripción" });
    await task.save();

    const response = await request(app)
      .delete(`/api/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`);
    assert.strictEqual(response.status, 200);

    const deletedTask = await Task.findById(task._id);
    assert.strictEqual(deletedTask, null);
  });

  it("PUT /api/tasks/:id update a task", async () => {
    const task = new Task({ title: "Tarea", description: "Descripción" });
    await task.save();

    const updatedTask = {
      title: "Tarea actualizada",
      description: "Descripción actualizada",
    };

    const response = await request(app)
      .put(`/api/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedTask)
      .set("Accept", "application/json");

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.title, updatedTask.title);
    assert.strictEqual(response.body.description, updatedTask.description);

    const fetchedTask = await Task.findById(task._id);
    assert.strictEqual(fetchedTask.title, updatedTask.title);
    assert.strictEqual(fetchedTask.description, updatedTask.description);
  });

  afterEach(async () => {
    await Task.deleteMany({});
    await User.deleteMany({});
  });
});
