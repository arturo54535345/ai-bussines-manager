const Client = require('../models/Client');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const aiService = require('../services/ai.service');

exports.getBusinessAdvice = async (req, res) => {
    try {
        const { prompt } = req.body; // La pregunta de Arturo
        
        // Buscamos los datos en el PC (Base de datos)
        const clients = await Client.find({ owner: req.user.id });
        const tasks = await Task.find({ owner: req.user.id });
        const activities = await Activity.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(3);

        // EXTRA: Sacamos al usuario completo para saber su TONO elegido (Coach, Socio, etc.)
        // Recuerda que req.user ya tiene los datos porque el "portero" (middleware) lo cargó.
        const userPreferences = req.user.preferences; 

        // LLAMADA AL SERVICIO: Le pasamos los datos, la pregunta Y las preferencias
        const advice = await aiService.analyzeBusinessData(clients, tasks, activities, prompt, userPreferences); 

        res.json({ aiAdvice: advice });
    } catch (error) {
        res.status(500).json({ message: "La IA no pudo procesar los datos" });
    }
};