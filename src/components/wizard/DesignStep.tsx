'use client';

import { useState, useRef } from 'react';
import DesignStudio3D from '@/components/DesignStudio3D';

interface DesignStepProps {
  data: any;
  updateData: (data: any) => void;
}

export default function DesignStep({ data, updateData }: DesignStepProps) {
  const [designMode, setDesignMode] = useState<'upload' | 'editor'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [colors, setColors] = useState(['#D4AF37', '#000000']);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateData({
          design: {
            ...data.design,
            imageUrl: event.target?.result,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddColor = (newColor: string) => {
    if (!colors.includes(newColor)) {
      const updatedColors = [...colors, newColor];
      setColors(updatedColors);
      updateData({
        design: {
          ...data.design,
          colors: updatedColors,
        },
      });
    }
  };

  const handleTextChange = (text: string) => {
    updateData({
      design: {
        ...data.design,
        text,
      },
    });
  };

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
              accept=".pdf,.ai,.jpg,.png,.psd"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-white/60 hover:text-white transition-colors"
            >
              <div className="text-4xl mb-2">📄</div>
              <p className="font-semibold">Drag and drop your design</p>
              <p className="text-sm text-white/40 mt-1">
                or click to select (PDF, AI, PSD, JPG, PNG)
              </p>
            </button>
          </div>
          {data.design?.imageUrl && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-white/60 mb-2">File uploaded</p>
              <p className="text-white font-semibold">Design Preview</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Add Text
            </label>
            <input
              type="text"
              value={data.design?.text || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter your text here"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Brand Colors
            </label>
            <div className="flex gap-3">
              {colors.map((color, idx) => (
                <div
                  key={idx}
                  className="w-12 h-12 rounded-lg border-2 border-white/10"
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                onBlur={(e) => handleAddColor(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-4">
            <DesignStudio3D
              imageSrc={data.design?.imageUrl}
              productType={data.productType}
              onCapture={(preview) => updateData({ design: { ...data.design, previewUrl: preview } })}
            />
            {data.design?.previewUrl && (
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                <p className="text-sm text-white/80 mb-2">Captured Preview</p>
                <img src={data.design.previewUrl} alt="preview" className="mx-auto w-48 h-48 object-cover rounded" />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-sm text-white/80">
          💡 <span className="font-semibold">Design Tip:</span> Ensure your design
          has proper bleed lines and high DPI (300+) for printing.
        </p>
      </div>
    </div>
  );
}
