import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, MessageRole, ContentBlock, ImageBlock, TextBlock, User } from '../types';
import { processUserMessage } from '../services/intelligentBotService';
import { quickQuestionsData } from '../data/quickQuestionsData';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import type { Content } from '@google/genai';
import { botAvatarUrl } from '../data/botAvatar';

// A Part type definition that aligns with what the Gemini API expects.
type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

const getRandomQuickQuestions = (): string[] => {
    const shuffled = [...quickQuestionsData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4).map(q => q.question);
};

interface ChatAssistantWidgetProps {
  user: User | null;
}

const ChatAssistantWidget: React.FC<ChatAssistantWidgetProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [apiHistory, setApiHistory] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  
  const setInitialMessage = useCallback((userName?: string) => {
     const welcomeText = userName 
        ? `¡Hola, ${userName}! Soy EcoBot, tu asistente de "EcoGestión". ¿En qué te puedo ayudar hoy?`
        : '¡Hola! Soy EcoBot, tu asistente virtual de "EcoGestión". ¿Cómo puedo ayudarte a reciclar mejor hoy?';
     
     setMessages([
      {
        role: MessageRole.BOT,
        content: [{ type: 'text', text: welcomeText }],
        quickQuestions: getRandomQuickQuestions(),
      },
    ]);
    setApiHistory([]);
  }, []);

  const handleClearChat = useCallback(() => {
    setInitialMessage(user?.name);
  }, [setInitialMessage, user]);

  useEffect(() => {
    if (isOpen) {
      setInitialMessage(user?.name);
    }
  }, [user, isOpen, setInitialMessage]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const injectBotMessage = useCallback((content: ContentBlock[]) => {
    const newBotMessage: ChatMessage = {
      role: MessageRole.BOT,
      content,
    };
    setMessages(prev => [...prev, newBotMessage]);
  }, []);

  const handleSendMessage = useCallback(async (inputText: string, image?: { data: string; mimeType: string; }) => {
    if ((!inputText.trim() && !image) || isLoading) return;

    const userMessageContent: (TextBlock | ImageBlock)[] = [];
    if (image) {
        userMessageContent.push({ type: 'image', base64Data: image.data, mimeType: image.mimeType });
    }
    if (inputText.trim()) {
        userMessageContent.push({ type: 'text', text: inputText });
    }

    const newUserMessage: ChatMessage = { role: MessageRole.USER, content: userMessageContent };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsLoading(true);
    
    const newApiParts: Part[] = [];
    if (image) {
      newApiParts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
    }
    const promptText = inputText.trim() || (image ? '¿Qué es esto y cómo lo reciclo?' : '');
    newApiParts.push({ text: promptText });
    
    const newApiContent: Content = { role: 'user', parts: newApiParts };
    const currentApiHistory = [...apiHistory, newApiContent];

    try {
      const { response: jsonResponse, isFallback, fromCache } = await processUserMessage(currentApiHistory, user?.name);
      
      let parsedResponse;
      try {
        const cleanedJson = jsonResponse.replace(/```json\n?/, '').replace(/```$/, '').trim();
        parsedResponse = JSON.parse(cleanedJson);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError, jsonResponse);
        throw new Error("Invalid JSON response from bot service.");
      }

      const newBotContent: ContentBlock[] = parsedResponse.response || [{type: 'text', text: "No he podido procesar la respuesta."}];
      const newBotMessage: ChatMessage = { 
        role: MessageRole.BOT, 
        content: newBotContent,
        isFallback,
        fromCache
      };
      setMessages(prev => [...prev, newBotMessage]);

      const newBotApiContent: Content = { role: 'model', parts: [{ text: jsonResponse }] };
      setApiHistory([...currentApiHistory, newBotApiContent]);

    } catch (err: any) {
      console.error("Error in ChatAssistantWidget:", err);
      const errorMessage: ChatMessage = {
        role: MessageRole.BOT,
        content: [{ type: 'text', text: 'Lo siento, ocurrió un error inesperado al procesar tu solicitud. Por favor, intenta de nuevo más tarde.' }],
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, apiHistory, user]);
  
  return (
    <>
      <div className={`fixed bottom-5 right-5 z-[1000] transition-all duration-300 ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-primary rounded-full text-white shadow-lg flex items-center justify-center hover:bg-primary-dark transition-all duration-200 transform hover:scale-110"
          aria-label="Abrir asistente de chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </button>
      </div>

      <div
        className={`fixed bottom-5 right-5 z-[1000] w-[calc(100%-40px)] max-w-sm h-[70vh] max-h-[600px] flex flex-col bg-surface shadow-2xl rounded-2xl border border-white/10 transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-background rounded-t-2xl flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <img src={botAvatarUrl} alt="EcoBot" className="w-8 h-8 rounded-full" />
              <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-background"></span>
            </div>
            <div>
              <h3 className="font-bold text-text-main text-sm">EcoBot</h3>
              <p className="text-xs text-text-secondary">En línea</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <button onClick={handleClearChat} className="p-1.5 text-text-secondary hover:text-primary transition-colors rounded-full" aria-label="Limpiar chat"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.898 2.186A1.001 1.001 0 0116.05 8.5A5.002 5.002 0 006.05 8.5a1 1 0 01-2 0 7.002 7.002 0 0110.198-4.95A1 1 0 1115 5.5a5.002 5.002 0 00-9.05 3.5 1 1 0 01-2 0A7.002 7.002 0 015 5.101V7a1 1 0 01-2 0V3a1 1 0 011-1zm12 11a1 1 0 01-1 1v2.101a7.002 7.002 0 01-11.898-2.186A1.001 1.001 0 013.95 11.5a5.002 5.002 0 009.05-3.5 1 1 0 012 0 7.002 7.002 0 01-1.802 4.95V18a1 1 0 01-2 0v-3a1 1 0 011-1z" clipRule="evenodd" /></svg></button>
            <button onClick={() => setIsOpen(false)} className="p-1.5 text-text-secondary hover:text-primary transition-colors rounded-full" aria-label="Cerrar chat"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
          </div>
        </header>
        
        <ChatHistory ref={chatHistoryRef} messages={messages} isLoading={isLoading} onSendMessage={handleSendMessage} />
        
        <footer className="p-4 border-t border-white/10 flex-shrink-0">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} injectBotMessage={injectBotMessage} />
        </footer>
      </div>
    </>
  );
};

export default ChatAssistantWidget;