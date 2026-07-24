import Link from 'next/link';
import ScrollReveal from '@/components/landing/ScrollReveal';

export default function PartnersHero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 pt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(25,93,230,0.24),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_50%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <ScrollReveal>
          <div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Retail partner program
            </div>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
              Earn more from the packaging your customers already use.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              Verveo connects food venues, cafes, bakeries, and quick-service restaurants with national
              brand campaigns across Nigeria. Receive branded packs, distribute them naturally, upload
              proof, and grow a new revenue line from everyday operations.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/auth/signup?role=retailer" className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
                Apply to Partner
              </Link>
              <a href="#how-it-works" className="rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-semibold text-white/90 transition hover:border-white/40">
                See how it works
              </a>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <div className="rounded-3xl border border-white/10 bg-card-dark/70 p-6 backdrop-blur">
            <div className="grid gap-4">
              {[
                ['Extra revenue', 'Earn from approved branded pack distribution.'],
                ['Simple operations', 'Use packs as part of normal customer service.'],
                ['Proof rewards', 'Upload photos to keep campaigns verified.'],
                ['Nationwide brands', 'Work with advertisers targeting your city.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-background-dark/70 p-5">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-2 text-sm text-text-secondary">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
