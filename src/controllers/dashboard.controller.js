const { Activity } = require('../models/Activity');
const Client = require('../models/Client');
const Task = require('../models/Task');

exports.getStats = async (req, res) =>{
    try{
        const userId = req.user.id;

        //aqui cuento los clientes activos
        const totalClients = await Client.countDocuments({owner: userId, active: true});

        const clientSummary = {
            total: totalClients,
            vips: await Client.countDocuments({owner: userId, active: true, category: 'VIP'}),
            prospects: await Client.countDocuments({owner: userId, active: true, category: 'Prospect'}),
            active: await Client.countDocuments({owner: userId, active: true, category: 'Active'}),
        };

        //hago un resumen de las tareas por el estado de ellas 
        const tasks = await Task.find({owner: userId});
        const stats = {
            totalTasks: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            completed: tasks.filter(t => t.status === 'completed').length,
            highPriority: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
        };

        //ultimos movimientos
        const recentTasks = await Task.find({owner: userId})
        .sort({createdAt: -1})
        .limit(5)
        .populate('client', 'name');
        
        //buscamos las ultimas 10 actividades del usuario
        const recentActivity = await Activity.find({user: userId})
        .sort({createdAt: -1})
        .limit(10)

        res.json({
            clientSummary,//este es el resumen que enviaremos
            taskSummary: stats,
            recentActivity
        });
    }catch(error){
        res.status(500).json({message: "Error al generar estadistica"});
    }
};