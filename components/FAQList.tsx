import React from 'react';

interface FAQListProps {
  questions: string[];
  onSendMessage: (message: string) => void;
}

const FAQList: React.FC<FAQListProps> = ({ questions, onSendMessage }) => {
  return (
    <div className="space-y-2 pt-2">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => onSendMessage(question)}
          className="w-full text-left p-3 bg-white/5 text-text-secondary border border-white/10 rounded-lg hover:bg-primary/20 hover:border-primary/50 hover:text-text-main transition-all duration-200 text-sm font-medium"
        >
          {question}
        </button>
      ))}
    </div>
  );
};

export default FAQList;
