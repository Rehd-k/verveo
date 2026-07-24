import { BadgeCheck, Boxes, Camera, HandCoins, MapPin, TrendingUp } from 'lucide-react';
import ScrollReveal from '@/components/landing/ScrollReveal';
import SectionHeader from '@/components/landing/SectionHeader';

const BENEFITS = [
  { icon: HandCoins, title: 'Earn from distribution', description: 'Turn routine packaging into a measurable partner revenue line.' },
  { icon: Boxes, title: 'We supply branded packs', description: 'Receive campaign packaging allocated to your venue and city.' },
  { icon: Camera, title: 'Simple proof uploads', description: 'Submit execution photos from your phone or laptop for admin review.' },
  { icon: MapPin, title: 'City-matched campaigns', description: 'See campaigns relevant to your location and venue type.' },
  { icon: BadgeCheck, title: 'Clear verification', description: 'Track pending, approved, and rejected proofs from one portal.' },
  { icon: TrendingUp, title: 'Grow with national brands', description: 'Build a track record that qualifies your venue for larger campaigns.' },
];

export default function PartnerBenefits() {
  return (
    <section id="benefits" className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeader
            label="Partner benefits"
            title="A low-effort way to monetize the packs already leaving your counter."
            description="Verveo keeps the workflow simple: receive stock, distribute naturally, upload proof, and keep your operation moving."
          />
        </ScrollReveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit, index) => (
            <ScrollReveal key={benefit.title} delay={index * 80}>
              <div className="h-full rounded-2xl border border-white/10 bg-card-dark/70 p-6 transition hover:border-primary/40">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <benefit.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-semibold">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{benefit.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
