
import { GoogleGenAI, Type, Content, GenerateContentResponse } from "@google/genai";
import { navigationData } from '../data/navigationData';

// Ensure the API key is available
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Dynamically create the list of available pages for the system instruction
const availablePages = navigationData
  .map(page => `- **'${page.title}'** (URL: '#${page.page}'): ${page.description}`)
  .join('\n');

const getSystemInstruction = (userName?: string): string => {
  const greeting = userName ? `¡Hola, ${userName}! ` : '';

  return `
Eres 'EcoBot', un asistente de IA amigable, simpático y experto en reciclaje para la iniciativa 'Formosa Recicla'. Tu único propósito es educar y ayudar a los usuarios con todas sus dudas sobre el reciclaje.

${greeting}Tu respuesta DEBE ser un objeto JSON que se ajuste al esquema proporcionado.

Tus reglas son estrictas:
1.  **Personalización**: Si el usuario ha iniciado sesión (se te proporcionará su nombre), salúdalo por su nombre de vez en cuando para que la conversación sea más cercana. Si no hay nombre, actúa de forma amigable pero general.
2.  **Formato de Respuesta**: Responde SIEMPRE en formato JSON. El JSON debe ser un objeto con una única clave "response" que contiene un array de bloques de contenido. Los tipos de bloque pueden ser 'text', 'list', 'link', o 'video'.
3.  **Exclusividad de Tema**: SOLO responde preguntas relacionadas con el reciclaje, la ecología, la sostenibilidad y la gestión de residuos.
4.  **Rechazo de Otros Temas**: Si un usuario te pregunta sobre cualquier otro tema (como pedir comida, historia, etc.), responde amablemente que tu función es exclusivamente ayudar con el reciclaje, usando un bloque de 'text'. Ejemplo: 'Mi propósito es ayudarte con el reciclaje. No puedo ayudarte a pedir una pizza, pero sí puedo decirte cómo reciclar la caja.'
5.  **Comprensión Flexible**: Esfuérzate al máximo por entender la intención del usuario, incluso si hay errores de ortografía o gramática.
6.  **Conocimiento de Secciones (¡MUY IMPORTANTE!)**: Conoces las siguientes secciones de la aplicación. Es crucial que si la pregunta del usuario se relaciona con alguna de estas secciones, le respondas con un bloque 'link' para dirigirlo allí. Por ejemplo, si preguntan sobre "chatear con gente" o "hablar con otros", DEBES enlazarlos a la sección 'Comunidad'. Si preguntan por "dónde tirar las cosas", DEBES enlazarlos a 'Puntos Verdes'. No inventes secciones que no existen en esta lista.
${availablePages}
7.  **Uso de Bloques**:
    *   **'text'**: Para párrafos de texto normales.
    *   **'list'**: Para enumerar elementos, como listas de materiales reciclables.
    *   **'link'**: Usa este bloque EXCLUSIVAMENTE para dirigir a los usuarios a las secciones de la página listadas arriba. El campo 'url' debe ser '#pagina' (ej. '#comunidad') y el 'title' debe ser claro (ej. 'Ir a la Comunidad').
    *   **'video'**: Si el usuario pide explícitamente un video o una recomendación visual, utiliza este bloque. Recomienda videos relevantes sobre reciclaje o ecología. Por ejemplo, si te piden un video sobre economía circular, puedes usar el ID 'z_s-831-48w'.
8.  **Tono y Longitud**: Mantén tu tono amigable y adapta la longitud de la respuesta a la pregunta. Usa múltiples bloques de texto para separar párrafos y hacer la lectura más fácil.
`;
};


const responseSchema = {
    type: Type.OBJECT,
    properties: {
        response: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: {
                        type: Type.STRING,
                        enum: ['text', 'list', 'link', 'video']
                    },
                    text: {
                        type: Type.STRING,
                        description: "Paragraph of text for the response.",
                    },
                    items: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "An array of strings for a bulleted list.",
                    },
                    url: {
                        type: Type.STRING,
                        description: "The URL for the link.",
                    },
                    title: {
                        type: Type.STRING,
                        description: "The display title for the link or video.",
                    },
                    youtubeId: {
                        type: Type.STRING,
                        description: "The YouTube video ID.",
                    },
                },
                required: ['type']
            }
        }
    },
    required: ['response']
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getErrorString = (err: any): string => {
  if (typeof err === 'string') {
    return err.toLowerCase();
  }
  if (typeof err === 'object' && err !== null) {
    const message = err.error?.message || err.message;
    if (message && typeof message === 'string') {
      return message.toLowerCase();
    }
    try {
      return JSON.stringify(err).toLowerCase();
    } catch {
      return (err.toString()).toLowerCase();
    }
  }
  return String(err).toLowerCase();
};

export const isHardQuotaError = (err: any): boolean => {
  const errorString = getErrorString(err);
  return errorString.includes('exceeded your current quota');
};

export const isTemporaryRateLimitError = (err: any): boolean => {
  const errorString = getErrorString(err);
  const isRateLimit = errorString.includes('429') || errorString.includes('resource_exhausted');
  return isRateLimit && !isHardQuotaError(err);
};

async function withRetry<T>(fn: () => Promise<T>, retries = 3, initialDelay = 1000): Promise<T> {
  let attempt = 0;
  let currentDelay = initialDelay;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      if (isTemporaryRateLimitError(err) && attempt < retries) {
        console.warn(`Temporary rate limit exceeded. Retrying in ${currentDelay}ms... (Attempt ${attempt}/${retries})`);
        await delay(currentDelay);
        currentDelay *= 2; // Exponential backoff
      } else {
        throw err;
      }
    }
  }
  throw new Error("Exhausted all retries.");
}

export const sendMessageToBot = async (contents: Content[], userName?: string): Promise<string> => {
  const model = 'gemini-2.5-flash';
  
  const apiCall = () => ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: getSystemInstruction(userName),
      responseMimeType: 'application/json',
      responseSchema,
    },
  });
  
  const response: GenerateContentResponse = await withRetry(apiCall);
  return response.text;
};
