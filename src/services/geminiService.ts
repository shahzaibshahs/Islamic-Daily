import { GoogleGenerativeAI, Type } from "@google/generative-ai";
import { Dua } from '../types';

// ✅ Correct client import (updated package name)
let ai: GoogleGenerativeAI | null = null;

// ✅ Lazily initialize the AI client.
function getClient(): GoogleGenerativeAI {
  if (!ai) {
    // ✅ Use Vite environment variable (works in frontend)
    const apiKey = import.meta.env.VITE_API_KEY;

    if (!apiKey) {
      throw new Error("VITE_API_KEY is not configured. Please check your .env file.");
    }

    ai = new GoogleGenerativeAI({ apiKey });
  }
  return ai;
}

const JSON_DUA_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: 'Unique short ID for the dua.' },
    arabic: { type: Type.STRING, description: 'The dua in Arabic (max 3 lines).' },
    transliteration: { type: Type.STRING, description: 'Phonetic transliteration.' },
    translation: { type: Type.STRING, description: 'One-sentence English translation.' },
    source: { type: Type.STRING, description: 'Source of the dua (e.g., Quran or Hadith).' },
    tip: { type: Type.STRING, description: 'When or why to recite this dua.' },
  },
  required: ['id', 'arabic', 'transliteration', 'translation', 'source', 'tip'],
};

export const getIslamicAnswer = async (question: string): Promise<string> => {
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.0-pro',
      contents: question,
      config: {
        systemInstruction: `You are a knowledgeable and respectful Islamic scholar AI. 
        Your purpose is to answer questions about Islam based on the Quran and authentic Sunnah. 
        Provide clear, concise, and easy-to-understand answers. 
        Avoid controversial topics or giving personal fatwas. 
        If a question requires a formal ruling, politely advise consulting a qualified scholar.`,
      },
    });
    return response.response.text();
  } catch (error) {
    console.error("Error fetching Islamic answer:", error);
    throw new Error("Failed to get an answer. Please try again.");
  }
};

export const getDailyDua = async (recentHistory: string[]): Promise<Dua> => {
  try {
    const client = getClient();
    const historyString = recentHistory.length > 0
      ? `Here is a list of recent dua IDs that you should not repeat: ${recentHistory.join(', ')}`
      : "This is the first request, so any dua is fine.";
    
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Provide a unique, authentic dua. ${historyString}`,
      config: {
        systemInstruction: `You are an Islamic Dua generator. 
        Each call must return one unique dua that has NOT appeared in recentHistory.
        Prefer authentic duas from the Qur'an or Sahih Hadith.
        Output a single, raw JSON object matching the provided schema exactly.`,
        responseMimeType: 'application/json',
        responseSchema: JSON_DUA_SCHEMA,
      },
    });

    let jsonString = response.response.text().trim();
    if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/```json|```/g, '').trim();
    }

    const parsed = JSON.parse(jsonString);
    if (parsed.id === 'error_exhausted') {
      throw new Error(parsed.tip || 'You have seen most available duas.');
    }

    return parsed as Dua;
  } catch (error) {
    console.error("Error fetching daily dua:", error);
    if (error instanceof SyntaxError) {
      throw new Error('Invalid format received. Please try again.');
    }
    throw new Error("Failed to get a dua from the AI. Please try again.");
  }
};

export const explainVerse = async (surah: string, ayah: string): Promise<string> => {
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.0-pro',
      contents: `Explain the meaning and context of Quran verse ${surah}:${ayah}.`,
      config: {
        systemInstruction: `You are an AI assistant specializing in Tafsir (Quranic explanation).
        Explain the verse simply and clearly, rooted in authentic Islamic sources.`,
      },
    });
    return response.response.text();
  } catch (error) {
    console.error("Error fetching verse explanation:", error);
    throw new Error("Failed to get a verse explanation. Please try again.");
  }
};
