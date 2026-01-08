// -------------------------------------------------------------------------
// 🏗️ SECCIÓN 1: IMPORTACIONES (Nuestros ingredientes y herramientas)
// -------------------------------------------------------------------------
const Task = require("../models/Task"); // Traemos el molde de las Tareas.
const aiService = require("../services/ai.service"); // El cable que conecta con la IA.
const Activity = require("../models/Activity"); // El diario donde anotamos qué has hecho.
const User = require("../models/User"); // El archivo de usuarios para conocer tus gustos.

// -------------------------------------------------------------------------
// 🚀 1. CREAR TAREA (Guardar un objetivo nuevo)
// -------------------------------------------------------------------------
exports.createTask = async (req, res) => {
  try {
    // 👨‍🏫 EXPLICACIÓN: Sacamos los datos del "sobre" (req.body) que envió Arturo.
    const {
      title,
      client,
      status,
      description,
      priority,
      dueDate,
      specifications,
      category 
    } = req.body;

    // 👨‍🏫 Creamos la tarea en la memoria del servidor usando nuestro molde.
    const newTask = new Task({
      title,
      description: description || "", // Si no hay descripción, ponemos un texto vacío.
      specifications, 
      client,
      status: status || 'pending', // Si no llega estado, nace como 'pendiente'.
      priority: priority || 'medium', // Si no llega prioridad, se queda en 'media'.
      dueDate,
      category: category || 'Otro', // Usamos la categoría elegida o 'Otro' por defecto.
      owner: req.user.id, // Marcamos que la tarea le pertenece a Arturo.
    });

    // 👨‍🏫 Guardamos el resultado en la base de datos real.
    await newTask.save();
    
    // 👨‍🏫 Respondemos a la web con la tarea recién creada (Código 201: Creado).
    res.status(201).json(newTask);
  } catch (error) {
    // 🕵️ Si algo sale mal, lo imprimimos en la consola negra para investigar.
    console.error("Error al crear tarea:", error.message);
    res.status(500).json({ message: "Error al crear la tarea", error: error.message });
  }
};

// -------------------------------------------------------------------------
// 🔍 2. VER TODAS LAS TAREAS (Buscador Total)
// -------------------------------------------------------------------------
exports.getTasks = async (req, res) => {
  try {
    // 👨‍🏫 Capturamos lo que Arturo escribió en la lupa (search) y los filtros.
    const { search, priority, category } = req.query;
    
    // Empezamos buscando solo las tareas de Arturo.
    let query = { owner: req.user.id };

    // 🟢 LÓGICA DEL BUSCADOR TOTAL
    if (search) {
      // 🕵️ Paso A: Buscamos qué clientes se llaman como lo que escribió Arturo.
      const Client = require("../models/Client"); 
      const matchingClients = await Client.find({
        name: { $regex: search, $options: "i" }, // "i" significa: ignora mayúsculas/minúsculas.
        owner: req.user.id,
      }).select("_id"); // Solo queremos sus códigos ID.

      // Guardamos esos IDs en una lista limpia.
      const clientIds = matchingClients.map(c => c._id);

      // 🕵️ Paso B: Buscamos tareas que cumplan CUALQUIERA de estas condiciones ($or).
      query.$or = [
        { title: { $regex: search, $options: "i" } },       // ¿El nombre coincide?
        { description: { $regex: search, $options: "i" } }, // ¿Está en la descripción?
        { category: { $regex: search, $options: "i" } },    // ¿Es ese tipo de tarea?
        { priority: { $regex: search, $options: "i" } },    // ¿Es esa prioridad?
        { client: { $in: clientIds } }                      // 🟢 ¿Es de un cliente que buscamos antes?
      ];
    }

    // 👨‍🏫 Si Arturo usó los selectores de arriba, añadimos esos filtros también.
    if (priority) query.priority = priority;
    if (category) query.category = category;

    // Buscamos en la base de datos y 'populate' nos trae el nombre del cliente.
    const tasks = await Task.find(query).populate("client", "name");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las tareas" });
  }
};

// -------------------------------------------------------------------------
// 📝 3. ACTUALIZAR TAREA (Cambiar datos o completar)
// -------------------------------------------------------------------------
exports.updateTask = async (req, res) => {
  try {
    // 👨‍🏫 Buscamos la tarea y le metemos los nuevos cambios.
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true } // 'new: true' nos devuelve la tarea ya actualizada.
    );

    // 👨‍🏫 Si marcas la tarea como "completed", se anota automáticamente un éxito.
    if (req.body.status === "completed" && task) {
      await new Activity({
        user: req.user.id,
        action: `Completó: ${task.title}`,
        type: "task",
      }).save();
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar" });
  }
};

// -------------------------------------------------------------------------
// 🗑️ 4. ELIMINAR TAREA
// -------------------------------------------------------------------------
exports.deleteTask = async (req, res) => {
  try {
    // 👨‍🏫 Buscamos por ID y borramos siempre que sea de Arturo.
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!task) return res.status(404).json({ message: "No encontrada" });
    res.json({ message: "Eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar" });
  }
};

// -------------------------------------------------------------------------
// 🆔 5. BUSCAR POR ID (Cargar la ficha de edición)
// -------------------------------------------------------------------------
exports.getTaskById = async (req, res) => {
  try {
    // 👨‍🏫 Traemos una sola tarea con el nombre de su cliente.
    const task = await Task.findById(req.params.id).populate("client", "name");
    if (!task) return res.status(404).json({ message: "No encontrada" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error al buscar" });
  }
};

// -------------------------------------------------------------------------
// 🤖 6. ASISTENTE IA (El cerebro de Groq)
// -------------------------------------------------------------------------
exports.getTaskAdvice = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

    // 👨‍🏫 Buscamos tus preferencias (Coach, Socio, etc.) para que la IA te hable como te gusta.
    const user = await User.findById(req.user.id);
    const userPreferences = user ? user.preferences : {};

    // 👨‍🏫 Llamamos al servicio de IA pasándole la tarea y tus gustos.
    const advice = await aiService.generateTaskPlan(task, userPreferences);

    res.json({ advice });
  } catch (error) {
    console.error("Error en Asistente IA:", error.message);
    res.status(500).json({ message: "La IA no pudo procesar el plan." });
  }
};