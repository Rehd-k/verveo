'use client';

import { useEffect } from 'react';
import { useAuth } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuth((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
