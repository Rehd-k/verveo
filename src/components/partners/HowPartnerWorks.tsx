import ScrollReveal from '@/components/landing/ScrollReveal';
import SectionHeader from '@/components/landing/SectionHeader';

const STEPS = [
  ['01', 'Apply', 'Create a retailer account and complete your business profile.'],
  ['02', 'Get packs', 'Once approved, receive branded stock allocated to your city and venue type.'],
  ['03', 'Distribute', 'Use the packs during normal service across meals, drinks, and takeaways.'],
  ['04', 'Upload proof', 'Submit photos in the portal so Addizi can verify execution and track status.'],
];

export default function HowPartnerWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(25,93,230,0.08),transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeader
            label="How it works"
            title="Four clear steps from application to verified campaign execution."
            align="center"
          />
        </ScrollReveal>

        <div className="mt-12 grid gap-5 md:grid-cols-4">
          {STEPS.map(([number, title, body], index) => (
            <ScrollReveal key={title} delay={index * 80}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm font-bold text-primary">{number}</p>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
