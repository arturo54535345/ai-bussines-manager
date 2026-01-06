const Task = require('../models/Task');
const aiService = require('../services/ai.service');
const Activity = require('../models/Activity');
const User = require('../models/User');

/**
 * 1. CREAR TAREA
 * Guarda un nuevo objetivo en la base de datos.
 */
exports.createTask = async (req, res) => {
    try {
        const { title, client, status, description, priority, dueDate, specifications } = req.body;
        
        const newTask = new Task({
            title, 
            description, 
            specifications, // 🟢 Vital para que la IA sepa qué hacer
            client, 
            status, 
            priority, 
            dueDate,
            owner: req.user.id // La tarea pertenece a quien está logueado
        });

        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la tarea', error: error.message });
    }
};

/**
 * 2. VER TODAS LAS TAREAS
 * Trae la lista de tareas con filtros de búsqueda y prioridad.
 */
exports.getTasks = async (req, res) => {
    try {
        const { search, priority } = req.query;
        let query = { owner: req.user.id };

        if (search) query.title = { $regex: search, $options: 'i' };
        if (priority) query.priority = priority;

        const tasks = await Task.find(query).populate('client', 'name');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las tareas" });
    }
};

/**
 * 3. ACTUALIZAR TAREA
 * Cambia los datos o el estado. Si se completa, registra la actividad.
 */
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },
            req.body,
            { new: true }
        );

        // 🟢 Si Arturo marca la tarea como hecha, avisamos al sistema de actividad
        if (req.body.status === 'completed' && task) {
            await new Activity({ 
                user: req.user.id, 
                action: `Completó: ${task.title}`, 
                type: 'task' 
            }).save();
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar" });
    }
};

/**
 * 4. ELIMINAR TAREA
 */
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
        if (!task) return res.status(404).json({ message: "No encontrada" });
        res.json({ message: "Eliminada" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar" });
    }
};

/**
 * 5. BUSCAR POR ID (Para editar)
 */
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "No encontrada" });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Error al buscar" });
    }
};

/**
 * 6. ASISTENTE IA PARA TAREAS (El botón mágico)
 * Conecta con Groq para darte un plan de acción detallado.
 */
exports.getTaskAdvice = async (req, res) => {
    try {
        // Buscamos la tarea específica
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

        // Buscamos al usuario para saber si quiere un tono "Coach" o "Socio"
        const user = await User.findById(req.user.id);
        const userPreferences = user ? user.preferences : {};

        // 🟢 LLAMADA AL SERVICIO: Le pasamos la tarea y tus gustos
        const advice = await aiService.generateTaskPlan(task, userPreferences);

        res.json({ advice });
    } catch (error) {
        console.error("Error en Asistente IA:", error.message);
        res.status(500).json({ message: "La IA no pudo procesar el plan." });
    }
};