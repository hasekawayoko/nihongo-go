
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER'
}

export interface StudentStats {
  id: string;
  name: string;
  className: string;
  loginCount: number;
  streakDays: number;
  completionRate: number; // 0-100
  puzzleAccuracy: number; // 0-100
  pronunciationScore: number; // 0-100
  totalPoints: number;
}

export interface ClassData {
  id: string;
  name: string;
  studentCount: number;
  avgCompletion: number;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate';
  type: 'KANA' | 'VOCAB' | 'PRONUNCIATION';
}

export interface ProgressState {
  completedModules: string[];
  points: number;
  streak: number;
}

export interface ResetConfig {
  day: number; // 0 (Sun) - 6 (Sat)
  hour: number; // 0-23
}
