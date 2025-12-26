const Task = require('../models/Task');

//creamos un cliente nuevo
exports.createClient = async (req, res) =>{
    try{
        //creamos el cliente con los datos del body y le asignamos el dueño 
        const newClient = new Client({
            ...req.body,
            owner: req.user.id// el ID viene del middleware
        });
        await newClient.save();
        res.status(201).json(newClient);
    }catch(error){
        res.status(500).json({
            message: "Error al crear el cliente",
            error: error.message,
        });
    }
};

//listar todos los clientes con el buscador o poniendole filtros 
exports.getClients = async (req , res) =>{
    try{
        const {search, page = 1, limit = 10} = req.query;//sacmos los datos mediante la url 

        //filtro que solo sea del dueño y que este vacio( se hace un borrado siempre )
        let query = {owner: req.user.id, active: true};

        //si alguien busca un nombre usamos una expresion sencilla para que sea facil de encontrar da igual que pongas juan que JUAN 
        if(search){
            query.name = { $regex: search, $options: 'i'};
        }
        const clients = await Client.find(query)
        .limit(limit * 1)//la cantidad de maxima que nos saldra en el buscador osea un max de 10 
        .skip((page - 1)* limit)//cuantos nos saltamos
        .sort({createdAt: -1});//esto hace que te salgan los mas nuevos primero

        res.json({
            total: await Client.countDocuments(query),
            currentPage: page,
            clients
        });
    }catch(error){
        res.status(500).json({message: "Error al obtener los clientes"});
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
        res.json(updatedClient);
    }catch(error){
        res.status(500).json({message: "Error al actualizar"})
    }
};

//elminacion de clientes pero no se elminana de todo simplemente se desactivan 
exports.deleteClient = async (req, res) =>{
    try{
        //no lo borro de la base de datos por asi decirlo simplemente lo desactivo
        const cliet = await Client.findOneAndUpdate(
            {_id: req.params.id, owner: req.user.id},
            {active: false},
            {new: true}
        );
        if (!client) return res.status(404).json({message: "Cliente no encontrado"});
        res.json({message: "Cliente desactivado correctamente"});
    }catch(error){
        res.status(500).json({message: "Error al elminar el cliente"});
    }
}