import PackagingCanvas from '@/components/features/studio/PackagingCanvas';
import { UploadPanel } from '@/components/features/studio/UploadPanel';

export default function DesignStudioPage() {
  return (
    <div className="flex h-[calc(100vh-64px)]"> {/* Subtract Header Height */}
      {/* Left Tools */}
      <aside className="w-20 bg-surface-dark border-r border-border-dark flex flex-col items-center py-6 gap-6 z-20">
         {/* Map buttons from campaign_wizard__3d_design_studio.html */}
         <button className="p-3 bg-primary text-black rounded-xl">
           <span className="material-symbols-outlined">cloud_upload</span>
         </button>
      </aside>

      {/* Drawer */}
      <div className="w-80 bg-surface-dark border-r border-border-dark z-10">
        <UploadPanel />
      </div>

      {/* 3D Viewport */}
      <main className="flex-1 relative">
        <PackagingCanvas />
        
        {/* Right Properties Panel */}
        <div className="absolute top-6 right-6 w-64 bg-surface-dark/90 backdrop-blur border border-border-dark rounded-xl p-4">
           <h3 className="text-sm font-bold mb-4">Selection Properties</h3>
           {/* Add Sliders/Inputs here */}
        </div>
      </main>
    </div>
  );
}