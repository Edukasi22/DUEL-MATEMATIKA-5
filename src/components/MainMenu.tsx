import React from 'react';
import { motion } from 'motion/react';
import { Play, ListOrdered, Info, RotateCcw } from 'lucide-react';
import { AppView } from '../types';

interface MainMenuProps {
  onNavigate: (view: AppView) => void;
  onResetScores: () => void;
}

export default function MainMenu({ onNavigate, onResetScores }: MainMenuProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-pattern">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-7xl text-blue-600 mb-2 drop-shadow-lg">
          DUEL MATEMATIKA
        </h1>
        <h2 className="text-5xl text-yellow-500 drop-shadow-md">
          CERDAS
        </h2>
        <div className="mt-4 inline-block bg-white px-6 py-2 rounded-full border-4 border-blue-400 text-blue-600 font-bold text-xl">
          Kelas 5 SD
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <MenuButton 
          icon={<Play size={32} />} 
          label="Mulai Game" 
          color="bg-green-500 text-white hover:bg-green-600"
          onClick={() => onNavigate('game')}
        />
        <MenuButton 
          icon={<ListOrdered size={32} />} 
          label="Papan Skor" 
          color="bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => onNavigate('scoreboard')}
        />
        <MenuButton 
          icon={<RotateCcw size={32} />} 
          label="Reset Skor" 
          color="bg-red-500 text-white hover:bg-red-600"
          onClick={onResetScores}
        />
        <MenuButton 
          icon={<Info size={32} />} 
          label="Petunjuk" 
          color="bg-yellow-500 text-white hover:bg-yellow-600"
          onClick={() => onNavigate('instructions')}
        />
      </div>

      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="mt-12 text-blue-300 opacity-50"
      >
        <span className="text-8xl">📐 ➕ 📏 ➗</span>
      </motion.div>
    </div>
  );
}

function MenuButton({ icon, label, color, onClick }: { icon: React.ReactNode, label: string, color: string, onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${color} flex items-center justify-center gap-4 py-6 px-8 rounded-3xl text-3xl font-display shadow-xl transition-colors`}
    >
      {icon}
      {label}
    </motion.button>
  );
}
