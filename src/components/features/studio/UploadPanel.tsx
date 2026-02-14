'use client';
import { useCampaignStore } from '@/store/useCampaignStore';
import { CheckCircle, ChevronDown, ChevronUp, Gem, Image, Info, Palette, Plus, ShieldCheck, ShoppingBag, TextInitial } from 'lucide-react';
import { useState, useRef } from 'react';

const LOGOS = [
    { id: 'zenith', name: 'Zenith Bank', dark: true, color: '#1a1a2e' },
    { id: 'generic', name: 'Generic Logo', dark: false, color: '#ffffff' },
];

const STICKERS = [
    { id: 'organic', name: 'Organic', icon: 'eco', color: 'text-green-500', bg: 'bg-green-900/20' },
    { id: 'special', name: 'Special Offer', icon: 'local_offer', color: 'text-primary', bg: 'bg-primary/10' },
    { id: 'premium', name: 'Premium', icon: 'verified', color: 'text-purple-400', bg: 'bg-purple-900/20' },
    { id: 'limited', name: 'Limited Time', icon: 'timer', color: 'text-orange-400', bg: 'bg-orange-900/20' },
];

const COLORS = [
    '#ffffff', '#000000', '#FF6B9D', '#00D4FF', '#FFA500', '#4CAF50', '#d4c5a6', '#8B4513', '#DC143C', '#FF1493'
];

const PRODUCTS = [
    { id: 'cup', name: '☕ Cup', type: 'cup' },
    { id: 'box', name: '📦 Box', type: 'box' },
    { id: 'bag', name: '🛍️ Bag', type: 'bag' },
    { id: 'pizza-box', name: '🍕 Pizza Box', type: 'pizza-box' },
];

interface UploadPanelProps {

    // id?: string,
    name: string,
    // specs: string,
    // eco?: string,
    // dimensions: string,
    // image: string,
    // link: string,
    // pricePerUnit: number,


}

// { product }: UploadPanelProps
export function UploadPanel({ name }: UploadPanelProps) {
    const { updateDesign, designConfig } = useCampaignStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [expandedSections, setExpandedSections] = useState({
        product: true,
        colors: false,
        texture: false,
        branding: false,
        materials: false,
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleApplyLogo = (logoId: string) => {
        updateDesign({ logo: logoId });
    };

    const handleColorChange = (color: string) => {
        updateDesign({ color });
    };

    const handleTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                console.log('Texture uploaded:', dataUrl);
                updateDesign({ textureUrl: dataUrl });
            };
            
            reader.readAsDataURL(file);
        }
    };

    const handleBrandTextChange = (text: string) => {
        updateDesign({ brandText: text });
    };

    const handleTextColorChange = (color: string) => {
        updateDesign({ textColor: color });
    };

    return (
        <div className="flex flex-col h-full bg-[#1c1a15]">
            {/* Header */}
            <div className="p-5 border-b border-border-dark sticky top-0 bg-[#1c1a15]/95 backdrop-blur">
                <h3 className="text-base font-bold text-white">Design Studio</h3>
                <p className="text-xs text-text-dim mt-1">Customize your product</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">


                {/* Base Colors */}
                <div className="border border-border-dark rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('colors')}
                        className="w-full px-4 py-3 bg-[#2d2a1e] hover:bg-[#3d3a2e] transition-colors flex items-center justify-between font-semibold text-white text-sm"
                    >
                        <span className="flex items-center gap-2">
                            <Palette className="size-4" />
                            Base Color
                        </span>
                        <span className="text-lg">{expandedSections.colors ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}</span>
                    </button>
                    {expandedSections.colors && (
                        <div className="p-4 bg-[#1c1a15] space-y-3">
                            <div className="grid grid-cols-5 gap-2">
                                {COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => handleColorChange(color)}
                                        className={`w-full h-10 rounded-lg border-2 transition-all ${designConfig.color === color
                                            ? 'border-white'
                                            : 'border-gray-600 hover:border-gray-400'
                                            }`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={designConfig.color}
                                    onChange={(e) => handleColorChange(e.target.value)}
                                    className="w-16 h-10 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={designConfig.color}
                                    onChange={(e) => handleColorChange(e.target.value)}
                                    className="flex-1 px-2 h-10 bg-[#2d2a1e] text-white text-xs rounded border border-border-dark"
                                    placeholder="#ffffff"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Texture Upload */}
                <div className="border border-border-dark rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('texture')}
                        className="w-full px-4 py-3 bg-[#2d2a1e] hover:bg-[#3d3a2e] transition-colors flex items-center justify-between font-semibold text-white text-sm"
                    >
                        <span className="flex items-center gap-2">
                            <Image className="size-4" />
                            Texture
                        </span>


                        <span className="text-lg">{expandedSections.texture ? <ChevronDown className='size-4' /> : <ChevronUp className='size-4' />}</span>
                    </button>
                    {expandedSections.texture && (
                        <div className="p-4 bg-[#1c1a15] space-y-3">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-20 border-2 border-dashed border-[#54503b] rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-[#2d2a1e] transition-colors group"
                            >
                                <span className="text-text-dim group-hover:text-primary text-2xl"><Plus className="size-6" /></span>
                                <span className="text-xs font-medium text-text-dim group-hover:text-primary">Upload Texture</span>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleTextureUpload}
                                className="hidden"
                            />
                            {designConfig.textureUrl && (
                                <div className="text-xs text-green-400 flex items-center gap-2">
                                    <CheckCircle className="size-4" />
                                    Texture applied
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-text-dim block">Scale: {designConfig.textureScale.toFixed(1)}x</label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3"
                                    step="0.1"
                                    value={designConfig.textureScale}
                                    onChange={(e) => updateDesign({ textureScale: parseFloat(e.target.value) })}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Branding/Text */}
                <div className="border border-border-dark rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('branding')}
                        className="w-full px-4 py-3 bg-[#2d2a1e] hover:bg-[#3d3a2e] transition-colors flex items-center justify-between font-semibold text-white text-sm"
                    >
                        <span className="flex items-center gap-2">
                            <TextInitial className="size-4" />
                            Branding Text
                        </span>
                        <span className="text-lg">{expandedSections.branding ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}</span>
                    </button>
                    {expandedSections.branding && (
                        <div className="p-4 bg-[#1c1a15] space-y-3">
                            <input
                                type="text"
                                value={designConfig.brandText}
                                onChange={(e) => handleBrandTextChange(e.target.value)}
                                placeholder="Enter brand text"
                                maxLength={30}
                                className="w-full px-3 h-10 bg-[#2d2a1e] text-white text-sm rounded border border-border-dark placeholder:text-text-dim"
                            />
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-text-dim block">Text Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={designConfig.textColor}
                                        onChange={(e) => handleTextColorChange(e.target.value)}
                                        className="w-12 h-10 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={designConfig.textColor}
                                        onChange={(e) => handleTextColorChange(e.target.value)}
                                        className="flex-1 px-2 h-10 bg-[#2d2a1e] text-white text-xs rounded border border-border-dark"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Material Properties */}
                <div className="border border-border-dark rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('materials')}
                        className="w-full px-4 py-3 bg-[#2d2a1e] hover:bg-[#3d3a2e] transition-colors flex items-center justify-between font-semibold text-white text-sm"
                    >
                        <span className="flex items-center gap-2">
                            <Gem className="size-4" />
                            Material
                        </span>
                        <span className="text-lg">{expandedSections.materials ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}</span>
                    </button>
                    {expandedSections.materials && (
                        <div className="p-4 bg-[#1c1a15] space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-text-dim block mb-2">Metalness: {designConfig.metalness.toFixed(2)}</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={designConfig.metalness}
                                    onChange={(e) => updateDesign({ metalness: parseFloat(e.target.value) })}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-text-dim block mb-2">Roughness: {designConfig.roughness.toFixed(2)}</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={designConfig.roughness}
                                    onChange={(e) => updateDesign({ roughness: parseFloat(e.target.value) })}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Logos Section */}
                <div className="border border-border-dark rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-[#2d2a1e]">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            <ShieldCheck className="size-4" />
                            Logo Template
                        </h4>
                    </div>
                    <div className="p-4 bg-[#1c1a15] grid grid-cols-2 gap-3">
                        {LOGOS.map((logo) => (
                            <button
                                key={logo.id}
                                onClick={() => handleApplyLogo(logo.id)}
                                className={`aspect-square rounded-lg border-2 p-3 flex items-center justify-center cursor-pointer transition-all ${designConfig.logo === logo.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border-dark hover:border-primary'
                                    } ${logo.dark ? 'bg-[#2d2a1e]' : 'bg-white'}`}
                            >
                                <div className={`text-center leading-none tracking-tight font-bold text-xs ${logo.dark ? 'text-white' : 'text-slate-900'}`}>
                                    <span className="text-red-500 block text-lg">Z</span>enith<br />Bank
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="border border-border-dark/50 rounded-lg p-3 bg-primary/5">
                    <p className="text-xs text-text-dim leading-relaxed">
                        <Info className="size-4 align-middle mr-1 inline" />
                        All changes are applied in real-time to your 3D preview.
                    </p>
                </div>
            </div>
        </div>
    );
}