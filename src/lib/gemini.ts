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

export async function generateQuestions(count: number = 40): Promise<Question[]> {
  try {
    const prompt = `Buatkan ${count} soal Matematika untuk kelas 5 SD dengan kriteria berikut:
    - WAJIB: Setiap materi berikut harus memiliki 10 soal:
      1. Pengolahan Data (tabel/diagram, nilai tertinggi, rata-rata sederhana)
      2. Sudut (jenis sudut: lancip, siku-siku, tumpul)
      3. Bangun Datar (ciri-ciri persegi, segitiga, dll)
      4. Keliling dan Luas (bangun datar sederhana)
    - Total soal harus berjumlah ${count}.
    - Distribusi Kesulitan: 30% Mudah, 50% Sedang, 20% Sulit.
    - Variasi Soal: Hanya Pilihan Ganda (A, B, C, D) dan Benar/Salah. JANGAN buat soal isian singkat.
    - Soal dalam Bahasa Indonesia yang ramah anak.
    - Gunakan angka acak dan variasi yang berbeda setiap kali.
    - Sertakan opsi A, B, C, D hanya untuk tipe 'multiple_choice'.
    - Untuk 'true_false', jawaban harus 'Benar' atau 'Salah'.`;

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
    // Comprehensive fallback static questions in case AI fails
    return [
      {
        id: 'f1', type: 'multiple_choice', difficulty: 'easy', topic: 'Sudut',
        question: 'Sudut yang besarnya 90 derajat disebut sudut...',
        options: ['Lancip', 'Tumpul', 'Siku-siku', 'Lurus'], correctAnswer: 'Siku-siku'
      },
      {
        id: 'f2', type: 'true_false', difficulty: 'easy', topic: 'Sudut',
        question: 'Sudut lancip adalah sudut yang besarnya kurang dari 90 derajat.',
        correctAnswer: 'Benar'
      },
      {
        id: 'f3', type: 'multiple_choice', difficulty: 'medium', topic: 'Bangun Datar',
        question: 'Bangun datar yang memiliki 4 sisi sama panjang dan 4 sudut siku-siku adalah...',
        options: ['Persegi Panjang', 'Persegi', 'Segitiga', 'Trapesium'], correctAnswer: 'Persegi'
      },
      {
        id: 'f4', type: 'multiple_choice', difficulty: 'easy', topic: 'Keliling',
        question: 'Keliling persegi dengan panjang sisi 5 cm adalah...',
        options: ['10 cm', '15 cm', '20 cm', '25 cm'], correctAnswer: '20 cm'
      },
      {
        id: 'f5', type: 'multiple_choice', difficulty: 'medium', topic: 'Luas',
        question: 'Luas persegi panjang dengan panjang 8 cm dan lebar 5 cm adalah...',
        options: ['13 cm²', '40 cm²', '26 cm²', '30 cm²'], correctAnswer: '40 cm²'
      },
      {
        id: 'f6', type: 'true_false', difficulty: 'easy', topic: 'Pengolahan Data',
        question: 'Dalam sebuah tabel, nilai yang paling banyak muncul disebut Modus.',
        correctAnswer: 'Benar'
      },
      {
        id: 'f7', type: 'multiple_choice', difficulty: 'medium', topic: 'Sudut',
        question: 'Sudut yang besarnya 120 derajat termasuk jenis sudut...',
        options: ['Lancip', 'Siku-siku', 'Tumpul', 'Refleks'], correctAnswer: 'Tumpul'
      },
      {
        id: 'f8', type: 'true_false', difficulty: 'easy', topic: 'Bangun Datar',
        question: 'Segitiga sama sisi memiliki tiga sudut yang besarnya sama.',
        correctAnswer: 'Benar'
      },
      {
        id: 'f9', type: 'multiple_choice', difficulty: 'easy', topic: 'Keliling',
        question: 'Keliling segitiga dengan sisi 6 cm, 8 cm, dan 10 cm adalah...',
        options: ['24 cm', '14 cm', '18 cm', '48 cm'], correctAnswer: '24 cm'
      },
      {
        id: 'f10', type: 'multiple_choice', difficulty: 'medium', topic: 'Pengolahan Data',
        question: 'Rata-rata dari nilai 70, 80, dan 90 adalah...',
        options: ['70', '75', '80', '85'], correctAnswer: '80'
      }
    ];
  }
}
