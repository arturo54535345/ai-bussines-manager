const Client = require('../models/Client');
const Task = require('../models/Task');
const aiService = require('../services/ai.service');

exports.getBusinessAdvice = async (req, res) =>{
    try{
        //buscamos todos los clientes y tareas de este usauario
        const clients = await Client.find({owner:req.user.id});
        const tasksn = await Task.find({owner:req.user.id});

        const advice = aiService.analyzeBusinessData(clients,tasks);//le pasamos esos datos al servicio de IA para que lo analice

        //devolvemos la respuesta inteligente
        res.json({
            summary: `Negocio con ${clients.length} clientes y ${tasks.length} tareas.`,
            aiAdvice: advice
        });
    }catch(error){
        res.status(500).json({message: "La IA no pudo procesar los datos"});
    }
};