import { Request, Response } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

export const generateDeck = async (req: Request, res: Response) => {
    try {
        const { topic } = req.body;
        console.log(`[AI Controller] Generando mazo para: ${topic}`);

        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error("OPENROUTER_API_KEY no configurada");
        }

        const completion = await openai.chat.completions.create({
            model: "openai/gpt-3.5-turbo", // O el modelo que prefieras de OpenRouter
            messages: [
                {
                    role: "system",
                    content: "Eres un asistente de juego para 'Charades' (Adivina la palabra). Tu tarea es generar una lista de 30 palabras o frases cortas relacionadas con un tema específico. Las palabras deben ser en ESPAÑOL. Responde SOLAMENTE con un objeto JSON que contenga un array llamado 'words'. No incluyas markdown, ni explicaciones."
                },
                {
                    role: "user",
                    content: `Genera un mazo de palabras para el tema: "${topic}".`
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        const parsed = JSON.parse(content || '{"words": []}');

        res.json({
            topic: topic,
            words: parsed.words || []
        });

    } catch (error) {
        console.error("Error generating deck:", error);
        // Fallback a algunas palabras genéricas en español si falla
        res.status(500).json({
            error: "Failed to generate deck",
            words: ["Error", "Intenta", "De", "Nuevo", "API", "Caída"]
        });
    }
};
