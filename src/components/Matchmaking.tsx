import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface MatchmakingProps {
  userId: string;
  onMatch: (matchId: string) => void;
}

type Purpose = 'casual' | 'friendship' | 'romantic';
type Gender = 'male' | 'female' | 'other';

interface PreferenceState {
  purpose: Purpose;
  gender?: Gender;
}

export default function Matchmaking({ userId, onMatch }: MatchmakingProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [preferences, setPreferences] = useState<PreferenceState>({
    purpose: 'casual',
  });
  const [socket, setSocket] = useState<Socket | null>(null);
  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    const newSocket = io(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
      {
        auth: {
          token: localStorage.getItem('token'),
        },
      }
    );

    newSocket.on('connect', () => {
      console.log('Connected to matchmaking server');
    });

    newSocket.on('match-found', (matchId: string) => {
      setIsSearching(false);
      onMatch(matchId);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [onMatch]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTime((prev) => prev + 1);
      }, 1000);
    } else {
      setSearchTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isSearching]);

  const startSearching = () => {
    if (!socket) return;

    setIsSearching(true);
    socket.emit('start-matchmaking', {
      userId,
      preferences,
    });
  };

  const stopSearching = () => {
    if (!socket) return;

    setIsSearching(false);
    socket.emit('stop-matchmaking', { userId });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Find a Chat Partner
      </h2>

      {/* Preferences Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            I want to...
          </label>
          <select
            value={preferences.purpose}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                purpose: e.target.value as Purpose,
              }))
            }
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            disabled={isSearching}
          >
            <option value="casual">Have a Casual Chat</option>
            <option value="friendship">Find a Friend</option>
            <option value="romantic">Find a Romantic Partner</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Gender (Optional)
          </label>
          <select
            value={preferences.gender || ''}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                gender: (e.target.value as Gender) || undefined,
              }))
            }
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            disabled={isSearching}
          >
            <option value="">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Search Status */}
      {isSearching && (
        <div className="text-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Searching for {preferences.gender || 'anyone'} for{' '}
            {preferences.purpose} chat...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Time elapsed: {formatTime(searchTime)}
          </p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={isSearching ? stopSearching : startSearching}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          isSearching
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isSearching ? 'Cancel Search' : 'Start Searching'}
      </button>

      {/* Tips */}
      <div className="mt-6 text-sm text-gray-500">
        <h3 className="font-medium mb-2">Tips:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Be respectful to your chat partner</li>
          <li>Don't share personal information</li>
          <li>Report inappropriate behavior</li>
        </ul>
      </div>
    </div>
  );
}
