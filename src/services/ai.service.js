const Groq = require('groq-sdk');

// 1. Inicializamos Groq con tu llave secreta
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Usaremos Llama 3.3, que es el modelo actual recomendado por Groq (más inteligente y estable)
const MODEL_NAME = "llama-3.3-70b-versatile";

/**
 * FUNCIÓN A: Plan para Tareas
 */
exports.generateTaskPlan = async (task, preferences = {}) => {
    try {
        // Groq usa un formato de "mensajes" (role: system/user)
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Actúa como un ${preferences.aiTone || 'Socio Estratégico'} experto en negocios.`
                },
                {
                    role: "user",
                    content: `Arturo necesita un plan para esta tarea:
                              TÍTULO: "${task.title}"
                              NOTAS: ${task.specifications || 'Sin notas extra'}
                              
                              Responde con: ANÁLISIS, PLAN DE ACCIÓN y CONSEJO PRO.`
                }
            ],
            model: MODEL_NAME,
        });

        // Extraemos el texto de la respuesta de Groq
        return chatCompletion.choices[0]?.message?.content || "No pude generar el consejo.";

    } catch (error) {
        console.error("Fallo en Groq (Tasks):", error.message);
        // "Plan B" por si falla internet
        return `ANÁLISIS: Analizando "${task.title}".\n1. Revisa tus notas: ${task.specifications || 'Validar'}.\n2. Ejecuta hoy.\n3. Consejo: Enfócate en la calidad Arturo.`;
    }
};

/**
 * FUNCIÓN B: Consejo del Dashboard
 */
exports.getDashboardInsight = async (stats, preferences = {}) => {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{
                role: "user",
                content: `Eres un ${preferences.aiTone}. Arturo tiene ${stats.taskSummary.pending} tareas. Dame un consejo de 15 palabras.`
            }],
            model: MODEL_NAME,
        });
        return chatCompletion.choices[0]?.message?.content;
    } catch (error) {
        return "¡A por todas hoy, Arturo! Cada paso cuenta.";
    }
};

/**
 * FUNCIÓN C: Chat Consultoría
 */
exports.analyzeBusinessData = async (clients, tasks, activities, userPrompt, preferences = {}) => {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: `Eres un ${preferences.aiTone} analizando el negocio de Arturo.` },
                { role: "user", content: `Datos: ${clients.length} clientes. Pregunta: "${userPrompt}"` }
            ],
            model: MODEL_NAME,
        });
        return chatCompletion.choices[0]?.message?.content;
    } catch (error) {
        return "Error de conexión con la consultoría IA.";
    }
};