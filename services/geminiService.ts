import { GoogleGenAI, Type } from "@google/genai";
import { Dua } from '../types';

let ai: GoogleGenAI | null = null;

// Lazily initialize the AI client to avoid crashing on load if env vars are not set.
function getClient(): GoogleGenAI {
  if (!ai) {
    // This check is to prevent crashing in browser environments where `process` is not defined.
    // The error will be caught by the UI and displayed to the user upon their first action.
    if (typeof process === 'undefined' || !process.env?.API_KEY) {
      throw new Error("API_KEY is not configured. Please ensure the environment variable is set.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

const JSON_DUA_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: {
      type: Type.STRING,
      description: 'A unique short ID for the dua, e.g., "dua_001".',
    },
    arabic: {
      type: Type.STRING,
      description: 'The dua in its original Arabic script (max 3 lines).',
    },
    transliteration: {
      type: Type.STRING,
      description: 'The phonetic transliteration of the Arabic text.',
    },
    translation: {
      type: Type.STRING,
      description: 'A short, one-sentence English translation of the dua.',
    },
    source: {
        type: Type.STRING,
        description: 'The source of the dua, e.g., Quran (2:201) or Sahih al-Bukhari.',
    },
    tip: {
        type: Type.STRING,
        description: 'A one-line tip on when to recite the dua or its context.',
    }
  },
  required: ['id', 'arabic', 'transliteration', 'translation', 'source', 'tip'],
};

export const getIslamicAnswer = async (question: string): Promise<string> => {
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: question,
      config: {
        systemInstruction: `You are a knowledgeable and respectful Islamic scholar AI. Your purpose is to answer questions about Islam based on the Quran and authentic Sunnah. Provide clear, concise, and easy-to-understand answers. Avoid controversial topics or giving personal fatwas. If a question is outside your scope or requires a formal ruling, politely state that the user should consult a qualified local scholar. Always maintain a respectful, humble, and compassionate tone. Structure your answers with paragraphs for readability.`,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching Islamic answer:", error);
    if (error instanceof Error) throw error;
    throw new Error("Failed to get an answer from the AI. Please try again.");
  }
};

export const getDailyDua = async (recentHistory: string[]): Promise<Dua> => {
  try {
    const client = getClient();
    const historyString = recentHistory.length > 0 ? `Here is a list of recent dua IDs that you should not repeat: ${recentHistory.join(', ')}` : "This is the first request, so any dua is fine.";
    
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a unique, authentic dua. ${historyString}`,
      config: {
        systemInstruction: `You are an Islamic Dua generator. Each time you are called, you must return one unique dua that has NOT appeared in the provided recentHistory list.
- Prefer authentic duas from the Qur'an or Sahih Hadith. If sourcing from scholars, mention the source briefly.
- Output a single, raw JSON object exactly matching the provided schema, with no markdown, code blocks, or extra text.
- The Arabic text should be short and easy to display (no more than 3 lines).
- The English translation should be a single, short sentence.
- If the recentHistory contains almost all known duas (e.g., >=90%), return a JSON object with an 'id' of 'error_exhausted' and a 'tip' field explaining that the user could explore categories like morning or travel duas.
- Always return a unique "id" so the app can store it in recentHistory.`,
        responseMimeType: 'application/json',
        responseSchema: JSON_DUA_SCHEMA,
      },
    });
    
    // Handle potential markdown in JSON response
    let jsonString = response.text.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.slice(7, -3).trim();
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.slice(3, -3).trim();
    }
    
    const parsed = JSON.parse(jsonString);

    if (parsed.id === 'error_exhausted') {
        throw new Error(parsed.tip || 'You have seen most of the available duas! Try exploring specific categories.');
    }

    return parsed as Dua;

  } catch (error) {
    console.error("Error fetching daily dua:", error);
    if (error instanceof Error) {
        // Provide a more user-friendly message for parsing errors
        if (error.name === 'SyntaxError') {
            throw new Error('Received an invalid format from the AI. Please try again.');
        }
        throw error;
    }
    throw new Error("Failed to get a dua from the AI. Please try again.");
  }
};

export const explainVerse = async (surah: string, ayah: string): Promise<string> => {
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Explain the meaning and context of Quran verse ${surah}:${ayah}.`,
      config: {
        systemInstruction: `You are an AI assistant specializing in Tafsir (Quranic exegesis). Explain the provided Quran verse in simple, clear, and accessible language for a general audience with no prior deep knowledge of Islamic sciences. Provide a brief context of the revelation if relevant. Your explanation should be rooted in authentic, mainstream Islamic scholarship. Keep the tone encouraging and enlightening. Format the output for readability.`,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching verse explanation:", error);
    if (error instanceof Error) throw error;
    throw new Error("Failed to get a verse explanation from the AI. Please try again.");
  }
};
