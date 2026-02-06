'use client';
import { useState } from 'react';
import WarRoomMap from '@/components/features/map/WarRoomMap'; // Reusing your map component

export default function LocationPage() {
    const [radius, setRadius] = useState(2.5);
    const [highTraffic, setHighTraffic] = useState(true);

    return (
        <div className="flex h-full w-full">
            {/* LEFT SIDEBAR: Controls & Filters */}
            <aside className="w-105 bg-[#1d1b13] border-r border-border-dark flex flex-col z-20 shrink-0">
                <div className="p-6 border-b border-border-dark">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-black text-xs font-bold">1</span>
                            <p className="text-primary text-sm font-medium">Step 1: Location Targeting</p>
                        </div>
                        <h1 className="text-2xl font-bold">Target Area</h1>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
                    {/* Search */}
                    <div className="flex flex-col gap-3">
                        <label className="text-text-dim text-xs font-semibold uppercase tracking-wider">Search</label>
                        <div className="flex w-full rounded-lg group focus-within:ring-2 ring-primary/50 border border-border-dark bg-[#27251b]">
                            <div className="px-4 flex items-center justify-center text-text-dim">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                className="w-full bg-transparent border-none text-white h-12 text-sm focus:ring-0 placeholder:text-text-dim"
                                placeholder="Search city or zip code"
                                defaultValue="Seattle, WA"
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-col gap-3">
                        <label className="text-text-dim text-xs font-semibold uppercase tracking-wider">Venue Categories</label>
                        <div className="space-y-1">
                            {[
                                { icon: 'fastfood', label: 'Fast Food Chains', count: '54 locations', checked: true },
                                { icon: 'business_center', label: 'Corporate Canteens', count: '12 locations', checked: false },
                                { icon: 'school', label: 'Universities', count: '3 locations', checked: true }
                            ].map((item) => (
                                <label key={item.label} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#2a281f] cursor-pointer transition-colors group">
                                    <input
                                        type="checkbox"
                                        defaultChecked={item.checked}
                                        className="h-5 w-5 rounded border-border-dark bg-transparent text-primary focus:ring-primary focus:ring-offset-0"
                                    />
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-border-dark text-text-dim group-hover:text-white">
                                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium leading-none">{item.label}</p>
                                        <p className="text-text-dim text-xs mt-1">~{item.count}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Slider for Radius Demo */}
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between text-xs text-text-dim font-semibold uppercase tracking-wider">
                            <span>Radius</span>
                            <span>{radius} mi</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="10"
                            step="0.5"
                            value={radius}
                            onChange={(e) => setRadius(parseFloat(e.target.value))}
                            className="w-full h-2 bg-border-dark rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                </div>

                {/* Persistent Footer Stats */}
                <div className="p-6 bg-[#1d1b13] border-t border-border-dark">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-text-dim text-xs font-medium uppercase">Est. Audience</span>
                        <span className="text-primary text-lg font-bold">~12,500 <span className="text-sm font-normal">/day</span></span>
                    </div>
                    <button className="w-full py-3 rounded-lg bg-primary text-black font-bold hover:bg-[#d9ba0b] transition-colors flex items-center justify-center gap-2">
                        Next Step
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                </div>
            </aside>

            {/* RIGHT CONTENT: Map Visualization */}
            <main className="flex-1 relative bg-[#101010] overflow-hidden">
                <WarRoomMap />

                {/* Overlay Radius UI (Simulated on top of Mapbox) */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                    {/* This would actually be drawn by Mapbox GL Draw in production, but CSS for mockup */}
                    <div
                        className="rounded-full border-2 border-primary bg-primary/20 shadow-[0_0_40px_rgba(242,208,13,0.2)] flex items-center justify-center relative backdrop-blur-[1px]"
                        style={{ width: `${radius * 100}px`, height: `${radius * 100}px` }}
                    >
                        <div className="absolute -top-8 bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur border border-border-dark">
                            Radius: {radius} mi
                        </div>
                    </div>
                </div>

                {/* Map Controls */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
                    <button className="w-10 h-10 bg-bg-dark border border-border-dark rounded-lg text-white hover:bg-surface-dark flex items-center justify-center">
                        <span className="material-symbols-outlined">my_location</span>
                    </button>
                </div>
            </main>
        </div>
    );
}