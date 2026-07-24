'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Radar, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#why-verveo', label: 'Why Verveo' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#analytics', label: 'Analytics' },
  { href: '#reach', label: 'Reach' },
  { href: '/partners', label: 'For Partners' },
  { href: '#faq', label: 'FAQ' },
];

export default function LandingNav() {
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
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-background-dark/80 py-3 backdrop-blur-xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-linear-to-tr from-primary to-blue-400">
            <Radar className="size-4 text-white" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">Verveo</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-background-dark transition hover:brightness-110"
          >
            Start a Campaign
          </Link>
        </div>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-background-dark/95 px-6 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-2 text-sm text-white/70"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/dashboard"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-background-dark"
              onClick={() => setOpen(false)}
            >
              Start a Campaign
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
