import React from 'react';
import type { ChatMessage, Page } from '../types';
import { marked } from 'marked';

interface ChatMessageBubbleProps {
    message: ChatMessage;
    onNavigate: (page: Page) => void;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, onNavigate }) => {
    const isUser = message.sender === 'user';
    const showTypingIndicator = message.sender === 'bot' && message.text === '';

    const botAvatar = (
        <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center" title="Ecobot">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF" className="w-5 h-5">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm3-1.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Zm3 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM12 17.25c.39 0 .771.045 1.137.127a.75.75 0 0 1 .533.933l-.36 1.343a.75.75 0 0 1-1.46-.39l.234-.875a8.25 8.25 0 0 0-1.228 0l.234.875a.75.75 0 0 1-1.46.39l-.36-1.343a.75.75 0 0 1 .533-.933A9.76 9.76 0 0 1 12 17.25Z" clipRule="evenodd" />
            </svg>
        </div>
    );

    const userAvatar = (
         <div className="w-8 h-8 rounded-full bg-slate-600 flex-shrink-0" title="Tú"></div>
    );

    const typingIndicator = (
        <div className="typing-indicator flex items-center space-x-1.5 p-2">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
        </div>
    );
    
    const renderMessageContent = () => {
        const text = message.text;
        const buttonRegex = /\[BUTTON: (.*?)\]\((.*?)\)/g;
        const buttons: { text: string; page: Page }[] = [];
        let match;

        while ((match = buttonRegex.exec(text)) !== null) {
            buttons.push({ text: match[1], page: match[2] as Page });
        }
        
        const cleanedText = text.replace(buttonRegex, '').trim();

        const createMarkup = (txt: string) => {
            const sanitized = txt.endsWith('```') ? txt + '\u00A0' : txt;
            return { __html: marked.parse(sanitized) };
        };

        return (
            <>
                {cleanedText && <div className="prose-custom prose-sm text-inherit" dangerouslySetInnerHTML={createMarkup(cleanedText)} />}
                {buttons.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {buttons.map((btn, index) => (
                            <button
                                key={index}
                                onClick={() => onNavigate(btn.page)}
                                className="chat-action-button"
                            >
                                {btn.text}
                            </button>
                        ))}
                    </div>
                )}
            </>
        );
    };


    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end animate-slide-in-right' : 'justify-start animate-slide-in-left'}`}>
            {!isUser && botAvatar}
            <div className={`max-w-xs md:max-w-md rounded-2xl ${isUser ? 'bg-primary text-white rounded-br-none' : 'bg-surface text-text-main rounded-bl-none'} ${showTypingIndicator ? '' : 'px-4 py-2'}`}>
                 {showTypingIndicator ? typingIndicator : renderMessageContent()}
            </div>
             {isUser && userAvatar}
        </div>
    );
};

export default ChatMessageBubble;