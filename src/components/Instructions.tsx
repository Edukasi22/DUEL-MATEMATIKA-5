import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Clock, Trophy } from 'lucide-react';
import { AppView } from '../types';

interface InstructionsProps {
  onBack: () => void;
}

export default function Instructions({ onBack }: InstructionsProps) {
  return (
    <div className="min-h-screen bg-blue-50 p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl flex justify-between items-center mb-12">
        <button 
          onClick={onBack}
          className="bg-white p-4 rounded-2xl shadow-md hover:bg-slate-50 text-blue-600 transition-colors"
        >
          <ArrowLeft size={32} />
        </button>
        <h1 className="text-5xl text-blue-600">PETUNJUK PERMAINAN</h1>
        <div className="w-16" />
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        <InstructionCard 
          icon={<BookOpen className="text-blue-500" size={48} />}
          title="Konsep Game"
          content="Duel 1 LAWAN 1 antar kelompok. Rebut soal secepat mungkin untuk mendapatkan skor tertinggi!"
        />
        <InstructionCard 
          icon={<Clock className="text-yellow-500" size={48} />}
          title="Waktu & Skor"
          content="Waktu menjawab adalah 15 detik. Jawaban benar mendapat +10 poin. Jika kelompok pertama tidak menjawab, soal bisa direbut kelompok lawan!"
        />
        <InstructionCard 
          icon={<Trophy className="text-green-500" size={48} />}
          title="Materi Soal"
          content="Materi meliputi Pengolahan Data, Bangun Datar, Sudut, Keliling, dan Luas. Soal diacak oleh AI setiap kali bermain."
        />
        <InstructionCard 
          icon={<div className="text-4xl">🎮</div>}
          title="Cara Main"
          content="Guru membacakan soal, lalu kelompok menekan tombol 'Jawab'. Jika salah atau tidak sanggup, tekan 'Rebut Soal'."
        />
      </main>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="mt-12 bg-blue-600 text-white px-12 py-4 rounded-full text-2xl font-display shadow-lg hover:bg-blue-700 transition-colors"
      >
        MENGALAMI! (SIAP)
      </motion.button>
    </div>
  );
}

function InstructionCard({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-8 rounded-[40px] shadow-xl border-t-8 border-blue-400"
    >
      <div className="flex items-center gap-4 mb-4">
        {icon}
        <h3 className="text-3xl text-slate-700">{title}</h3>
      </div>
      <p className="text-xl text-slate-600 leading-relaxed font-medium">
        {content}
      </p>
    </motion.div>
  );
}
