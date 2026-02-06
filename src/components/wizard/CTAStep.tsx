'use client';

import { useState } from 'react';
import QRCode from 'qrcode';

interface CTAStepProps {
  data: any;
  updateData: (data: any) => void;
}

export default function CTAStep({ data, updateData }: CTAStepProps) {
  const [qrCode, setQrCode] = useState('');
  const [ctaType, setCtaType] = useState('custom');

  const generateQRCode = async (url: string) => {
    try {
      const qr = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });
      setQrCode(qr);
      updateData({ ctaUrl: url });
    } catch (error) {
      console.error('QR Code generation failed:', error);
    }
  };

  const quickLinks = [
    { name: 'WhatsApp', prefix: 'https://wa.me/' },
    { name: 'Phone Call', prefix: 'tel:' },
    { name: 'Website', prefix: 'https://' },
    { name: 'Instagram', prefix: 'https://instagram.com/' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Call-to-Action</h3>
        <p className="text-white/60 mb-4">
          Where should people go when they scan your QR code?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => setCtaType(link.name.toLowerCase())}
            className={`p-3 rounded-lg border transition-all text-left ${
              ctaType === link.name.toLowerCase()
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-white/10 bg-white/5 text-white hover:border-white/20'
            }`}
          >
            <span className="font-semibold">{link.name}</span>
            <p className="text-xs text-white/60 mt-1">{link.prefix}...</p>
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Complete URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={data.ctaUrl || ''}
            onChange={(e) => updateData({ ctaUrl: e.target.value })}
            placeholder="https://example.com"
            className="flex-1 rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30"
          />
          <button
            onClick={() => generateQRCode(data.ctaUrl)}
            disabled={!data.ctaUrl}
            className="px-4 py-3 rounded-lg bg-primary text-background-dark font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
          >
            Generate QR
          </button>
        </div>
      </div>

      {qrCode && (
        <div className="p-6 rounded-lg bg-white/5 border border-white/10 text-center">
          <p className="text-sm text-white/80 mb-4">QR Code Preview</p>
          <img
            src={qrCode}
            alt="QR Code"
            className="w-48 h-48 mx-auto rounded-lg border-2 border-white/10"
          />
          <p className="text-xs text-white/60 mt-4">
            Unique tracking ID: {Math.random().toString(36).substr(2, 9)}
          </p>
        </div>
      )}

      <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-sm text-white/80">
          <span className="font-bold text-primary">Pro Tip:</span> Our system
          generates unique QR codes for each campaign. This lets you track scans,
          demographics, and ROI per campaign.
        </p>
      </div>

      <div className="space-y-2 p-4 rounded-lg bg-white/5 border border-white/10">
        <p className="text-sm font-semibold text-white">Campaign Summary</p>
        <p className="text-xs text-white/60">
          {data.locations?.join(', ')} • {data.productType} •{' '}
          {data.quantity?.toLocaleString()} units
        </p>
      </div>
    </div>
  );
}
