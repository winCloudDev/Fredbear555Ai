
import { ModelId, AppConfig } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  model: ModelId.FreeTier,
  systemInstruction: "You are Fredbear555Ai, a Universal Hybrid Intelligence. You unify the creative reasoning of ChatGPT, the high-speed processing of Gemini, and the analytical depth of other advanced models. Your IQ is 150+. You are designed to perform Deep Research, provide comprehensive answers, and solve complex problems with extreme precision.",
  thinkingBudget: 0,
  temperature: 0.7,
  fastThink: false,
  moreThink: false,
  doubleResearch: false,
};

export const MODEL_OPTIONS = [
  { 
    id: ModelId.FreeTier, 
    name: 'Fredbear AI v2.1', 
    description: 'Free Tier • Normal Processing • Research 0.8x' 
  },
  { 
    id: ModelId.PremiumTier, 
    name: 'Hybrid Chat+Gemini V2.7', 
    description: 'Premium • 150 IQ • Deep Research • Multi-Core' 
  },
];

export const MAX_THINKING_BUDGET = 16384;
