//le decimos a express que URL vamos a manejar en este archivo
const express = require('express');
const router = express.Router();
const authController = require( '../controllers/auth.controller');//trameos el cerbero

//cuando alguien envie datos POST a /register activara la funcion register
router.post('/register', authController.register);

module.exports = router;