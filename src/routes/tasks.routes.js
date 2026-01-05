const express = require('express');
const router = express.Router();

// 1. IMPORTACIÓN: Aquí usamos "tasks" porque así se llama tu archivo. 
// Es como buscar a alguien por su nombre exacto en la agenda.
const tasksController = require('../controllers/tasks.controller'); 

const auth = require('../middlewares/auth.middleware');

// --- RUTAS ---

// Crear tarea
router.post('/', auth, tasksController.createTask);

// Ver todas las tareas
router.get('/', auth, tasksController.getTasks);

// EDITAR: Ver una tarea específica
// 🟢 CLAVE: Hemos puesto los dos puntos (:) antes de "id".
// Sin los dos puntos, el servidor busca la palabra "id". 
// Con los dos puntos, el servidor entiende que ahí va el CÓDIGO de la tarea.
router.get('/:id', auth, tasksController.getTaskById);

// Actualizar la tarea
router.put('/:id', auth, tasksController.updateTask);

// Eliminar la tarea
router.delete('/:id', auth, tasksController.deleteTask);

module.exports = router;