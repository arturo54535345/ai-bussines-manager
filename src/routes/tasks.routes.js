const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const auth = require('../middlewares/auth.middleware');

//ruta para crear una tarea protegida por el middleware de autenticacion
router.post('/', auth, tasksController.createTask);//crear tarea
router.get('/', auth, tasksController.getTasks);//ver detalles de la tarea
router.put('/:id', auth, tasksController.updateTask);//editar la tarea
router.delete('/:id', auth, tasksController.deleteTask);//eliminar la tarea

module.exports = router;