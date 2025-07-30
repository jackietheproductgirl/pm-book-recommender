export interface QuizAnswers {
  experience: string;
  primaryFocus: string;
  businessModel: string;
  learningStyle: string;
  careerStage: string;
  secondarySkills: string[];
  currentChallenges: string[];
  [key: string]: string | string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    value: string;
  }[];
  type: 'single' | 'multi';
  maxSelections?: number;
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: Array<{
    questionId: string;
    answer: string | string[];
  }>;
  isComplete: boolean;
  isLoading: boolean;
} 