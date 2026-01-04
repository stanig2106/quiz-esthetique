export type Question = {
  id: number;
  label: string;
  choices: string[];
  correctIndex: number;
};

export type QuizAnswer = {
  questionId: number;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
};

export type QuizUser = {
  firstName: string;
  lastName: string;
  email: string;
};

export type QuizProgress = {
  user: QuizUser;
  currentIndex: number;
  answers: QuizAnswer[];
  startedAt: string;
  finishedAt?: string;
  submittedAttemptId?: number;
};

export type Attempt = {
  id: number;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  score: number;
  totalQuestions: number;
  answers: QuizAnswer[];
  questionsSnapshot: Question[];
  startedAt?: string | null;
  finishedAt?: string | null;
  durationMs?: number | null;
  createdAt: string;
};

export type Stats = {
  total: number;
  average: number;
  median: number;
  min: number;
  max: number;
  averageDurationMs?: number;
  distribution: Record<string, number>;
};
