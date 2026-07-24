import { EyeOff, Target, Wallet } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import SectionHeader from './SectionHeader';

const PAINS = [
  {
    icon: EyeOff,
    title: 'No attribution',
    description:
      'Billboards and transit ads look impressive, but you never know who saw them, who cared, or who acted. Your budget disappears into the skyline with zero proof of performance.',
  },
  {
    icon: Target,
    title: 'Spray-and-pray targeting',
    description:
      'Traditional OOH cannot filter by city, venue type, or consumption moment. You pay for everyone passing by — not the people actually holding your message in their hands.',
  },
  {
    icon: Wallet,
    title: 'Wasted spend, slow cycles',
    description:
      'Months of lead time, opaque pricing, and no real-time feedback. By the time a billboard goes up, your campaign brief has already changed twice.',
  },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="relative px-6 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(25,93,230,0.08),transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeader
            label="The problem"
            title="Billboards are blind. Social feeds are noisy. Advertisers deserve better."
            description="Most media channels either lack measurement or lack physical presence. Verveo bridges both — putting your brand on packaging people actually hold, with QR tracking that proves every interaction."
          />
        </ScrollReveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PAINS.map((pain, i) => (
            <ScrollReveal key={pain.title} delay={i * 100}>
              <div className="group h-full rounded-2xl border border-white/10 bg-card-dark/60 p-6 backdrop-blur-sm transition hover:border-primary/40 hover:shadow-[0_0_40px_rgba(25,93,230,0.12)]">
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-white/5 text-primary transition group-hover:bg-primary/20">
                  <pain.icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold">{pain.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{pain.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
