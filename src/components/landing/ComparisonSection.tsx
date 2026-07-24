import { Check, X } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import SectionHeader from './SectionHeader';

const FEATURES = [
  { label: 'Measurable scans & conversions', billboard: false, social: true, verveo: true },
  { label: 'Physical brand presence', billboard: true, social: false, verveo: true },
  { label: 'Geo-targeted by city & venue', billboard: false, social: true, verveo: true },
  { label: '15–30 min dwell time', billboard: false, social: false, verveo: true },
  { label: 'Real-time dashboard', billboard: false, social: true, verveo: true },
  { label: 'Transparent per-unit pricing', billboard: false, social: false, verveo: true },
  { label: 'Launch in days', billboard: false, social: true, verveo: true },
  { label: 'Ad-blocker proof', billboard: true, social: false, verveo: true },
];

function Cell({ value, highlight }: { value: boolean; highlight?: boolean }) {
  return (
    <td className={`px-4 py-3 text-center ${highlight ? 'bg-primary/5' : ''}`}>
      {value ? (
        <Check className={`mx-auto size-4 ${highlight ? 'text-primary' : 'text-green-400'}`} />
      ) : (
        <X className="mx-auto size-4 text-white/20" />
      )}
    </td>
  );
}

export default function ComparisonSection() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <SectionHeader
            label="Compare channels"
            title="Verveo vs. billboards vs. social ads"
            description="See how packaging media stacks up against the channels advertisers already know — and why the combination of physical + digital wins."
            align="center"
          />
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="mt-12 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  <th className="px-4 py-4 text-left font-medium text-white/50">Capability</th>
                  <th className="px-4 py-4 text-center font-medium text-white/50">Billboards</th>
                  <th className="px-4 py-4 text-center font-medium text-white/50">Social Ads</th>
                  <th className="px-4 py-4 text-center font-semibold text-primary">Verveo</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((row) => (
                  <tr key={row.label} className="border-b border-white/5">
                    <td className="px-4 py-3 text-white/80">{row.label}</td>
                    <Cell value={row.billboard} />
                    <Cell value={row.social} />
                    <Cell value={row.verveo} highlight />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
