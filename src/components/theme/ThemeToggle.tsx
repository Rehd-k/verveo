'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/cn';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          'inline-flex h-9 items-center rounded-lg border border-border bg-muted',
          compact ? 'w-9 justify-center' : 'gap-1 p-1',
          className
        )}
        aria-hidden
      />
    );
  }

  if (compact) {
    const next =
      theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    const Current =
      theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
    return (
      <button
        type="button"
        onClick={() => setTheme(next)}
        className={cn(
          'inline-flex size-9 items-center justify-center rounded-lg border border-border bg-popover text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
          className
        )}
        aria-label={`Theme: ${theme}. Click to switch to ${next}`}
        title={`Theme: ${theme}`}
      >
        <Current className="size-4" />
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted p-1',
        className
      )}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
              active
                ? 'bg-popover text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-pressed={active}
            aria-label={label}
            title={label}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
