'use client';

import { Menu } from 'lucide-react';

interface RetailerPageHeaderProps {
  title: string;
  description?: string;
  onMenuClick?: () => void;
}

export default function RetailerPageHeader({
  title,
  description,
  onMenuClick,
}: RetailerPageHeaderProps) {
  return (
    <div className="border-b border-border bg-background px-4 py-4 md:px-8 md:py-6">
      <div className="flex items-start gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="mt-0.5 flex size-9 items-center justify-center rounded-lg border border-border bg-card text-foreground md:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
