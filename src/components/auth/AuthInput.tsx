'use client';

import { useState } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

export function AuthInput({
  label,
  icon: Icon,
  error,
  type = 'text',
  className = '',
  id,
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <input
          id={inputId}
          type={inputType}
          className={cn(
            'h-11 w-full rounded-lg border bg-card py-3 text-foreground placeholder:text-muted-foreground transition-colors',
            'focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/40',
            Icon ? 'pl-10 pr-4' : 'px-4',
            isPassword && 'pr-11',
            error ? 'border-destructive/50 focus:border-destructive/50' : 'border-input',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
