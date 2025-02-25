'use client';

import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = 'Finding your perfect match...',
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="relative">
        <motion.div
          className="w-16 h-16 border-4 border-blue-200 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute inset-0 w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
      <motion.p
        className="mt-8 text-lg font-medium text-gray-600 dark:text-gray-300"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
      <motion.div
        className="mt-4 flex space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatDelay: 0.2,
          }}
        />
        <motion.div
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatDelay: 0.2,
            delay: 0.2,
          }}
        />
        <motion.div
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatDelay: 0.2,
            delay: 0.4,
          }}
        />
      </motion.div>
    </div>
  );
}
