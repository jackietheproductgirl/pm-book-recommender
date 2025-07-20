'use client';

import React from 'react';
import { QuizQuestion as QuizQuestionType } from '@/data/quizData';

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedAnswer?: string;
  onAnswerSelect: (answer: string) => void;
}

export default function QuizQuestion({ 
  question, 
  selectedAnswer, 
  onAnswerSelect 
}: QuizQuestionProps) {
  return (
    <div className="space-y-8">
      {/* Question Text */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
          {question.question}
        </h2>
      </div>

      {/* Answer Options */}
      <div className="space-y-4">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onAnswerSelect(option.value)}
            className={`w-full p-5 text-left rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
              selectedAnswer === option.value
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 shadow-lg'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:shadow-md'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-200 ${
                selectedAnswer === option.value
                  ? 'border-blue-500 bg-blue-500 scale-110'
                  : 'border-gray-300'
              }`}>
                {selectedAnswer === option.value && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                )}
              </div>
              <span className="font-semibold text-lg">{option.text}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 