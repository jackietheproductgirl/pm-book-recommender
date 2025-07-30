'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion as QuizQuestionType } from '@/data/quizData';

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedAnswer?: string | string[];
  onAnswerSelect: (answer: string | string[]) => void;
}

export default function QuizQuestion({ 
  question, 
  selectedAnswer, 
  onAnswerSelect 
}: QuizQuestionProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Initialize selected options from props
  useEffect(() => {
    if (selectedAnswer) {
      if (Array.isArray(selectedAnswer)) {
        setSelectedOptions(selectedAnswer);
      } else {
        setSelectedOptions([selectedAnswer]);
      }
    } else {
      setSelectedOptions([]);
    }
  }, [selectedAnswer]);

  const handleOptionClick = (optionValue: string) => {
    if (question.type === 'single') {
      // Single select - replace current selection
      onAnswerSelect(optionValue);
    } else {
      // Multi select - toggle selection
      const newSelectedOptions = selectedOptions.includes(optionValue)
        ? selectedOptions.filter(opt => opt !== optionValue)
        : [...selectedOptions, optionValue];
      
      // Enforce max selections
      const maxSelections = question.maxSelections || 3;
      if (newSelectedOptions.length <= maxSelections) {
        setSelectedOptions(newSelectedOptions);
        onAnswerSelect(newSelectedOptions);
      }
    }
  };

  const isOptionSelected = (optionValue: string) => {
    return selectedOptions.includes(optionValue);
  };

  const canSelectMore = () => {
    if (question.type === 'single') return true;
    const maxSelections = question.maxSelections || 3;
    return selectedOptions.length < maxSelections;
  };

  return (
    <div className="space-y-8">
      {/* Question Text */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
          {question.question}
        </h2>
        {question.type === 'multi' && (
          <p className="text-gray-600 text-sm">
            Select {question.maxSelections === 1 ? '1' : `up to ${question.maxSelections}`} option{question.maxSelections !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Answer Options */}
      <div className="space-y-4">
        {question.options.map((option) => {
          const selected = isOptionSelected(option.value);
          const disabled = question.type === 'multi' && !selected && !canSelectMore();
          
          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.value)}
              disabled={disabled}
              className={`w-full p-5 text-left rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                selected
                  ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 shadow-lg'
                  : disabled
                  ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:shadow-md'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-200 ${
                  selected
                    ? 'border-blue-500 bg-blue-500 scale-110'
                    : disabled
                    ? 'border-gray-200'
                    : 'border-gray-300'
                }`}>
                  {selected && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="font-semibold text-lg">{option.text}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selection Counter for Multi-select */}
      {question.type === 'multi' && (
        <div className="text-sm text-gray-500 text-center">
          {selectedOptions.length} of {question.maxSelections} selected
        </div>
      )}
    </div>
  );
} 