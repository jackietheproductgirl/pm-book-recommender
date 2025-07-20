export interface BookRecommendation {
  id: string;
  title: string;
  author: string;
  summary: string;
  goodreadsRating: number;
  amazonLink: string;
  coverImage?: string;
  personalizedExplanation: string;
}

export interface QuizResults {
  recommendations: BookRecommendation[];
  userAnswers: Record<string, string>;
} 