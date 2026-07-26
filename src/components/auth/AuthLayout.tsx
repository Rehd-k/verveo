'use client';

import Link from 'next/link';
import { ArrowLeft, Radar, ScanLine, MapPin, BarChart3 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const FEATURES = [
  {
    icon: MapPin,
    title: 'Target local markets',
    description: 'Pick cities and venue types where your audience eats and shops.',
  },
  {
    icon: ScanLine,
    title: 'QR-powered tracking',
    description: 'Every pack becomes a measurable scan and conversion channel.',
  },
  {
    icon: BarChart3,
    title: 'Live campaign analytics',
    description: 'Watch impressions, scans, and spend from one dashboard.',
  },
];

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand panel — always dark for brand atmosphere */}
        <div className="relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between dark">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(25,93,230,0.35),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(25,93,230,0.15),transparent_55%)]" />
          <div className="absolute inset-0 bg-linear-to-br from-[#0f1115] via-[#12151c] to-black" />
          <div className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-10 p-10 xl:p-14">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-flex w-fit items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
              >
                <ArrowLeft className="size-4" />
                Back to home
              </Link>
              <ThemeToggle compact />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-linear-to-tr from-primary to-blue-400 shadow-lg shadow-primary/25">
                  <Radar className="size-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight">Verveo</p>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                    Physical ads, digital precision
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="max-w-md text-3xl font-bold leading-tight xl:text-4xl">
                  Turn everyday packaging into{' '}
                  <span className="bg-linear-to-r from-primary via-white to-primary bg-clip-text text-transparent">
                    performance media
                  </span>
                </h1>
                <p className="max-w-md text-sm leading-relaxed text-white/70">
                  Launch QR-tracked campaigns on cups, boxes, and bags — then measure every scan in
                  real time.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{feature.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/60">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 px-10 py-6 xl:px-14">
            <div className="flex flex-wrap gap-6 text-xs text-white/60">
              <div>
                <p className="text-base font-bold text-white">50K+</p>
                <p>Daily packs distributed</p>
              </div>
              <div>
                <p className="text-base font-bold text-white">3x</p>
                <p>Average scan uplift</p>
              </div>
              <div>
                <p className="text-base font-bold text-white">Realtime</p>
                <p>Campaign analytics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center px-4 py-10 sm:px-10 lg:px-14 xl:px-20">
          <div className="mb-8 flex items-start justify-between gap-4 lg:hidden">
            <div>
              <Link
                href="/"
                className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Back to home
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-tr from-primary to-blue-400">
                  <Radar className="size-5 text-primary-foreground" />
                </div>
                <p className="text-lg font-bold">Verveo</p>
              </div>
            </div>
            <ThemeToggle compact />
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 hidden justify-end lg:flex">
              <ThemeToggle compact />
            </div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
