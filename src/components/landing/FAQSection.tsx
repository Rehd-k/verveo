'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import SectionHeader from './SectionHeader';

const FAQS = [
  {
    q: 'How is Addizi different from billboards or flyers?',
    a: 'Billboards offer reach but no attribution. Flyers get thrown away. Addizi puts your brand on packaging people actively hold for 15–30 minutes, with a QR code that tracks every scan, device, and location in real time.',
  },
  {
    q: 'Which cities can I target?',
    a: 'Addizi covers cities across Nigeria including Abuja, Enugu, Port Harcourt, Kano, Ibadan, Calabar, and more. You select specific cities and venue types during campaign setup — no spray-and-pray distribution.',
  },
  {
    q: 'What does a campaign cost?',
    a: 'Pricing is transparent and per-unit: cups from ₦85, paper bags from ₦95, food boxes from ₦120, and pizza boxes from ₦150. Your total spend depends on quantity and cities selected. You see the full breakdown before checkout.',
  },
  {
    q: 'How does QR tracking work?',
    a: 'Each pack gets a unique QR code linked to your CTA (website, WhatsApp, phone, Instagram). When a customer scans, we log the timestamp, device type, and approximate location. All data flows to your live dashboard.',
  },
  {
    q: 'How fast can I launch a campaign?',
    a: 'Most campaigns go from design to distribution in days, not months. Upload your creative, pick your zones and quantity, generate your QR, and checkout — your packs start reaching customers within the week.',
  },
  {
    q: 'Is there a minimum order quantity?',
    a: 'Minimum quantities vary by packaging type and city availability. The campaign wizard shows real-time reach estimates and pricing as you adjust your order, so you always know what you are committing to.',
  },
  {
    q: 'Can I see performance while the campaign is running?',
    a: 'Yes. Your dashboard updates in real time with impressions, scans, spend, and zone-level heatmaps. You can identify top-performing cities and venue types and adjust future campaigns accordingly.',
  },
  {
    q: 'Do I need design skills to create my packaging?',
    a: 'No. Upload your existing artwork or use the in-browser design studio with 3D preview. The platform guides you through placement, colors, and QR positioning so your packs look professional.',
  },
  {
    q: 'What types of businesses distribute the packaging?',
    a: 'Addizi partners with fast-food chains, cafés, bakeries, and quick-service restaurants nationwide. You choose venue types that match your target audience during campaign setup.',
  },
  {
    q: 'How do I get started?',
    a: 'Create an advertiser account, then launch your first campaign from the dashboard. Pick your cities, choose packaging, design your creative, set your QR CTA, and checkout. Your analytics go live as soon as packs hit the street.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <SectionHeader
            label="FAQ"
            title="Questions advertisers ask before launching."
            align="center"
          />
        </ScrollReveal>

        <div className="mt-12 space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <ScrollReveal key={faq.q} delay={i * 40}>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-card-dark/40 transition hover:border-white/20">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-medium">{faq.q}</span>
                    <ChevronDown
                      className={`size-4 shrink-0 text-white/40 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm leading-relaxed text-white/55">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
