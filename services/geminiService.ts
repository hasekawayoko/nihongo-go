
import { GoogleGenAI, Type } from "@google/genai";

// Use process.env.API_KEY directly as per guidelines
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }
  return new GoogleGenAI({ apiKey });
};

export const getPronunciationFeedback = async (text: string, transcription: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the Japanese pronunciation of "${text}". The student transcribed it as "${transcription}". Provide a encouraging score (0-100) and 2 sentences of feedback in Chinese for a university student.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING }
        },
        required: ["score", "feedback"]
      }
    }
  });
  if (!response.text) {
    throw new Error("No response text from Gemini");
  }
  return JSON.parse(response.text);
};

export const generateStudyEncouragement = async (stats: any) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on student stats: ${JSON.stringify(stats)}, generate a brief, witty, and motivating 1-sentence "Daily Zen" in Chinese to encourage them to keep learning Japanese.`,
  });
  return response.text || "加油！";
};
