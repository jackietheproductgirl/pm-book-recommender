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
}

type QuizAction =
  | { type: 'ANSWER_QUESTION'; payload: QuizAnswer }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'SET_RECOMMENDATIONS'; payload: BookRecommendation[] }
  | { type: 'RESET_QUIZ' };

const initialState: QuizState = {
  currentQuestionIndex: 0,
  answers: [],
  isComplete: false,
  isLoading: false,
  recommendations: [],
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
        currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, 4), // 5 questions total
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
        goals: '',
        industry: '',
        learningStyle: '',
      };

      state.answers.forEach(answer => {
        const question = answer.questionId;
        if (question === 'experience') quizAnswers.experience = answer.answer;
        else if (question === 'goals') quizAnswers.goals = answer.answer;
        else if (question === 'industry') quizAnswers.industry = answer.answer;
        else if (question === 'style') quizAnswers.learningStyle = answer.answer;
        else if (question === 'focus') quizAnswers.goals = answer.answer; // Use focus as additional goals
      });

      // Call the API
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: quizAnswers }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: data.recommendations });
      dispatch({ type: 'COMPLETE_QUIZ' });
    } catch (error) {
      console.error('Error completing quiz:', error);
      // Fallback to mock data
      const { mockRecommendations } = await import('@/data/mockRecommendations');
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: mockRecommendations });
      dispatch({ type: 'COMPLETE_QUIZ' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <QuizContext.Provider value={{ state, dispatch, completeQuiz }}>
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