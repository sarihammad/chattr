'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { motion } from 'framer-motion';
import { Chat } from '@/components/Chat';
import { LoadingState } from '@/components/ui/loading-state';
import {
  MatchmakingState,
  MatchStatus,
  MatchmakingPreferences,
} from '@/components/MatchmakingState';

export default function ChatPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  const [matchId, setMatchId] = useState<string | null>(null);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('idle');

  const handleMatchmaking = async (preferences: MatchmakingPreferences) => {
    if (!session?.user) return;

    setMatchStatus('searching');
    try {
      const response = await fetch('/api/matchmaking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to find match');
      }

      const data = await response.json();

      if (data.roomId) {
        setMatchId(data.roomId);
        setMatchStatus('found');
      } else {
        setMatchStatus('not-found');
      }
    } catch (error) {
      console.error('Matchmaking error:', error);
      setMatchStatus('not-found');
    }
  };

  const handleLeaveChat = async () => {
    if (matchId) {
      try {
        await fetch('/api/matchmaking', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roomId: matchId }),
        });
      } catch (error) {
        console.error('Error leaving chat:', error);
      }
    }
    setMatchId(null);
    setMatchStatus('idle');
  };

  const handleRetryMatch = () => {
    setMatchStatus('idle');
  };

  const handleStartChat = () => {
    setMatchStatus('idle');
  };

  if (status === 'loading') {
    return <LoadingState message="Loading..." />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {matchId ? 'Chat Room' : 'Find a Chat Partner'}
            </h1>
            {session?.user?.image && (
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-10 h-10 rounded-full ring-2 ring-blue-500"
              />
            )}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-300"
          >
            {matchId
              ? 'You are now chatting with someone'
              : 'Connect with people around the world instantly'}
          </motion.p>
        </header>

        {matchId ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Chat
              roomId={matchId}
              userId={session.user.id}
              onClose={handleLeaveChat}
            />
          </motion.div>
        ) : (
          <MatchmakingState
            status={matchStatus}
            onSubmit={handleMatchmaking}
            onRetry={handleRetryMatch}
            onStartChat={handleStartChat}
          />
        )}
      </div>
    </main>
  );
}
