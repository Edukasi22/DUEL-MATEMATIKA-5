import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MainMenu from './components/MainMenu';
import Instructions from './components/Instructions';
import ScoreBoard from './components/ScoreBoard';
import QuizGame from './components/QuizGame';
import SetupGame from './components/SetupGame';
import { AppView, Team, Question } from './types';
import { generateQuestions } from './lib/gemini';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [team1, setTeam1] = useState<Team>({ id: 'team1', name: 'Kelompok A', score: 0 });
  const [team2, setTeam2] = useState<Team>({ id: 'team2', name: 'Kelompok B', score: 0 });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Error boundary simplified
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      console.error("Runtime error caught:", e);
      setHasError(true);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-8 text-center text-red-600 font-bold">
        Oops! Terjadi kesalahan teknik. Silakan muat ulang halaman.
      </div>
    );
  }

  // Persistence of scores and names
  useEffect(() => {
    try {
      const saved = localStorage.getItem('duel_matematika_data');
      if (saved) {
        const data = JSON.parse(saved);
        if (data && typeof data === 'object') {
          const { t1Score, t2Score, t1Name, t2Name } = data;
          setTeam1(prev => ({ ...prev, score: Number(t1Score) || 0, name: t1Name || 'Kelompok A' }));
          setTeam2(prev => ({ ...prev, score: Number(t2Score) || 0, name: t2Name || 'Kelompok B' }));
        }
      }
    } catch (err) {
      console.error("Error loading saved data:", err);
      localStorage.removeItem('duel_matematika_data');
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('duel_matematika_data', JSON.stringify({ 
        t1Score: team1.score, 
        t2Score: team2.score,
        t1Name: team1.name,
        t2Name: team2.name
      }));
    } catch (err) {
      console.error("Error saving data:", err);
    }
  }, [team1.score, team2.score, team1.name, team2.name]);

  const updateScore = (teamId: 'team1' | 'team2', delta: number) => {
    if (teamId === 'team1') {
      setTeam1(prev => ({ ...prev, score: Math.max(0, prev.score + delta) }));
    } else {
      setTeam2(prev => ({ ...prev, score: Math.max(0, prev.score + delta) }));
    }
  };

  const resetScores = () => {
    if (confirm('Apakah Anda yakin ingin mereset skor semua kelompok?')) {
      setTeam1(prev => ({ ...prev, score: 0 }));
      setTeam2(prev => ({ ...prev, score: 0 }));
    }
  };

  const startNewGame = async () => {
    setIsLoading(true);
    try {
      const newQuestions = await generateQuestions(40);
      setQuestions(newQuestions);
      setCurrentView('game');
    } catch (error) {
      alert("Gagal memuat soal. Silakan coba lagi.");
    } finally {
      // Small delay to ensure smooth transition
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleNavigate = (view: AppView) => {
    if (view === 'game') {
      setCurrentView('setup');
    } else {
      setCurrentView(view);
    }
  };

  const handleNamesSet = (name1: string, name2: string) => {
    setTeam1(prev => ({ ...prev, name: name1 }));
    setTeam2(prev => ({ ...prev, name: name2 }));
    startNewGame();
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-blue-600 flex flex-col items-center justify-center text-white"
          >
            <Loader2 size={80} className="animate-spin mb-6" />
            <h2 className="text-4xl font-display">MENYIAPKAN SOAL CERDAS...</h2>
            <p className="mt-4 text-xl opacity-80 uppercase tracking-widest">Dibuat khusus oleh AI untukmu</p>
          </motion.div>
        ) : (
          <motion.div
            key={currentView}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            {currentView === 'home' && (
              <MainMenu onNavigate={handleNavigate} onResetScores={resetScores} />
            )}

            {currentView === 'setup' && (
              <SetupGame 
                team1Name={team1.name} 
                team2Name={team2.name} 
                onNamesSet={handleNamesSet} 
                onBack={() => setCurrentView('home')} 
              />
            )}
            
            {currentView === 'instructions' && (
              <Instructions onBack={() => setCurrentView('home')} />
            )}
            
            {currentView === 'scoreboard' && (
              <ScoreBoard 
                team1={team1} 
                team2={team2} 
                onUpdateScore={updateScore} 
                onResetScores={resetScores}
                onBack={() => setCurrentView('home')} 
              />
            )}

            {currentView === 'game' && (
              <QuizGame 
                questions={questions}
                team1={team1}
                team2={team2}
                onUpdateScore={updateScore}
                onHome={() => setCurrentView('home')}
                onRestart={startNewGame}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
