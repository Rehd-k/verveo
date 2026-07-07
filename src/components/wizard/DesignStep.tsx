'use client';

import { useState, useRef, useEffect } from 'react';
import PackagingCanvas from '@/components/features/studio/PackagingCanvas';
import { useCampaignStore } from '@/store/useCampaignStore';
import { designConfigToCampaignDesign } from '@/lib/designStudio';

interface DesignStepProps {
  data: any;
  updateData: (data: any) => void;
}

export default function DesignStep({ data, updateData }: DesignStepProps) {
  const { designConfig, updateDesign } = useCampaignStore();
  const [designMode, setDesignMode] = useState<'upload' | 'editor'>(
    data.design?.imageUrl || designConfig.textureUrl ? 'editor' : 'upload'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [colors, setColors] = useState(data.design?.colors?.length ? data.design.colors : ['#D4AF37', '#000000']);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (designConfig.textureUrl && !data.design?.imageUrl) {
      updateData({
        design: designConfigToCampaignDesign(designConfig),
      });
    }
  }, [designConfig, data.design?.imageUrl, updateData]);

  const syncDesign = (partial: Partial<typeof designConfig>) => {
    updateDesign(partial);
    const nextConfig = { ...designConfig, ...partial };
    updateData({
      design: designConfigToCampaignDesign(nextConfig),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      syncDesign({ textureUrl: dataUrl });
      setDesignMode('editor');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddColor = (newColor: string) => {
    if (!colors.includes(newColor)) {
      const updatedColors = [...colors, newColor];
      setColors(updatedColors);
      syncDesign({ color: newColor });
      updateData({
        design: {
          ...data.design,
          colors: updatedColors,
        },
      });
    }
  };

  const handleTextChange = (text: string) => {
    syncDesign({ brandText: text });
  };

  const handleColorPick = (color: string) => {
    syncDesign({ color });
  };

  const texturePreview = designConfig.textureUrl || data.design?.imageUrl;

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button
          onClick={() => setDesignMode('upload')}
          className={`flex-1 p-4 rounded-lg border transition-all ${
            designMode === 'upload'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-white/10 bg-white/5 text-white'
          }`}
        >
          Upload Design
        </button>
        <button
          onClick={() => setDesignMode('editor')}
          className={`flex-1 p-4 rounded-lg border transition-all ${
            designMode === 'editor'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-white/10 bg-white/5 text-white'
          }`}
        >
          Design Editor
        </button>
      </div>

      {designMode === 'upload' ? (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-primary/50 transition-all">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-white/60 hover:text-white transition-colors w-full"
            >
              <div className="text-4xl mb-2">📄</div>
              <p className="font-semibold">Drag and drop your design</p>
              <p className="text-sm text-white/40 mt-1">
                or click to select (PNG, JPG, WEBP)
              </p>
            </button>
          </div>
          {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
          {texturePreview && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-white/60 mb-2">File uploaded</p>
              <img
                src={texturePreview}
                alt="Design preview"
                className="w-full max-h-40 object-contain rounded"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Add Text</label>
            <input
              type="text"
              value={designConfig.brandText || data.design?.text || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter your text here"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Brand Colors</label>
            <div className="flex gap-3 flex-wrap">
              {colors.map((color: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleColorPick(color)}
                  className={`w-12 h-12 rounded-lg border-2 ${
                    designConfig.color === color ? 'border-primary' : 'border-white/10'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                onChange={(e) => handleAddColor(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Texture Scale</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={designConfig.textureScale}
              onChange={(e) => syncDesign({ textureScale: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="rounded-xl overflow-hidden border border-white/10">
            <PackagingCanvas compact />
          </div>
        </div>
      )}

      <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-sm text-white/80">
          <span className="font-semibold text-primary">Design Tip:</span> Ensure your design
          has proper bleed lines and high DPI (300+) for printing.
        </p>
      </div>
    </div>
  );
}
