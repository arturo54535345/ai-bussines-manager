const {GoogleGenerativeAI} = require('@google/generative-ai');

//inicio la ia con la clave secreta
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

exports.analyzeBusinessData = async (clients, tasks, activities) =>{
    try{
        const pendingTasks = tasks.filter(t => t.status === 'pending').length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const vips = clients.filter(c => c.category === 'VIP').length;//datos clave para la ia
        const urgentTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;//datos clave para la ia
        const activitySummary = activities.map(a => a.action).join(", ");//resumen de las ultimas 3 actividades para que la ia sepa que esta pasando

        const prompt= `
        Eres un consultor de estrategia empresarial para (nombre del cliente)
        ESTADO ACTUAL:
        - Tienes ${clients.length} clientes en total (de los cuales ${vips} son VIP).
        -Hay ${tasks.length} tareas registradas.
        -¡ALERTA!: Hay ${urgentTasks} tareas de ALTA prioridad pendientes.
        -HISTORIAL RECIENTE: (nombre del cliente) ha hecho lo siguiente hace poco: ${activitySummary}.

        REGLA DE ORO: Prioriza siempre los clientes VIP y las tareas de alta prioridad.
        TAREA: Dame un consejo de 3 frases corto y motivador sobre que paso dar a continuacion. 
        `;

        //envio el mensaje a la IA
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();

        //devuelvo el texto que la ia ha respondido
        return response.text();
    }catch(error){
        console.error("Error en la IA", error);
        return "Lo siento, no pude generar un consejo en este momento.";
    }
};