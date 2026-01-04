const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.analyzeBusinessData = async (clients, tasks, activities, userPrompt, preferences) => {
    try {
        // 1. Resumen rápido para la IA
        const vips = clients.filter(c => c.category === 'VIP').length;
        const pending = tasks.filter(t => t.status === 'pending').length;
        
        // 2. CREAMOS EL MENSAJE MAESTRO (Prompt)
        // Usamos las preferencias para decirle a Gemini cómo debe comportarse
        const prompt = `
        Eres un ${preferences.aiTone || 'Socio'} experto en estrategia de negocios. 
        Tu tono debe ser el de un ${preferences.aiTone}.
        
        Contexto del negocio actual:
        - Clientes totales: ${clients.length} (de los cuales ${vips} son VIP).
        - Tareas pendientes: ${pending}.
        - Meta mensual del usuario: ${preferences.monthlyGoal} tareas.
        
        EL USUARIO TE PREGUNTA: "${userPrompt}"
        
        INSTRUCCIONES DE RESPUESTA:
        - Responde basándote en los datos anteriores.
        - Usa exactamente el estilo de un ${preferences.aiTone}.
        - Si el usuario pregunta algo que no tiene que ver con su negocio, recuérdale sus metas suavemente.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error en Gemini:", error);
        return "Lo siento Arturo, mi conexión con Google ha fallado. ¿Podemos intentarlo en un momento?";
    }
};