'use client';

import React from 'react';

interface QuizProgressProps {
  current: number;
  total: number;
}

export default function QuizProgress({ current, total }: QuizProgressProps) {
  const progressPercentage = (current / total) * 100;

  return (
    <div className="mb-8">
      {/* Progress Text */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-700">
          Question {current} of {total}
        </span>
        <span className="text-sm font-medium text-gray-600">
          {Math.round(progressPercentage)}% complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
} 