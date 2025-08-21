import React from 'react';

interface QuickQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
  disabled: boolean;
}

const QuickQuestions: React.FC<QuickQuestionsProps> = ({ questions, onQuestionClick, disabled }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((q, index) => (
        <button
          key={q}
          onClick={() => onQuestionClick(q)}
          disabled={disabled}
          className="px-3 py-1.5 text-sm text-primary bg-primary/10 border border-primary/20 rounded-full hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 animate-fade-in-up"
          style={{ animationDelay: `${index * 100 + 100}ms`}}
        >
          {q}
        </button>
      ))}
    </div>
  );
};

export default QuickQuestions;