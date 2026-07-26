import WarRoomMap from '@/components/features/map/WarRoomMap';
import { StatCard } from '@/components/ui/StatCard';

export default function WarRoomPage() {
  return (
    <div className="relative flex h-svh w-full overflow-hidden bg-background text-foreground">
      <main className="relative min-w-0 flex-1">
        <div className="absolute left-4 right-4 top-4 z-10 flex flex-col gap-3 sm:left-6 sm:right-auto sm:top-6 sm:w-80">
          <input
            type="search"
            placeholder="Search locations..."
            aria-label="Search locations"
            className="w-full rounded-lg border border-border bg-popover px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-lg"
          />
        </div>

        <div className="absolute right-4 top-4 z-10 flex max-w-[calc(100%-2rem)] flex-col gap-3 sm:right-6 sm:top-6 sm:max-w-none sm:flex-row">
          <StatCard
            label="Active Campaigns"
            value="0"
            sub="Needs Action"
            valueClassName="text-warning"
            className="min-w-40 bg-popover shadow-lg"
          />
          <StatCard
            label="Wallet Balance"
            value="₦ 450k"
            valueClassName="text-success"
            className="min-w-40 bg-popover shadow-lg"
          />
        </div>

        <WarRoomMap />
      </main>
    </div>
  );
}
