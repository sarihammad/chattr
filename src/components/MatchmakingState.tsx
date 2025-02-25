import { motion, AnimatePresence } from 'framer-motion';
import { LoadingState } from './ui/loading-state';
import { NoMatchFound } from './ui/no-match-found';
import { MatchFound } from './ui/match-found';
import { MatchmakingForm } from './MatchmakingForm';

export type MatchmakingPreferences = {
  gender: string;
  purpose: string;
  minAge?: number;
  maxAge?: number;
};

export type MatchStatus = 'idle' | 'searching' | 'not-found' | 'found';

interface MatchmakingStateProps {
  status: MatchStatus;
  onSubmit: (preferences: MatchmakingPreferences) => Promise<void>;
  onRetry: () => void;
  onStartChat: () => void;
}

export function MatchmakingState({
  status,
  onSubmit,
  onRetry,
  onStartChat,
}: MatchmakingStateProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto"
      >
        {status === 'idle' && (
          <MatchmakingForm onSubmit={onSubmit} isLoading={false} />
        )}
        {status === 'searching' && (
          <LoadingState message="Finding your perfect match..." />
        )}
        {status === 'not-found' && <NoMatchFound onRetry={onRetry} />}
        {status === 'found' && <MatchFound onStartChat={onStartChat} />}
      </motion.div>
    </AnimatePresence>
  );
}
