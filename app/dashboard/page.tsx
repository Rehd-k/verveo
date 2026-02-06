'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/store/authStore';
import { useCampaign } from '@/store/campaignStore';
import Map, { GeolocateControl, Marker, NavigationControl, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';


export default function Dashboard() {

  const { campaigns, fetchCampaigns } = useCampaign();
  const [hovered, setHovered] = useState<typeof markers[number] | null>(null);
  const [selected, setSelected] = useState<typeof markers[number] | null>(null); // for tap/click and persistent open
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, logout } = useAuth();
  const [showWizard, setShowWizard] = useState(false);


  useEffect(() => {
    if (!user) {

      return;
    }

    // Fetch campaigns
    fetchCampaigns(user.id || '');
  }, [user, fetchCampaigns]);

  const handleEnter = (marker: any) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHovered(marker);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setHovered(null), 150);
  };

  // Optional: close popup when tapping elsewhere on the map
  const handleMapClick = () => {
    setSelected(null); // or toggle if you prefer
  };

  const markers = useMemo(() => [
    {
      id: "1",
      name: "Ikeja Branch",
      longitude: 3.3500,
      latitude: 6.6000,
      address: "Ikeja, Lagos",
      backgroundImage: "https://example.com/ikeja-image.jpg", // replace with real URL or dynamic
      subtitle: "Tech Hub & University District", // customize per marker
      dailyActive: 5000,
      inventory: "High",
      screens: 12,
    },
    {
      id: "2",
      name: "VI Branch",
      longitude: 3.4200,
      latitude: 6.4300,
      address: "Victoria Island, Lagos",
      backgroundImage: "https://example.com/vi-image.jpg", // replace with real URL or dynamic
      subtitle: "Business & Entertainment District",
      dailyActive: 7500,
      inventory: "Medium",
      screens: 8,
    },
    // Add more markers with their specific data
  ], []);

  const getActiveMarker = hovered || selected; // unified for Popup

  return <main className="flex-1 relative flex flex-col bg-background-dark h-screen w-screen/2">
    {/* Header / Overlay Controls */}
    <div className="absolute top-0 left-0 w-full z-10 p-6 pointer-events-none flex justify-between items-start">
      {/* Search Bar (Floating) */}
      <div className="pointer-events-auto w-96 shadow-2xl shadow-black/50">
        <div className="flex w-full items-center bg-card-dark/90 backdrop-blur-md rounded-lg border border-white/10 h-12 px-4 transition-all focus-within:ring-2 focus-within:ring-primary/50">
          <span className="material-symbols-outlined text-text-secondary">
            search
          </span>
          <input
            className="bg-transparent border-none text-white text-sm w-full focus:ring-0 placeholder:text-text-secondary ml-2"
            placeholder="Search locations (e.g., Ikeja, Lekki)..."
            type="text"
          />
        </div>
      </div>
      {/* HUD Stats Widgets (Floating) */}
      <div className="pointer-events-auto flex gap-4">
        {/* Stat 1 */}
        <div className="bg-card-dark/80 backdrop-blur-md border border-white/10 rounded-lg p-4 min-w-40 flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">
              Active Campaigns
            </span>
            <span className="material-symbols-outlined text-text-secondary text-[16px]">
              campaign
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">0</span>
            <span className="text-xs text-orange-400 font-medium">
              Needs Action
            </span>
          </div>
        </div>
        {/* Stat 2 */}
        <div className="bg-card-dark/80 backdrop-blur-md border border-white/10 rounded-lg p-4 min-w-40 flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">
              Wallet Balance
            </span>
            <span className="material-symbols-outlined text-green-400 text-[16px]">
              account_balance_wallet
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">₦ 450k</span>
          </div>
        </div>
        {/* Stat 3 */}
        <div className="bg-card-dark/80 backdrop-blur-md border border-white/10 rounded-lg p-4 min-w-40 flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">
              Saved Drafts
            </span>
            <span className="material-symbols-outlined text-text-secondary text-[16px]">
              save
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">2</span>
            <span className="text-xs text-text-secondary font-medium">Pending</span>
          </div>
        </div>
      </div>
    </div>
    <div className="relative w-[80wv] h-screen bg-[#111318]">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: 3.3792,
          latitude: 6.5244,
          zoom: 14,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onClick={handleMapClick} // close popup when tapping empty map area
      >
        {/* Map Controls: Zoom In/Out and Find Me */}
        <NavigationControl
          position="bottom-right"
          showCompass={false} // just zoom buttons
          visualizePitch={false}
        />
        <GeolocateControl
          position="bottom-right"
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true} // optional: follow user
          showUserHeading={true}
          style={{ marginBottom: 80 }} // space above navigation if needed
        />

        {markers.map((m) => (
          <Marker
            key={m.id}
            longitude={m.longitude}
            latitude={m.latitude}
          >
            <div
              // Desktop hover
              onMouseEnter={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                setHovered(m);
              }}
              onMouseLeave={() => {
                timeoutRef.current = setTimeout(() => setHovered(null), 200); // delay hide to allow moving to popup
              }}

              // Mobile/Desktop: tap/click to select (toggle persistent open)
              onClick={(e) => {
                e.stopPropagation();
                setSelected(m === selected ? null : m);
                setHovered(null); // clear hover if clicking
              }}

              style={{
                width: 24,                // even larger for better tap/hover
                height: 24,
                borderRadius: "50%",
                background: getActiveMarker?.id === m.id
                  ? "#ff9800"             // orange when active
                  : "red",
                border: "3px solid white",
                cursor: "pointer",
                pointerEvents: "auto",
                transform: "translate(-50%, -50%)",
                transition: "all 0.2s ease",
                boxShadow: getActiveMarker?.id === m.id ? "0 0 12px rgba(255,152,0,0.6)" : "none",
              }}
            />
          </Marker>
        ))}

        {getActiveMarker && (
          <Popup
            longitude={getActiveMarker.longitude}
            latitude={getActiveMarker.latitude}
            closeButton={true}
            closeOnClick={false}
            anchor="top"
            offset={28} // more space for larger card
            onClose={() => {
              setHovered(null);
              setSelected(null);
            }}
            // Keep open on hover over popup (for desktop)
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setHovered(getActiveMarker); // reinforce hovered
            }}
            onMouseLeave={() => {
              timeoutRef.current = setTimeout(() => setHovered(null), 200);
            }}
            // Style to match card width/appearance
            style={{
              maxWidth: "none", // allow full card width
              padding: 0,       // no extra padding
              background: "transparent", // hide default bg
              border: "none",
            }}
          >
            {/* Custom Card Component */}
            <div className="mt-4 bg-card-dark/95 backdrop-blur-xl border border-white/10 p-0 rounded-xl shadow-2xl w-64 overflow-hidden">
              <div
                className="h-24 bg-cover bg-center relative"
                data-alt={`${getActiveMarker.name} view`}
                style={{
                  backgroundImage: `url("${getActiveMarker.backgroundImage}")`
                }}
              >
                <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-lg font-bold text-white leading-none">
                    {getActiveMarker.name}
                  </h3>
                  <p className="text-xs text-gray-300 mt-1">
                    {getActiveMarker.subtitle || getActiveMarker.address}
                  </p>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-green-400 text-sm">
                    trending_up
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {getActiveMarker.dailyActive.toLocaleString()} daily active eaters
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 p-2 rounded flex flex-col gap-1">
                    <span className="text-text-secondary">Inventory</span>
                    <span className="text-white font-medium">{getActiveMarker.inventory}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded flex flex-col gap-1">
                    <span className="text-text-secondary">Screens</span>
                    <span className="text-white font-medium">{getActiveMarker.screens} Avail.</span>
                  </div>
                </div>
                <button
                  className="mt-3 w-full py-1.5 bg-primary/20 hover:bg-primary/30 text-primary hover:text-white border border-primary/20 rounded text-xs font-semibold transition-all"
                  onClick={() => {
                    // Add your "Target this Area" logic here, e.g., console.log or navigate
                    alert(`Targeting ${getActiveMarker.name}`);
                  }}
                >
                  Target this Area
                </button>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Floating Bottom Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex bg-card-dark/90 backdrop-blur-lg border border-white/10 rounded-full p-1.5 shadow-2xl gap-1">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold shadow-lg shadow-primary/25">
            <span className="material-symbols-outlined text-[18px]">layers</span>
            All Layers
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 text-text-secondary hover:text-white text-xs font-medium transition-colors">
            <span className="material-symbols-outlined text-[18px]">traffic</span>
            Traffic
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 text-text-secondary hover:text-white text-xs font-medium transition-colors">
            <span className="material-symbols-outlined text-[18px]">
              storefront
            </span>
            Inventory
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 text-text-secondary hover:text-white text-xs font-medium transition-colors">
            <span className="material-symbols-outlined text-[18px]">group</span>
            Demographics
          </button>
        </div>
      </div>
      {/* Zoom Controls */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-20">
        <button className="size-10 bg-card-dark/90 backdrop-blur border border-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/10 shadow-lg transition-colors">
          <span className="material-symbols-outlined">add</span>
        </button>
        <button className="size-10 bg-card-dark/90 backdrop-blur border border-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/10 shadow-lg transition-colors">
          <span className="material-symbols-outlined">remove</span>
        </button>
        <button className="size-10 bg-card-dark/90 backdrop-blur border border-white/10 rounded-lg flex items-center justify-center text-primary hover:bg-white/10 shadow-lg mt-2 transition-colors">
          <span className="material-symbols-outlined">near_me</span>
        </button>
      </div>


    </div>




    {/* Campaigns */}
    <>
      {/* <div className="px-8 py-6"> */}
      {/* <h2 className="text-2xl font-bold text-white mb-4">Recent Campaigns</h2> */}
      {/* <div className="space-y-3">
          {campaigns.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-white/3 p-8 text-center">
              <p className="text-white/60">No campaigns yet. Create your first one!</p>
            </div>
          ) : (
            campaigns.slice(0, 5).map((campaign) => (
              <div
                key={campaign._id}
                className="rounded-xl border border-white/5 bg-white/3 p-6 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">{campaign.title}</h3>
                    <p className="text-sm text-white/60">
                      {campaign.quantity.toLocaleString()} units • {campaign.status}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="font-bold text-white">
                      ₦{campaign.budget?.toLocaleString()}
                    </p>
                    <p className="text-sm text-white/60">{campaign.stats?.scans || 0} scans</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/analytics/campaign/${campaign._id}`);
                            if (!res.ok) throw new Error('Analytics fetch failed');
                            const data = await res.json();
                            window.open('data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)), '_blank');
                          } catch (err) {
                            console.error(err);
                            alert('Failed to fetch analytics');
                          }
                        }}
                        className="rounded-md bg-white/5 px-3 py-1 text-sm text-white/80 hover:bg-white/10"
                      >
                        View Analytics
                      </button>
                      <Link
                        href={`/api/qr/${campaign._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md bg-white/5 px-3 py-1 text-sm text-white/80 hover:bg-white/10"
                      >
                        Test QR
                      </Link>
                      <Link href={`/dashboard/checkout?campaignId=${campaign._id}`} className="rounded-md bg-primary px-3 py-1 text-sm font-semibold text-black hover:brightness-105">Checkout</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div> */}

      {/* Campaign Wizard Modal */}
      {/* {showWizard && <CampaignWizard onClose={() => setShowWizard(false)} />} */}
      {/* </div> */}
    </>

  </main>


}
