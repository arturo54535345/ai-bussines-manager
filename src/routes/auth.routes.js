//le decimos a express que URL vamos a manejar en este archivo
const express = require('express');
const router = express.Router();
const authController = require( '../controllers/auth.controller');//trameos el cerbero
const auth = require('../middlewares/auth.middleware');

//cuando alguien envie datos POST a /register activara la funcion register
router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/profile', auth, authController.updateProfile);
router.put('/change-password', auth, authController.changePassword);

module.exports = router;