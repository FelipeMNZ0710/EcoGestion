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
    // FIX: Made base64Data optional to accommodate both user uploads (base64Data) and pre-defined content (imageUrl).
    base64Data?: string; // For user uploads
    imageUrl?: string; // For pre-defined content like news
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

export interface ProcessStep {
    step: number;
    title: string;
    description: string;
    icon: string;
}

export interface ImpactStat {
    stat: string;
    value: string;
    icon: string;
}

export interface MaterialContent {
    yes: MaterialContentItem[];
    no: MaterialContentItem[];
    tip: string;
    quiz: Quiz;
    commonMistakes: string[];
    recyclingProcess: ProcessStep[];
    impactStats: ImpactStat[];
}

export interface UserStats {
    messagesSent: number;
    pointsVisited: number;
    reportsMade: number;
    dailyLogins: number;
    completedQuizzes: Material[];
    quizzesCompleted: number;
    gamesPlayed: number;
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
  favoriteLocations?: string[];
  // New fields for customization
  bannerUrl?: string;
  profilePictureUrl?: string;
  title?: string;
  bio?: string;
  socials?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export type GamificationAction = 'send_message' | 'check_in' | 'report_punto_verde' | 'daily_login' | 'complete_quiz' | 'complete_game';

export interface Notification {
    id: number;
    type: 'points' | 'achievement';
    title: string;
    message: string;
    icon?: string;
}

// --- Puntos Verdes Types ---
export type LocationStatus = 'ok' | 'reported' | 'maintenance' | 'serviced';

export interface Schedule {
  days: number[]; // 0 for Sunday, 1 for Monday, etc.
  open: string; // "HH:MM"
  close: string; // "HH:MM"
}

export interface Report {
  userId: string;
  userName: string;
  reason: 'full' | 'dirty' | 'damaged' | 'other';
  comment: string;
  imageUrl?: string;
  timestamp: string;
}


export interface Location {
  id: string;
  name: string;
  address: string;
  hours: string; // Keep for display, but schedule is the source of truth
  schedule: Schedule[];
  materials: string[];
  mapData: {
    name: string;
    id: string;
    lat: number;
    lng: number;
    x: number;
    y: number;
  };
  status: LocationStatus;
  description: string;
  lastServiced: string; // ISO date string
  checkIns: number;
  reports: Report[];
  imageUrls: string[];
}

// --- Game Types ---
export type GameType = 'trivia' | 'memory' | 'sorting' | 'hangman' | 'chain' | 'catcher' | 'repair';

export interface MemoryCardData {
  id: string;
  content: string; // Could be an emoji or an image URL
  type: 'icon' | 'image';
}

export type BinType = 'papel' | 'plastico' | 'vidrio' | 'metales' | 'organico';

export interface SortableItemData {
  id: string;
  name: string;
  image: string;
  correctBin: BinType;
}

export interface HangmanWord {
    word: string;
    hint: string;
}

export interface CatcherItem {
    id: string;
    image: string;
    type: 'recyclable' | 'trash';
    points: number;
}

export interface RepairableItem {
    id: string;
    name: string;
    image: string; // Emoji or URL
    toolOptions: string[]; // Emojis
    correctTool: string;
}

export interface Game {
    id: number;
    title: string;
    category: string;
    image: string;
    type: GameType;
    learningObjective: string;
    payload: {
        points: number;
        // For trivia
        questions?: QuizQuestion[];
        // For memory
        cards?: MemoryCardData[];
        // For sorting & chain
        items?: SortableItemData[];
        bins?: BinType[];
        duration?: number; // in seconds
        // For hangman
        words?: HangmanWord[];
        // For catcher
        fallingItems?: CatcherItem[];
        lives?: number;
        // For repair
        repairableItems?: RepairableItem[];
        timePerItem?: number;
    }
}

// --- News Types ---
export interface NewsArticle {
    id: number;
    image: string;
    category: string;
    title: string;
    date: string;
    excerpt: string;
    content: ContentBlock[];
    featured: boolean;
}