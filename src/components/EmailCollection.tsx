'use client';

import React, { useState } from 'react';

interface EmailCollectionProps {
  onSubmit: (data: { firstName: string; email: string }) => void;
  onSkip: () => void;
}

export default function EmailCollection({ onSubmit, onSkip }: EmailCollectionProps) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ firstName: firstName.trim(), email: email.trim() });
    } catch (error) {
      console.error('Error submitting email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Stay Updated
        </h2>
        <p className="text-gray-600">
          Get notified about new book recommendations and PM resources
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
            placeholder="Enter your first name"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
            placeholder="Enter your email address"
            required
          />
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={!firstName.trim() || !email.trim() || isSubmitting}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
              !firstName.trim() || !email.trim() || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Get Updates'}
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="w-full py-3 px-6 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        We'll only send you relevant PM content. Unsubscribe anytime.
      </div>
    </div>
  );
} 