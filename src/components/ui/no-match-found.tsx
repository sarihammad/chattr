'use client';

import { motion } from 'framer-motion';
import { IconMoodSad, IconRefresh } from '@tabler/icons-react';

interface NoMatchFoundProps {
  onRetry: () => void;
}

export function NoMatchFound({ onRetry }: NoMatchFoundProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
    >
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      >
        <IconMoodSad className="w-16 h-16 text-gray-400" />
      </motion.div>
      <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
        No Match Found
      </h3>
      <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-sm">
        We couldn&apos;t find anyone matching your preferences right now. Would
        you like to try again or adjust your preferences?
      </p>
      <div className="mt-8 flex space-x-4">
        <button
          onClick={onRetry}
          className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
        >
          <IconRefresh className="w-5 h-5 mr-2" />
          Try Again
        </button>
      </div>
    </motion.div>
  );
}
