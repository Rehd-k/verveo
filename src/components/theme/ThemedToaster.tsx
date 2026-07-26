'use client';

import { useTheme } from 'next-themes';
import { Toaster as HotToaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme === 'dark';

  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        style: {
          background: isDark ? '#1c1f26' : '#ffffff',
          color: isDark ? '#f4f5f7' : '#0f1115',
          border: isDark
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid #d8dde8',
        },
      }}
    />
  );
}
