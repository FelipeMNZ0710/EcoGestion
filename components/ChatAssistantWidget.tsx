import React, { useState, useEffect } from 'react';
import type { User, ChatMessage, Page } from '../types';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { getBotResponseStream } from '../services/intelligentBotService';
import { quickQuestions as allQuickQuestions } from '../data/quickQuestionsData';
import { getFromCache, setInCache } from '../services/cacheService';

interface ChatAssistantWidgetProps {
    user: User | null;
    setCurrentPage: (page: Page) => void;
}

const getShuffledQuestions = () => {
    // Shuffle array and take the first 4 questions
    return allQuickQuestions.sort(() => 0.5 - Math.random()).slice(0, 4);
};

const ChatAssistantWidget: React.FC<ChatAssistantWidgetProps> = ({ user, setCurrentPage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [shuffledQuestions, setShuffledQuestions] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Shuffle questions for the new session
            setShuffledQuestions(getShuffledQuestions());
            
            let welcomeText: string;

            if (user) {
                // Personalized greeting for logged-in users
                const firstName = user.name.split(' ')[0];
                welcomeText = `¡Hola, ${firstName}! Soy Ecobot, tu asistente virtual de EcoGestión. 🤖\n\n¿Cómo puedo ayudarte a reciclar hoy?`;
            } else {
                // General greeting for guests
                welcomeText = `¡Hola! Soy Ecobot, tu asistente virtual de EcoGestión. 🤖\n\n¿Cómo puedo ayudarte a reciclar hoy?`;
            }
            
            const welcomeMessage = {
                id: Date.now(),
                text: welcomeText,
                sender: 'bot' as const
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen, user, messages.length]);

    const handleSend = async (text: string) => {
        const newUserMessage: ChatMessage = { id: Date.now(), text, sender: 'user' };
        setMessages(prev => [...prev, newUserMessage]);

        // Check cache first for an instant response
        const cachedResponse = getFromCache(text);
        if (cachedResponse) {
            const cachedBotMessage: ChatMessage = { id: Date.now() + 1, text: cachedResponse, sender: 'bot' };
            setMessages(prev => [...prev, cachedBotMessage]);
            return;
        }

        setIsLoading(true);
        const botMessageId = Date.now() + 1;
        const placeholderBotMessage: ChatMessage = { id: botMessageId, text: '', sender: 'bot' };
        setMessages(prev => [...prev, placeholderBotMessage]);

        let fullResponse = '';
        try {
            const stream = getBotResponseStream(text);
            for await (const chunk of stream) {
                fullResponse += chunk;
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
                    )
                );
            }
        } catch (error) {
            console.error("Error streaming bot response:", error);
            const errorMessage = "Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.";
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === botMessageId ? { ...msg, text: errorMessage } : msg
                )
            );
        } finally {
            setIsLoading(false);
            if (fullResponse) {
                setInCache(text, fullResponse);
            }
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        // Reset messages to ensure the welcome message and random questions are fresh on the next open.
        // This fixes the bug where the user's name wouldn't update after logging in.
        setMessages([]);
    };

    const handleNavigate = (page: Page) => {
        setCurrentPage(page);
        handleClose();
    };


    return (
        <>
            <div className={`fixed bottom-5 right-5 z-[1000] transition-all duration-300 ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-primary rounded-full shadow-lg text-white flex items-center justify-center hover:bg-primary-dark hover:scale-110 transition-transform"
                    aria-label="Abrir chat de ayuda"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm3-1.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Zm3 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM12 17.25c.39 0 .771.045 1.137.127a.75.75 0 0 1 .533.933l-.36 1.343a.75.75 0 0 1-1.46-.39l.234-.875a8.25 8.25 0 0 0-1.228 0l.234.875a.75.75 0 0 1-1.46.39l-.36-1.343a.75.75 0 0 1 .533-.933A9.76 9.76 0 0 1 12 17.25Z" /></svg>
                </button>
            </div>

            <div className={`fixed bottom-5 right-5 z-[1000] w-[calc(100%-2.5rem)] max-w-sm h-[70vh] max-h-[600px] bg-background rounded-2xl shadow-2xl flex flex-col transform transition-all duration-300 ease-out origin-bottom-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <header className="p-4 bg-surface rounded-t-2xl flex items-center justify-between border-b border-white/10">
                    <h3 className="font-bold text-lg text-text-main">Ecobot Asistente</h3>
                    <button onClick={handleClose} className="text-3xl leading-none px-2 text-text-secondary hover:text-text-main rounded-full">&times;</button>
                </header>
                
                <ChatHistory 
                    messages={messages} 
                    isLoading={isLoading} 
                    showQuickQuestions={messages.length === 1}
                    quickQuestions={shuffledQuestions}
                    onQuickQuestionClick={handleSend}
                    onNavigate={handleNavigate}
                />
                                
                <ChatInput onSend={handleSend} isLoading={isLoading} />
            </div>
        </>
    );
};

export default ChatAssistantWidget;