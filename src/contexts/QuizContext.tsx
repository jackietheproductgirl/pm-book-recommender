'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { QuizAnswer } from '@/data/quizData';
import { BookRecommendation } from '@/types/book';
import { QuizAnswers } from '@/types/quiz';

interface QuizState {
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  isComplete: boolean;
  isLoading: boolean;
  recommendations: BookRecommendation[];
  showEmailCollection: boolean;
  emailSubmitted: boolean;
}

type QuizAction =
  | { type: 'ANSWER_QUESTION'; payload: QuizAnswer }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'SET_RECOMMENDATIONS'; payload: BookRecommendation[] }
  | { type: 'SHOW_EMAIL_COLLECTION' }
  | { type: 'SUBMIT_EMAIL'; payload: { firstName: string; email: string } }
  | { type: 'SKIP_EMAIL' }
  | { type: 'RESET_QUIZ' };

const initialState: QuizState = {
  currentQuestionIndex: 0,
  answers: [],
  isComplete: false,
  isLoading: false,
  recommendations: [],
  showEmailCollection: false,
  emailSubmitted: false,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'ANSWER_QUESTION':
      const existingAnswerIndex = state.answers.findIndex(
        answer => answer.questionId === action.payload.questionId
      );
      
      const updatedAnswers = existingAnswerIndex >= 0
        ? state.answers.map((answer, index) =>
            index === existingAnswerIndex ? action.payload : answer
          )
        : [...state.answers, action.payload];

      return {
        ...state,
        answers: updatedAnswers,
      };

    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, 6), // 7 questions total
      };

    case 'PREVIOUS_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'COMPLETE_QUIZ':
      return {
        ...state,
        isComplete: true,
      };

    case 'SET_RECOMMENDATIONS':
      return {
        ...state,
        recommendations: action.payload,
      };

    case 'SHOW_EMAIL_COLLECTION':
      return {
        ...state,
        showEmailCollection: true,
      };

    case 'SUBMIT_EMAIL':
      return {
        ...state,
        emailSubmitted: true,
        showEmailCollection: false,
      };

    case 'SKIP_EMAIL':
      return {
        ...state,
        showEmailCollection: false,
      };

    case 'RESET_QUIZ':
      return initialState;

    default:
      return state;
  }
}

interface QuizContextType {
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
  completeQuiz: () => Promise<void>;
  submitEmail: (data: { firstName: string; email: string }) => Promise<void>;
  skipEmail: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const completeQuiz = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Convert answers to the format expected by the API
      const quizAnswers: QuizAnswers = {
        experience: '',
        primaryFocus: '',
        businessModel: '',
        learningStyle: '',
        careerStage: '',
        secondarySkills: [],
        currentChallenges: [],
      };

      state.answers.forEach(answer => {
        const question = answer.questionId;
        if (question === 'experience') quizAnswers.experience = answer.answer as string;
        else if (question === 'primaryFocus') quizAnswers.primaryFocus = answer.answer as string;
        else if (question === 'businessModel') quizAnswers.businessModel = answer.answer as string;
        else if (question === 'learningStyle') quizAnswers.learningStyle = answer.answer as string;
        else if (question === 'careerStage') quizAnswers.careerStage = answer.answer as string;
        else if (question === 'secondarySkills') quizAnswers.secondarySkills = answer.answer as string[];
        else if (question === 'currentChallenges') quizAnswers.currentChallenges = answer.answer as string[];
      });

      // Call the API
      console.log('Calling API with answers:', quizAnswers);
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: quizAnswers }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      console.log('API response data:', data);
      console.log('Recommendations received:', data.recommendations?.length || 0);
      
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: data.recommendations });
      dispatch({ type: 'COMPLETE_QUIZ' });
      dispatch({ type: 'SHOW_EMAIL_COLLECTION' });
      
      console.log('State updates completed - recommendations should now be visible');
    } catch (error) {
      console.error('Error completing quiz:', error);
      // Fallback to mock data
      const { mockRecommendations } = await import('@/data/mockRecommendations');
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: mockRecommendations });
      dispatch({ type: 'COMPLETE_QUIZ' });
      dispatch({ type: 'SHOW_EMAIL_COLLECTION' });
    }
  };

  const submitEmail = async (data: { firstName: string; email: string }) => {
    try {
      // Here you would typically send the email to your backend
      console.log('Submitting email:', data);
      
      // For now, we'll just simulate a successful submission
      // In a real app, you'd make an API call here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch({ type: 'SUBMIT_EMAIL', payload: data });
    } catch (error) {
      console.error('Error submitting email:', error);
      throw error;
    }
  };

  const skipEmail = () => {
    dispatch({ type: 'SKIP_EMAIL' });
  };

  return (
    <QuizContext.Provider value={{ state, dispatch, completeQuiz, submitEmail, skipEmail }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
} 