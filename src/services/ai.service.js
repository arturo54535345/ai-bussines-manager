//esto se encarga de redactar el mensaje para la ia
exports.analyzeBusinessData= (Client, tasks) =>{
    const pendingTasks = tasks.filter(t=> t.status === 'pending').length;//contamos cuantas tareas hay de cada tipo para darle a la ia
    const completedTask = tasks.filter(t=> t.status === 'completed').length;

    //creamos el prompt osea la instruccion para la ia
    const prompt = `
    Eres un consultor de negocios experto que has ayudado a mejorar miles de negocios con tus consejos.
    Actualmente el negocio tiene ${Client.length} clientes.
    Hay un total de ${tasks.length} tareas registradas.
    -Tareas pendientes ${pendingTasks}
    -Tareas completadas ${completedTask}

    Basado en esos datos, dame un consejo breve (maximo 3 frases) sobre que deberia priorizar el dueño del negocio hoy, el mes y el año completo.
    `;

    //esto de aqui sera provisional hasta que conectemos la API real
    return `Analisis de IA: Tienes ${pendingTasks} tareas acumuladas. Deberias contactar a tus clientes ${clients.length} clientes para cerrar proyectos pendientes.`;
};