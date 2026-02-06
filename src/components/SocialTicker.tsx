'use client';

import React from 'react';

const logos = [
  { name: 'Zenith', img: '/logos/zenith.svg' },
  { name: 'Konga', img: '/logos/konga.svg' },
  { name: 'Flutterwave', img: '/logos/flutterwave.svg' },
  { name: 'Glovo', img: '/logos/glovo.svg' },
  { name: 'FMCG', img: '/logos/fmcg.svg' },
];

export default function SocialTicker() {
  return (
    <div className="w-full overflow-hidden border-t border-b border-white/5 bg-white/2">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-6 py-3">
          <div className="text-sm font-semibold text-white/70 uppercase tracking-widest">Trusted by</div>
          <div className="ticker flex gap-10">
            <div className="ticker-track flex gap-10">
              <div className="flex items-center gap-4">
                <span className="font-bold text-white/80">1.2M Packs Distributed</span>
              </div>
              {logos.map((l) => (
                <div key={l.name} className="flex items-center gap-3 opacity-90">
                  <img src={l.img} alt={l.name} className="h-6 w-auto grayscale opacity-80" />
                </div>
              ))}
              {/* Repeat for smooth loop */}
              <div className="flex items-center gap-4">
                <span className="font-bold text-white/80">1.2M Packs Distributed</span>
              </div>
              {logos.map((l) => (
                <div key={l.name + '-2'} className="flex items-center gap-3 opacity-90">
                  <img src={l.img} alt={l.name} className="h-6 w-auto grayscale opacity-80" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ticker { position: relative; overflow: hidden; }
        .ticker-track { display: inline-flex; gap: 4rem; white-space: nowrap; animation: scroll 18s linear infinite; }
        @keyframes scroll { 0% { transform: translateX(0%);} 100%{ transform: translateX(-50%);} }
      `}</style>
    </div>
  );
}
