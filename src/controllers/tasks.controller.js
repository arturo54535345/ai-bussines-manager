const Task = require('../models/Task');//importamos el modelo de Task 
const Activity = require('../models/Activity');

//funcion para crear una tarea
exports.createTask = async (req, res) => {
    try{
        const {title, client, status, description, priority, dueDate} = req.body;//obtenemos los datos de la tarea desde el cuerpo de la peticion

        const newTask = new Task({
            title,
            description,//la informacion de la tarea
            client,//el id del cliente al que pertenece
            status,//el estado de la tarea
            priority,//la prioridad de la tarea 
            dueDate,//guardamos la fecha
            owner: req.user.id//el id del usuario crea la tarea, viene del token
        });

        await newTask.save();//guardamos la tarea en la base de datos
        res.status(201).json(newTask);//retornamos la tarea creada 
    }catch(error){
        res.status(500).json({message: 'Error al crear la tarea', error: error.message});//si hay un error retornamos un mensaje de error
    }
};

//funcion para ver todas las tareas de un usuario 
exports.getTasks = async (req, res) => {
    try {
        const { search, priority } = req.query; // Leemos la búsqueda y la prioridad
        let query = { owner: req.user.id };

        // Si Arturo escribe algo, buscamos por título (ignora mayúsculas)
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // Si Arturo elige una prioridad (Alta, Media, Baja), filtramos
        if (priority) {
            query.priority = priority;
        }

        const tasks = await Task.find(query).populate('client', 'name');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las tareas" });
    }
};

//funcion para poder editar las tareas
exports.updateTask = async (req, res) =>{
    try{
        const task = await Task.findOneAndUpdate(
            {_id: req.params.id, owner: req.user.id},
            req.body,
            {new: true},
        );
        if(req.body.status === 'completed'){
        await new Activity({
            user: req.user.id,
            action: `Completo la tarea: ${task.title}`,
            type: 'task'
        }).save();
        }
        res.json(task)
    }catch(error){
        res.status(500).json({message: "Error al actualizar la tarea"});
    }
};

//funcion para eleminar tareas
exports.deleteTask = async (req, res) =>{
    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user.id});
        if(!task) return res.status(404).json({message: "Tarea no encontrada"});

        res.json({message: "Tarea elminada correctamente"});
    }catch(error){
        res.status(500).json({message: "Error al eliminar la tarea"});
    }
};

exports.getTaskById = async (req, res) =>{
    try{
        //busco la tarea mediante el id que me llega 
        const task = await Task.findById(req.params.id);

        //si no existe aviso
        if(!task){
            return res.status(404).json({message: "Tarea no encontrada"});
        }

        //si existe esta tarea se enviara al front
        res.json(task);
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Error al buscar la tarea"});
    }
};