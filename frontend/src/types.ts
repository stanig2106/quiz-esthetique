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
  createdAt: string;
};

export type Stats = {
  total: number;
  average: number;
  median: number;
  min: number;
  max: number;
  distribution: Record<string, number>;
};
