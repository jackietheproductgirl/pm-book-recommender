'use client';

import React from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import BookRecommendation from './BookRecommendation';

export default function QuizResults() {
  const { state, dispatch } = useQuiz();

  const handleRetakeQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-6 shadow-lg">
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Personalized Book Recommendations
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Based on your answers, here are the top 5 books to accelerate your product management journey 🚀
          </p>
          <p className="text-gray-500">
            Each recommendation is tailored to your experience level and learning goals
          </p>
        </div>

        {/* Recommendations */}
        <div className="space-y-6">
          {state.recommendations.map((book, index) => (
            <BookRecommendation key={book.id} book={book} index={index} />
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to start reading? 📚
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              Pick the book that resonates most with your current goals and start your learning journey today!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRetakeQuiz}
                className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Retake Quiz
              </button>
              
              <a
                href="https://twitter.com/intent/tweet?text=Just got personalized PM book recommendations! Check out this awesome tool:"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
                Share Results
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 