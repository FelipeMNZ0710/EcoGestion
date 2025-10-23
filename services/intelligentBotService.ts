import { getGeminiResponseStream } from './geminiService';
import { getFallbackResponseStream } from './fallbackService';
import { getOllamaResponseStream } from './ollamaService';

// --- CONMUTADOR PRINCIPAL ---
// Cambia este valor a 'false' si quieres volver a usar la API de Gemini.
const USE_OLLAMA = true;

export async function* getBotResponseStream(query: string): AsyncGenerator<string, void, unknown> {
    if (USE_OLLAMA) {
        // Intenta usar Ollama
        try {
            yield* getOllamaResponseStream(query);
        } catch (error) {
            console.error("Ollama falló, cambiando al servicio de fallback:", error);
            // Si Ollama falla (por ejemplo, no está corriendo), usa el fallback simple.
            yield* getFallbackResponseStream(query);
        }
    } else {
        // Lógica original: Intenta usar Gemini, si falla, usa el fallback.
        try {
            yield* getGeminiResponseStream(query);
        } catch (error) {
            console.error("Switching to fallback due to Gemini API error:", error);
            yield* getFallbackResponseStream(query);
        }
    }
}
