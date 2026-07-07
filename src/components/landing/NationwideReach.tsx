import ScrollReveal from './ScrollReveal';
import SectionHeader from './SectionHeader';

const CITIES = [
  'Abuja',
  'Enugu',
  'Port Harcourt',
  'Kano',
  'Ibadan',
  'Calabar',
  'Benin City',
  'Kaduna',
  'Jos',
  'Warri',
  'Owerri',
  'Uyo',
];

const STATS = [
  { value: '50K+', label: 'Daily packs distributed' },
  { value: '1.2M', label: 'Total packs delivered' },
  { value: '36+', label: 'Cities & growing' },
  { value: 'Realtime', label: 'Zone-level analytics' },
];

export default function NationwideReach() {
  return (
    <section id="reach" className="relative px-6 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(25,93,230,0.12),transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeader
            label="Nationwide reach"
            title="From Abuja to Calabar — your brand, everywhere people eat."
            description="Addizi partners with fast-food outlets, cafés, and bakeries across Nigeria. Pick the cities that matter to your audience and scale as you grow."
          />
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mt-10 flex flex-wrap gap-2.5">
            {CITIES.map((city) => (
              <span
                key={city}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 transition hover:border-primary/40 hover:text-white"
              >
                {city}
              </span>
            ))}
            <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              + more cities
            </span>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 80}>
              <div className="rounded-2xl border border-white/10 bg-card-dark/60 p-6 text-center transition hover:border-primary/30">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-2 text-sm text-white/50">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={200}>
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/3 p-8 md:p-10">
            <p className="text-lg font-medium leading-relaxed text-white/80">
              &ldquo;Whether you&apos;re launching in the federal capital, expanding into the South-East, or
              testing a new product in the North — Addizi lets you{' '}
              <span className="text-primary">target precisely</span>, measure honestly, and scale
              confidently.&rdquo;
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
