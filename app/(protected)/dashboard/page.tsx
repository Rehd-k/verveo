'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/store/authStore';
import { useCampaign } from '@/store/campaignStore';
import Map, { GeolocateControl, Marker, NavigationControl, Popup, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Caravan, ChartNoAxesCombined, Group, Layers, Save, StoreIcon, TrafficCone, Wallet } from 'lucide-react';
import { cities } from './cities';
import Link from 'next/link';
import { useMapUserLocation } from '@/hooks/useMapUserLocation';
import { authHeaders } from '@/lib/fetchAuth';
import { useTheme } from 'next-themes';

export default function Dashboard() {

  const { campaigns, fetchCampaigns } = useCampaign();
  const [hovered, setHovered] = useState<typeof markers[number] | null>(null);
  const [selected, setSelected] = useState<typeof markers[number] | null>(null); // for tap/click and persistent open
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<MapRef>(null);
  const { user, logout } = useAuth();
  const mapLocation = useMapUserLocation();
  const { resolvedTheme } = useTheme();
  const mapStyle =
    resolvedTheme === 'light'
      ? 'mapbox://styles/mapbox/light-v11'
      : 'mapbox://styles/mapbox/dark-v11';

  useEffect(() => {
    if (!mapLocation.ready || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [mapLocation.longitude, mapLocation.latitude],
      zoom: mapLocation.zoom,
      duration: 1200,
    });
  }, [mapLocation.ready, mapLocation.longitude, mapLocation.latitude, mapLocation.zoom]);


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

  const markers = useMemo(() =>
    cities
    , []);

  const getActiveMarker = hovered || selected;

  const populationLabel = (marker: (typeof markers)[number]) =>
    (marker.dailyActive ?? marker.ExtPopulation ?? marker.possible_points ?? 0).toLocaleString();

  const densityLabel = (marker: (typeof markers)[number]) =>
    marker.inventory ?? marker.density ?? '—';

  const screensLabel = (marker: (typeof markers)[number]) =>
    marker.screens ?? marker.possible_points ?? '—';

  return <main className="relative flex h-[min(95vh,calc(100svh-4rem))] min-w-0 flex-1 flex-col overflow-hidden bg-background md:h-[calc(100svh-4rem)]">
    {/* Header / Overlay Controls */}
    <div className="pointer-events-none absolute left-0 top-0 z-10 flex w-full flex-col gap-3 p-3 sm:flex-row sm:items-start sm:justify-between sm:p-6">
      {/* Search Bar (Floating) */}
      <div className="pointer-events-auto w-full max-w-md shadow-2xl shadow-black/20">
        <div className="flex h-12 w-full items-center rounded-lg border border-border bg-popover px-4 shadow-lg transition-all focus-within:ring-2 focus-within:ring-ring/50">
          <span className="material-symbols-outlined text-muted-foreground" aria-hidden>
            search
          </span>
          <input
            className="ml-2 w-full border-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:ring-0"
            placeholder="Search locations (e.g., Ikeja, Lekki)..."
            type="search"
            aria-label="Search locations"
          />
        </div>
      </div>
      {/* HUD Stats Widgets (Floating) */}
      <div className="pointer-events-auto flex max-w-full gap-2 overflow-x-auto no-scrollbar sm:gap-4">
        {/* Stat 1 */}
        <div className="flex min-w-36 flex-col rounded-lg border border-border bg-popover p-4 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active Campaigns
            </span>
            <Caravan className='ml-4 size-4' />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{campaigns.length}</span>
            {campaigns.length < 1 ? <span className="text-xs text-orange-400 font-medium">
              Needs Action
            </span> : <></>}

          </div>
        </div>
        {/* Stat 2 */}
        <div className="bg-popover border border-border rounded-lg p-4 min-w-40 flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Wallet
            </span>
            <Wallet className='size-4 ml-4' />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              ₦{(user?.walletBalance ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
        {/* Stat 3 */}
        <div className="bg-popover border border-border rounded-lg p-4 min-w-40 flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Saved Drafts
            </span>
            <Save className='size-4 ml-4' />
          </div>
          <Link href={'/campaigns'} className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{campaigns.filter((c) => c.status === 'draft').length}</span>
            <span className="text-xs text-muted-foreground font-medium">Pending</span>
          </Link>
        </div>
      </div>
    </div>
    <div className="relative h-screen w-full min-w-0 overflow-hidden bg-muted">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: mapLocation.longitude,
          latitude: mapLocation.latitude,
          zoom: mapLocation.zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
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
            offset={0} // more space for larger card
            onClose={() => {
              setHovered(null);
              setSelected(null);
            }}
            style={{
              maxWidth: "none",
              padding: 0,
              background: "transparent",
              border: "none",
            }}

          >
            {/* Custom Card Component */}
            <div
              className="mt-4 bg-popover border border-border p-0 rounded-xl shadow-2xl w-64 overflow-hidden"
              onMouseEnter={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                setHovered(getActiveMarker); // reinforce hovered
              }}
              onMouseLeave={() => {
                timeoutRef.current = setTimeout(() => setHovered(null), 200);
              }}
            >
              <div
                className="h-24 bg-cover bg-center relative"
                data-alt={`${getActiveMarker.name} view`}
                style={{
                  backgroundImage: `url("${getActiveMarker.backgroundImage}")`
                }}
              >
                <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-lg font-bold text-foreground leading-none">
                    {getActiveMarker.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getActiveMarker.subtitle || getActiveMarker.address}
                  </p>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  <ChartNoAxesCombined />
                  <span className="text-sm font-semibold text-foreground">
                    {populationLabel(getActiveMarker)}{' '}
                    <span className="text-xs">Estimated Population</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-card p-2 rounded flex flex-col gap-1">
                    <span className="text-muted-foreground">Density</span>
                    <span className="text-foreground font-medium">{densityLabel(getActiveMarker)}</span>
                  </div>
                  <div className="bg-card p-2 rounded flex flex-col gap-1">
                    <span className="text-muted-foreground">Screens</span>
                    <span className="text-foreground font-medium">{screensLabel(getActiveMarker)} Avail.</span>
                  </div>
                </div>
                <Link href={`/campaign?area=${getActiveMarker.name}&long=${getActiveMarker.longitude}&lat=${getActiveMarker.latitude}`}>
                  <button
                    className="mt-3 w-full py-1.5 bg-primary/20 hover:bg-primary/30 text-primary hover:text-primary-foreground border border-primary/20 rounded text-xs font-semibold transition-all"

                  >
                    Target this Area
                  </button>
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Floating Bottom Controls */}
      <div className="absolute bottom-8 md:left-1/2 md:-translate-x-1/2 z-20 left-2">
        <div className="md:flex flex-col md:flex-row bg-popover border border-border md:rounded-full p-1.5 shadow-2xl gap-2 rounded-xl">
          <button className="flex items-center gap-2 px-4 md:py-2 py-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/25">
            <Layers className="size-4" />
            <p className="hidden md:block">Layers</p>

          </button>
          <button className="flex items-center gap-2 px-4 md:py-2 py-4 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-medium transition-colors">
            <TrafficCone className="size-4" />
            <p className="hidden md:block">Traffic</p>

          </button>
          <button className="flex items-center gap-2 px-4 md:py-2 py-4 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-medium transition-colors">
            <StoreIcon className="size-4" />
            <p className="hidden md:block">Inventory</p>

          </button>
          <button className="flex items-center gap-2 px-4 md:py-2 py-4 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-medium transition-colors">
            <Group className="size-4" />
            <p className="hidden md:block">Demographics</p>
          </button>
        </div>
      </div>
    </div>




    {/* Campaigns */}
    <>
      {/* <div className="px-8 py-6"> */}
      {/* <h2 className="text-2xl font-bold text-foreground mb-4">Recent Campaigns</h2> */}
      {/* <div className="space-y-3">
          {campaigns.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">No campaigns yet. Create your first one!</p>
            </div>
          ) : (
            campaigns.slice(0, 5).map((campaign) => (
              <div
                key={campaign._id}
                className="rounded-xl border border-border bg-card p-6 hover:bg-accent transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-foreground">{campaign.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {campaign.quantity.toLocaleString()} units • {campaign.status}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="font-bold text-foreground">
                      ₦{campaign.budget?.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">{campaign.stats?.scans || 0} scans</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/analytics/campaign/${campaign._id}`, { headers: authHeaders() });
                            if (!res.ok) throw new Error('Analytics fetch failed');
                            const data = await res.json();
                            window.open('data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)), '_blank');
                          } catch (err) {
                            console.error(err);
                            alert('Failed to fetch analytics');
                          }
                        }}
                        className="rounded-md bg-card px-3 py-1 text-sm text-muted-foreground hover:bg-accent"
                      >
                        View Analytics
                      </button>
                      <Link
                        href={`/api/qr/${campaign._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md bg-card px-3 py-1 text-sm text-muted-foreground hover:bg-accent"
                      >
                        Test QR
                      </Link>
                      <Link href={`/dashboard/checkout?campaignId=${campaign._id}`} className="rounded-md bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground hover:brightness-105">Checkout</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div> */}

    </>

  </main>


}
