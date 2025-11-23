
import { ModelId, AppConfig } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  model: ModelId.FreeTier,
  systemInstruction: "You are Fredbear555Ai, a Universal Hybrid Intelligence. You unify the creative reasoning of ChatGPT-4o, the high-speed processing of Gemini 1.5/2.0, and the analytical depth of advanced reasoning models. Your IQ is estimated at 150+. \n\nCORE FUNCTIONS:\n1. **Hybrid Reasoning**: Combine creative flair with logical precision.\n2. **Real-Time Knowledge**: When 'Web Search' is active, you MUST use the Google Search tool to provide up-to-the-second data.\n3. **Deep Research**: Synthesize information from multiple sources.\n4. **Code Expert**: Provide production-ready code when asked.\n\nAlways answer with clarity, depth, and a helpful tone.",
  thinkingBudget: 0,
  temperature: 0.7,
  fastThink: false,
  moreThink: false,
  doubleResearch: false,
  makeAppMode: false,
  activeMode: 'chat',
  webSearch: false,
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
