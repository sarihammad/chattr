'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import {
  IconGenderFemale,
  IconGenderMale,
  IconHeart,
  IconFriends,
  IconBriefcase,
} from '@tabler/icons-react';

interface MatchmakingFormProps {
  onSubmit: (preferences: {
    gender: string;
    purpose: string;
    minAge?: number;
    maxAge?: number;
  }) => void;
  isLoading: boolean;
}

export function MatchmakingForm({ onSubmit, isLoading }: MatchmakingFormProps) {
  const [gender, setGender] = useState('any');
  const [purpose, setPurpose] = useState('friendship');
  const [ageRange, setAgeRange] = useState({ min: 18, max: 99 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      gender,
      purpose,
      minAge: ageRange.min,
      maxAge: ageRange.max,
    });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">
          I want to chat with:
        </label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'male', label: 'Men', icon: <IconGenderMale /> },
            { value: 'female', label: 'Women', icon: <IconGenderFemale /> },
            { value: 'any', label: 'Anyone', icon: <IconFriends /> },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setGender(option.value)}
              className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                gender === option.value
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 ring-2 ring-blue-500'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {option.icon}
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">
          Chat Purpose:
        </label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'friendship', label: 'Friendship', icon: <IconFriends /> },
            { value: 'dating', label: 'Dating', icon: <IconHeart /> },
            {
              value: 'networking',
              label: 'Networking',
              icon: <IconBriefcase />,
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPurpose(option.value)}
              className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                purpose === option.value
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 ring-2 ring-blue-500'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {option.icon}
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">
          Age Range: {ageRange.min} - {ageRange.max}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Minimum Age
            </label>
            <input
              type="range"
              min="18"
              max="99"
              value={ageRange.min}
              onChange={(e) =>
                setAgeRange((prev) => ({
                  ...prev,
                  min: Math.min(parseInt(e.target.value), ageRange.max),
                }))
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Maximum Age
            </label>
            <input
              type="range"
              min="18"
              max="99"
              value={ageRange.max}
              onChange={(e) =>
                setAgeRange((prev) => ({
                  ...prev,
                  max: Math.max(parseInt(e.target.value), ageRange.min),
                }))
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-6 text-lg font-semibold"
      >
        Find Match
      </Button>
    </motion.form>
  );
}
