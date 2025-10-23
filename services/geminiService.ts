import { GoogleGenAI } from "@google/genai";
import { systemInstruction } from '../data/botPrompt';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const modelName = 'gemini-2.5-flash';

export async function* getGeminiResponseStream(query: string): AsyncGenerator<string, void, unknown> {
    try {
        const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents: query,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            if (chunkText) {
                yield chunkText;
            }
        }
    } catch (error) {
        console.error("Error fetching from Gemini API stream:", error);
        // Re-throw the error to be caught by the intelligentBotService and trigger the fallback.
        throw error;
    }
}
