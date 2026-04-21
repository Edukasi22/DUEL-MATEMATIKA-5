export type QuestionType = 'multiple_choice' | 'true_false';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  topic: string;
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: string;
}

export interface Team {
  id: 'team1' | 'team2';
  name: string;
  score: number;
}

export interface GameState {
  currentRound: number;
  maxRounds: number;
  team1: Team;
  team2: Team;
  questions: Question[];
  status: 'idle' | 'playing' | 'round_end' | 'game_end';
  currentQuestionIndex: number;
  activeTeamId: 'team1' | 'team2' | null; // Who is currently answering
  isRebuttable: boolean;
}

export type AppView = 'home' | 'game' | 'scoreboard' | 'instructions' | 'setup';
