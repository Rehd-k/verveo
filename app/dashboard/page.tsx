'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/store/authStore';
import { useCampaign } from '@/store/campaignStore';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import Map, { Marker, Popup } from 'react-map-gl';
import CampaignWizard from '@/components/CampaignWizard';
import 'mapbox-gl/dist/mapbox-gl.css';
import Link from 'next/link';

if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

export default function Dashboard() {

  const { campaigns, fetchCampaigns } = useCampaign();
  const { user, logout } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [hovered, setHovered] = useState(null);


  useEffect(() => {
    if (!user) {

      return;
    }

    // Fetch campaigns
    fetchCampaigns(user.id || '');
  }, [user, fetchCampaigns]);

  const markers = useMemo(
    () => [
      {
        id: "1",
        name: "Ikeja Branch",
        longitude: 3.3500,
        latitude: 6.6000,
        address: "Ikeja, Lagos",
      },
      {
        id: "2",
        name: "VI Branch",
        longitude: 3.4200,
        latitude: 6.4300,
        address: "Victoria Island, Lagos",
      },
    ],
    []
  );

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
          zoom: 14
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >
        {/* MARKERS */}
        {markers.map((m) => (
          <Marker key={m.id} longitude={m.longitude} latitude={m.latitude}>
            <div
              onMouseEnter={() => setHovered(m)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "red",
                cursor: "pointer",
              }}
            />
          </Marker>
        ))}

        {/* HOVER CARD */}
        {hovered && (
          <Popup
            longitude={hovered.longitude}
            latitude={hovered.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="top"
            offset={15}
          >
            {/* Your prepared card goes here */}
            <div style={{ width: 200 }}>
              <h4 style={{ margin: 0 }}>{hovered.name}</h4>
              <p style={{ margin: "6px 0 0" }}>{hovered.address}</p>
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
