'use client';

import {
  Building2,
  ChevronLeft,
  Hamburger,
  MoveRight,
  School,
  Search,
  Settings2,
} from 'lucide-react';
import Map, {
  GeolocateControl,
  Layer,
  Marker,
  NavigationControl,
  Source,
  type MapRef,
} from 'react-map-gl/mapbox';
import { circle } from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCampaignStore } from '@/store/useCampaignStore';
import { cities } from '../../dashboard/cities';
import {
  VENUE_CATEGORIES,
  computeTargetedVenues,
  type VenueCategory,
} from '@/lib/locationTargeting';
import { getAllNigeriaVenues } from '@/lib/nigeriaVenues';
import { DEFAULT_USER_ZOOM, useMapUserLocation } from '@/hooks/useMapUserLocation';

const CATEGORY_ICONS: Record<VenueCategory, React.ReactNode> = {
  'fast food chains': <Hamburger className="size-4" />,
  'corporate canteens': <Building2 className="size-4" />,
  universities: <School className="size-4" />,
  'shopping malls': <Search className="size-4" />,
  'entertainment venues': <Settings2 className="size-4" />,
};

const CATEGORY_LABELS: Record<VenueCategory, { title: string; subtitle: string }> = {
  'fast food chains': { title: 'Fast Food Chains', subtitle: 'Quick-service restaurants' },
  'corporate canteens': { title: 'Corporate Canteens', subtitle: 'Business parks and office hubs' },
  universities: { title: 'Universities', subtitle: 'Higher education campuses' },
  'shopping malls': { title: 'Shopping Malls', subtitle: 'Retail centers and arcades' },
  'entertainment venues': { title: 'Entertainment Venues', subtitle: 'Cinemas and gaming zones' },
};

interface LocationStepProps {
  data: { locations: string[]; venueTypes: string[] };
  updateData: (data: Partial<{ locations: string[]; venueTypes: string[] }>) => void;
  nextStage: () => void;
  initialDistrict?: string;
  initialCenter?: [number, number];
}

export default function LocationPage({
  updateData,
  nextStage,
  initialDistrict,
  initialCenter,
}: LocationStepProps) {
  const mapLocation = useMapUserLocation();
  const mapRef = useRef<MapRef>(null);
  const allVenues = useMemo(() => getAllNigeriaVenues(cities), []);

  const defaultCenter = useMemo((): [number, number] => {
    if (initialCenter) return initialCenter;
    if (initialDistrict) {
      const city = cities.find((c) => c.name === initialDistrict);
      if (city) return [city.longitude, city.latitude];
    }
    return [mapLocation.longitude, mapLocation.latitude];
  }, [initialCenter, initialDistrict, mapLocation.longitude, mapLocation.latitude]);

  const [radiusMeters, setRadiusMeters] = useState(1000);
  const [center, setCenter] = useState<[number, number]>(defaultCenter);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const { setSelectedBusinesses, setTargetLocation, setEstimatedReach } = useCampaignStore();
  const [categories, setCategories] = useState<string[]>([...VENUE_CATEGORIES]);
  const [isDraggingCenter, setIsDraggingCenter] = useState(false);
  const [mapZoom, setMapZoom] = useState(
    initialCenter || initialDistrict ? DEFAULT_USER_ZOOM : mapLocation.zoom
  );

  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(
      (c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
    );
  }, [citySearch]);

  const circlePoly = useMemo(
    () =>
      circle(center, radiusMeters / 1000, {
        units: 'kilometers',
        steps: 340,
      }),
    [center, radiusMeters]
  );

  const { dailyReach, selectedPlaces, districtNames } = useMemo(
    () => computeTargetedVenues(allVenues, center, radiusMeters, categories),
    [allVenues, center, radiusMeters, categories]
  );

  const selectedPlaceIds = useMemo(
    () => new Set(selectedPlaces.map((p) => p.id)),
    [selectedPlaces]
  );

  const setupProgress = selectedPlaces.length > 0 && categories.length > 0 ? 25 : 0;
  const canProceed = categories.length > 0 && selectedPlaces.length > 0;

  useEffect(() => {
    setSelectedBusinesses(selectedPlaces);
    setTargetLocation(districtNames.join(', ') || 'Custom area');
    setEstimatedReach(dailyReach);
    updateData({
      locations: districtNames.length > 0 ? districtNames : [],
      venueTypes: categories,
    });
  }, [
    selectedPlaces,
    districtNames,
    categories,
    dailyReach,
    setSelectedBusinesses,
    setTargetLocation,
    setEstimatedReach,
    updateData,
  ]);

  useEffect(() => {
    if (initialCenter) {
      setCenter(initialCenter);
      setMapZoom(DEFAULT_USER_ZOOM);
    } else if (initialDistrict) {
      const city = cities.find((c) => c.name === initialDistrict);
      if (city) {
        setCenter([city.longitude, city.latitude]);
        setMapZoom(DEFAULT_USER_ZOOM);
      }
    }
  }, [initialCenter, initialDistrict]);

  useEffect(() => {
    if (initialCenter || initialDistrict || !mapLocation.ready) return;
    setCenter([mapLocation.longitude, mapLocation.latitude]);
    setMapZoom(mapLocation.zoom);
    mapRef.current?.flyTo({
      center: [mapLocation.longitude, mapLocation.latitude],
      zoom: mapLocation.zoom,
      duration: 1200,
    });
  }, [mapLocation.ready, mapLocation.longitude, mapLocation.latitude, mapLocation.zoom, initialCenter, initialDistrict]);

  const jumpToCity = (name: string, longitude: number, latitude: number) => {
    setCenter([longitude, latitude]);
    setMapZoom(DEFAULT_USER_ZOOM);
    mapRef.current?.flyTo({
      center: [longitude, latitude],
      zoom: DEFAULT_USER_ZOOM,
      duration: 1000,
    });
  };

  const toggleCategory = (category: string) => {
    setCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      }
      return [...prev, category];
    });
  };

  return (
    <div className="flex-1 relative flex flex-col bg-background md:h-[91.8vh] h-[80vh] w-full">
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 relative">
          <Map
            ref={mapRef}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            initialViewState={{
              longitude: center[0],
              latitude: center[1],
              zoom: mapZoom,
              pitch: 60,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
          >
            <NavigationControl position="bottom-right" showCompass={false} visualizePitch={false} />
            <GeolocateControl
              position="bottom-right"
              positionOptions={{ enableHighAccuracy: true }}
              trackUserLocation={true}
              showUserHeading={true}
              style={{ marginBottom: 80 }}
            />

            <Marker
              longitude={center[0]}
              latitude={center[1]}
              draggable
              onDragStart={() => setIsDraggingCenter(true)}
              onDrag={(e) => setCenter([e.lngLat.lng, e.lngLat.lat])}
              onDragEnd={() => setIsDraggingCenter(false)}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#FFD700',
                  border: '3px solid white',
                  cursor: 'grab',
                  boxShadow: isDraggingCenter
                    ? '0 0 12px rgba(255,215,0,0.8)'
                    : '0 2px 8px rgba(0,0,0,0.4)',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </Marker>

            {allVenues.map((m) => {
              const inRange = selectedPlaceIds.has(m.id);
              return (
                <Marker key={m.id} longitude={m.longitude} latitude={m.latitude}>
                  <div
                    title={m.name}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: inRange ? '#ff9800' : '#666',
                      border: '2px solid white',
                      opacity: inRange ? 1 : 0.35,
                      transform: 'translate(-50%, -50%)',
                      transition: 'opacity 0.2s ease, background 0.2s ease',
                    }}
                  />
                </Marker>
              );
            })}

            <Source id="radius-circle-source" type="geojson" data={circlePoly} />
            <Layer
              id="radius-circle-fill"
              type="fill"
              source="radius-circle-source"
              paint={{ 'fill-color': '#FFD700', 'fill-opacity': 0.25 }}
            />
            <Layer
              id="radius-circle-outline"
              type="line"
              source="radius-circle-source"
              paint={{ 'line-color': '#FFD700', 'line-width': 3, 'line-opacity': 0.8 }}
            />
          </Map>

          <div className="absolute left-2 right-2 top-14 md:top-1.5 md:right-2 md:left-auto bg-overlay text-foreground p-3 md:p-4 rounded-lg z-10">
            <label className="block text-xs md:text-sm mb-2">
              Radius: {(radiusMeters / 1000).toFixed(1)} km (~{(radiusMeters / 1609.34).toFixed(1)} mi)
            </label>
            <input
              type="range"
              min={50}
              max={2000}
              step={10}
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(Number(e.target.value))}
              className="w-full md:w-48"
            />
            <div className="text-[10px] md:text-xs mt-1 opacity-70">Drag the gold handle to move center</div>
          </div>

          <button
            className="md:hidden absolute bottom-6 left-2 h-12 w-12 rounded-full bg-background border border-border text-muted-foreground hover:text-primary hover:bg-accent transition-all flex items-center justify-center group"
            onClick={() => setShowUserMenu((prev) => !prev)}
          >
            <Settings2 className="size-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>

          <section
            className={`absolute bottom-1.5 md:top-1.5 left-2 md:w-85 w-[96%] md:h-120 h-0 flex flex-col z-20 rounded-lg border border-border bg-popover text-popover-foreground shadow-2xl ${showUserMenu ? 'h-170' : ''}`}
          >
            <div className="p-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest leading-none">
                  Campaign Wizard
                </p>
                <p className="text-xs font-bold text-foreground mt-1">Location Targeting</p>
              </div>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors md:hidden"
                onClick={() => setShowUserMenu(false)}
              >
                <ChevronLeft />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                  Jump to City
                  <span className="text-[10px] text-primary/70">{filteredCities.length} cities</span>
                </label>
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Search cities across Nigeria..."
                  className="w-full px-3 py-2 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
                />
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {filteredCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => jumpToCity(city.name, city.longitude, city.latitude)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                  Venue Categories
                  <span className="text-[10px] text-primary/70">{categories.length} Selected</span>
                </label>
                <div className="space-y-1">
                  {VENUE_CATEGORIES.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors group"
                    >
                      <input
                        checked={categories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="h-3 w-3 rounded-lg border-border bg-transparent text-primary checked:bg-primary focus:ring-0 focus:ring-offset-0 transition-all"
                        style={{ backgroundImage: 'var(--checkbox-tick-svg)' }}
                        type="checkbox"
                        value={category}
                      />
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-background border border-border text-muted-foreground group-hover:text-primary transition-colors">
                          {CATEGORY_ICONS[category]}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{CATEGORY_LABELS[category].title}</p>
                          <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[category].subtitle}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-border py-4">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Advanced Parameters
                </label>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">High Foot Traffic</p>
                    <p className="text-[11px] text-muted-foreground">Focus on premium volume locations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox" readOnly />
                    <div className="w-9 h-5 bg-border-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-card after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Setup Progress
                </span>
                <span className="text-[10px] font-bold text-primary uppercase">{setupProgress}%</span>
              </div>
              <div className="w-full bg-border-dark h-1 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${setupProgress}%` }}
                />
              </div>
            </div>
          </section>
        </main>
      </div>

      <footer className="min-h-14 border-t border-border flex items-center justify-between md:px-12 px-3 py-2 z-30 shrink-0 gap-2">
        <div className="flex items-center md:gap-10 gap-2 min-w-0">
          <button
            type="button"
            className="md:hidden shrink-0 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-1"
          >
            Save Draft
          </button>
          <div className="flex flex-col min-w-0">
            <span className="text-muted-foreground text-[9px] sm:text-[10px] font-bold uppercase tracking-widest sm:tracking-[0.15em] mb-0.5 sm:mb-1">
              Est. Audience Reach
            </span>
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-foreground text-xs sm:text-sm font-bold tracking-tight transition-all duration-300">
                ~{dailyReach.toLocaleString()}
              </span>
              <span className="text-primary text-xs sm:text-sm font-semibold">people/day</span>
            </div>
          </div>
          <div className="hidden sm:block h-10 w-px bg-border-dark shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-muted-foreground text-[9px] sm:text-[10px] font-bold uppercase tracking-widest sm:tracking-[0.15em] mb-0.5 sm:mb-1">
              Target Locations
            </span>
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-foreground text-xs sm:text-sm font-bold tracking-tight transition-all duration-300">
                {selectedPlaces.length}
              </span>
              <span className="text-muted-foreground text-xs sm:text-sm font-medium">venues</span>
            </div>
          </div>
        </div>

        <button
          disabled={!canProceed}
          onClick={nextStage}
          className="px-4 py-2 cursor-pointer rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs shadow-[0_8px_30px_rgb(242,208,13,0.15)] transition-all flex items-center gap-2 group md:hidden disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          Next
          <MoveRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>

        <div className="md:flex items-center gap-4 hidden">
          <button className="px-8 py-3.5 cursor-pointer rounded-xl text-muted-foreground hover:text-foreground font-semibold text-xs transition-all">
            Save Draft
          </button>
          <button
            onClick={nextStage}
            disabled={!canProceed}
            className="px-5 py-2 cursor-pointer rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs shadow-[0_8px_30px_rgb(242,208,13,0.15)] transition-all flex items-center gap-3 group disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next Step: Ad Creative
            <MoveRight className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </footer>
    </div>
  );
}
