import Link from 'next/link';
import ScrollReveal from '@/components/landing/ScrollReveal';

export default function PartnerCTA() {
  return (
    <section className="px-6 py-20 md:py-28">
      <ScrollReveal>
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-linear-to-br from-primary/20 via-card-dark to-black p-10 text-center md:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Join the network</p>
          <h2 className="mt-4 text-3xl font-semibold md:text-5xl">
            Put your venue in front of national advertiser campaigns.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/70">
            Apply as a retail partner, complete onboarding, and start managing stock, campaigns, and proof uploads from your portal.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/auth/signup?role=retailer" className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-600">
              Apply to Partner
            </Link>
            <Link href="/auth/login" className="rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white/90 transition hover:border-white/40">
              Partner Sign In
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
