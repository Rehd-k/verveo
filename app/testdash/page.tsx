import WarRoomMap from '@/components/features/map/WarRoomMap';
import { Sidebar } from '@/components/layout/Sidebar'; // Assume you build this based on sidebar HTML
import { StatCard } from '@/components/ui/StatCard';

export default function WarRoomPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-dark">
       <Sidebar /> 
       <main className="flex-1 relative">
         {/* Floating HUD */}
         <div className="absolute top-6 left-6 z-10 w-96">
            <input 
              type="text" 
              placeholder="Search locations..." 
              className="w-full bg-surface-dark/90 backdrop-blur border border-border-dark rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
         </div>

         <div className="absolute top-6 right-6 z-10 flex gap-4">
            <StatCard label="Active Campaigns" value="0" sub="Needs Action" color="text-orange-400" />
            <StatCard label="Wallet Balance" value="₦ 450k" color="text-green-400" />
         </div>

         <WarRoomMap />
       </main>
    </div>
  );
}