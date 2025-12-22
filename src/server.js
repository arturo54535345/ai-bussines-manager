require('dotenv').config(); //cargamos las variables secretas del .env
const app = require('/app'); //treames lo que configuramos en el app.js
const connectDB = require('/config/db'); //treameos la conexion de la base de datos

const PORT = process.env.PORT || 3000; //definimos el puerto

app.listen(PORT, ()=>{
    console.log(`Servidor funcionando en el puerto ${PORT}`);
    connectDB(); //conectamos a la base de datosd cuando el  servidor inicie 
})