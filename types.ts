export enum MessageRole {
  USER = 'user',
  BOT = 'bot',
}

// New Structured Content Types
export interface TextBlock {
  type: 'text';
  text: string;
}

export interface ListBlock {
  type: 'list';
  items: string[];
}

export interface LinkBlock {
  type: 'link';
  url: string;
  title: string;
}

export interface VideoBlock {
  type: 'video';
  youtubeId: string;
  title: string;
}

export interface ImageBlock {
    type: 'image';
    base64Data: string;
    mimeType: string;
}

export interface FAQBlock {
  type: 'faq';
  questions: string[];
}

export type ContentBlock = TextBlock | ListBlock | LinkBlock | VideoBlock | ImageBlock | FAQBlock;

export interface ChatMessage {
  role: MessageRole;
  content: ContentBlock[];
  quickQuestions?: string[];
  isFallback?: boolean;
  fromCache?: boolean;
}

export type Page =
  | 'home'
  | 'como-reciclar'
  | 'puntos-verdes'
  | 'juegos'
  | 'noticias'
  | 'comunidad'
  | 'contacto'
  | 'perfil';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockCondition: {
    type: 'points' | 'stat';
    stat?: keyof UserStats;
    value: number;
  };
}

export type Material = 'papel' | 'plastico' | 'vidrio' | 'metales';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct option
}

export interface Quiz {
  points: number;
  questions: QuizQuestion[];
}

export interface MaterialContentItem {
    text: string;
    icon: string; // Emoji
}

export interface MaterialContent {
    yes: MaterialContentItem[];
    no: MaterialContentItem[];
    tip: string;
    quiz: Quiz;
    commonMistakes: string[];
}

export interface UserStats {
    messagesSent: number;
    pointsVisited: number;
    reportsMade: number;
    dailyLogins: number;
    completedQuizzes: Material[];
    quizzesCompleted: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  achievements: Achievement[];
  isAdmin: boolean;
  stats: UserStats;
  lastLogin: string; // ISO date string 'YYYY-MM-DD'
}

export type GamificationAction = 'send_message' | 'check_in' | 'report_punto_verde' | 'daily_login' | 'complete_quiz';

export interface Notification {
    id: number;
    type: 'points' | 'achievement';
    title: string;
    message: string;
    icon?: string;
}