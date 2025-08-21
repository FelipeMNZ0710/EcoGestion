
import React, { forwardRef } from 'react';
import { ChatMessage } from '../types';
import { MessageRole } from '../types';
import ChatMessageBubble from './ChatMessageBubble';

interface ChatHistoryProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const ChatHistory = forwardRef<HTMLDivElement, ChatHistoryProps>(({ messages, isLoading, onSendMessage }, ref) => {
  return (
    <div ref={ref} className="flex-1 p-6 space-y-6 overflow-y-auto">
      {messages.map((msg, index) => (
        <ChatMessageBubble key={index} message={msg} onSendMessage={onSendMessage} isLoading={isLoading} />
      ))}
      {isLoading && messages[messages.length - 1]?.role === MessageRole.USER && (
        <div className="flex items-start space-x-3 animate-pulse">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5,12A2.5,2.5 0 0,0 19,9.5A2.5,2.5 0 0,0 16.5,7A2.5,2.5 0 0,0 14,9.5A2.5,2.5 0 0,0 16.5,12M9,11A1,1 0 0,0 10,10A1,1 0 0,0 9,9A1,1 0 0,0 8,10A1,1 0 0,0 9,11M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12C20,13.24 19.62,14.4 19,15.41L15.41,19C14.4,19.62 13.24,20 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z" /></svg>
            </div>
          <div className="flex items-center space-x-1 pt-2">
            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
          </div>
        </div>
      )}
    </div>
  );
});

ChatHistory.displayName = 'ChatHistory';
export default ChatHistory;