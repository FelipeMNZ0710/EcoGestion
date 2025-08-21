import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, MessageRole, ContentBlock, ImageBlock, TextBlock, User } from '../types';
import { processUserMessage } from '../services/intelligentBotService';
import { quickQuestionsData } from '../data/quickQuestionsData';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import type { Content } from '@google/genai';

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
        ? `¡Hola, ${userName}! Soy EcoBot, tu asistente de "Formosa Recicla". ¿En qué te puedo ayudar hoy?`
        : '¡Hola! Soy EcoBot, tu asistente virtual de "Formosa Recicla". ¿Cómo puedo ayudarte a reciclar mejor hoy?';
     
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

  // Effect to initialize or reset chat when the user state changes (login/logout)
  useEffect(() => {
    // Only reset if the chat is open, to avoid changing state unnecessarily in the background.
    if (isOpen) {
      setInitialMessage(user?.name);
    }
  }, [user, isOpen, setInitialMessage]);

  // Effect to initialize chat when it's first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setInitialMessage(user?.name);
    }
  }, [isOpen, messages.length, user, setInitialMessage]);

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
    // Always add text, even if empty, as Gemini API expects it for certain multimodal prompts
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
      {/* Chat Widget Container */}
      <div className={`fixed bottom-0 right-0 md:bottom-8 md:right-8 z-[1000] transition-all duration-500 ease-in-out ${isOpen ? 'w-full h-full md:w-[440px] md:h-[70vh] md:max-h-[700px]' : 'w-20 h-20'}`}>
          {isOpen ? (
              // Open State - Chat Window
              <div className="flex flex-col w-full h-full bg-white md:rounded-2xl shadow-2xl animate-fade-in-up">
                  {/* Header */}
                   <header className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                      <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5,12A2.5,2.5 0 0,0 19,9.5A2.5,2.5 0 0,0 16.5,7A2.5,2.5 0 0,0 14,9.5A2.5,2.5 0 0,0 16.5,12M9,11A1,1 0 0,0 10,10A1,1 0 0,0 9,9A1,1 0 0,0 8,10A1,1 0 0,0 9,11M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12C20,13.24 19.62,14.4 19,15.41L15.41,19C14.4,19.62 13.24,20 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z" /></svg>
                            </div>
                            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                          </div>
                          <div>
                            <h2 className="font-bold text-lg text-text-main">EcoBot</h2>
                            <p className="text-sm text-green-600 font-semibold">En línea</p>
                          </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={handleClearChat}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                          aria-label="Limpiar conversación"
                          title="Limpiar conversación"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        <button 
                          onClick={() => setIsOpen(false)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                          aria-label="Cerrar chat"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                  </header>
                  <ChatHistory ref={chatHistoryRef} messages={messages} isLoading={isLoading} onSendMessage={handleSendMessage} />
                  <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
                      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} injectBotMessage={injectBotMessage} />
                  </div>
              </div>
          ) : (
              // Closed State - Floating Action Button
              <button
                  onClick={() => setIsOpen(true)}
                  className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-green-800 transition-all duration-300 transform hover:scale-110"
                  aria-label="Abrir asistente de chat"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5,12A2.5,2.5 0 0,0 19,9.5A2.5,2.5 0 0,0 16.5,7A2.5,2.5 0 0,0 14,9.5A2.5,2.5 0 0,0 16.5,12M9,11A1,1 0 0,0 10,10A1,1 0 0,0 9,9A1,1 0 0,0 8,10A1,1 0 0,0 9,11M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12C20,13.24 19.62,14.4 19,15.41L15.41,19C14.4,19.62 13.24,20 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z" /></svg>
              </button>
          )}
      </div>
    </>
  );
};

export default ChatAssistantWidget;