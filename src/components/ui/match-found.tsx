'use client';

import { motion } from 'framer-motion';
import { IconHeart, IconMessage } from '@tabler/icons-react';

interface MatchFoundProps {
  onStartChat: () => void;
}

export function MatchFound({ onStartChat }: MatchFoundProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
    >
      <div className="relative">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full blur-xl opacity-25"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="relative"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <IconHeart className="w-16 h-16 text-pink-500" />
        </motion.div>
      </div>
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-xl font-semibold text-gray-900 dark:text-white"
      >
        Match Found!
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-2 text-gray-600 dark:text-gray-300 max-w-sm"
      >
        We&apos;ve found someone who matches your preferences. Start chatting
        now!
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <button
          onClick={onStartChat}
          className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105"
        >
          <IconMessage className="w-5 h-5 mr-2" />
          Start Chatting
        </button>
      </motion.div>
    </motion.div>
  );
}
