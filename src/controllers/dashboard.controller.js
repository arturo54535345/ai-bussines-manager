// 1. IMPORTACIONES: Traemos los modelos para poder consultar la base de datos
const Client = require('../models/Client');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Calculamos la fecha de hace 7 días para el gráfico de barras
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 2. RESUMEN DE CLIENTES
        // Contamos cuántos clientes activos hay en total y por categoría
        const clientSummary = {
            total: await Client.countDocuments({ owner: userId, active: true }),
            vips: await Client.countDocuments({ owner: userId, active: true, category: 'VIP' }),
            active: await Client.countDocuments({ owner: userId, active: true, category: 'Active' }),
        };

        // 3. RESUMEN DE TAREAS
        // Buscamos todas las tareas del usuario para filtrarlas por estado
        const tasks = await Task.find({ owner: userId });
        const taskSummary = {
            totalTasks: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            completed: tasks.filter(t => t.status === 'completed').length,
        };

        // 4. LÓGICA DE TENDENCIA SEMANAL (Gráfico de barras)
        // Buscamos las actividades de los últimos 7 días
        const activities = await Activity.find({
            user: userId,
            createdAt: { $gte: sevenDaysAgo }
        });

        const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        const weeklyHistory = [];

        // Bucle para construir la lista de los últimos 7 días con sus nombres
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = days[d.getDay()];
            
            // Filtramos las actividades que ocurrieron en este día específico
            const count = activities.filter(a => 
                new Date(a.createdAt).toDateString() === d.toDateString()
            ).length;

            weeklyHistory.push({ day: dayName, acciones: count });
        }

        // 5. RESPUESTA FINAL: Enviamos todo el paquete de datos al Frontend
        res.json({
            clientSummary,
            taskSummary,
            weeklyHistory, 
            recentActivity: await Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(10)
        });

    } catch (error) {
        console.error("Error en getStats:", error);
        res.status(500).json({ message: "Error al generar estadísticas" });
    }
};