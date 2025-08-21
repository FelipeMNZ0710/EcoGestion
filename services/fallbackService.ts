import { faqData } from '../data/faqData';
import { recyclingFacts } from '../data/recyclingFacts';
import type { ContentBlock } from '../types';

// The initial message shown when the bot enters fallback mode.
// It presents the user with a list of frequently asked questions.
export const getFallbackResponse = (): ContentBlock[] => {
  return [
    {
      type: 'text',
      text: 'Debido a una alta demanda, estoy operando en modo de asistencia básica. Por favor, selecciona una de las siguientes preguntas frecuentes para obtener una respuesta instantánea:'
    },
    {
      type: 'faq',
      questions: faqData.map(item => item.question)
    }
  ];
};

// Retrieves the predefined answer for a specific FAQ.
export const getFaqAnswer = (question: string): ContentBlock[] | null => {
    const item = faqData.find(faq => faq.question.toLowerCase() === question.toLowerCase());
    return item ? item.answer : null;
};

// Retrieves a random recycling fact.
export const getRandomFact = (): ContentBlock[] => {
  const randomIndex = Math.floor(Math.random() * recyclingFacts.length);
  const fact = recyclingFacts[randomIndex];
  return [{ type: 'text', text: fact }];
};
