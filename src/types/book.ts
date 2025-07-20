export interface BookRecommendation {
  id: string;
  title: string;
  author: string;
  summary: string;
  goodreadsRating: number;
  amazonLink: string;
  coverImage?: string;
  personalizedExplanation: string;
  tags?: string;
  difficultyLevel?: string;
  industryFocus?: string;
  learningStyle?: string;
}

export interface QuizResults {
  recommendations: BookRecommendation[];
  userAnswers: Record<string, string>;
} 