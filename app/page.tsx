import HeroAnimationsClient from '@/components/HeroAnimationsClient';
import SocialTicker from '@/components/SocialTicker';
import LandingNav from '@/components/landing/LandingNav';
import ProblemSection from '@/components/landing/ProblemSection';
import AdvertiserBenefits from '@/components/landing/AdvertiserBenefits';
import ComparisonSection from '@/components/landing/ComparisonSection';
import AnalyticsShowcase from '@/components/landing/AnalyticsShowcase';
import PackagingSection from '@/components/landing/PackagingSection';
import NationwideReach from '@/components/landing/NationwideReach';
import ROISection from '@/components/landing/ROISection';
import TestimonialsCarousel from '@/components/landing/TestimonialsCarousel';
import FAQSection from '@/components/landing/FAQSection';
import FinalCTA from '@/components/landing/FinalCTA';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <LandingNav />

      {/* HERO — intentionally dark over video for contrast in both themes */}
      <section className="relative flex min-h-svh items-center justify-center overflow-hidden text-white">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/0201.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/80 via-black/70 to-background/95" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_55%),radial-gradient(circle_at_bottom,rgba(0,0,0,0.9),transparent_60%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-20 text-center sm:px-6">
          {/* <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1 text-xs font-medium uppercase tracking-[0.24em] text-white/60 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary landing-glow" />
            Physical media, digital intelligence
          </div> */}

          <h1 className="font-display text-4xl leading-tight sm:text-5xl md:text-6xl md:leading-[1.05]">
            Physical Advertising.
            <br />
            <span className="bg-linear-to-r from-primary via-white to-primary bg-clip-text text-transparent">
              Digital Precision.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-balance text-sm text-white/70 sm:text-base md:text-lg">
            Place your brand in the hands of{' '}
            <span className="font-semibold text-white">50,000 customers daily across Nigeria</span>.
            Cups, boxes, and bags that become measurable, QR-powered performance channels.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition hover:translate-y-0.5 hover:brightness-110"
            >
              Start a Campaign
            </a>
            <a
              href="/auth/signup?role=retailer"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 bg-black/30 px-7 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10"
            >
              Become a Retail Partner
            </a>
          </div>
        </div>
      </section>

      <SocialTicker />

      <ProblemSection />

      <section
        id="how-it-works"
        className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-20 sm:px-6 md:py-28"
      >
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl md:text-4xl">
            From street to dashboard in three precise steps.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            Pick your target cities across Nigeria, wrap everyday packaging with your brand, and watch
            real-time dashboards light up as customers scan, redeem, and convert.
          </p>
        </div>

        <div className="relative min-h-[120vh] space-y-24 overflow-x-hidden pb-32">
          <HeroAnimationsClient />
        </div>
      </section>

      <AdvertiserBenefits />
      <ComparisonSection />
      <AnalyticsShowcase />
      <PackagingSection />
      <NationwideReach />
      <ROISection />
      <TestimonialsCarousel />
      <FAQSection />
      <FinalCTA />
      <LandingFooter />
    </main>
  );
}
