const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');
const assert = require('chai').assert;
const expect = require('chai').expect;

// Generate a fake verification token
const generateFakeToken = (payload) => {
  const secret = process.env.TOKEN_SECRET; // Replace with your own secret key
  const options = { expiresIn: '1h' }; // Set the token expiration time as needed
  return jwt.sign(payload, secret, options);
};

const generateInvalidToken = (payload) => {
  const secret = "not_token"; // Replace with your own secret key
  const options = { expiresIn: '1h' }; // Set the token expiration time as needed
  return jwt.sign(payload, secret, options);
};

// Describe the test suite
describe('Login test case', () => {
  // Test case 1: Successful login
  it('should return 200 status and have 4 elements in its response', async() => {
    try {const user = new User({ name: 'Diego', lastName: 'Aguilera', email: "diego.aguileram@usm.cl", password: "contraseña"})
      await user.save();
    }catch(error){
      console.error("Failed to create user", error)
    }

    const credentials = {
      email: 'diego.aguileram@sansano.usm.cl',
      password: 'contraseña',
    };


    // Make a POST request to the login endpoint
    request(app)
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .end((err, res) => {
        if (err) return err;
        expect(Object.keys(res.body).length).to.equal(4);
      });
  })
  // Test case 2: Failed login
  it('should return 401 status and an error message for invalid credentials', (done) => {
    const credentials = {
      email: 'invalid@example.com',
      password: 'invalidpassword',
    };

    // Make a POST request to the login endpoint
    request(app)
      .post('/api/login')
      .send(credentials)
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.body.error, 'Invalid credentials');
        done();
      });
  });

  // Test case 3: Missing email or password
  it('should return 400 status and an error message for missing email or password', (done) => {
    const credentials = {
      email: 'diego.aguileram@sansano.usm.cl',
    };

    // Make a POST request to the login endpoint
    request(app)
      .post('/api/login')
      .send({email: credentials.email,password:""})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.body.error, 'Missing Input');
        done();
      });
  });
  
});

describe('Create Task Endpoint Test Case', () => {
  // Test case 1: Create a Task
  it('should save a task in the database', (done) => {
    const task = {
      title: "tarea 1",
      description: "primera tarea",
      due_date: "12-05-2023",
      category: "categoria 1",
      status: "pending"
    };

    const fakeToken = generateFakeToken({ name: 'fulanito', id: '123123123' });

    request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${fakeToken}`)
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
        assert.strictEqual(res.body.category, task.category)
        assert.strictEqual(res.body.status, task.status)
        assert.ok(res.body.id); // Assuming the created task has an "id" property

        done();
      });
  });
  
  //Test Case 2: Invalid Token
  it('should return a 403 status and an error message for an invalid token', (done) => {
    const task = {
      title: "invalid task",
      description: "invalid task",
      due_date: "12-05-2023",
      category: "categoria 1",
      status: "pending"
    };

    const invalidtoken = generateInvalidToken({ name: 'fulanito', id: '123123123' });
    request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${invalidtoken}`)
      .send(task)
      .expect(403)
      .expect((res) => {
        // Check the response message
        if (res.body !== 'Token is not valid') {
          throw new Error('Unexpected response message');
        }
      })
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });
  // Test case 3: Token not provided
  it('should return a 401 error if token is not provided', (done) => {
    const task = {
      title: "invalid task",
      description: "invalid task",
      due_date: "12-05-2023",
      category: "categoria 1",
      status: "pending"
    };

    request(app)
      .post('/api/tasks')
      .send(task)
      .expect(401)
      .expect((res) => {
        // Check the response message
        if (res.body !== 'You are not authenticated') {
          throw new Error('Unexpected response message');
        }
      })
      .end((err) => {
        if (err) return done(err);
        done();
      });
  }); 
});

describe('Category Endpoint Test Case', () => {
  // Test case 1: Save a new category
  it('should save a category in the database and return a 200 status', (done) => {
    const category = {
      name: "Pruebas de Software",
      user: "Oscar Reyes",
      color: "Rojo",
    };

    request(app)
      .post('/api/categories')
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
        assert.strictEqual(res.body.category, category.category)
        assert.strictEqual(res.body.status, category.status)
        assert.ok(res.body.id); // Assuming the created task has an "id" property
        done();
      });
  });

  // Test case 2: Create a new category with empty fields
  it('should return 400 status and an error message for any missing attributes', (done) => {
    const category = {
      name: "",
      user: "Oscar Reyes",
      color: "",
    };

    request(app)
      .post('/api/categories')
      .send(category)
      .expect(400) // Assuming 201 is the status code for a successful creation
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.body.error, 'Missing Attribute(s)');
        done();
      });
  });

  // Test Case 3: Edit successfully an existing category 
  it('should return a 200 status and save an edited category', async() => {
    const newCategory = {
      name: "Pruebas de Hardware",
      color: "verde",
    };

    const category = new Category({ name: 'Pruebas de Software', user: 'Fulanito', color: "Azul" });
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
  })

  // Test Case 4: Trying to edit empty attributes on an existing category
  it('should return a 400 status and an error message for missing attributes', async() => {
    const category = new Category({ name: 'Pruebas de Software', user: 'Fulanito', color: "Azul" });
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
        assert.strictEqual(res.body.error, 'Missing Attribute(s)');
      });
  })

  // Test Case 5:  Trying to update an nonexistent category
  it('should return a 404 status and an Category not found message ', (done) => {
    //const category = new Category({ name: 'Pruebas de Software', user: 'Fulanito', color: "Azul" });
    //await category.save();
    const newCategory = {
      name: "Pruebas de Hardware",
      color: "Amarillo",
    };

    request(app)
      .put('/api/categories/507f1f77bcf86cd799439011') // nonexistent ID
      .send(newCategory)
      .expect(404)
      .end((err, res) => {
        if (err) {
          done(err)
          return 
        }
        // Assert that the task was saved in the database
        assert.strictEqual(res.body.error, 'Category not found');
        done();
      });
  })

  // Test Case 6: Trying to update with a wrong id format
  it('should return a 400 status and a Invalid ID format message ', (done) => {
    const newCategory = {
      name: "Pruebas de Hardware",
      color: "Amarillo",
    };

    request(app)
      .put('/api/categories/asdjiqwey18923792183712789euiwjlejqiejiwqojd81') // invalid ID
      .send(newCategory)
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        assert.strictEqual(res.body.error, 'Invalid ID format');
        done();
      });
  })

  // Test Case 7: Delete a existing Category
  it('should return a 204 status and delete a category', async() => {
    const category = new Category({ name: 'Pruebas de Software', user: 'Fulanito', color: "Azul" });
    await category.save();
    request(app)
      .delete(`/api/categories/${category._id}`) // Any known existing ID
      .expect(204)
      .end((err, res) => {
        if (err) {
          return err
        }
      });
  })
  // Test case 8: Get the list of categories
  it('should get the list of all categories and get a 200 status', (done) => {
    request(app)
      .get("/api/categories")
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        expect(res.body).to.be.an('array')
        done()
      });
  })
});
