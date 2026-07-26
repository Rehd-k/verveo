'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, Radar, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const LINKS = [
  { href: '#benefits', label: 'Benefits' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#requirements', label: 'Requirements' },
  { href: '#partner-faq', label: 'FAQ' },
];

export default function PartnersNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled
          ? 'border-b border-border bg-background py-3 text-foreground'
          : 'py-5 text-foreground'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-tr from-primary to-blue-400">
            <Radar className="size-5 text-primary-foreground" />
          </div>
          <span className="font-display truncate text-lg font-bold">Verveo Partners</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            For Advertisers
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle compact />
          <Link
            href="/auth/signup?role=retailer"
            className="inline-flex min-h-10 items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Apply to Partner
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle compact />
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-lg border border-border bg-card"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/"
              className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              For Advertisers
            </Link>
            <Link
              href="/auth/signup?role=retailer"
              className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              onClick={() => setOpen(false)}
            >
              Apply to Partner
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
