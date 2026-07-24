'use client';

import { useEffect, useRef, useState } from 'react';
import ScrollReveal from './ScrollReveal';
import SectionHeader from './SectionHeader';

function useCountUp(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let start: number | null = null;
    let frame: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, active]);

  return value;
}

function AnimatedStat({
  target,
  suffix,
  label,
  description,
}: {
  target: number;
  suffix: string;
  label: string;
  description: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const count = useCountUp(target, 1800, active);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-bold text-primary md:text-5xl">
        {count}
        {suffix}
      </p>
      <p className="mt-2 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs text-white/50">{description}</p>
    </div>
  );
}

const ROI_POINTS = [
  {
    title: 'Lower cost per engaged impression',
    body: 'A ₦85 cup that gets held for 20 minutes and scanned delivers more value than a ₦500,000 billboard nobody remembers.',
  },
  {
    title: 'Attribution you can defend',
    body: 'Every scan is logged with timestamp, device type, and location. Show your stakeholders real numbers, not estimated reach.',
  },
  {
    title: 'Iterate mid-campaign',
    body: 'See which cities and venue types perform best, then reallocate budget in real time — something impossible with traditional OOH.',
  },
];

export default function ROISection() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeader
            label="Return on investment"
            title="Numbers that make the case for packaging media."
            description="Verveo advertisers see measurable returns because every pack is both an impression and a conversion opportunity."
            align="center"
          />
        </ScrollReveal>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          <AnimatedStat
            target={3}
            suffix="x"
            label="Average scan uplift"
            description="vs. passive OOH campaigns"
          />
          <AnimatedStat
            target={50}
            suffix="K+"
            label="Daily impressions"
            description="packs in customers' hands"
          />
          <div className="text-center">
            <p className="text-4xl font-bold text-primary md:text-5xl">₦42</p>
            <p className="mt-2 text-sm font-semibold">Avg. cost per scan</p>
            <p className="mt-1 text-xs text-white/50">across active campaigns</p>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {ROI_POINTS.map((point, i) => (
            <ScrollReveal key={point.title} delay={i * 100}>
              <div className="rounded-2xl border border-white/10 bg-card-dark/50 p-6">
                <h3 className="font-semibold">{point.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{point.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
