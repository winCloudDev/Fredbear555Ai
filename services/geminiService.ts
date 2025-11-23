
import { GoogleGenAI, Content, Part, GenerateContentResponse } from "@google/genai";
import { ChatMessage, AppConfig, Attachment } from "../types";

// Helper to get AI instance
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAI();
  // Using gemini-2.5-flash-image for general image generation
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        // imageSize: "1K" // Only for 3-pro-image-preview
      }
    }
  });

  // Extract image from response
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return "Error: No image generated.";
};

export const generateVideo = async (prompt: string): Promise<string> => {
  const ai = getAI();
  
  // Veo generation requires waiting for operation
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  // Polling loop
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed");

  // Fetch the actual video bytes using the API key
  const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  
  // Convert blob to object URL for display
  return URL.createObjectURL(blob);
};

export const streamGeminiResponse = async (
  history: ChatMessage[],
  newMessage: string,
  attachments: Attachment[],
  config: AppConfig,
  onChunk: (text: string) => void
): Promise<string> => {
  
  const ai = getAI();

  // 1. Prepare History for the API
  const contents: Content[] = history
    .filter(msg => msg.role !== 'model' || msg.content) // Filter out empty model messages if any
    .map((msg) => {
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
  let instructions = config.systemInstruction;
  
  // Apply Mode-Specific Instructions
  if (config.makeAppMode) {
      instructions = "You are a Senior Software Architect and Master Developer. Provide full directory structures, complete source code (no placeholders), and compilation instructions. Prefer Python, C#, or Node.js.";
  } else if (config.activeMode === 'math') {
      instructions = "You are a strict and precise Mathematician. 1. Analyze the problem. 2. Show step-by-step derivation. 3. Verify the result. 4. Use LaTeX for formulas where appropriate. 5. If the user provides an image, solve the problem in the image.";
  } else if (config.activeMode === 'checker') {
      instructions = "You are an AI QA Auditor and Fact Checker. Your job is to ANALYZE the input for: 1. Logical errors. 2. Code bugs. 3. Factual inaccuracies. 4. AI-generated patterns. Provide a 'Confidence Score', 'Error List', and 'Corrected Version'.";
  }

  if (config.fastThink) instructions += " Prioritize speed and brevity.";
  
  const generateConfig: any = {
    temperature: config.activeMode === 'math' || config.activeMode === 'checker' ? 0.2 : config.temperature, // Lower temp for math/checking
    systemInstruction: instructions,
  };

  // Thinking Logic
  if (config.model.includes('preview')) {
     if (config.moreThink) {
         generateConfig.thinkingConfig = { thinkingBudget: 16000 }; 
     } else if (config.thinkingBudget > 0) {
         generateConfig.thinkingConfig = { thinkingBudget: config.thinkingBudget };
     } else if (config.fastThink) {
         generateConfig.thinkingConfig = { thinkingBudget: 0 }; 
     }
  }

  // Tool Config - SEARCH or DOUBLE RESEARCH
  // Explicitly enable Google Search if webSearch is ON or doubleResearch is ON
  if (config.doubleResearch || config.webSearch) {
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
