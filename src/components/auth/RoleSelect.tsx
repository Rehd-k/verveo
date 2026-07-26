'use client';

import { Megaphone, Store } from 'lucide-react';
import { cn } from '@/lib/cn';

export type SignupRole = 'advertiser' | 'retailer';

interface RoleSelectProps {
  value: SignupRole;
  onChange: (role: SignupRole) => void;
}

const ROLES: {
  value: SignupRole;
  label: string;
  description: string;
  icon: typeof Megaphone;
}[] = [
  {
    value: 'advertiser',
    label: 'Advertiser',
    description: 'Launch and track QR campaigns on everyday packaging.',
    icon: Megaphone,
  },
  {
    value: 'retailer',
    label: 'Retail Partner',
    description: 'Distribute branded packs and earn from partner campaigns.',
    icon: Store,
  },
];

export function RoleSelect({ value, onChange }: RoleSelectProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-foreground">Account type</legend>
      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Account type">
        {ROLES.map((role) => {
          const selected = value === role.value;
          return (
            <button
              key={role.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(role.value)}
              className={cn(
                'min-h-11 rounded-xl border p-4 text-left transition-all',
                selected
                  ? 'border-primary/50 bg-primary/10 ring-1 ring-primary/30'
                  : 'border-border bg-card hover:bg-accent'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                    selected
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <role.icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{role.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {role.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
