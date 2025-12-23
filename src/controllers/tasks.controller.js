const Task = require('../models/Task');//importamos el modelo de Task 

//funcion para crear una tarea
exports.createTask = async (req, res) => {
    try{
        const {title, client, status} = req.body;//obtenemos los datos de la tarea desde el cuerpo de la peticion

        const newTask = new Task({
            title,
            client,//el id del cliente al que pertenece
            satatus,//el estado de la tarea
            owner: req.user.id//el id del usuario crea la tarea, viene del token
        });

        await newTask.save();//guardamos la tarea en la base de datos
        res.status(201).json(newTask);//retornamos la tarea creada 
    }catch(error){
        res.status(500).json({message: 'Error al crear la tarea', error: error.message});//si hay un error retornamos un mensaje de error
    }
};

//funcion para ver todas las tareas de un usuario 
exports.getTasks = async (req, res) =>{
    try{
        const tasks = await Task.find({owner:req.user.id}).populate('client');//buscamos las tareas del dueño, usuario 
        res.json(tasks);//retornamos las tareas encontradas

    }catch(error){
        res.status(500).json({message: 'Error al obtener las tareas', error: error.message});
    }
};