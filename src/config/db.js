const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        //nos conectamos usando la url que tengo en el .env
        await mongoose.connect(process.env.MONGO_URL);
        console.log('MongoDB connected');
    }catch(error){
        //mensaje de error por si algo sale mal 
        console.error('MongoDB connection error:', error.message);
        process.exit(1); //si no hay base de datos cerramos el servidor
    }
};

module.exports = connectDB;