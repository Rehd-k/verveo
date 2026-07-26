import { CheckCircle2 } from 'lucide-react';
import ScrollReveal from '@/components/landing/ScrollReveal';
import SectionHeader from '@/components/landing/SectionHeader';

const REQUIREMENTS = [
  'Active venue serving takeaway food, drinks, snacks, or retail food items.',
  'Located in a supported city such as Abuja, Enugu, Port Harcourt, Kano, Ibadan, or Calabar.',
  'Able to store branded packs safely and distribute them during normal operations.',
  'Able to upload clear proof photos showing branded packs in customer-facing use.',
  'Willing to keep stock counts accurate and request replenishment before running out.',
];

export default function PartnerRequirements() {
  return (
    <section id="requirements" className="px-6 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <ScrollReveal>
          <SectionHeader
            label="Requirements"
            title="Built for serious venues with steady customer flow."
            description="The best partners are food and retail venues that already serve customers daily and can keep branded packaging visible, clean, and consistent."
          />
        </ScrollReveal>

        <div className="space-y-3">
          {REQUIREMENTS.map((item, index) => (
            <ScrollReveal key={item} delay={index * 70}>
              <div className="flex gap-3 rounded-2xl border border-border bg-card p-5">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-foreground/75">{item}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
