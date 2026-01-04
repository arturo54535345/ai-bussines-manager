const Activity = require('../models/Activity')
const Task = require('../models/Task');
const Client = require('../models/Client');

//creamos un cliente nuevo
exports.createClient = async (req, res) =>{
    try{
        //creamos el cliente con los datos del body y le asignamos el dueño 
        const newClient = new Client({
            ...req.body,
            owner: req.user.id// el ID viene del middleware
        });
        await newClient.save();
        await new Activity({
            user: req.user.id,
            action: `Creo al cliente: ${newClient.name}`,
            type: 'client'
        }).save();
        res.status(201).json(newClient);
    }catch(error){
        res.status(500).json({
            message: "Error al crear el cliente",
            error: error.message,
        });
    }
};

//listar todos los clientes con el buscador o poniendole filtros 
exports.getClients = async (req, res) => {
    try {
        const { search, category } = req.query; // Leemos lo que Arturo escribe en la web
        let query = { owner: req.user.id }; // Por defecto, solo sus clientes

        // Si hay búsqueda, usamos una "RegExp" (Buscador inteligente que ignora mayúsculas)
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Si hay categoría (VIP, etc.), filtramos por ella
        if (category) {
            query.category = category;
        }

        const clients = await Client.find(query);
        res.json({ clients });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener clientes" });
    }
};

//veremos los detalles del cliente al completo
exports.getClientDetails = async (req, res) =>{
    try{
        //buscamos al cliente 
        const client = await Client.findOne({_id: req.params.id, owner: req.user.id});
        if(!client) return res.status(404).json({message: "Cliente no encontrado"});

        //bucamos las tareas asociadas a ese cliente 
        const tasks = await Task.find({client: client._id});

        //devolvemos las dos cosas
        res.json({client, tasks});
    }catch(error){
        res.status(500).json({message: "Error al obtener detalles"});
    }
};

//edicion del cliente 
exports.updateClient = async (req, res) =>{
    try{
        const updatedClient = await Client.findOneAndUpdate(
            {_id: req.params.id, owner: req.user.id},
            req.body,//aqui es donde llegan los cambios
            {new: true, runValidators: true}//new lo que hace es devolver el objeto ya cambiado 
        );
        await new Activity({
            user: req.user.id,
            action: `Actualizo al cliente: ${updatedClient.name}`,
            type: 'client'
        }).save();
        res.json(updatedClient);
    }catch(error){
        res.status(500).json({message: "Error al actualizar"})
    }
};

//elminacion de clientes pero no se elminana de todo simplemente se desactivan 
exports.deleteClient = async (req, res) =>{
    try{
        //no lo borro de la base de datos por asi decirlo simplemente lo desactivo
        const client = await Client.findOneAndUpdate(
            {_id: req.params.id, owner: req.user.id},
            {active: false},
            {new: true}
        );
        if (!client) return res.status(404).json({message: "Cliente no encontrado"});
        await new Activity({
            user: req.user.id,
            action: `Elimino al cliente: ${client.name}`,
            type: 'client'
        }).save();
        res.json({message: "Cliente desactivado correctamente"});
    }catch(error){
        res.status(500).json({message: "Error al elminar el cliente"});
    }
}