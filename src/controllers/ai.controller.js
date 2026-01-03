const Client = require('../models/Client');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const aiService = require('../services/ai.service');

exports.getBusinessAdvice = async (req, res) =>{
    try{
        const { prompt } = req.body; // <--- Capturamos tu pregunta del Front
        const clients = await Client.find({owner:req.user.id});
        const tasks = await Task.find({owner:req.user.id});
        const activities = await Activity.find({user: req.user.id}).sort({createdAt: -1}).limit(3);

        // Le pasamos tu pregunta al servicio
        const advice = await aiService.analyzeBusinessData(clients, tasks, activities, prompt); 

        res.json({ aiAdvice: advice });
    } catch(error) {
        res.status(500).json({message: "La IA no pudo procesar los datos"});
    }
};