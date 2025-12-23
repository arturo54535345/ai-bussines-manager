const Client = require('../models/Client');

//funcion para crear clientes
exports.createClient = async (req, res) =>{
    try{
        const {name, email, phone} = req.body;//sacamos los datos que vienen del front

        const newClient = new Client({
            name,
            email,
            owner: req.user.id,//aqui usamos el id que el middelware descodifico del token
            phone,
        });

        await newClient.save();//guardamos en la base de datos

        res.status(201).json(newClient);//devolvemos el cliente creado

    }catch(error){
        res.status(500).json({message: 'Error al crear el cliente', error: error.message});
    }
};

//funcion para ver mis clientes
exports.getClients = async (req, res) =>{
    try{
        const clients = await Client.find({owner: req.user.id});//buscamos los clientes que pertenecen al usuario logueado correspondiente al id
        res.json(clients);//devolvemos los clientes encontrados
    }catch(error){
        res.status(500).json({message: 'Error al obtener los clientes', error: error.message});
    }
};