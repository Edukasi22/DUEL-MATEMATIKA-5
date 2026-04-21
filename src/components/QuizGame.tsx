import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, ArrowRight, Home, RotateCcw, Trophy, Check, X, Bell } from 'lucide-react';
import { Question, Team, GameState } from '../types';
import { cn } from '../lib/utils';

// Sound effect simulator helper
const playSound = (type: 'correct' | 'wrong' | 'timer' | 'finish') => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  if (type === 'correct') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } else if (type === 'wrong') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } else if (type === 'timer') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } else if (type === 'finish') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }
};

interface QuizGameProps {
  questions: Question[];
  team1: Team;
  team2: Team;
  onUpdateScore: (teamId: 'team1' | 'team2', delta: number) => void;
  onHome: () => void;
  onRestart: () => void;
}

export default function QuizGame({ questions, team1, team2, onUpdateScore, onHome, onRestart }: QuizGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeTeam, setActiveTeam] = useState<'team1' | 'team2' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isRebuttable, setIsRebuttable] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [gameFinished, setGameFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (timeLeft > 0 && !showAnswer && !gameFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 3 && prev > 0) playSound('timer');
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && !showAnswer) {
      if (!isRebuttable) {
        setIsRebuttable(true);
        setTimeLeft(10); // Give 10 seconds for rebuttal
      } else {
        setShowAnswer(true);
        setIsCorrect(false);
        playSound('wrong');
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, showAnswer, isRebuttable, gameFinished]);

  const handleAnswer = (answer: string) => {
    if (showAnswer || !activeTeam) return;

    const isRight = answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    setIsCorrect(isRight);
    setShowAnswer(true);

    if (isRight) {
      onUpdateScore(activeTeam, 10);
      playSound('correct');
    } else {
      // Penalty? User didn't specify auto penalty for wrong answer during duel, 
      // but usually -5 manual. I'll just show it's wrong.
      playSound('wrong');
    }
  };

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      setGameFinished(true);
      playSound('finish');
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setTimeLeft(30);
    setActiveTeam(null);
    setShowAnswer(false);
    setIsCorrect(null);
    setIsRebuttable(false);
    setUserInput('');
  };

  const claimQuestion = (teamId: 'team1' | 'team2') => {
    if (activeTeam || showAnswer) return;
    setActiveTeam(teamId);
  };

  const handleRebut = (teamId: 'team1' | 'team2') => {
    if (!isRebuttable || activeTeam || showAnswer) return;
    setActiveTeam(teamId);
  };

  if (gameFinished) {
    const winner = team1.score > team2.score ? team1 : team2.score > team1.score ? team2 : null;
    return (
      <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center p-8 overflow-hidden relative">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-[60px] p-16 shadow-2xl flex flex-col items-center max-w-2xl w-full text-center relative z-10"
        >
          <Trophy size={120} className="text-yellow-500 mb-8" />
          <h1 className="text-6xl text-blue-600 mb-4">PERMAINAN SELESAI!</h1>
          
          {winner ? (
            <div className="mb-8">
              <p className="text-3xl text-slate-600 mb-2 font-bold">PEMENANGNYA ADALAH:</p>
              <h2 className="text-7xl text-yellow-500">{winner.name}</h2>
            </div>
          ) : (
            <h2 className="text-6xl text-slate-500 mb-8 font-display">SERI! (HASIL IMBANG)</h2>
          )}

          <div className="flex gap-12 mb-12">
            <div className="text-center">
              <p className="text-xl text-blue-500 font-bold">{team1.name}</p>
              <p className="text-5xl font-display">{team1.score}</p>
            </div>
            <div className="text-center">
              <p className="text-xl text-yellow-500 font-bold">{team2.name}</p>
              <p className="text-5xl font-display">{team2.score}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <button 
              onClick={onRestart}
              className="bg-green-500 text-white py-6 rounded-3xl text-3xl font-display flex items-center justify-center gap-4 hover:bg-green-600 transition-colors shadow-lg"
            >
              <RotateCcw size={32} /> MAIN LAGI
            </button>
            <button 
              onClick={onHome}
              className="bg-blue-100 text-blue-600 py-6 rounded-3xl text-3xl font-display flex items-center justify-center gap-4 hover:bg-blue-200 transition-colors"
            >
              <Home size={32} /> KE MENU UTAMA
            </button>
          </div>
        </motion.div>
        
        {/* Decorative elements */}
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: 'linear' }} className="absolute -top-20 -left-20 text-9xl">⭐</motion.div>
        <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 12, ease: 'linear' }} className="absolute -bottom-20 -right-20 text-9xl">🌟</motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pattern flex flex-col p-6">
      {/* HUD Header */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-lg border-b-4 border-blue-200 mb-8">
        <div className={cn("flex items-center gap-4 p-3 rounded-2xl transition-all", activeTeam === 'team1' && "bg-blue-100 ring-4 ring-blue-500")}>
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-display">A</div>
          <div>
            <p className="font-bold text-blue-600">{team1.name}</p>
            <p className="text-3xl font-display">{team1.score}</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-1">Ronde {currentIndex + 1} / {questions.length}</p>
          <div className={cn(
            "flex items-center gap-3 px-8 py-3 rounded-full shadow-inner text-4xl font-display",
            timeLeft <= 5 ? "bg-red-100 text-red-500 animate-pulse" : "bg-slate-100 text-slate-700"
          )}>
            <Timer size={40} />
            {timeLeft}s
          </div>
        </div>

        <div className={cn("flex items-center gap-4 p-3 rounded-2xl transition-all text-right", activeTeam === 'team2' && "bg-yellow-100 ring-4 ring-yellow-500")}>
          <div className="text-right">
            <p className="font-bold text-yellow-600">{team2.name}</p>
            <p className="text-3xl font-display">{team2.score}</p>
          </div>
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-display">B</div>
        </div>
      </div>

      {/* Main Question Area */}
      <main className="flex-1 flex flex-col items-center justify-center gap-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-full max-w-4xl bg-white p-10 rounded-[50px] shadow-2xl border-b-[12px] border-slate-200 relative"
          >
            <div className="absolute -top-6 left-12 bg-blue-500 text-white px-6 py-2 rounded-full text-xl font-display border-4 border-white shadow-md">
              {currentQuestion.topic}
            </div>
            <div className="absolute -top-6 right-12 bg-yellow-500 text-white px-6 py-2 rounded-full text-xl font-display border-4 border-white shadow-md uppercase">
              {currentQuestion.difficulty}
            </div>

            <h2 className="text-4xl text-slate-800 text-center leading-tight mb-12 mt-4 font-semibold px-4">
              {currentQuestion.question}
            </h2>

            {/* Answer Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options?.map((opt, i) => (
                <AnswerButton 
                  key={i}
                  label={opt}
                  prefix={['A', 'B', 'C', 'D'][i]}
                  disabled={!activeTeam || showAnswer}
                  isCorrect={showAnswer && opt === currentQuestion.correctAnswer}
                  isWrong={showAnswer && activeTeam && isCorrect === false && userInput === opt}
                  onClick={() => { setUserInput(opt); handleAnswer(opt); }}
                />
              ))}

              {currentQuestion.type === 'true_false' && ['Benar', 'Salah'].map((opt, i) => (
                <AnswerButton 
                  key={i}
                  label={opt}
                  className="py-10 text-4xl"
                  disabled={!activeTeam || showAnswer}
                  isCorrect={showAnswer && opt === currentQuestion.correctAnswer}
                  isWrong={showAnswer && activeTeam && isCorrect === false && userInput === opt}
                  onClick={() => { setUserInput(opt); handleAnswer(opt); }}
                />
              ))}
            </div>

            {/* Feedback Overlay */}
            <AnimatePresence>
              {showAnswer && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "mt-8 p-6 rounded-3xl border-4 flex flex-col items-center gap-2",
                    isCorrect ? "bg-green-50 border-green-400 text-green-700" : "bg-red-50 border-red-400 text-red-700"
                  )}
                >
                  <div className="flex items-center gap-4 text-4xl font-display">
                    {isCorrect ? <Check size={48} /> : <X size={48} />}
                    {isCorrect ? 'BENAR!' : 'SALAH!'}
                  </div>
                  <p className="text-xl font-bold">Jawaban yang benar: {currentQuestion.correctAnswer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex gap-6 items-center">
          {!activeTeam && !showAnswer && !isRebuttable && (
            <>
              <button 
                onClick={() => claimQuestion('team1')}
                className="bg-blue-600 text-white px-10 py-6 rounded-3xl text-3xl font-display shadow-xl hover:bg-blue-700 flex flex-col items-center gap-2"
              >
                <div className="text-sm uppercase opacity-70">Kelompok A</div>
                JAWAB!
              </button>
              <div className="text-4xl text-slate-300 font-display">ATAU</div>
              <button 
                onClick={() => claimQuestion('team2')}
                className="bg-yellow-500 text-white px-10 py-6 rounded-3xl text-3xl font-display shadow-xl hover:bg-yellow-600 flex flex-col items-center gap-2"
              >
                <div className="text-sm uppercase opacity-70">Kelompok B</div>
                JAWAB!
              </button>
            </>
          )}

          {isRebuttable && !activeTeam && !showAnswer && (
            <div className="flex flex-col items-center gap-4 bg-orange-100 p-8 rounded-[40px] border-4 border-orange-400">
               <Bell className="text-orange-500 animate-bounce" size={48} />
               <p className="text-2xl font-bold text-orange-700">WAKTU HABIS! SOAL BISA DIREBUT!</p>
               <div className="flex gap-6">
                <button 
                  onClick={() => handleRebut('team1')}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-xl font-display hover:bg-blue-700 shadow-md"
                >
                  REBUT (KEL A)
                </button>
                <button 
                  onClick={() => handleRebut('team2')}
                  className="bg-yellow-500 text-white px-8 py-4 rounded-2xl text-xl font-display hover:bg-yellow-600 shadow-md"
                >
                  REBUT (KEL B)
                </button>
               </div>
            </div>
          )}

          {showAnswer && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleNext}
              className="bg-blue-600 text-white px-16 py-6 rounded-full text-3xl font-display shadow-2xl hover:bg-blue-700 flex items-center gap-4"
            >
              RONDE BERIKUTNYA <ArrowRight size={40} />
            </motion.button>
          )}

          {!showAnswer && (
             <button 
              onClick={onHome}
              className="fixed bottom-8 left-8 bg-white/80 p-4 rounded-2xl shadow-md text-slate-500 hover:text-blue-600 hover:bg-white transition-all flex items-center gap-2 font-bold"
            >
              <Home size={24} /> KELUAR
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function AnswerButton({ label, prefix, onClick, disabled, isCorrect, isWrong, className }: any) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -4 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative flex items-center p-6 text-2xl font-bold text-left rounded-3xl border-4 transition-all shadow-md group",
        !disabled ? "border-slate-100 bg-slate-50 hover:border-blue-400 hover:bg-blue-50 text-slate-700" : "bg-slate-50 text-slate-400 opacity-80",
        isCorrect && "bg-green-500 border-green-600 text-white z-10 scale-105 shadow-green-200",
        isWrong && "bg-red-500 border-red-600 text-white z-10",
        className
      )}
    >
      {prefix && (
        <span className={cn(
          "w-12 h-12 flex items-center justify-center rounded-xl mr-6 text-xl font-display transition-colors",
          !disabled ? "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" : "bg-slate-200 text-slate-400",
          isCorrect && "bg-white text-green-600",
          isWrong && "bg-white text-red-600"
        )}>
          {prefix}
        </span>
      )}
      <span className="flex-1">{label}</span>
      {isCorrect && <Check className="ml-2" size={32} />}
      {isWrong && <X className="ml-2" size={32} />}
    </motion.button>
  );
}
