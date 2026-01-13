'use client';

import { useState, useEffect } from 'react';
import { getUser, getAuthToken, logout as logoutUser } from '@/lib/auth';

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

/**
 * Hook to get authentication state from Spring Boot JWT
 * Replaces NextAuth's useSession hook
 */
export function useAuth(): AuthSession {
  const [session, setSession] = useState<AuthSession>({
    user: null,
    status: 'loading',
  });

  useEffect(() => {
    const token = getAuthToken();
    const user = getUser();

    if (token && user) {
      setSession({
        user,
        status: 'authenticated',
      });
    } else {
      setSession({
        user: null,
        status: 'unauthenticated',
      });
    }
  }, []);

  return session;
}

export function useSession() {
  const auth = useAuth();
  return {
    data: auth.user ? { user: auth.user } : null,
    status: auth.status,
  };
}

export function signOut(options?: { callbackUrl?: string }) {
  logoutUser();
  if (typeof window !== 'undefined') {
    const redirectUrl = options?.callbackUrl || '/login';
    window.location.href = redirectUrl;
  }
}

