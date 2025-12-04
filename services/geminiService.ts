import { GoogleGenAI } from "@google/genai";

// Helper to retrieve API Key from either Node-style process.env (local/preview) 
// or Vite-style import.meta.env (Netlify/Production)
const getApiKey = (): string | undefined => {
  // Check for Vite environment variable (Netlify standard)
  // @ts-ignore: import.meta is a standard feature in modern bundlers like Vite
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  
  // Check for Node/Process environment variable
  // This is kept for the AI Studio preview environment compatibility
  try {
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch {
    // Ignore reference errors if process is not defined in the browser
  }

  return undefined;
};

const apiKey = getApiKey();

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const getReleaseInsight = async (title: string, description: string): Promise<string> => {
  if (!apiKey) {
    return "Configuration Error: API Key missing. Please set VITE_API_KEY in your Netlify environment variables.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an assistant for an anime tracker app called HentaiPulse. 
      Write a short, hype-building, engaging summary (max 2 sentences) for the adult anime titled "${title}".
      Context provided: "${description}". 
      Do not be overly explicit, keep it teasing and exciting suitable for a tracker description card.`,
    });

    return response.text || "No insight available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to retrieve insights at this time.";
  }
};