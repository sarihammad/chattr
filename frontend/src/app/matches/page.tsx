'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { MessageCircle, Heart, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getApiUrl, getAuthHeaders } from '@/lib/api';
import Link from 'next/link';

interface Match {
  matchId: number;
  otherUser: {
    username: string;
    age?: number;
    city?: string;
    country?: string;
    bio?: string;
    avatarUrl?: string;
  };
  matchedAt: string;
  roomId: string;
}

export default function Matches() {
  const { status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchMatches();
    }
  }, [status, router]);

  const fetchMatches = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/v1/matches`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your matches</h1>
              <p className="text-sm text-gray-500">
                {matches.length} active {matches.length === 1 ? 'conversation' : 'conversations'}
              </p>
            </div>
            <Link
              href="/introductions"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              View introductions
            </Link>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {matches.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No matches yet</h2>
            <p className="text-gray-600 mb-6">
              When you and someone both accept an introduction, you&apos;ll see them here.
            </p>
            <Link
              href="/introductions"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              <span>View introductions</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match) => (
              <Link
                key={match.matchId}
                href={`/chat/${match.roomId}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {match.otherUser.avatarUrl ? (
                      <Image
                        src={match.otherUser.avatarUrl}
                        alt={match.otherUser.username}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
                        <span className="text-xl font-semibold text-rose-500">
                          {match.otherUser.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {match.otherUser.username}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {match.otherUser.age && `${match.otherUser.age} • `}
                      {match.otherUser.city && match.otherUser.city}
                      {match.otherUser.country && `, ${match.otherUser.country}`}
                    </p>
                    {match.otherUser.bio && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {match.otherUser.bio}
                      </p>
                    )}
                    <div className="mt-3 flex items-center space-x-2 text-sm text-rose-500">
                      <MessageCircle className="h-4 w-4" />
                      <span>Open conversation</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quality cue */}
        {matches.length > 0 && matches.length < 3 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> We cap active conversations to help you focus. Try a thoughtful opener to make each connection count.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

