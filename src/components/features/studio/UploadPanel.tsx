'use client';

import { useCampaignStore } from '@/store/useCampaignStore';
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Gem,
  Image,
  Info,
  Palette,
  Plus,
  ShieldCheck,
  TextInitial,
  X,
} from 'lucide-react';
import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const LOGOS = [
  { id: 'zenith', name: 'Zenith Bank', dark: true, color: '#1a1a2e' },
  { id: 'generic', name: 'Generic Logo', dark: false, color: '#ffffff' },
];

const COLORS = [
  '#ffffff',
  '#000000',
  '#FF6B9D',
  '#00D4FF',
  '#FFA500',
  '#4CAF50',
  '#d4c5a6',
  '#8B4513',
  '#DC143C',
  '#FF1493',
];

interface UploadPanelProps {
  name: string;
  /** Hide the sticky title when embedded in a mobile sheet that already has a header */
  hideHeader?: boolean;
}

export function UploadPanel({ name, hideHeader = false }: UploadPanelProps) {
  const { updateDesign, designConfig, selectedProduct } = useCampaignStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    product: true,
    colors: true,
    texture: false,
    branding: false,
    materials: false,
  });

  useEffect(() => {
    if (designConfig.textureUrl) {
      setExpandedSections((prev) => ({ ...prev, texture: true }));
    }
  }, [designConfig.textureUrl]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleApplyLogo = (logoId: string) => {
    updateDesign({ logo: logoId });
  };

  const handleColorChange = (color: string) => {
    updateDesign({ color });
  };

  const handleTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image must be under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateDesign({ textureUrl: dataUrl });
      setExpandedSections((prev) => ({ ...prev, texture: true }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearTexture = () => {
    updateDesign({ textureUrl: null });
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBrandTextChange = (text: string) => {
    updateDesign({ brandText: text });
  };

  const handleTextColorChange = (color: string) => {
    updateDesign({ textColor: color });
  };

  const SectionHeader = ({
    id,
    icon,
    label,
  }: {
    id: keyof typeof expandedSections;
    icon: ReactNode;
    label: string;
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(id)}
      className="flex min-h-11 w-full items-center justify-between bg-secondary px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/80"
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      {expandedSections[id] ? (
        <ChevronDown className="size-4 text-muted-foreground" />
      ) : (
        <ChevronUp className="size-4 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-card text-card-foreground">
      {!hideHeader && (
        <div className="sticky top-0 z-10 border-b border-border bg-card p-4 sm:p-5">
          <h3 className="text-base font-bold text-foreground">Design Studio</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {selectedProduct?.name ?? name} — customize your product
          </p>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 sm:space-y-4 sm:p-4">
        {/* Base Colors */}
        <div className="overflow-hidden rounded-lg border border-border">
          <SectionHeader
            id="colors"
            icon={<Palette className="size-4" />}
            label="Base Color"
          />
          {expandedSections.colors && (
            <div className="space-y-3 bg-card p-4">
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className={cn(
                      'h-10 w-full rounded-lg border-2 transition-all',
                      designConfig.color === color
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-border hover:border-muted-foreground'
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={designConfig.color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-11 w-14 cursor-pointer rounded border border-border bg-transparent"
                  aria-label="Custom color"
                />
                <input
                  type="text"
                  value={designConfig.color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-secondary px-3 text-xs text-foreground"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          )}
        </div>

        {/* Texture Upload */}
        <div className="overflow-hidden rounded-lg border border-border">
          <SectionHeader
            id="texture"
            icon={<Image className="size-4" />}
            label="Texture"
          />
          {expandedSections.texture && (
            <div className="space-y-3 bg-card p-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group flex h-20 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary hover:bg-accent"
              >
                <Plus className="size-6 text-muted-foreground group-hover:text-primary" />
                <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">
                  Upload Texture
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/*"
                onChange={handleTextureUpload}
                className="hidden"
              />
              {uploadError && (
                <p className="text-xs text-destructive">{uploadError}</p>
              )}
              {designConfig.textureUrl && (
                <>
                  <div className="relative overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={designConfig.textureUrl}
                      alt="Uploaded texture"
                      className="h-24 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleClearTexture}
                      className="absolute right-2 top-2 rounded-full bg-overlay p-1.5 text-foreground"
                      title="Remove texture"
                      aria-label="Remove texture"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-success">
                    <CheckCircle className="size-4" />
                    Texture applied
                  </div>
                </>
              )}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-muted-foreground">
                  Scale: {designConfig.textureScale.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={designConfig.textureScale}
                  onChange={(e) =>
                    updateDesign({ textureScale: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-muted-foreground">
                  Rotation: {((designConfig.textureRotation * 180) / Math.PI).toFixed(0)}°
                </label>
                <input
                  type="range"
                  min="0"
                  max={Math.PI * 2}
                  step="0.1"
                  value={designConfig.textureRotation}
                  onChange={(e) =>
                    updateDesign({ textureRotation: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Branding */}
        <div className="overflow-hidden rounded-lg border border-border">
          <SectionHeader
            id="branding"
            icon={<TextInitial className="size-4" />}
            label="Branding Text"
          />
          {expandedSections.branding && (
            <div className="space-y-3 bg-card p-4">
              <input
                type="text"
                value={designConfig.brandText}
                onChange={(e) => handleBrandTextChange(e.target.value)}
                placeholder="Enter brand text"
                maxLength={30}
                className="h-11 w-full rounded-lg border border-border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground"
              />
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-muted-foreground">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={designConfig.textColor}
                    onChange={(e) => handleTextColorChange(e.target.value)}
                    className="h-11 w-12 cursor-pointer rounded border border-border"
                    aria-label="Text color"
                  />
                  <input
                    type="text"
                    value={designConfig.textColor}
                    onChange={(e) => handleTextColorChange(e.target.value)}
                    className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-secondary px-3 text-xs text-foreground"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Material */}
        <div className="overflow-hidden rounded-lg border border-border">
          <SectionHeader
            id="materials"
            icon={<Gem className="size-4" />}
            label="Material"
          />
          {expandedSections.materials && (
            <div className="space-y-4 bg-card p-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-muted-foreground">
                  Metalness: {designConfig.metalness.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={designConfig.metalness}
                  onChange={(e) =>
                    updateDesign({ metalness: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-muted-foreground">
                  Roughness: {designConfig.roughness.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={designConfig.roughness}
                  onChange={(e) =>
                    updateDesign({ roughness: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Logos */}
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="bg-secondary px-4 py-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="size-4" />
              Logo Template
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3 bg-card p-4">
            {LOGOS.map((logo) => (
              <button
                key={logo.id}
                type="button"
                onClick={() => handleApplyLogo(logo.id)}
                className={cn(
                  'flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 p-3 transition-all',
                  designConfig.logo === logo.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary',
                  logo.dark ? 'bg-secondary' : 'bg-card'
                )}
              >
                <div
                  className={cn(
                    'text-center text-xs font-bold leading-none tracking-tight',
                    logo.dark ? 'text-foreground' : 'text-foreground'
                  )}
                >
                  <span className="block text-lg text-destructive">Z</span>
                  enith
                  <br />
                  Bank
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-primary/5 p-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <Info className="mr-1 inline size-4 align-middle" />
            Changes apply in real time to the 3D preview. Pinch or drag to orbit on
            mobile.
          </p>
        </div>
      </div>
    </div>
  );
}
