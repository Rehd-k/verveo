'use client';
import { useCampaignStore } from '@/store/useCampaignStore';

const LOGOS = [
    { id: 'zenith', name: 'Zenith Bank', dark: true },
    { id: 'generic', name: 'Generic Logo', dark: false },
];

const STICKERS = [
    { id: 'organic', name: 'Organic', icon: 'eco', color: 'text-green-500', bg: 'bg-green-900/20' },
    { id: 'special', name: 'Special Offer', icon: 'local_offer', color: 'text-primary', bg: 'bg-primary/10' },
    { id: 'premium', name: 'Premium', icon: 'verified', color: 'text-purple-400', bg: 'bg-purple-900/20' },
    { id: 'limited', name: 'Limited Time', icon: 'timer', color: 'text-orange-400', bg: 'bg-orange-900/20' },
];

export function UploadPanel() {
    const { updateDesign } = useCampaignStore();

    const handleApplyLogo = (logoId: string) => {
        // In a real app, this would set a URL or SVG path to the Zustand store
        updateDesign({ logo: logoId });
    };

    return (
        <div className="flex flex-col h-full bg-[#1c1a15]">
            {/* Header */}
            <div className="p-5 border-b border-border-dark">
                <h3 className="text-base font-bold text-white">Your Uploads</h3>
                <p className="text-xs text-text-dim mt-1">Drag and drop assets onto the box.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* Upload Button Trigger */}
                <button className="w-full h-24 border border-dashed border-[#54503b] rounded-lg flex flex-col items-center justify-center gap-2 mb-6 hover:bg-[#2d2a1e] transition-colors group">
                    <span className="material-symbols-outlined text-text-dim group-hover:text-primary">add_photo_alternate</span>
                    <span className="text-xs font-medium text-text-dim">Upload media</span>
                </button>

                {/* Logos Section */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8a8776] mb-3">Logos</h4>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {LOGOS.map((logo) => (
                        <div
                            key={logo.id}
                            onClick={() => handleApplyLogo(logo.id)}
                            className={`aspect-square rounded-lg border border-border-dark p-4 flex items-center justify-center cursor-grab hover:border-primary transition-all relative overflow-hidden ${logo.dark ? 'bg-[#2d2a1e]' : 'bg-white'
                                }`}
                        >
                            <div className={`text-center leading-none tracking-tight font-bold ${logo.dark ? 'text-white' : 'text-slate-900'}`}>
                                <span className="text-red-500 text-xl">Z</span>enith<br />Bank
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stickers Section */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8a8776] mb-3">Stickers & Badges</h4>
                <div className="grid grid-cols-2 gap-3">
                    {STICKERS.map((sticker) => (
                        <div
                            key={sticker.id}
                            className="bg-[#2d2a1e] rounded-lg border border-border-dark p-3 flex flex-col gap-2 hover:border-primary cursor-pointer transition-colors"
                        >
                            <div className={`aspect-square ${sticker.bg} rounded flex items-center justify-center`}>
                                <span className={`material-symbols-outlined ${sticker.color} text-3xl`}>{sticker.icon}</span>
                            </div>
                            <span className="text-xs text-center font-medium text-text-dim">{sticker.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}