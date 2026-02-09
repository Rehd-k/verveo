'use client';
import { useState } from 'react';
import WarRoomMap from '@/components/features/map/WarRoomMap'; // Reusing your map component

export default function LocationPage() {
    const [radius, setRadius] = useState(2.5);
    const [highTraffic, setHighTraffic] = useState(true);

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex flex-1 overflow-hidden">
                <aside className="w-95 bg-sidebar-dark border-r border-border-dark flex flex-col z-20 shrink-0">
                    <div className="p-6 border-b border-border-dark flex items-center gap-3">
                        <button className="text-gray-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-sm font-semibold text-gray-400 uppercase tracking-widest leading-none">
                                Campaign Wizard
                            </h1>
                            <p className="text-xl font-bold text-white mt-1">
                                Location Targeting
                            </p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Target Area
                            </label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl group-focus-within:text-primary transition-colors">
                                    search
                                </span>
                                <input
                                    className="w-full bg-background-dark border border-border-dark rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:ring-1 focus:ring-primary focus:border-primary transition-all"
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
                                        className="h-5 w-5 rounded border-border-dark bg-transparent text-primary checked:bg-primary focus:ring-0 focus:ring-offset-0 transition-all"
                                        style={{ backgroundImage: "var(--checkbox-tick-svg)" }}
                                        type="checkbox"
                                    />
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-background-dark border border-border-dark text-gray-400 group-hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">
                                                fastfood
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                Fast Food Chains
                                            </p>
                                            <p className="text-[11px] text-gray-500">
                                                Includes quick-service restaurants
                                            </p>
                                        </div>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                                    <input
                                        defaultChecked
                                        className="h-5 w-5 rounded border-border-dark bg-transparent text-primary checked:bg-primary focus:ring-0 focus:ring-offset-0 transition-all"
                                        style={{ backgroundImage: "var(--checkbox-tick-svg)" }}
                                        type="checkbox"
                                    />
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-background-dark border border-border-dark text-gray-400 group-hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">
                                                corporate_fare
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                Corporate Canteens
                                            </p>
                                            <p className="text-[11px] text-gray-500">
                                                Business parks and office hubs
                                            </p>
                                        </div>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                                    <input
                                        defaultChecked
                                        className="h-5 w-5 rounded border-border-dark bg-transparent text-primary checked:bg-primary focus:ring-0 focus:ring-offset-0 transition-all"
                                        style={{ backgroundImage: "var(--checkbox-tick-svg)" }}
                                        type="checkbox"
                                    />
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-background-dark border border-border-dark text-gray-400 group-hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">
                                                school
                                            </span>
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
                        <div className="space-y-4 pt-4 border-t border-border-dark">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Advanced Parameters
                            </label>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-200">
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
                    <div className="p-6 border-t border-border-dark bg-background-dark/50">
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
                </aside>
                <main className="flex-1 relative bg-background-dark">
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center contrast-[1.1] brightness-[0.6]"
                        style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAN69GGMK3j0D2bh1iU5eZJBTMZ0z5deXoNiKirZX2x_haj1r-eIunJ1uq3I4uSfzXdAJumHUi8D16TIwnWTSVxgh6kKHJuCFkd0CJfBQw-3iYKiOsVCerjXs0Ft6YDvu_8G4yMGclOgiYXZK0BSIbJZarRdSSEkChC-D6TtcSHjG-mOh08DddZ76xOjCZgWerXwn3D_N8JxGnjVbPVlJyx1oz3fxDpzUNId_1x6hANpH8_YHl6mDZfx2scxkYmE5gvAVwZDNl2RmU")'
                        }}
                    ></div>
                    <div className="absolute inset-0 bg-background-dark/30 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full border-2 border-primary bg-primary/10 shadow-[0_0_60px_rgba(242,208,13,0.15)] z-10 flex items-center justify-center">
                        <div className="w-3 h-3 bg-primary rounded-full shadow-lg border-2 border-background-dark" />
                        <div className="absolute -top-12 flex flex-col items-center">
                            <div className="bg-black/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-primary/40 backdrop-blur-md shadow-xl flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px] text-primary">
                                    distance
                                </span>
                                Radius: 2.5 mi
                            </div>
                            <div className="w-px h-4 bg-primary/60 mt-1" />
                        </div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 bg-white border-2 border-primary rounded-full cursor-ew-resize hover:scale-125 transition-transform shadow-lg" />
                    </div>
                    <div className="absolute top-[35%] left-[42%] text-primary z-20">
                        <span className="material-symbols-outlined text-[36px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                            location_on
                        </span>
                    </div>
                    <div className="absolute top-[58%] left-[55%] text-primary z-20 opacity-80">
                        <span className="material-symbols-outlined text-[32px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                            location_on
                        </span>
                    </div>
                    <div className="absolute top-[48%] left-[65%] text-primary z-20 opacity-80">
                        <span className="material-symbols-outlined text-[32px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                            location_on
                        </span>
                    </div>
                    <div className="absolute top-[62%] left-[48%] text-primary z-20 opacity-70">
                        <span className="material-symbols-outlined text-[28px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                            location_on
                        </span>
                    </div>
                    <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
                        <div className="flex flex-col bg-sidebar-dark border border-border-dark rounded-xl overflow-hidden shadow-2xl">
                            <button className="w-12 h-12 flex items-center justify-center hover:bg-white/5 transition-colors text-white border-b border-border-dark">
                                <span className="material-symbols-outlined">add</span>
                            </button>
                            <button className="w-12 h-12 flex items-center justify-center hover:bg-white/5 transition-colors text-white border-b border-border-dark">
                                <span className="material-symbols-outlined">remove</span>
                            </button>
                            <button className="w-12 h-12 flex items-center justify-center hover:bg-white/5 transition-colors text-white">
                                <span className="material-symbols-outlined">my_location</span>
                            </button>
                        </div>
                        <button className="w-12 h-12 flex items-center justify-center bg-sidebar-dark border border-border-dark rounded-xl hover:bg-white/5 transition-colors text-white shadow-2xl">
                            <span className="material-symbols-outlined">layers</span>
                        </button>
                    </div>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-sidebar-dark/90 backdrop-blur-xl border border-border-dark px-2 py-1.5 rounded-2xl flex items-center gap-1 z-20 shadow-2xl">
                        <button className="p-2.5 rounded-xl bg-primary text-background-dark font-bold shadow-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">
                                radio_button_unchecked
                            </span>
                            <span className="text-xs uppercase tracking-wider pr-1">Radius</span>
                        </button>
                        <button className="p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                            <span className="material-symbols-outlined text-[20px]">
                                pentagon
                            </span>
                        </button>
                        <button className="p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                            <span className="material-symbols-outlined text-[20px]">draw</span>
                        </button>
                        <div className="w-px h-6 bg-border-dark mx-1" />
                        <button className="p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    </div>
                </main>
            </div>
            <footer className="h-24 bg-sidebar-dark border-t border-border-dark flex items-center justify-between px-12 z-30 shrink-0">
                <div className="flex items-center gap-10">
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">
                            Est. Audience Reach
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-white text-3xl font-bold tracking-tight">
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
                            <span className="text-white text-3xl font-bold tracking-tight">
                                69
                            </span>
                            <span className="text-gray-400 text-sm font-medium">
                                total venues
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-8 py-3.5 rounded-xl text-gray-400 hover:text-white font-semibold text-sm transition-all">
                        Save Draft
                    </button>
                    <button className="px-10 py-3.5 rounded-xl bg-primary text-background-dark hover:bg-primary/90 font-bold text-sm shadow-[0_8px_30px_rgb(242,208,13,0.15)] transition-all flex items-center gap-3 group">
                        Next Step: Ad Creative
                        <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                            arrow_forward
                        </span>
                    </button>
                </div>
            </footer>
        </div>

    );
}