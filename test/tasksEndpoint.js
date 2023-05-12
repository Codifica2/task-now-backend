const request = require('supertest');
const app = require('../app'); // Suponiendo que tu aplicación Express está en un archivo llamado app.js
const Task = require('../models/Task');
const assert = require('chai').assert;
const User = require('../models/User');
const jwt = require("jsonwebtoken");


describe('Unit test for task endpoints', () => {
  let token;
  beforeEach(async () => {
    try {const user = new User({ name: 'Sebita', lastName: 'Sebita', email: "sebita@usm.cl", password: "123456" });
    await user.save();

    token = jwt.sign(
      {
        name: user.name,
        id: user.id,
      },
      process.env.TOKEN_SECRET,
    );
    }catch (error) {
    console.error('Error en beforeEach:', error);
  }
  });



  it('GET /api/tasks returns all existing tasks', async () => {

    const task1 = new Task({ title: 'Tarea 1', description: 'Descripción 1', due_date: '2025-05-05', category: 'category', status: 'status'});
    const task2 = new Task({ title: 'Tarea 2', description: 'Descripción 2', due_date: '2025-05-06', category: 'category2', status: 'status2'});

    Promise.all([task1.save(), task2.save()]) // Promise.all para esperar a que se guarden ambas tareas
      .then(() => {
        return request(app)
          .get('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect((res) => {
            assert.strictEqual(res.body.status, 200)
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

  it('POST /api/tasks create a new task', async () => {
    const newTask = {
      title: 'Nueva tarea',
      description: 'Descripción de la nueva tarea',
    };

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send(newTask)
      .set('Accept', 'application/json');

    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.title, newTask.title);
    assert.strictEqual(response.body.description, newTask.description);

    const createdTask = await Task.findById(response.body.id);
    assert.strictEqual(createdTask.title, newTask.title);
    assert.strictEqual(createdTask.description, newTask.description);
  });

  it('GET /api/tasks/:id returns a task', async () => {
    const task = new Task({ title: 'Tarea', description: 'Descripción' });
    await task.save();

    const response = await request(app).get(`/api/tasks/${task._id}`).set('Authorization', `Bearer ${token}`);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.title, task.title);
    assert.strictEqual(response.body.description, task.description);
  });

  it('DELETE /api/tasks/:id delete a task', async () => {
    const task = new Task({ title: 'Tarea', description: 'Descripción' });
    await task.save();

    const response = await request(app).delete(`/api/tasks/${task._id}`).set('Authorization', `Bearer ${token}`);
    assert.strictEqual(response.status, 200);

    const deletedTask = await Task.findById(task._id);
    assert.strictEqual(deletedTask, null);
  });

  it('PUT /api/tasks/:id update a task', async () => {
    const task = new Task({ title: 'Tarea', description: 'Descripción' });
    await task.save();

    const updatedTask = {
      title: 'Tarea actualizada',
      description: 'Descripción actualizada',
    };

    const response = await request(app)
      .put(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedTask)
      .set('Accept', 'application/json');

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
})

