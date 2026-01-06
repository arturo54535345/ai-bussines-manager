const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const auth = require('../middlewares/auth.middleware');

// Rutas normales
router.post('/', auth, tasksController.createTask);
router.get('/', auth, tasksController.getTasks);
router.get('/:id', auth, tasksController.getTaskById);
router.put('/:id', auth, tasksController.updateTask);
router.delete('/:id', auth, tasksController.deleteTask);

// 🟢 RESTAURADO: El camino para la IA
router.get('/:id/ai-advice', auth, tasksController.getTaskAdvice);

module.exports = router;