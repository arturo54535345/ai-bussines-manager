// -------------------------------------------------------------------------
// 🏗️ SECCIÓN 1: IMPORTACIONES (Nuestras fuentes de información)
// -------------------------------------------------------------------------
const Client = require('../models/Client'); // Para saber todo sobre tus clientes.
const Task = require('../models/Task');     // El motor principal, donde ahora vive el dinero.
const Activity = require('../models/Activity'); // El registro de tus movimientos diarios.
const User = require('../models/User');     // Tu perfil y preferencias de IA.
const aiService = require('../services/ai.service'); // Tu consultor personal Groq.

// 🟢 FUNCIÓN PRINCIPAL: Generar todas las estadísticas del panel
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id; // Identificamos que eres Arturo mediante su ID.
        const user = await User.findById(userId);

        // -------------------------------------------------------------------------
        // 👥 1. RESUMEN DE CLIENTES
        // -------------------------------------------------------------------------
        const clientSummary = {
            // Contamos los clientes activos que te pertenecen.
            total: await Client.countDocuments({ owner: userId, active: true }),
            // Contamos solo los que tienen la etiqueta 'VIP'.
            vips: await Client.countDocuments({ owner: userId, active: true, category: 'VIP' }),
        };

        // -------------------------------------------------------------------------
        // 📝 2. RESUMEN GENERAL DE TAREAS
        // -------------------------------------------------------------------------
        // Traemos todas tus tareas de la base de datos para analizarlas.
        const tasks = await Task.find({ owner: userId });

        // -------------------------------------------------------------------------
        // 💰 3. INTELIGENCIA FINANCIERA (Lo que entra y lo que sale)
        // -------------------------------------------------------------------------
        // 👨‍🏫 Lógica: Usamos 'reduce' para recorrer todas las tareas y sumar los euros.
        const financialSummary = tasks.reduce((acc, task) => {
            // Sumamos el coste de CADA tarea al total de gastos (aunque no esté hecha, el gasto suele ser previo).
            acc.totalExpenses += (task.cost || 0);

            if (task.status === 'completed') {
                // Si la tarea está completada, el presupuesto se convierte en INGRESO REAL.
                acc.realIncome += (task.budget || 0);
            } else {
                // Si la tarea está pendiente o en curso, el presupuesto es DINERO PROYECTADO (lo que ganarás).
                acc.projectedIncome += (task.budget || 0);
            }
            return acc;
        }, { realIncome: 0, totalExpenses: 0, projectedIncome: 0 }); // Empezamos todas las cajas en 0€.

        // 👨‍🏫 El Beneficio Actual es: Lo que ya has cobrado de verdad MENOS lo que te has gastado.
        const currentProfit = financialSummary.realIncome - financialSummary.totalExpenses;
        
        // Creamos un resumen rápido de estados (Pendientes vs Hechas).
        const taskSummary = {
            totalTasks: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            completed: tasks.filter(t => t.status === 'completed').length,
        };

        // -------------------------------------------------------------------------
        // 🚨 4. RADAR DE URGENCIAS (Tareas Críticas)
        // -------------------------------------------------------------------------
        // Buscamos tareas de prioridad alta que Arturo aún no ha terminado.
        const criticalTasks = await Task.find({
            owner: userId,
            status: { $ne: 'completed' }, // $ne significa "Que no sea igual a..."
            priority: 'high'              
        })
        .sort({ dueDate: 1 }) // Ordenamos: la fecha más cercana aparece arriba.
        .limit(3)             // Solo cogemos las 3 principales.
        .populate('client', 'name'); // Traemos el nombre del cliente para saber de quién es.

        // -------------------------------------------------------------------------
        // 🍩 5. DISTRIBUCIÓN POR CATEGORÍAS (Para el gráfico Donut)
        // -------------------------------------------------------------------------
        const categoryDistribution = tasks.reduce((acc, task) => {
            const cat = task.category || 'Otro';
            acc[cat] = (acc[cat] || 0) + 1; // Contamos cuántas tareas hay de cada tipo.
            return acc;
        }, {});

        // Lo convertimos a formato lista [{name: 'Email', value: 5}, ...] para Recharts.
        const categoryData = Object.keys(categoryDistribution).map(name => ({
            name,
            value: categoryDistribution[name]
        }));

        // -------------------------------------------------------------------------
        // 📅 6. HISTORIAL SEMANAL Y FINANCIERO  (Gráfico de Barras)
        // -------------------------------------------------------------------------
        const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        const weeklyHistory = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const start = new Date(d.setHours(0,0,0,0));
            const end = new Date(d.setHours(23,59,59,999));
            
            //busco tareas que se completaran en este mismo dia en especifico
            const tasksDoneToday = await Task.find({
                owner: userId,
                status: 'completed',
                updateAt: { $gte: start, $lte: end}
            });

            //sumo el presupuesto de esas tareas para saber el ingreso diario
            const incomeToday = tasksDoneToday.reduce((sum, t)=> sum + (t.budget || 0), 0);

            //tambien mantengo el conteo de las acciones(clics/actividad)
            const actionCount = await Activity.countDocuments({
                user: userId,
                createdAt: {$gte: start, $lte: end}
            });

            weeklyHistory.push({
                day: days[d.getDay()],
                dinero: incomeToday,
                acciones: actionCount
            })
        }

        // -------------------------------------------------------------------------
        // 🤖 7. CONSEJO ESTRATÉGICO DE LA IA
        // -------------------------------------------------------------------------
        let aiInsight = "Analizando tus flujos de trabajo...";
        try {
            // Le enviamos a la IA el resumen de clientes, tareas y ahora también el dinero.
            const realAdvice = await aiService.getDashboardInsight(
                { clientSummary, taskSummary, financialSummary, currentProfit }, 
                user.preferences || {}
            );
            if (realAdvice) aiInsight = realAdvice;
        } catch (aiError) {
            console.error("La IA tuvo un error al leer las finanzas.");
        }

        // -------------------------------------------------------------------------
        // 📦 8. ENVÍO FINAL (El paquete que recibe tu Frontend)
        // -------------------------------------------------------------------------
        res.json({
            clientSummary,
            taskSummary,
            financialSummary, // 🟢 AÑADIDO: Ahora la web recibirá los datos de ingresos y gastos.
            currentProfit,    // 🟢 AÑADIDO: Tu beneficio neto actual.
            criticalTasks,
            categoryData,
            weeklyHistory, 
            recentActivity: await Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(10),
            aiInsight 
        });

    } catch (error) {
        console.error("Error crítico en el Dashboard:", error);
        res.status(500).json({ message: "Error al generar estadísticas" });
    }
};