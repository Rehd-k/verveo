import HeroAnimationsClient from '@/components/HeroAnimationsClient';
import SocialTicker from '@/components/SocialTicker';

export default function Home() {
  return (
    <main className="min-h-screen bg-background-dark text-white">
      {/* HERO */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Video background */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/0201.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Gradient + vignette overlay */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/80 via-black/70 to-background-dark/95" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_55%),radial-gradient(circle_at_bottom,rgba(0,0,0,0.9),transparent_60%)]" />

        {/* Content */}
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1 text-xs font-medium uppercase tracking-[0.24em] text-white/60 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Physical media, digital intelligence
          </div>

          <h1 className="font-display text-4xl leading-tight sm:text-5xl md:text-6xl md:leading-[1.05]">
            Physical Advertising.
            <br />
            <span className="bg-linear-to-r from-primary via-white to-primary bg-clip-text text-transparent">
              Digital Precision.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-balance text-sm text-white/70 sm:text-base md:text-lg">
            Place your brand in the hands of{' '}
            <span className="font-semibold text-white">50,000 customers daily</span>. Lunch-hour cups and boxes
            that turn into measurable, QR-powered performance channels.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-background-dark shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition hover:translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80"
            >
              Start a Campaign
            </a>
            <a
              href="/auth/signup?role=retailer"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/30 px-7 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:border-white/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Become a Retail Partner
            </a>
          </div>

          {/* Micro metrics */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-white/60 sm:text-sm">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-sm font-semibold text-white sm:text-base">50K+</span>
              <span>Daily packs in Lagos</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-sm font-semibold text-white sm:text-base">3x</span>
              <span>Average scan-through uplift</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-sm font-semibold text-white sm:text-base">Realtime</span>
              <span>QR & redemption analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF TICKER */}
      <SocialTicker />

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20 md:py-28"
      >
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/90">How it works</p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl md:text-4xl">
            From street to dashboard in three precise steps.
          </h2>
          <p className="mt-4 text-sm text-white/70 sm:text-base">
            Pick your Lagos zones, wrap everyday packaging with your brand, and watch real-time dashboards light up
            as customers scan, redeem and convert.
          </p>
        </div>

        <div className="relative min-h-[120vh] space-y-24 pb-32">
          <HeroAnimationsClient />
        </div>
      </section>
    </main>
  );
}
