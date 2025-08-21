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
  | 'contacto';

export interface User {
  name: string;
}