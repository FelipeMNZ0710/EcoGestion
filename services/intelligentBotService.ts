import { sendMessageToBot, isHardQuotaError } from './geminiService';
import { getCachedResponse, setCachedResponse } from './cacheService';
import { getFallbackResponse, getFaqAnswer, getRandomFact } from './fallbackService';
import { quickQuestionsData } from '../data/quickQuestionsData';
import type { Content } from '@google/genai';
import type { ContentBlock } from '../types';

interface ProcessedResponse {
  response: string; // This will always be a JSON string of ContentBlock[]
  isFallback: boolean;
  fromCache: boolean;
}

const getUserPrompt = (history: Content[]): string | null => {
    if (history.length === 0) return null;
    const lastMessage = history[history.length - 1];
    
    const isTextOnly = lastMessage.role === 'user' && lastMessage.parts.every(part => 'text' in part);
    if (!isTextOnly) return null;

    const textParts = lastMessage.parts.filter(part => 'text' in part) as { text: string }[];
    return textParts.map(p => p.text).join(' ').trim() || null;
}

const getQuickQuestionAnswer = (question: string): ContentBlock[] | null => {
    const item = quickQuestionsData.find(qq => qq.question.toLowerCase() === question.toLowerCase());
    return item ? item.answer : null;
};

export const processUserMessage = async (history: Content[], userName?: string): Promise<ProcessedResponse> => {
    const userPrompt = getUserPrompt(history);

    // 0. Check for "Dato Curioso" command for instant, local response
    if (userPrompt?.toLowerCase() === 'dime un dato curioso') {
        const factContent = getRandomFact();
        const responseJson = JSON.stringify({ response: factContent });
        return { response: responseJson, isFallback: false, fromCache: true }; // Treat as instant response
    }

    // 1. Check for Quick Question match (from dynamic list)
    if (userPrompt) {
        const quickQuestionAnswer = getQuickQuestionAnswer(userPrompt);
        if (quickQuestionAnswer) {
            const responseJson = JSON.stringify({ response: quickQuestionAnswer });
            return { response: responseJson, isFallback: false, fromCache: true }; // Treat as cache hit
        }
    }

    // 2. Check for exact FAQ match (from fallback list)
    if (userPrompt) {
        const faqAnswer = getFaqAnswer(userPrompt);
        if (faqAnswer) {
            const responseJson = JSON.stringify({ response: faqAnswer });
            return { response: responseJson, isFallback: false, fromCache: true }; // Treat as cache hit
        }
    }

    // 3. Check Cache for other text prompts
    if (userPrompt) {
        const cachedResponse = getCachedResponse(userPrompt);
        if (cachedResponse) {
            return { response: cachedResponse, isFallback: false, fromCache: true };
        }
    }

    // 4. Call Gemini API
    try {
        const geminiResponse = await sendMessageToBot(history, userName);
        
        if (userPrompt) {
            setCachedResponse(userPrompt, geminiResponse);
        }
        
        return { response: geminiResponse, isFallback: false, fromCache: false };
    } catch (err: any) {
        // 5. Use Fallback if Gemini fails with a hard quota error
        if (isHardQuotaError(err)) {
            console.warn("Gemini API quota exceeded. Using fallback service.");
            const fallbackContent = getFallbackResponse();
            const fallbackResponseJson = JSON.stringify({ response: fallbackContent });
            return { response: fallbackResponseJson, isFallback: true, fromCache: false };
        }
        
        // For other errors, re-throw to be handled by the UI
        console.error("Unhandled error from Gemini Service:", err);
        throw err;
    }
};