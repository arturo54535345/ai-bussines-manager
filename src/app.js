const express = require('express'); //por asi decirlo es un recepcionista que recibe las peticiones y las envia a su destino
const cors = require('cors'); // el guardia que permite que el front pueda comunicarse con el back

const app = express(); //creamos la app
const authRoutes = require('./routes/auth.routes'); //rutas de autenticacion
const clientsRoutes = require('./routes/clients.routes');//rutas de clientes
const tasksRoutes = require('./routes/tasks.routes');//rutas de tareas
const aiRoutes = require('./routes/ai.routes');//rutas de la ia 

//Middlewares(filtros)

app.use(cors()); //permite que otras web se conecten con la nuestra 
app.use(express.json()); //permite que nuestra web entienda cuando le envian datos en JSON 
app.use('/api/auth', authRoutes); //todas las rutas que empiecen con /api/auth seran manejadas por authRoutes
app.use('/api/clients', clientsRoutes);//permita que todas las rutas que empiecen con /api/clients sean menajadas por clientesRoutes
app.use('/api/tasks', tasksRoutes);//permite que todas las rutas sean manejadas por tasksRoutes
app.use('/api/ai', aiRoutes);//permite que todas las rutas sean manejadas por aiRoutes

//ruta de prueba 
app.get('/', (req, res) => {
    res.send("servidor funcionando correctamente");
});


module.exports = app; //exportamos la app para usarlo a ver si todo esta okeys makey

/**
"message": "Login exitoso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NGIyNjQ0YmY3MzBlZTdmNjA3MGJkZSIsImlhdCI6MTc2NjUzMjc5MiwiZXhwIjoxNzY2NTM2MzkyfQ.yEpF2DZwZOTfqqkjlamUQ_VXzRtAb7JEh-Iwn54J9js",
    "user": {
        "id": "694b2644bf730ee7f6070bde",
        "name": "Arturo Prueba",
        "email": "arturo@test.com"


 */