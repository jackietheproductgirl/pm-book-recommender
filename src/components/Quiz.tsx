'use client';

import React from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { quizQuestions } from '@/data/quizData';
import QuizQuestion from './QuizQuestion';
import QuizProgress from './QuizProgress';
import BookRecommendation from './BookRecommendation';
import EmailCollection from './EmailCollection';

export default function Quiz() {
  const { state, dispatch, completeQuiz, submitEmail, skipEmail } = useQuiz();
  const currentQuestion = quizQuestions[state.currentQuestionIndex];
  const totalQuestions = quizQuestions.length;

  const handleAnswerSelect = (answer: string | string[]) => {
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
      completeQuiz();
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

  // Check if current question is answered (for both single and multi-select)
  const isQuestionAnswered = () => {
    if (!currentAnswer) return false;
    
    if (currentQuestion.type === 'single') {
      return typeof currentAnswer.answer === 'string' && currentAnswer.answer.length > 0;
    } else {
      return Array.isArray(currentAnswer.answer) && currentAnswer.answer.length > 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 py-8 px-4">
      <div className={`mx-auto ${!state.isComplete ? 'max-w-md' : 'max-w-2xl'}`}>
        {/* Header - Only show on quiz, not on results */}
        {!state.isComplete && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Find Your Next PM Book
            </h1>
            <p className="text-gray-600">
              Let's discover the perfect books for your product management journey
            </p>
          </div>
        )}

        {/* Show Quiz OR Recommendations, not both */}
        {!state.isComplete ? (
          <>
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
                disabled={!isQuestionAnswered()}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  !isQuestionAnswered()
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-white bg-brand-600 hover:bg-brand-700 shadow-sm'
                }`}
              >
                {state.currentQuestionIndex === totalQuestions - 1 ? 'Get Recommendations' : 'Next'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Loading State */}
            {state.isLoading && (
              <div className="mt-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                <p className="mt-2 text-gray-600">Finding your perfect books...</p>
              </div>
            )}

            {/* Recommendations */}
            {state.recommendations.length > 0 && !state.showEmailCollection && (
              <div className="mt-8">
                <div className="text-center mb-8">
                  {/* Success Checkmark */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Your Personalized Book Recommendations
                  </h2>
                  <p className="text-lg text-gray-700 mb-2">
                    Based on your answers, here are the top 5 books to accelerate your product management journey 🚀
                  </p>
                  <p className="text-gray-700 mb-4">
                    Each recommendation is tailored to your experience level and learning goals
                  </p>
                  
                  {/* Email Collection Prompt */}
                  <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Want more recommendations?
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Get personalized book updates and PM resources delivered to your inbox.
                    </p>
                    <button
                      onClick={() => dispatch({ type: 'SHOW_EMAIL_COLLECTION' })}
                      className="px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
                    >
                      Get Updates
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {state.recommendations.map((book, index) => (
                    <BookRecommendation key={book.id} book={book} index={index} />
                  ))}
                </div>

                {/* Restart Quiz Button */}
                <div className="mt-8 text-center">
                  <button
                    onClick={() => dispatch({ type: 'RESET_QUIZ' })}
                    className="px-8 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Take Quiz Again
                  </button>
                </div>
              </div>
            )}

            {/* Email Collection */}
            {state.showEmailCollection && (
              <div className="mt-8">
                <EmailCollection
                  onSubmit={submitEmail}
                  onSkip={skipEmail}
                />
              </div>
            )}

            {/* Success Message After Email Submission */}
            {state.emailSubmitted && (
              <div className="mt-8 text-center">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Thanks for subscribing!
                  </h3>
                  <p className="text-gray-700 mb-4">
                    You'll receive our latest PM book recommendations and resources.
                  </p>
                  <button
                    onClick={() => dispatch({ type: 'RESET_QUIZ' })}
                    className="px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
                  >
                    Take Quiz Again
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 