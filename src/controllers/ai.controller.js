// src/controllers/ai.controller.js
const Client = require('../models/Client');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const User = require('../models/User'); // NUEVO: Importamos User
const aiService = require('../services/ai.service');

exports.getBusinessAdvice = async (req, res) => {
    try {
        const { prompt } = req.body;
        
        // 1. Buscamos al usuario para sacar sus preferencias (Tono, metas, etc.)
        const user = await User.findById(req.user.id);
        
        // 2. Buscamos los datos de su negocio
        const clients = await Client.find({ owner: req.user.id });
        const tasks = await Task.find({ owner: req.user.id });
        const activities = await Activity.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(3);

        // 3. Le pasamos TODO al servicio
        const advice = await aiService.analyzeBusinessData(
            clients, 
            tasks, 
            activities, 
            prompt, 
            user.preferences // Enviamos las preferencias reales
        ); 

        res.json({ aiAdvice: advice });
    } catch (error) {
        res.status(500).json({ message: "La IA no pudo procesar los datos" });
    }
};