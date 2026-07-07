'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, Radar, X } from 'lucide-react';

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
    <header className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? 'border-b border-white/10 bg-background-dark/80 py-3 backdrop-blur-xl' : 'py-5'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-linear-to-tr from-primary to-blue-400">
            <Radar className="size-4" />
          </div>
          <span className="font-display text-lg font-bold">Addizi Partners</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-white/60 hover:text-white">
              {link.label}
            </a>
          ))}
          <Link href="/" className="text-sm text-white/60 hover:text-white">
            For Advertisers
          </Link>
        </nav>

        <Link href="/auth/signup?role=retailer" className="hidden rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white md:inline-flex">
          Apply to Partner
        </Link>

        <button type="button" className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-background-dark/95 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href} className="py-2 text-sm text-white/70" onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <Link href="/" className="py-2 text-sm text-white/70" onClick={() => setOpen(false)}>
              For Advertisers
            </Link>
            <Link href="/auth/signup?role=retailer" className="mt-2 rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white" onClick={() => setOpen(false)}>
              Apply to Partner
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
