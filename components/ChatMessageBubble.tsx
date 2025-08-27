import React from 'react';
import { ChatMessage, MessageRole, ContentBlock } from '../types';
import QuickQuestions from './QuickQuestions';
import FAQList from './FAQList';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, onSendMessage, isLoading }) => {
  const isUser = message.role === MessageRole.USER;

  const wrapperClasses = isUser ? 'flex justify-end' : 'flex items-start space-x-3';
  const animationClass = isUser ? 'animate-slide-in-right' : 'animate-slide-in-left';
  const bubbleClasses = isUser
    ? 'bg-primary text-white'
    : 'bg-zinc-800 text-text-main';
  
  const renderBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'text':
        return <p key={index}>{block.text}</p>;
      case 'image':
        return (
          <img
            key={index}
            src={`data:${block.mimeType};base64,${block.base64Data}`}
            alt="Contenido subido por el usuario"
            className="mt-1 rounded-lg max-w-full h-auto border-2 border-white/50"
          />
        );
      case 'list':
        return (
          <ul key={index} className="space-y-1 list-disc pl-5">
            {block.items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        );
      case 'link':
        return (
          <a
            key={index}
            href={block.url}
            onClick={(e) => {
              // This is a simple client-side navigation for hash links
              if (block.url.startsWith('#')) {
                e.preventDefault();
                const targetId = block.url.substring(1);
                // In a real SPA, you'd use a router here.
                // For this project, we can just signal the page change.
                // This assumes the app can handle page changes via a prop function or context.
                // Since we don't have that, we'll just log it.
                console.log(`Navigate to page: ${targetId}`);
              }
            }}
            target={block.url.startsWith('#') ? '_self' : '_blank'}
            rel="noopener noreferrer"
            className="block my-2 bg-primary/20 text-primary font-semibold p-3 rounded-lg hover:bg-primary/30 transition-colors underline"
          >
            {block.title} &rarr;
          </a>
        );
      case 'video':
        return (
          <div key={index} className="my-3 text-text-main">
            <p className="font-semibold mb-2">{block.title}</p>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border">
              <iframe
                src={`https://www.youtube.com/embed/${block.youtubeId}`}
                title={block.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        );
       case 'faq':
        return <FAQList key={index} questions={block.questions} onSendMessage={onSendMessage} />;
      default:
        // This handles the case where the content is a simple string for user messages
        if (typeof block === 'string') {
           return <p key={index}>{block}</p>
        }
        return null;
    }
  };

  return (
    <div className={`${wrapperClasses} ${animationClass}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5,12A2.5,2.5 0 0,0 19,9.5A2.5,2.5 0 0,0 16.5,7A2.5,2.5 0 0,0 14,9.5A2.5,2.5 0 0,0 16.5,12M9,11A1,1 0 0,0 10,10A1,1 0 0,0 9,9A1,1 0 0,0 8,10A1,1 0 0,0 9,11M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12C20,13.24 19.62,14.4 19,15.41L15.41,19C14.4,19.62 13.24,20 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z" /></svg>
        </div>
      )}
      <div className={`max-w-lg`}>
        <div className={`px-4 py-3 rounded-2xl ${bubbleClasses} ${isUser ? 'rounded-br-none' : 'rounded-bl-none'}`}>
            <div className="prose prose-sm max-w-none text-inherit space-y-2">
                {message.content.map(renderBlock)}
            </div>
        </div>
        
        {/* Fallback/Cache Message */}
        {message.fromCache && !isUser && (
            <p className="text-xs text-text-secondary mt-1.5 px-2">
                Respuesta instantánea ✨
            </p>
        )}
        {message.isFallback && !isUser && (
            <p className="text-xs text-amber-400 mt-1.5 px-2 flex items-center space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.37-1.21 3.006 0l7.22 13.75a1.75 1.75 0 01-1.503 2.651H2.534a1.75 1.75 0 01-1.503-2.651l7.22-13.75zM10 14a1 1 0 11-2 0 1 1 0 012 0zm-1-5a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                <span>Respuesta básica. EcoBot volverá a su máxima capacidad pronto.</span>
            </p>
        )}

        {message.quickQuestions && message.quickQuestions.length > 0 && (
            <div className="mt-3">
                <QuickQuestions questions={message.quickQuestions} onQuestionClick={onSendMessage} disabled={isLoading} />
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageBubble;
