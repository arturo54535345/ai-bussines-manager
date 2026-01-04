exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 1. RESUMEN GENERAL (Lo que ya tenías)
        const totalClients = await Client.countDocuments({ owner: userId, active: true });
        const clientSummary = {
            total: totalClients,
            vips: await Client.countDocuments({ owner: userId, active: true, category: 'VIP' }),
            active: await Client.countDocuments({ owner: userId, active: true, category: 'Active' }),
        };

        const tasks = await Task.find({ owner: userId });
        const taskSummary = {
            totalTasks: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            completed: tasks.filter(t => t.status === 'completed').length,
        };

        // 2. LÓGICA DE SUBIDAS Y BAJADAS (Últimos 7 días)
        // Buscamos las actividades del usuario en la última semana
        const activities = await Activity.find({
            user: userId,
            createdAt: { $gte: sevenDaysAgo }
        });

        // Creamos una lista con los nombres de los últimos 7 días
        const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        const weeklyHistory = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = days[d.getDay()];
            
            // Contamos cuántas acciones hubo en este día específico
            const count = activities.filter(a => 
                new Date(a.createdAt).toDateString() === d.toDateString()
            ).length;

            weeklyHistory.push({ day: dayName, acciones: count });
        }

        // 3. ENVIAMOS TODO AL FRONTEND
        res.json({
            clientSummary,
            taskSummary,
            weeklyHistory, // Enviamos la nueva lista para el gráfico
            recentActivity: await Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(10)
        });
    } catch (error) {
        res.status(500).json({ message: "Error al generar estadísticas" });
    }
};