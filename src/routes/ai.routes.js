const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const auth = require('../middlewares/auth.middleware');

//solo los usuarios registrados pueden pedir consejo a la ia
router.get('/analyze', auth, aiController.getBusinessAdvice);

module.exports = router;