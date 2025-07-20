'use client';

import React from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { quizQuestions } from '@/data/quizData';
import QuizQuestion from './QuizQuestion';
import QuizProgress from './QuizProgress';
import QuizResults from './QuizResults';

export default function Quiz() {
  const { state, dispatch, completeQuiz } = useQuiz();
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

  const handleNext = async () => {
    if (state.currentQuestionIndex === totalQuestions - 1) {
      await completeQuiz();
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

  // Show results if quiz is complete
  if (state.isComplete) {
    return <QuizResults />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Find Your Next PM Book
          </h1>
          <p className="text-gray-600 text-lg">
            Let's discover the perfect books for your product management journey ✨
          </p>
        </div>

        {/* Progress Bar */}
        <QuizProgress 
          current={state.currentQuestionIndex + 1} 
          total={totalQuestions} 
        />

        {/* Question */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <QuizQuestion
            question={currentQuestion}
            selectedAnswer={currentAnswer?.answer}
            onAnswerSelect={handleAnswerSelect}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={state.currentQuestionIndex === 0}
            className={`px-6 py-4 rounded-2xl font-semibold transition-all duration-200 ${
              state.currentQuestionIndex === 0
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-700 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl border border-gray-200'
            }`}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!currentAnswer}
            className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-200 ${
              !currentAnswer
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {state.currentQuestionIndex === totalQuestions - 1 ? 'Get Recommendations' : 'Next'}
          </button>
        </div>

        {/* Loading State */}
        {state.isLoading && (
          <div className="mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 text-lg">Finding your perfect books...</p>
          </div>
        )}
      </div>
    </div>
  );
} 