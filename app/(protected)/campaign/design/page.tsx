'use client';
import { useState } from 'react';
import PackagingCanvas from '@/components/features/studio/PackagingCanvas';
import { UploadPanel } from '@/components/features/studio/UploadPanel';
import { useCampaignStore } from '@/store/useCampaignStore';
import { ArrowLeft, BadgeCheck, CircleX, Info, Logs, MessageCircleQuestionMark, Redo, ScanEye, Undo } from 'lucide-react';


interface LocationStepProps {
  data: any;
  updateData: (data: any) => void;
  nextStage: () => void;
  prevStage: () => void;
}
export default function DesignStudioPage({ prevStage, nextStage }: LocationStepProps) {
  const { designConfig } = useCampaignStore();

  return (
    <div className="flex h-[91.5vh]  w-full bg-[#0f0d0a]">


      {/* Design Panel Drawer */}

      <div className="w-96 border-r overflow-hidden flex flex-col">
        <UploadPanel name={designConfig.productType} />
        {/*   */}
      </div>


      {/* 3D Viewport */}
      <main className="flex-1 relative overflow-hidden">
        <PackagingCanvas />

        {/* Live Stats Badge */}
        <div className="absolute top-6 right-6 bg-surface-dark/90 backdrop-blur border border-border-dark rounded-xl p-4 max-w-xs z-20">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Info />
              Design Stats
            </h3>
            <div className="text-xs text-text-dim space-y-1">
              <div className="flex justify-between">
                <span>Product:</span>
                <span className="text-primary font-medium">{designConfig.productType.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Color:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border border-border-dark"
                    style={{ backgroundColor: designConfig.color }}
                  ></div>
                  <span className="text-primary font-medium">{designConfig.color}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Texture:</span>
                <span className="text-primary font-medium">
                  {designConfig.textureUrl ? '✓ Applied' : '✗ None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Metalness:</span>
                <span className="text-primary font-medium">{(designConfig.metalness * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Roughness:</span>
                <span className="text-primary font-medium">{(designConfig.roughness * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex justify-around w-full">
          <button
            // onClick={() => setShowPreview(showPreview)}
            onClick={prevStage}
            className="px-6 py-3 bg-surface-dark/90 backdrop-blur border border-border-dark hover:border-primary rounded-lg text-white font-semibold transition-all flex items-center gap-2 material-symbols-outlined"
          >
            <ArrowLeft className='size-4' />

            Go Back
          </button>
          <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-black rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-primary/50" onClick={nextStage}>
            <BadgeCheck className='size-4' />
            Confirm Design
          </button>
        </div>
      </main>
    </div>
  );
}