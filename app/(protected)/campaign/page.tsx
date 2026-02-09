'use client';
import { Building2, Hamburger, MoveRight, School, Search, Settings2 } from 'lucide-react';
import Map, { GeolocateControl, Layer, Marker, NavigationControl, Source } from 'react-map-gl/mapbox';
import { booleanPointInPolygon, point, circle } from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useMemo, useState } from 'react';

export default function LocationPage() {
    const [radiusMeters, setRadiusMeters] = useState(4000);           // ~2.5 miles ≈ 4023 m
    const [center, setCenter] = useState<[number, number]>([3.3792, 6.5244]); // lng, lat – start at your initial view or user's location
    const [isDraggingCenter, setIsDraggingCenter] = useState(false);
    // Optional: selected places (array of your marker objects or just IDs)
    const [selectedPlaces, setSelectedPlaces] = useState<typeof markers[0][]>([]);

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



    const circlePoly = useMemo(() => {
        return circle(center, radiusMeters / 1000, {
            units: 'kilometers',
            steps: 64,
        });
    }, [center, radiusMeters]);

    useEffect(() => {
        if (!markers.length) return;

        const selected = markers.filter((m) => {
            const pt = point([m.longitude, m.latitude]);
            return booleanPointInPolygon(pt, circlePoly);
        });

        setSelectedPlaces(selected);
        console.log(selected)
    }, [circlePoly, markers]);   // ← depend on memoized poly


    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex flex-1 overflow-hidden">

                <main className="flex-1 relative bg-background-dark">
                    <Map
                        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                        initialViewState={{
                            longitude: 3.3792,
                            latitude: 6.5244,
                            zoom: 14,
                        }}
                        style={{ width: "100%", height: "100%" }}
                        mapStyle="mapbox://styles/mapbox/dark-v11"
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
                                draggable
                                onDragStart={() => setIsDraggingCenter(true)}
                                onDrag={(e) => {
                                    setCenter([e.lngLat.lng, e.lngLat.lat]);
                                }}
                                onDragEnd={() => setIsDraggingCenter(false)}
                            >
                                <div
                                    style={{
                                        width: 24,                // even larger for better tap/hover
                                        height: 24,
                                        borderRadius: "50%",
                                        background: "#ff9800",
                                        border: "3px solid white",
                                        cursor: "pointer",
                                        pointerEvents: "auto",
                                        transform: "translate(-50%, -50%)",
                                        transition: "all 0.2s ease"
                                    }}
                                />
                            </Marker>
                        ))}
                        <Source
                            id="radius-circle-source"
                            type="geojson"
                            data={circlePoly}
                        />

                        <Layer
                            id="radius-circle-fill"
                            type="fill"
                            source="radius-circle-source"
                            paint={{
                                'fill-color': '#FFD700',        // yellow like your screenshot
                                'fill-opacity': 0.25,
                            }}
                        />

                        <Layer
                            id="radius-circle-outline"
                            type="line"
                            source="radius-circle-source"
                            paint={{
                                'line-color': '#FFD700',
                                'line-width': 3,
                                'line-opacity': 0.8,
                            }}
                        />

                    </Map>
                    <div className="absolute top-2 right-2 bg-black/70 text-white p-4 rounded-lg z-10">
                        <label className="block text-sm mb-2">
                            Radius: {(radiusMeters / 1000).toFixed(1)} km (~{(radiusMeters / 1609.34).toFixed(1)} mi)
                        </label>
                        <input
                            type="range"
                            min={500}
                            max={20000}
                            step={100}
                            value={radiusMeters}
                            onChange={(e) => setRadiusMeters(Number(e.target.value))}
                            className="w-48"
                        />
                        <div className="text-xs mt-1 opacity-70">
                            Drag the white handle to move center
                        </div>
                    </div>


                    <button className=" md:hidden absolute bottom-6 left-2 h-12 w-12 rounded-full bg-background-dark border border-border-dark text-gray-400 hover:text-primary hover:bg-white/5 transition-all flex items-center justify-center group">
                        <Settings2 className="size-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    <section className="absolute bottom-1.5 md:top-2 left-2  md:w-85 w-[96%] md:h-133 h-0 flex flex-col z-20  bg-background-dark rounded-lg">


                        <div className="p-2 flex items-center gap-3">
                            <button className="text-gray-400 hover:text-white transition-colors">
                                {/* <ChevronLeft /> */}
                            </button>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest leading-none">
                                    Campaign Wizard
                                </p>
                                <p className="text-xs font-bold text-white mt-1">
                                    Location Targeting
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 space-y-8">
                            <div className="space-t-3">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Target Area
                                </label>
                                <div className="relative group">
                                    <Search className=" size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl group-focus-within:text-primary transition-colors" />

                                    <input
                                        className="w-full text-xs bg-background-dark border border-border-dark rounded-lg py-1 pl-10 pr-4 text-gray-500 placeholder:text-gray-600 focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                        placeholder="Search city, neighborhood, or zip..."
                                        type="text"
                                        defaultValue="Seattle, WA"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                                    Venue Categories
                                    <span className="text-[10px] text-primary/70">3 Selected</span>
                                </label>
                                <div className="space-y-1">
                                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                                        <input
                                            defaultChecked
                                            className="h-3 w-3 rounded-lg border-border-dark bg-transparent text-primary checked:bg-primary focus:ring-0 focus:ring-offset-0 transition-all"
                                            style={{ backgroundImage: "var(--checkbox-tick-svg)" }}
                                            type="checkbox"
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-background-dark border border-border-dark text-gray-400 group-hover:text-primary transition-colors">
                                                <Hamburger className='size-4' />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-white">
                                                    Fast Food Chains
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Includes quick-service restaurants
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                                        <input
                                            defaultChecked
                                            className="h-3 w-3 rounded border-border-dark bg-transparent text-primary checked:bg-primary focus:ring-0 focus:ring-offset-0 transition-all"
                                            style={{ backgroundImage: "var(--checkbox-tick-svg)" }}
                                            type="checkbox"
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-background-dark border border-border-dark text-gray-400 group-hover:text-primary transition-colors">
                                                <Building2 className='size-4' />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-white">
                                                    Corporate Canteens
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Business parks and office hubs
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                                        <input
                                            defaultChecked
                                            className="h-3 w-3 rounded-lg border-border-dark bg-transparent text-primary checked:bg-primary focus:ring-0 focus:ring-offset-0 transition-all"
                                            style={{ backgroundImage: "var(--checkbox-tick-svg)" }}
                                            type="checkbox"
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-background-dark border border-border-dark text-gray-400 group-hover:text-primary transition-colors">
                                                <School className='size-4' />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">Universities</p>
                                                <p className="text-[11px] text-gray-500">
                                                    Higher education campuses
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-4 border-t border-border-dark pb-4">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Advanced Parameters
                                </label>
                                <div className="flex items-center justify-between mt-4">
                                    <div>
                                        <p className="text-xs font-medium text-gray-200">
                                            High Foot Traffic
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            Focus on premium volume locations
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            defaultChecked
                                            className="sr-only peer"
                                            type="checkbox"
                                        />
                                        <div className="w-9 h-5 bg-border-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-200">
                                            Exclude Industrial Zones
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            Omit logistics and manufacturing hubs
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input className="sr-only peer" type="checkbox" />
                                        <div className="w-9 h-5 bg-border-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t ">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    Setup Progress
                                </span>
                                <span className="text-[10px] font-bold text-primary uppercase">
                                    25%
                                </span>
                            </div>
                            <div className="w-full bg-border-dark h-1 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-1/4" />
                            </div>
                        </div>

                    </section>
                </main>
            </div>
            <footer className="h-14 bg-sidebar-dark border-t border-border-dark flex items-center justify-between md:px-12 px-2 z-30 shrink-0">
                <div className="flex items-center md:gap-10 gap-2">
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">
                            Est. Audience Reach
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-white text-sm font-bold tracking-tight">
                                ~12,500
                            </span>
                            <span className="text-primary text-sm font-semibold">people/day</span>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-border-dark" />
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">
                            Target Locations
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-white text-sm font-bold tracking-tight">
                                69
                            </span>
                            <span className="text-gray-400 text-sm font-medium">
                                total venues
                            </span>
                        </div>
                    </div>
                </div>
                <button className="px-5 py-2 cursor-pointer rounded-xl bg-primary text-background-dark hover:bg-primary/90 font-bold text-xs shadow-[0_8px_30px_rgb(242,208,13,0.15)] transition-all flex items-center gap-3 group md:hidden">

                    <MoveRight className=" size-4 transition-transform group-hover:translate-x-1" />
                </button>
                <div className="md:flex items-center gap-4 hidden">
                    <button className="px-8 py-3.5 cursor-pointer rounded-xl text-gray-400 hover:text-white font-semibold text-xs transition-all">
                        Save Draft
                    </button>
                    <button className="px-5 py-2 cursor-pointer rounded-xl bg-primary text-background-dark hover:bg-primary/90 font-bold text-xs shadow-[0_8px_30px_rgb(242,208,13,0.15)] transition-all flex items-center gap-3 group">
                        Next Step: Ad Creative
                        <MoveRight className=" size-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </footer>
        </div>

    );
}