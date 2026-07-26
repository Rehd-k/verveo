import Link from 'next/link';
import ScrollReveal from './ScrollReveal';

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(25,93,230,0.25),transparent_60%)]" />
      <ScrollReveal>
        <div className="relative mx-auto max-w-4xl rounded-3xl border border-border bg-linear-to-br from-card-dark via-background to-black p-10 text-center md:p-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/90">
            Ready to launch?
          </p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl md:text-5xl">
            Your next campaign starts on{' '}
            <span className="bg-linear-to-r from-primary via-white to-primary bg-clip-text text-transparent">
              everyday packaging
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground sm:text-base">
            Target cities across Nigeria, design your packs, generate trackable QR codes, and watch
            performance roll in — all from one dashboard.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_rgba(25,93,230,0.25)] transition hover:brightness-110"
            >
              Start a Campaign
            </Link>
            <Link
              href="/auth/signup?role=advertiser"
              className="inline-flex items-center justify-center rounded-full border border-border bg-accent px-8 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition hover:border-border"
            >
              Create Advertiser Account
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
