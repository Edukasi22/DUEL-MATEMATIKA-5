import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
}

const QUESTION_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      type: { 
        type: Type.STRING, 
        enum: ['multiple_choice', 'true_false'],
        description: "The type of question"
      },
      difficulty: { 
        type: Type.STRING, 
        enum: ['easy', 'medium', 'hard'],
        description: "The difficulty level"
      },
      topic: { 
        type: Type.STRING,
        description: "The math topic being tested (Pengolahan Data, Sudut, Bangun Datar, Keliling, Luas)"
      },
      question: { 
        type: Type.STRING,
        description: "The question text in Indonesian language"
      },
      options: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "The options for multiple choice questions (exactly 4 options: A, B, C, D)"
      },
      correctAnswer: { 
        type: Type.STRING,
        description: "The correct answer value (for multiple choice, provide the full text of the option; for true_false, 'Benar' or 'Salah'; for short_answer, a simple numerical or short text value)"
      }
    },
    required: ["type", "difficulty", "topic", "question", "correctAnswer"]
  }
};

export async function generateQuestions(count: number = 15): Promise<Question[]> {
  try {
    const prompt = `Buatkan ${count} soal Matematika untuk kelas 5 SD dengan kriteria berikut:
    - Materi: Pengolahan Data (tabel/diagram, nilai tertinggi, rata-rata sederhana), Sudut (jenis sudut), Bangun Datar (ciri-ciri), Keliling dan Luas bangun datar sederhana.
    - Distribusi Kesulitan: 30% Mudah, 50% Sedang, 20% Sulit.
    - Variasi Soal: Hanya Pilihan Ganda (A, B, C, D) dan Benar/Salah. JANGAN buat soal isian singkat.
    - Soal dalam Bahasa Indonesia yang ramah anak.
    - Gunakan angka acak dan variasi yang berbeda setiap kali.
    - Sertakan opsi A, B, C, D hanya untuk tipe 'multiple_choice'.
    - Untuk 'true_false', jawaban adalah 'Benar' atau 'Salah'.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: QUESTION_SCHEMA
      }
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }

    const rawQuestions = JSON.parse(response.text);
    return rawQuestions.map((q: any, i: number) => ({
      ...q,
      id: `q-${i}-${Date.now()}`
    }));
  } catch (error) {
    console.error("Error generating questions:", error);
    // Fallback static questions in case AI fails
    return [
      {
        id: 'fallback-1',
        type: 'multiple_choice',
        difficulty: 'easy',
        topic: 'Sudut',
        question: 'Sudut yang besarnya tepat 90 derajat disebut sudut...',
        options: ['Lancip', 'Tumpul', 'Siku-siku', 'Lurus'],
        correctAnswer: 'Siku-siku'
      }
    ];
  }
}
