// -------------------------------------------------------------------------
// 🏗️ SECCIÓN 1: IMPORTACIONES (Nuestros libros de consulta)
// -------------------------------------------------------------------------
const Client = require('../models/Client'); 
const Task = require('../models/Task');     
const Activity = require('../models/Activity'); 
const User = require('../models/User');     
const aiService = require('../services/ai.service'); 

// 🟢 AQUÍ ESTÁ: Nombre actualizado a getDashboardStats
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id; // Identificamos quién eres tú (Arturo).
        const user = await User.findById(userId);

        // 👥 1. RESUMEN DE CLIENTES
        const clientSummary = {
            total: await Client.countDocuments({ owner: userId, active: true }),
            vips: await Client.countDocuments({ owner: userId, active: true, category: 'VIP' }),
        };

        // 📝 2. RESUMEN DE TAREAS (El conteo general)
        const tasks = await Task.find({ owner: userId });
        const taskSummary = {
            totalTasks: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            completed: tasks.filter(t => t.status === 'completed').length,
        };

        // -------------------------------------------------------------------------
        // 🚨 3. LO NUEVO: TAREAS CRÍTICAS (El "Radar de Urgencias")
        // -------------------------------------------------------------------------
        // 👨‍🏫 Lógica: Esta es la parte que buscabas. Vamos a la base de datos y 
        // le pedimos específicamente las tareas que:
        // - Son tuyas (owner: userId).
        // - NO están terminadas (status: { $ne: 'completed' }).
        // - Tienen prioridad ALTA (priority: 'high').
        const criticalTasks = await Task.find({
            owner: userId,
            status: { $ne: 'completed' }, 
            priority: 'high'              
        })
        .sort({ dueDate: 1 }) // Las ordenamos para que la que vence ANTES salga primero.
        .limit(3)             // Solo cogemos las 3 más "peligrosas" para no estresarte.
        .populate('client', 'name'); // Traemos el nombre del cliente para saber de quién es.

        // -------------------------------------------------------------------------
        // 🍩 4. REPARTO POR CATEGORÍAS (Para tu gráfico circular)
        // -------------------------------------------------------------------------
        const categoryDistribution = tasks.reduce((acc, task) => {
            const cat = task.category || 'Otro';
            acc[cat] = (acc[cat] || 0) + 1; // Sumamos 1 a cada grupo (Llamada, Email, etc.)
            return acc;
        }, {});

        // Lo convertimos a una lista que la web sepa dibujar.
        const categoryData = Object.keys(categoryDistribution).map(name => ({
            name,
            value: categoryDistribution[name]
        }));

        // 📅 5. HISTORIAL DE ACTIVIDAD (Gráfico de barras)
        const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        const weeklyHistory = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const start = new Date(d.setHours(0,0,0,0));
            const end = new Date(d.setHours(23,59,59,999));
            
            const count = await Activity.countDocuments({ 
                user: userId, 
                createdAt: { $gte: start, $lte: end } 
            });
            weeklyHistory.push({ day: days[d.getDay()], acciones: count });
        }

        // 🤖 6. CONSEJO IA
        let aiInsight = "Analizando tus datos...";
        try {
            const realAdvice = await aiService.getDashboardInsight(
                { clientSummary, taskSummary }, 
                user.preferences || {}
            );
            if (realAdvice) aiInsight = realAdvice;
        } catch (aiError) {
            console.error("La IA no pudo generar el consejo.");
        }

        // -------------------------------------------------------------------------
        // 📦 7. RESPUESTA FINAL (El paquete que recibe tu web)
        // -------------------------------------------------------------------------
        res.json({
            clientSummary,
            taskSummary,
            criticalTasks, // 🟢 AQUÍ VA: Tu lista de fuegos que apagar.
            categoryData,  // Datos para el gráfico de colores.
            weeklyHistory, 
            recentActivity: await Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(10),
            aiInsight 
        });

    } catch (error) {
        console.error("Error en Dashboard:", error);
        res.status(500).json({ message: "Error al generar estadísticas" });
    }
};