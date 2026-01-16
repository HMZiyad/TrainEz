
export enum Role {
  HOST = 'HOST',
  SERVER = 'SERVER',
  MANAGER = 'MANAGER',
  BARTENDER = 'BARTENDER'
}

export enum Language {
  ENGLISH = 'en',
  SPANISH = 'es'
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  role: Role;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  customerProfile: string;
  initialPrompt: string;
}

export interface EvaluationResult {
  politeness: number;
  clarity: number;
  speed: number;
  empathy: number;
  problemSolving: number;
  feedback: string;
  overallScore: number;
}

export interface TrainingSession {
  id: string;
  scenarioId: string;
  timestamp: number;
  transcript: { sender: 'user' | 'ai'; text: string }[];
  evaluation?: EvaluationResult;
}

export interface UserStats {
  sessionsCompleted: number;
  averageScore: number;
  recentTrends: number[];
}
