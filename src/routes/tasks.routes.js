const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const auth = require('../middlewares/auth.middleware');

//ruta para crear una tarea protegida por el middleware de autenticacion
router.post('/', auth, tasksController.createTask);
router.get('/', auth, tasksController.getTasks);

module.exports = router;