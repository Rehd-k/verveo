'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ScrollReveal from '@/components/landing/ScrollReveal';
import SectionHeader from '@/components/landing/SectionHeader';

const FAQS = [
  ['How do I become a partner?', 'Create a retailer account, complete onboarding, and wait for admin approval. Once approved, your portal will show matched campaigns and stock details.'],
  ['Do I need to pay for branded packs?', 'No. Verveo allocates campaign stock to approved venues. Your job is to distribute packs properly and keep proof up to date.'],
  ['Which venues qualify?', 'Fast-food outlets, cafes, bakeries, corporate canteens, university-area vendors, shopping mall food spots, and entertainment venues are strong fits.'],
  ['How are campaigns matched to my venue?', 'Campaigns are matched by your city and venue type, so you only see advertiser campaigns relevant to your operation.'],
  ['What is proof of execution?', 'Proof is a clear photo showing branded packs in real customer-facing use at your venue. Admin reviews each submission.'],
  ['Can I request more stock?', 'Yes. The stock page lets you request replenishment and track request status.'],
  ['What cities are supported?', 'Verveo is built for nationwide growth, including Abuja, Enugu, Port Harcourt, Kano, Ibadan, Calabar, and more.'],
  ['Can I update my venue details later?', 'Yes. Your profile can be updated through the retailer profile API, and admin can also manage your partner status.'],
];

export default function PartnerFAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="partner-faq" className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <SectionHeader label="FAQ" title="What partners ask before applying." align="center" />
        </ScrollReveal>

        <div className="mt-10 space-y-3">
          {FAQS.map(([question, answer], index) => {
            const isOpen = open === index;
            return (
              <ScrollReveal key={question} delay={index * 40}>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-card-dark/70">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium"
                    onClick={() => setOpen(isOpen ? -1 : index)}
                  >
                    {question}
                    <ChevronDown className={`size-4 shrink-0 text-white/40 transition ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`grid transition-all ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm leading-relaxed text-text-secondary">{answer}</p>
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
