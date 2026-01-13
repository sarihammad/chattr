'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart, X, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getApiUrl, getAuthHeaders } from '@/lib/api';

interface Introduction {
  candidateId: number;
  candidate: {
    username: string;
    age?: number;
    city?: string;
    country?: string;
    bio?: string;
    avatarUrl?: string;
  };
  score: number;
  signals: string[];
  reasons: string[];
  status: string;
}

export default function Introductions() {
  const { status } = useSession();
  const router = useRouter();
  const [introductions, setIntroductions] = useState<Introduction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const markAsShown = useCallback(async (candidateId: number) => {
    try {
      await fetch(`${getApiUrl()}/api/v1/introductions/${candidateId}/shown`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error marking as shown:', error);
    }
  }, []);

  const fetchIntroductions = useCallback(async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/v1/introductions`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setIntroductions(data);
        if (data.length > 0) {
          // Mark first as shown
          markAsShown(data[0].candidateId);
        }
      }
    } catch (error) {
      console.error('Error fetching introductions:', error);
    } finally {
      setLoading(false);
    }
  }, [markAsShown]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchIntroductions();
    }
  }, [status, router, fetchIntroductions]);

  const handleAccept = async () => {
    if (processing || currentIndex >= introductions.length) return;
    
    setProcessing(true);
    const intro = introductions[currentIndex];
    
    try {
      const response = await fetch(
        `${getApiUrl()}/api/v1/introductions/${intro.candidateId}/accept`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );
      
      if (response.ok) {
        // Move to next introduction
        if (currentIndex < introductions.length - 1) {
          const nextIntro = introductions[currentIndex + 1];
          markAsShown(nextIntro.candidateId);
          setCurrentIndex(currentIndex + 1);
        } else {
          // No more introductions
          setIntroductions([]);
        }
      }
    } catch (error) {
      console.error('Error accepting introduction:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handlePass = async () => {
    if (processing || currentIndex >= introductions.length) return;
    
    setProcessing(true);
    const intro = introductions[currentIndex];
    
    try {
      const response = await fetch(
        `${getApiUrl()}/api/v1/introductions/${intro.candidateId}/pass`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );
      
      if (response.ok) {
        // Move to next introduction
        if (currentIndex < introductions.length - 1) {
          const nextIntro = introductions[currentIndex + 1];
          markAsShown(nextIntro.candidateId);
          setCurrentIndex(currentIndex + 1);
        } else {
          // No more introductions
          setIntroductions([]);
        }
      }
    } catch (error) {
      console.error('Error passing introduction:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (introductions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No introductions today</h2>
          <p className="text-gray-600 mb-6">
            You&apos;ve seen all of today&apos;s introductions. Check back tomorrow for new matches.
          </p>
          <button
            onClick={() => router.push('/matches')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
          >
            <span>View your matches</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  const currentIntro = introductions[currentIndex];
  const compatibilityPercent = Math.round((currentIntro.score || 0) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Introductions</h1>
              <p className="text-sm text-gray-500">
                {currentIndex + 1} of {introductions.length} today
              </p>
            </div>
            <button
              onClick={() => router.push('/matches')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              View matches
            </button>
          </div>
        </div>
      </div>

      {/* Introduction Card */}
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Photo placeholder */}
          <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
            {currentIntro.candidate.avatarUrl ? (
              <Image
                src={currentIntro.candidate.avatarUrl}
                alt={currentIntro.candidate.username}
                fill
                className="object-cover"
              />
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-semibold text-rose-500">
                    {currentIntro.candidate.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">No photo</p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 space-y-6">
            {/* Name and location */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                {currentIntro.candidate.username}
              </h2>
              <p className="text-gray-600">
                {currentIntro.candidate.age && `${currentIntro.candidate.age} • `}
                {currentIntro.candidate.city && `${currentIntro.candidate.city}`}
                {currentIntro.candidate.country && `, ${currentIntro.candidate.country}`}
              </p>
            </div>

            {/* Compatibility score (subtle) */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>{compatibilityPercent}% compatible</span>
            </div>

            {/* Match reasons */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Why this match
              </h3>
              <div className="space-y-2">
                {currentIntro.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-rose-500 mt-2" />
                    <p className="text-gray-700 text-sm leading-relaxed">{reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shared signals */}
            {currentIntro.signals.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Shared values
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentIntro.signals.map((signal, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-sm"
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {currentIntro.candidate.bio && (
              <div>
                <p className="text-gray-700 leading-relaxed">{currentIntro.candidate.bio}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePass}
                disabled={processing}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
                <span className="font-medium">Pass</span>
              </button>
              <button
                onClick={handleAccept}
                disabled={processing}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Heart className="h-5 w-5" />
                <span className="font-medium">Accept</span>
              </button>
            </div>
            {processing && (
              <div className="mt-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin text-rose-500 mx-auto" />
              </div>
            )}
          </div>
        </div>

        {/* Helper text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>When you both accept, a conversation will open.</p>
        </div>
      </div>
    </div>
  );
}
