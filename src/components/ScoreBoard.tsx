import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Minus, RotateCcw } from 'lucide-react';
import { Team } from '../types';

interface ScoreBoardProps {
  team1: Team;
  team2: Team;
  onUpdateScore: (teamId: 'team1' | 'team2', delta: number) => void;
  onResetScores: () => void;
  onBack: () => void;
}

export default function ScoreBoard({ team1, team2, onUpdateScore, onResetScores, onBack }: ScoreBoardProps) {
  return (
    <div className="min-h-screen bg-blue-100 p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl flex justify-between items-center mb-16">
        <button 
          onClick={onBack}
          className="bg-white p-4 rounded-2xl shadow-md hover:bg-slate-50 text-blue-600 transition-colors"
        >
          <ArrowLeft size={32} />
        </button>
        <h1 className="text-6xl text-blue-700 tracking-wider">PAPAN SKOR</h1>
        <button 
          onClick={onResetScores}
          className="bg-red-500 p-4 rounded-2xl shadow-md hover:bg-red-600 text-white transition-colors"
          title="Reset Skor"
        >
          <RotateCcw size={32} />
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-12 w-full max-w-6xl justify-center items-stretch">
        <TeamCard 
          team={team1} 
          color="blue" 
          onAdd={() => onUpdateScore('team1', 10)} 
          onSub={() => onUpdateScore('team1', -5)} 
        />
        <div className="flex items-center justify-center">
          <div className="text-8xl text-slate-300 font-display">VS</div>
        </div>
        <TeamCard 
          team={team2} 
          color="yellow" 
          onAdd={() => onUpdateScore('team2', 10)} 
          onSub={() => onUpdateScore('team2', -5)} 
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="mt-16 bg-white border-4 border-blue-500 text-blue-600 px-12 py-4 rounded-full text-2xl font-display shadow-lg hover:bg-blue-50 transition-colors"
      >
        KEMBALI KE MENU
      </motion.button>
    </div>
  );
}

function TeamCard({ team, color, onAdd, onSub }: { team: Team, color: 'blue' | 'yellow', onAdd: () => void, onSub: () => void }) {
  const bgColor = color === 'blue' ? 'bg-blue-600' : 'bg-yellow-500';
  const borderColor = color === 'blue' ? 'border-blue-400' : 'border-yellow-400';
  const textColor = color === 'blue' ? 'text-blue-500' : 'text-yellow-600';

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white p-10 rounded-[60px] shadow-2xl flex-1 flex flex-col items-center border-[12px] border-white relative overflow-hidden"
    >
      <div className={`absolute top-0 w-full h-4 ${bgColor}`} />
      
      <h2 className={`text-4xl mb-8 ${textColor} text-center`}>{team.name}</h2>
      
      <div className="relative mb-10">
        <motion.div 
          key={team.score}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-9xl font-display text-slate-800"
        >
          {team.score}
        </motion.div>
        <span className="absolute -top-4 -right-8 text-2xl text-slate-400 font-bold uppercase">POIN</span>
      </div>

      <div className="flex gap-4 w-full">
        <button 
          onClick={onSub}
          className="flex-1 bg-red-100 text-red-500 p-6 rounded-3xl hover:bg-red-200 transition-colors flex flex-col items-center gap-2"
        >
          <Minus size={40} />
          <span className="font-display">-5</span>
        </button>
        <button 
          onClick={onAdd}
          className="flex-3 bg-green-500 text-white p-6 rounded-3xl hover:bg-green-600 transition-colors flex flex-col items-center gap-2 shadow-lg"
        >
          <Plus size={40} />
          <span className="font-display">+10</span>
        </button>
      </div>
    </motion.div>
  );
}
