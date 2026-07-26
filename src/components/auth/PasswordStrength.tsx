'use client';

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string) {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-destructive' };
  if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-warning' };
  return { score: 3, label: 'Strong', color: 'bg-success' };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const { score, label, color } = getStrength(password);

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={3} aria-label={`Password strength: ${label}`}>
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              level <= score ? color : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: <span className="font-medium text-foreground">{label}</span>
      </p>
    </div>
  );
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-zA-Z]/.test(password)) return 'Password must include a letter';
  if (!/\d/.test(password)) return 'Password must include a number';
  return null;
}
