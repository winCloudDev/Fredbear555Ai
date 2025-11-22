
export enum ModelId {
  FreeTier = 'gemini-2.5-flash', // Maps to "AI v2.1"
  PremiumTier = 'gemini-3-pro-preview', // Maps to "Hybrid V2.7"
}

export type UserTier = 'free' | 'premium' | null;

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  isThinking?: boolean;
}

export interface Attachment {
  mimeType: string;
  data: string; // base64
  name: string;
}

export interface AppConfig {
  model: ModelId;
  systemInstruction: string;
  thinkingBudget: number; // 0 to disable
  temperature: number;
  // New Features
  fastThink: boolean;
  moreThink: boolean;
  doubleResearch: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastModified: number;
  preview: string;
}

export type LoadingState = 'idle' | 'streaming' | 'error';
