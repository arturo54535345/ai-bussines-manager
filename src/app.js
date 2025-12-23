const express = require('express'); //por asi decirlo es un recepcionista que recibe las peticiones y las envia a su destino
const cors = require('cors'); // el guardia que permite que el front pueda comunicarse con el back

const app = express(); //creamos la app
const authRoutes = require('./routes/auth.routes'); //rutas de autenticacion
const clientesRoutes = require('./routes/clients.routes');//rutas de clientes

//Middlewares(filtros)

app.use(cors()); //permite que otras web se conecten con la nuestra 
app.use(express.json()); //permite que nuestra web entienda cuando le envian datos en JSON 
app.use('/api/auth', authRoutes); //todas las rutas que empiecen con /api/auth seran manejadas por authRoutes
app.use('api/clients', clientesRoutes);//permita que todas las rutas que empiecen con /api/clients sean menajadas por clientesRoutes

//ruta de prueba 
app.get('/', (req, res) => {
    res.send("servidor funcionando correctamente");
});


module.exports = app; //exportamos la app para usarlo a ver si todo esta okeys makey