export interface QuizAnswers {
  experience: string;
  goals: string;
  industry: string;
  learningStyle: string;
  [key: string]: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    value: string;
  }[];
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
  isComplete: boolean;
  isLoading: boolean;
} 