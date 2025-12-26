const Client = require('../models/Client');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const aiService = require('../services/ai.service');

exports.getBusinessAdvice = async (req, res) =>{
    try{
        //buscamos todos los clientes,tareas y actividades de este usauario
        const clients = await Client.find({owner:req.user.id});
        const tasks = await Task.find({owner:req.user.id});
        const activities = await Activity.find({user: req.user.id})
            .sort({createdAt: -1})
            .limit(3);

        const advice = await aiService.analyzeBusinessData(clients,tasks, activities);//le pasamos esos datos al servicio de IA para que lo analice

        //devolvemos la respuesta inteligente
        res.json({
            summary: `Negocio con ${clients.length} clientes y ${tasks.length} tareas.`,
            aiAdvice: advice
        });
    }catch(error){
        res.status(500).json({message: "La IA no pudo procesar los datos"});
    }
};