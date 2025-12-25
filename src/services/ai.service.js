const {GoogleGenerativeAI} = require('@google/generative-ai');

//inicio la ia con la clave secreta
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

exports.analyzeBusinessData = async (clients, tasks) =>{
    try{
        const pendingTasks = tasks.filter(t => t.status === 'pending').length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;

        const prompt= `
        Eres un consultor de negocios experto.
        El negocio tiene ${clients.length} clientes.
        Tareas totales: ${tasks.length} (Pendientes: ${pendingTasks}, Completadas: ${completedTasks}).
        Basado en esto, dame un consejo de 3 frases para priorizar hoy.
        `;

        //envio el mensaje a la IA
        const result = await model.generateContent(prompt);
        const response = await result.response;

        //devuelvo el texto que la ia ha respondido
        return response.text();
    }catch(error){
        console.error("Error en la IA", error);
        return "Lo siento, no pude generar un consejo en este momento.";
    }
};