
import React, { forwardRef } from 'react';
import { ChatMessage } from '../types';
import { MessageRole } from '../types';
import ChatMessageBubble from './ChatMessageBubble';
import { botAvatarUrl } from '../data/botAvatar';

interface ChatHistoryProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const ChatHistory = forwardRef<HTMLDivElement, ChatHistoryProps>(({ messages, isLoading, onSendMessage }, ref) => {
  return (
    <div ref={ref} className="flex-1 p-6 space-y-6 overflow-y-auto bg-background">
      {messages.map((msg, index) => (
        <ChatMessageBubble key={index} message={msg} onSendMessage={onSendMessage} isLoading={isLoading} />
      ))}
      {isLoading && messages[messages.length - 1]?.role === MessageRole.USER && (
        <div className="flex items-start space-x-3 animate-pulse">
            <img src={botAvatarUrl} alt="EcoBot pensando" className="flex-shrink-0 w-10 h-10 rounded-full" />
          <div className="flex items-center space-x-1 pt-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
          </div>
        </div>
      )}
    </div>
  );
});

ChatHistory.displayName = 'ChatHistory';
export default ChatHistory;