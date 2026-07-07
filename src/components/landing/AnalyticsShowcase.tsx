import { Activity, MousePointerClick, Wallet, Map } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import SectionHeader from './SectionHeader';

const METRICS = [
  { icon: Activity, label: 'Total Scans', value: '12,847', change: '+18% this week' },
  { icon: MousePointerClick, label: 'Scan Rate', value: '4.2%', change: '3x industry avg' },
  { icon: Wallet, label: 'Cost per Scan', value: '₦42', change: '↓ 12% vs last campaign' },
  { icon: Map, label: 'Active Zones', value: '6 cities', change: 'Abuja, Enugu +4' },
];

const SCAN_DATA = [32, 45, 38, 62, 55, 78, 71, 89, 82, 95, 88, 102];

export default function AnalyticsShowcase() {
  return (
    <section id="analytics" className="relative px-6 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(25,93,230,0.06),transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeader
            label="Analytics"
            title="Every scan. Every city. One live dashboard."
            description="Stop guessing whether your media spend worked. Addizi logs every QR interaction with device, timestamp, and location data — giving you the attribution layer physical advertising has always lacked."
          />
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-card-dark/80 backdrop-blur-sm">
            <div className="border-b border-white/10 px-6 py-4">
              <p className="text-xs font-medium uppercase tracking-widest text-white/40">
                Campaign Dashboard — Preview
              </p>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
              {METRICS.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-white/5 bg-white/3 p-4 transition hover:border-primary/30"
                >
                  <div className="flex items-center gap-2 text-white/50">
                    <m.icon className="size-3.5" />
                    <span className="text-xs">{m.label}</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{m.value}</p>
                  <p className="mt-1 text-xs text-primary/80">{m.change}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 p-6">
              <p className="mb-4 text-xs font-medium text-white/50">Scans over time</p>
              <div className="flex h-32 items-end gap-1.5">
                {SCAN_DATA.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-linear-to-t from-primary/80 to-primary/30 transition-all hover:from-primary hover:to-primary/50"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="relative border-t border-white/10 p-6">
              <p className="mb-3 text-xs font-medium text-white/50">Zone heatmap</p>
              <div className="relative h-40 overflow-hidden rounded-xl bg-[#111318]">
                <div className="heatmap-glow absolute left-[20%] top-[30%] h-24 w-24 rounded-full" />
                <div className="heatmap-glow absolute right-[25%] top-[20%] h-20 w-20 rounded-full opacity-70" />
                <div className="heatmap-glow absolute bottom-[20%] left-[45%] h-28 w-28 rounded-full opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xs text-white/30">Live scan density across active cities</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
