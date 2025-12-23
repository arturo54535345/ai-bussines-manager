const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clients.controller');
const auth = require('../middlewares/auth.middleware');//traemos al middleware para proteger las rutas

//primero para entrar a estas rutas se pasa por el portero
router.post('/', auth, clientsController.createClient);//ruta de creacion de clientes protegida por el middleware
router.get('/', auth, clientsController.getClients);//ruta para ver a mis clientes portegida por el middleaware

module.exports = router;