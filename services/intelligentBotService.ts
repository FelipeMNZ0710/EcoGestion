import { getGeminiResponseStream } from './geminiService';
import { getFallbackResponseStream } from './fallbackService';

export async function* getBotResponseStream(query: string): AsyncGenerator<string, void, unknown> {
    try {
        // Yield from the Gemini stream generator
        yield* getGeminiResponseStream(query);
    } catch (error) {
        console.error("Switching to fallback due to Gemini API error:", error);
        // If Gemini fails, yield from the fallback stream generator
        yield* getFallbackResponseStream(query);
    }
}