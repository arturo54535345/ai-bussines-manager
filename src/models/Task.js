// -------------------------------------------------------------------------
// 🏗️ SECCIÓN 1: IMPORTACIÓN
// -------------------------------------------------------------------------
const mongoose = require('mongoose'); // Traemos la herramienta que sabe hablar con la base de datos.

// -------------------------------------------------------------------------
// 📐 SECCIÓN 2: EL MOLDE (TaskSchema)
// -------------------------------------------------------------------------
// Imagina que esto es un molde de silicona. Cada vez que creas una tarea, 
// tiene que encajar perfectamente en estos huecos.

const TaskSchema = new mongoose.Schema({
    // El título es obligatorio (required: true). Sin nombre no hay tarea.
    title: { type: String, required: true },
    
    // La descripción es texto. Si no pones nada, se guarda como un texto vacío "".
    description: { type: String, default: "" },
    
    // Detalles extra o instrucciones para la IA.
    specifications: { type: String },
    
    // ESTADO: Aquí controlamos si la tarea está pendiente o terminada.
    status: {
        type: String,
        // 'enum' significa: "SOLO se permiten estas palabras exactas".
        enum: ['pending', 'in-progress', 'completed'], 
        default: 'pending' // Si no dices nada, nace como 'pendiente'.
    },

    // PRIORIDAD: Importancia de la tarea.
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },

    // CATEGORÍA: El tipo de trabajo (Llamada, Email...).
    category: {
        type: String,
        // 🟢 CORRECCIÓN CLAVE: Hemos añadido las tildes para que coincidan con tu Frontend.
        enum: ['Llamada', 'Reunión', 'Email', 'Administración', 'Catering', 'Otro'],
        default: 'Otro'
    },

    //Dinero que va a recibir el usuario por esta tarea
    budget:{
        type: Number,
        default: 0
    },

    //Dinero que le cuesta al usuario realizar esa tarea
    cost:{
        type: Number,
        default: 0
    },

    // La fecha de vencimiento. Se guarda en formato de fecha de ordenador.
    dueDate: { type: Date },

    // NOTAS: Una lista de comentarios que puedes ir añadiendo.
    notes: [{
        content: String,
        date: { type: Date, default: Date.now }, // Guarda la fecha del momento exacto del comentario.
    }],

    // 🔗 CONEXIONES (Relaciones)
    // client: Guarda el ID de un cliente y "mira" hacia el archivador de Clientes.
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    
    // owner: Guarda el ID del usuario que creó la tarea (Tú, Arturo).
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

}, { 
    // timestamps: Esto crea automáticamente dos campos: 
    // 1. Cuándo se creó la tarea (createdAt)
    // 2. Cuándo se modificó por última vez (updatedAt)
    timestamps: true 
});

// -------------------------------------------------------------------------
// 🚀 SECCIÓN 3: EXPORTACIÓN
// -------------------------------------------------------------------------
// Convertimos este molde en un "Modelo" llamado 'Task' para poder usarlo en los controladores.
module.exports = mongoose.model('Task', TaskSchema);