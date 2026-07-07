interface RetailerStatsProps {
  allowance: number;
  currentStock: number;
  activeCampaigns: number;
  pendingProofs: number;
}

const formatter = new Intl.NumberFormat('en-NG');

export default function RetailerStats({
  allowance,
  currentStock,
  activeCampaigns,
  pendingProofs,
}: RetailerStatsProps) {
  const stats = [
    { label: 'Stock allowance', value: formatter.format(allowance), sub: 'packs approved' },
    { label: 'Current stock', value: formatter.format(currentStock), sub: 'packs available' },
    { label: 'Active campaigns', value: formatter.format(activeCampaigns), sub: 'matched to your venue' },
    { label: 'Pending proofs', value: formatter.format(pendingProofs), sub: 'awaiting review' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-white/10 bg-card-dark/80 p-5">
          <p className="text-xs text-white/50">{stat.label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
          <p className="mt-1 text-xs text-text-secondary">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}
