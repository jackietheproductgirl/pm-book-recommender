import { QuizProvider } from '@/contexts/QuizContext';
import Quiz from '@/components/Quiz';

export default function Home() {
  return (
    <QuizProvider>
      <Quiz />
    </QuizProvider>
  );
} 