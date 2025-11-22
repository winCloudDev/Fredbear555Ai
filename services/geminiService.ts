
import { GoogleGenAI, Content, Part, GenerateContentResponse } from "@google/genai";
import { ChatMessage, AppConfig, Attachment } from "../types";

// Initialize client with process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const streamGeminiResponse = async (
  history: ChatMessage[],
  newMessage: string,
  attachments: Attachment[],
  config: AppConfig,
  onChunk: (text: string) => void
): Promise<string> => {
  
  // 1. Prepare History for the API
  const contents: Content[] = history.map((msg) => {
    const parts: Part[] = [];
    
    // Add images if present
    if (msg.attachments && msg.attachments.length > 0) {
      msg.attachments.forEach(att => {
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        });
      });
    }
    
    // Add text
    if (msg.content) {
      parts.push({ text: msg.content });
    }

    return {
      role: msg.role,
      parts: parts
    };
  });

  // 2. Prepare the current new message content
  const currentParts: Part[] = [];
  attachments.forEach(att => {
    currentParts.push({
      inlineData: {
        mimeType: att.mimeType,
        data: att.data
      }
    });
  });
  currentParts.push({ text: newMessage });

  contents.push({
    role: 'user',
    parts: currentParts
  });

  // 3. Configure the Request
  // Adjust system instruction based on Core prompt
  let instructions = config.systemInstruction;
  if (config.fastThink) instructions += " Prioritize speed and brevity.";
  if (config.doubleResearch) {
      instructions += " ACTIVATE DEEP RESEARCH MODE: 1. Analyze the user query from multiple perspectives (simulating consensus between ChatGPT, Gemini, and Claude). 2. Use the search tool extensively to find high-quality sources. 3. Synthesize a comprehensive, deeply researched answer.";
  }
  
  const generateConfig: any = {
    temperature: config.temperature,
    systemInstruction: instructions,
  };

  // Thinking Logic
  if (config.model.includes('preview')) {
     // Only applied to models that support thinking (Premium tier usually)
     if (config.moreThink) {
         generateConfig.thinkingConfig = { thinkingBudget: 16000 }; // High budget
     } else if (config.thinkingBudget > 0) {
         generateConfig.thinkingConfig = { thinkingBudget: config.thinkingBudget };
     } else if (config.fastThink) {
         generateConfig.thinkingConfig = { thinkingBudget: 0 }; // Disable thinking for speed
     }
  }

  // Tool Config
  if (config.doubleResearch) {
      generateConfig.tools = [{ googleSearch: {} }];
  }

  // 4. Stream Response
  let fullText = "";
  
  try {
    const responseStream = await ai.models.generateContentStream({
      model: config.model,
      contents: contents,
      config: generateConfig
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onChunk(fullText);
      }
    }
  } catch (error) {
    console.error("Gemini Streaming Error:", error);
    throw error;
  }

  return fullText;
};
