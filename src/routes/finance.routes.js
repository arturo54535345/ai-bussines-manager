const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller'); // Asegúrate de que el nombre coincida
const auth = require('../middlewares/auth.middleware');
// 👨‍🏫 Definimos la dirección que la web está buscando
router.get('/summary', auth, financeController.getFinancialSummary);

module.exports = router;