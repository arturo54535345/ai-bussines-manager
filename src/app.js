const express = require('express'); // El recepcionista que organiza las peticiones.
const cors = require('cors'); // El guardia de seguridad que permite la conexión entre Front y Back.
require("dotenv").config();
console.log("Gemini key loaded:", !!process.env.GEMINI_API_KEY);

const app = express(); // Creamos la aplicación.

// 1. IMPORTACIÓN DE RUTAS (Las calles de nuestra ciudad)
const authRoutes = require('./routes/auth.routes'); 
const clientsRoutes = require('./routes/clients.routes');
const tasksRoutes = require('./routes/tasks.routes');
const aiRoutes = require('./routes/ai.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// 2. MIDDLEWARES (Los filtros de seguridad y procesado)

// Ajustamos el CORS para que el navegador confíe totalmente en nuestra llave 'x-auth-token'
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token'],
    exposedHeaders: ['x-auth-token'] // Ordenamos que el sobre 'x-auth-token' sea visible
}));

app.use(express.json()); // Permite que el servidor entienda los datos en formato JSON (el idioma de la web).

// 3. REGISTRO DE RUTAS (Asignamos cada dirección a su controlador)
app.use('/api/auth', authRoutes); 
app.use('/api/clients', clientsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Ruta de prueba para saber si el motor arranca
app.get('/', (req, res) => {
    res.send("Servidor funcionando correctamente. ¡Todo listo, Arturo!");
});

module.exports = app; // Exportamos la app para que server.js la ponga a funcionar.