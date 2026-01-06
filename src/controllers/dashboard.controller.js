const Client = require('../models/Client');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const User = require('../models/User'); 
const aiService = require('../services/ai.service'); 

/**
 * OBTENER ESTADÍSTICAS GENERALES
 * Prepara los datos para los gráficos y las tarjetas de la web.
 */
exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        // 1. RESUMEN DE CLIENTES
        const clientSummary = {
            total: await Client.countDocuments({ owner: userId, active: true }),
            vips: await Client.countDocuments({ owner: userId, active: true, category: 'VIP' }),
        };

        // 2. RESUMEN DE TAREAS
        const tasks = await Task.find({ owner: userId });
        const taskSummary = {
            totalTasks: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            completed: tasks.filter(t => t.status === 'completed').length,
        };

        // 3. HISTORIAL DE 7 DÍAS (Para el gráfico de barras)
        const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        const weeklyHistory = [];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); 
            d.setDate(d.getDate() - i);
            
            // Buscamos cuántas cosas hizo Arturo en este día específico
            const count = await Activity.countDocuments({
                user: userId,
                createdAt: { 
                    $gte: new Date(d.setHours(0,0,0,0)), 
                    $lte: new Date(d.setHours(23,59,59,999)) 
                }
            });
            
            weeklyHistory.push({ day: days[d.getDay()], acciones: count });
        }

        // 4. CONSEJO DE IA PERSONALIZADO
        let aiInsight = "Arturo, tus datos están listos. Sigue así.";
        
        try {
            // 🟢 Le preguntamos a Groq basándonos en tus tareas reales
            const userPreferences = user ? user.preferences : {};
            const realAdvice = await aiService.getDashboardInsight(
                { clientSummary, taskSummary }, 
                userPreferences
            );
            if (realAdvice) aiInsight = realAdvice;
        } catch (aiError) {
            console.error("Aviso: Groq no respondió para el Dashboard.");
        }

        // 5. ENVIAR TODO AL FRONTEND
        res.json({
            clientSummary,
            taskSummary,
            weeklyHistory, 
            recentActivity: await Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(10),
            aiInsight 
        });

    } catch (error) {
        res.status(500).json({ message: "Error al generar estadísticas" });
    }
};