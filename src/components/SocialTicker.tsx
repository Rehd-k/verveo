'use client';

import React from 'react';

const PARTNERS = [
  { name: 'Zenith' },
  { name: 'Konga' },
  { name: 'Flutterwave' },
  { name: 'Glovo' },
  { name: 'FMCG' },
];

export default function SocialTicker() {
  const items = (
    <>
      <div className="flex items-center gap-4">
        <span className="font-bold text-white/80">1.2M Packs Distributed</span>
      </div>
      {PARTNERS.map((p) => (
        <div key={p.name} className="flex items-center gap-3 opacity-90">
          <span className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wider text-white/70">
            {p.name}
          </span>
        </div>
      ))}
    </>
  );

  return (
    <div className="w-full overflow-hidden border-t border-b border-white/5 bg-white/2">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-6 py-3">
          <div className="shrink-0 text-sm font-semibold uppercase tracking-widest text-white/70">
            Trusted by
          </div>
          <div className="ticker flex-1 overflow-hidden">
            <div className="ticker-track flex gap-10">
              {items}
              {items}
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
