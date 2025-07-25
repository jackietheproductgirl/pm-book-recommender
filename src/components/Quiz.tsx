'use client';

import React from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { quizQuestions } from '@/data/quizData';
import QuizQuestion from './QuizQuestion';
import QuizProgress from './QuizProgress';

export default function Quiz() {
  const { state, dispatch } = useQuiz();
  const currentQuestion = quizQuestions[state.currentQuestionIndex];
  const totalQuestions = quizQuestions.length;

  const handleAnswerSelect = (answer: string) => {
    dispatch({
      type: 'ANSWER_QUESTION',
      payload: {
        questionId: currentQuestion.id,
        answer,
      },
    });
  };

  const handleNext = () => {
    if (state.currentQuestionIndex === totalQuestions - 1) {
      dispatch({ type: 'COMPLETE_QUIZ' });
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  };

  const handlePrevious = () => {
    dispatch({ type: 'PREVIOUS_QUESTION' });
  };

  const currentAnswer = state.answers.find(
    answer => answer.questionId === currentQuestion.id
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Next PM Book
          </h1>
          <p className="text-gray-600">
            Let's discover the perfect books for your product management journey
          </p>
        </div>

        {/* Progress Bar */}
        <QuizProgress 
          current={state.currentQuestionIndex + 1} 
          total={totalQuestions} 
        />

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <QuizQuestion
            question={currentQuestion}
            selectedAnswer={currentAnswer?.answer}
            onAnswerSelect={handleAnswerSelect}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={state.currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              state.currentQuestionIndex === 0
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-700 bg-white hover:bg-gray-50 shadow-sm'
            }`}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!currentAnswer}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              !currentAnswer
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-white bg-blue-600 hover:bg-blue-700 shadow-sm'
            }`}
          >
            {state.currentQuestionIndex === totalQuestions - 1 ? 'Get Recommendations' : 'Next'}
          </button>
        </div>

        {/* Loading State */}
        {state.isLoading && (
          <div className="mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Finding your perfect books...</p>
          </div>
        )}
      </div>
    </div>
  );
} 