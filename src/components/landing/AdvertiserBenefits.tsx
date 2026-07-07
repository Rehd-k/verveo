import {
  Clock,
  MapPin,
  ScanLine,
  BarChart3,
  Zap,
  ShieldCheck,
  Palette,
  TrendingUp,
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import SectionHeader from './SectionHeader';

const BENEFITS = [
  {
    icon: Clock,
    title: '15–30 minutes of dwell time',
    description:
      'A coffee cup or food box stays in your customer\'s hands for the entire meal. That\'s sustained attention no roadside billboard can guarantee — your brand travels with them.',
  },
  {
    icon: MapPin,
    title: 'Geo-precision across Nigeria',
    description:
      'Select cities like Abuja, Enugu, Port Harcourt, Kano, and Ibadan. Filter by venue type — fast food, cafés, bakeries — and reach people exactly where they eat.',
  },
  {
    icon: ScanLine,
    title: 'Every pack is a trackable ad unit',
    description:
      'Each package carries a unique QR code linked to your CTA. When someone scans, you capture device, time, and location — turning physical media into a performance channel.',
  },
  {
    icon: BarChart3,
    title: 'Live campaign analytics',
    description:
      'Watch impressions, scans, spend, and conversion trends update in real time. No waiting for monthly reports from an agency — your dashboard tells the truth instantly.',
  },
  {
    icon: Zap,
    title: 'Launch in days, not months',
    description:
      'Design your packaging, pick your zones, set your quantity, and go live. Skip the months-long OOH procurement cycle and start reaching customers this week.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent unit economics',
    description:
      'Know your cost per pack before you commit. Cups from ₦85, boxes from ₦120 — clear pricing with no hidden production fees or surprise media markups.',
  },
  {
    icon: Palette,
    title: 'In-browser design studio',
    description:
      'Upload your artwork or build creative directly in the platform. Preview your branded packaging in 3D before a single pack is printed.',
  },
  {
    icon: TrendingUp,
    title: '3x average scan-through uplift',
    description:
      'Physical packaging with a clear QR CTA consistently outperforms passive OOH. Customers engage because the medium is personal — they\'re literally holding your message.',
  },
];

export default function AdvertiserBenefits() {
  return (
    <section id="why-addizi" className="relative px-6 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(25,93,230,0.1),transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeader
            label="Why Addizi"
            title="The best channel for advertisers who refuse to guess."
            description="Addizi combines the intimacy of physical media with the accountability of digital advertising. Here is why performance-focused brands choose us over billboards, flyers, and social-only campaigns."
          />
        </ScrollReveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit, i) => (
            <ScrollReveal key={benefit.title} delay={(i % 4) * 80}>
              <div className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/3 p-5 transition hover:border-primary/40 hover:shadow-[0_0_40px_rgba(25,93,230,0.12)]">
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <benefit.icon className="size-5" />
                </div>
                <h3 className="text-sm font-semibold">{benefit.title}</h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-white/55">{benefit.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
