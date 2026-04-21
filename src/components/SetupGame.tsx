import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, CheckCircle2 } from 'lucide-react';

interface SetupGameProps {
  team1Name: string;
  team2Name: string;
  onNamesSet: (name1: string, name2: string) => void;
  onBack: () => void;
}

export default function SetupGame({ team1Name, team2Name, onNamesSet, onBack }: SetupGameProps) {
  const [name1, setName1] = useState(team1Name);
  const [name2, setName2] = useState(team2Name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name1.trim() && name2.trim()) {
      onNamesSet(name1, name2);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-8 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white p-12 rounded-[60px] shadow-2xl border-b-[16px] border-blue-200"
      >
        <header className="flex items-center gap-6 mb-12">
          <button 
            onClick={onBack}
            className="bg-slate-100 p-4 rounded-3xl hover:bg-slate-200 transition-colors text-slate-600"
          >
            <ArrowLeft size={32} />
          </button>
          <h1 className="text-5xl text-blue-600">PERSIAPAN TIM</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-4">
            <label className="text-2xl font-bold text-blue-600 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-base font-display">A</div>
              NAMA KELOMPOK 1
            </label>
            <input 
              type="text"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              placeholder="Contoh: Sang Juara"
              className="w-full p-6 text-3xl rounded-3xl border-4 border-slate-100 focus:border-blue-400 outline-none transition-all shadow-inner text-blue-700 font-bold"
              required
            />
          </div>

          <div className="space-y-4">
            <label className="text-2xl font-bold text-yellow-500 flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-base font-display">B</div>
              NAMA KELOMPOK 2
            </label>
            <input 
              type="text"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              placeholder="Contoh: Elang Biru"
              className="w-full p-6 text-3xl rounded-3xl border-4 border-slate-100 focus:border-yellow-400 outline-none transition-all shadow-inner text-yellow-600 font-bold"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-green-500 text-white py-6 rounded-3xl text-3xl font-display flex items-center justify-center gap-4 hover:bg-green-600 transition-colors shadow-lg mt-12"
          >
            <CheckCircle2 size={40} /> LANJUT KE GAME
          </motion.button>
        </form>
      </motion.div>
      
      <div className="mt-8 flex items-center gap-2 text-blue-300">
        <Users size={24} />
        <span className="font-bold uppercase tracking-widest">Tentukan identitas kelompokmu!</span>
      </div>
    </div>
  );
}
