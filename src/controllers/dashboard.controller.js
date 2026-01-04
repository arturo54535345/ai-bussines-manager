// 1. HERRAMIENTAS: Traemos los modelos y el servicio de IA
const Client = require('../models/Client');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const User = require('../models/User'); 
const aiService = require('../services/ai.service'); 

exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Buscamos al usuario para saber su tono (Socio, Coach...) y sus metas
        const user = await User.findById(userId);

        // --- A. CÁLCULO DE NÚMEROS (Esto es local y muy fiable) ---
        const clientSummary = {
            total: await Client.countDocuments({ owner: userId, active: true }),
            vips: await Client.countDocuments({ owner: userId, active: true, category: 'VIP' }),
            active: await Client.countDocuments({ owner: userId, active: true, category: 'Active' }),
        };

        const tasks = await Task.find({ owner: userId });
        const taskSummary = {
            totalTasks: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            completed: tasks.filter(t => t.status === 'completed').length,
        };

        // --- B. LÓGICA DE TENDENCIA (Gráfico) ---
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activities = await Activity.find({ user: userId, createdAt: { $gte: sevenDaysAgo } });
        const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        const weeklyHistory = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const count = activities.filter(a => new Date(a.createdAt).toDateString() === d.toDateString()).length;
            weeklyHistory.push({ day: days[d.getDay()], acciones: count });
        }

        // --- C. LA CAJA DE SEGURIDAD PARA LA IA ---
        // Preparamos un mensaje por defecto por si Gemini falla
        let aiInsight = "Arturo, tus datos están listos. Sigue así para alcanzar tus objetivos.";
        
        try {
            // Intentamos obtener el consejo real. 
            // Si esto falla, saltará al "catch" de aquí abajo pero NO detendrá el servidor.
            const realAdvice = await aiService.getWeeklySummary(
                { clientSummary, taskSummary }, 
                user.preferences 
            );
            if (realAdvice) aiInsight = realAdvice;
        } catch (aiError) {
            // Si la IA falla, solo lo anotamos en la consola del servidor para que tú lo veas
            console.error("Aviso: La IA no respondió a tiempo, usando mensaje por defecto.");
        }

        // 6. RESPUESTA FINAL: Enviamos todo el paquete.
        // Como 'aiInsight' está fuera de la caja de error, siempre tendrá un valor.
        res.json({
            clientSummary,
            taskSummary,
            weeklyHistory, 
            recentActivity: await Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(10),
            aiInsight 
        });

    } catch (error) {
        // Este error solo saltará si algo muy grave pasa con la base de datos
        console.error("Error crítico en getStats:", error);
        res.status(500).json({ message: "Error al generar estadísticas" });
    }
};