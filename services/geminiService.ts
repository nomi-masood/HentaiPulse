import { GoogleGenAI } from "@google/genai";

// Helper to retrieve API Key safely for Vite/Netlify environments
const getApiKey = (): string | undefined => {
  // 1. Check for Vite environment variable (Standard for Netlify)
  // We use a try-catch block to safely access import.meta which can vary by environment
  try {
    // @ts-ignore: import.meta is valid in Vite
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Continue to fallback
  }
  
  // 2. Fallback for local Node/Preview environments (if not using Vite)
  try {
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch {
    // Ignore reference errors
  }

  return undefined;
};

const apiKey = getApiKey();

// Initialize Gemini Client
// We pass the key if it exists, otherwise calls will fail gracefully in the catch block below
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const getReleaseInsight = async (title: string, description: string): Promise<string> => {
  if (!apiKey) {
    console.warn("Gemini API Key missing. Please set 'VITE_API_KEY' in your Netlify Site Settings.");
    return "AI Insights require a configured API Key.";
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