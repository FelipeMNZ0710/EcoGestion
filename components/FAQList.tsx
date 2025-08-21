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
          className="w-full text-left p-3 bg-white/80 text-primary border border-gray-200 rounded-lg hover:bg-secondary/20 hover:border-secondary/50 transition-all duration-200 text-sm font-medium"
        >
          {question}
        </button>
      ))}
    </div>
  );
};

export default FAQList;
