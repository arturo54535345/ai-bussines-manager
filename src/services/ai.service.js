const {GoogleGenerativeAI} = require('@google/generative-ai');

//inicio la ia con la clave secreta
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

// Añadimos 'userPrompt' a la función
exports.analyzeBusinessData = async (clients, tasks, activities, userPrompt) =>{
    try {
        // ... (tus filtros de vips, urgentTasks, etc)
        
        const prompt = `
        Eres un consultor experto. Los datos actuales son:
        - Clientes: ${clients.length} (${vips} VIP).
        - Tareas: ${tasks.length}.
        - Actividad reciente: ${activitySummary}.
        
        EL USUARIO TE PREGUNTA: "${userPrompt}"
        
        Responde a su pregunta basándote en estos datos con 3 frases motivadoras.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch(error) {
        return "Lo siento, no pude generar un consejo.";
    }
};