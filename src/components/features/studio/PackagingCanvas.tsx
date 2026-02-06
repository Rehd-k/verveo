'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useTexture } from '@react-three/drei';
import { Suspense } from 'react';
import { useCampaignStore } from '@/store/useCampaignStore';

function BoxModel() {
  const { designConfig } = useCampaignStore();
  
  // In a real app, use useGLTF to load the actual .glb model
  // This is a primitive placeholder
  return (
    <mesh rotation={[0, Math.PI / 4, 0]}>
      <boxGeometry args={[3, 4, 1]} />
      <meshStandardMaterial 
        color={designConfig.color || '#d4c5a6'} 
        roughness={0.5} 
      />
      {/* Decal/Logo logic would go here using <Decal /> from drei */}
    </mesh>
  );
}

export default function PackagingCanvas() {
  return (
    <div className="w-full h-full bg-[#181711] relative">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 50 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <BoxModel />
          </Stage>
        </Suspense>
        <OrbitControls makeDefault />
        <gridHelper args={[20, 20, 0xffffff, 0x333333]} position={[0, -2, 0]} />
      </Canvas>
      
      {/* Overlay Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-surface-dark border border-border-dark rounded-full p-2 flex gap-4 shadow-xl">
        <button className="text-white hover:text-primary material-symbols-outlined">rotate_left</button>
        <button className="text-white hover:text-primary material-symbols-outlined">zoom_in</button>
      </div>
    </div>
  );
}