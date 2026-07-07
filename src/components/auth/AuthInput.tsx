'use client';

import { useState } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';

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
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
        )}
        <input
          type={inputType}
          className={`w-full rounded-lg border bg-white/5 py-3 text-white placeholder:text-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
            Icon ? 'pl-10 pr-4' : 'px-4'
          } ${isPassword ? 'pr-11' : ''} ${
            error
              ? 'border-red-500/50 focus:border-red-500/50'
              : 'border-white/10 focus:border-primary/50'
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-white"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}
