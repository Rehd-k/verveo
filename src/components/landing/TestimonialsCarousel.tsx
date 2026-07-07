'use client';

import { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import ScrollReveal from './ScrollReveal';
import SectionHeader from './SectionHeader';

const TESTIMONIALS = [
  {
    quote:
      'We shifted 30% of our OOH budget to Addizi and finally had data to show the board. Scans from Enugu and Port Harcourt outperformed our Abuja billboard three to one.',
    name: 'Adaeze O.',
    role: 'Marketing Director, FMCG Brand',
    city: 'Abuja',
  },
  {
    quote:
      'The QR tracking changed how we think about physical media. Every cup is a performance ad. We saw a 3x uplift in scan-through compared to our previous flyer campaign.',
    name: 'Chidi M.',
    role: 'Growth Lead, Fintech Startup',
    city: 'Enugu',
  },
  {
    quote:
      'Transparent pricing, fast launch, real analytics. We targeted Kano and Ibadan for a product test and had actionable data within 48 hours of distribution.',
    name: 'Fatima B.',
    role: 'Brand Manager, Consumer Goods',
    city: 'Kano',
  },
  {
    quote:
      'Addizi let us reach customers in Calabar and Uyo without flying a team there. The dashboard showed exactly which venues drove the most scans.',
    name: 'Emeka T.',
    role: 'Head of Digital, Retail Chain',
    city: 'Port Harcourt',
  },
];

export default function TestimonialsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(scrollNext, 5000);
    return () => clearInterval(interval);
  }, [emblaApi, scrollNext]);

  return (
    <section className="relative px-6 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(25,93,230,0.08),transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeader
            label="Advertiser stories"
            title="Brands across Nigeria are switching to measurable packaging media."
            align="center"
          />
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <div className="mt-12 overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="min-w-0 shrink-0 grow-0 basis-full md:basis-[calc(50%-12px)] lg:basis-[calc(33.333%-16px)]"
                >
                  <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-card-dark/60 p-6 backdrop-blur-sm transition hover:border-primary/30">
                    <p className="flex-1 text-sm leading-relaxed text-white/75">&ldquo;{t.quote}&rdquo;</p>
                    <div className="mt-6 border-t border-white/10 pt-4">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-white/50">
                        {t.role} · {t.city}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
