'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { useCampaignStore } from '@/store/useCampaignStore';
import { resolveProductSlug } from '@/lib/designStudio';
import { Grid3x2, ChevronLeft } from 'lucide-react';
import ProductModel from './ProductModel';

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#d4c5a6" wireframe />
    </mesh>
  );
}

interface PackagingCanvasProps {
  compact?: boolean;
}

export default function PackagingCanvas({ compact = false }: PackagingCanvasProps) {
  const { designConfig, selectedProduct } = useCampaignStore();
  const [showGrid, setShowGrid] = useState(!compact);

  const productSlug = resolveProductSlug(
    selectedProduct?.name,
    designConfig.productType
  );

  return (
    <div className={`w-full ${compact ? 'h-96' : 'h-full'} bg-linear-to-br from-[#181711] to-[#0f0d0a] relative overflow-hidden`}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 50 }}>
        <Suspense fallback={<LoadingFallback />}>
          <ambientLight intensity={0.5} color="#ffffff" />
          <directionalLight
            intensity={1.2}
            position={[5, 10, 7]}
            castShadow
            color="#fff9e6"
          />
          <directionalLight intensity={0.4} position={[-5, 5, -7]} color="#a0d8ff" />
          <pointLight intensity={0.6} position={[0, 5, 0]} color="#ff6b9d" />

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#0f172a" metalness={0.2} roughness={0.8} />
          </mesh>

          {showGrid && (
            <gridHelper args={[20, 20, 0xffffff, 0x333333]} position={[0, -1.99, 0]} />
          )}

          <ProductModel
            productSlug={productSlug}
            textureUrl={designConfig.textureUrl}
            textureScale={designConfig.textureScale}
            textureRotation={designConfig.textureRotation}
            color={designConfig.color}
            metalness={designConfig.metalness}
            roughness={designConfig.roughness}
            brandText={designConfig.brandText}
            textColor={designConfig.textColor}
            textSize={designConfig.textSize}
          />
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          autoRotate
          autoRotateSpeed={2}
          minDistance={5}
          maxDistance={15}
        />
      </Canvas>

      {!compact && (
        <>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-surface-dark/90 backdrop-blur border border-border-dark rounded-full p-3 flex gap-4 shadow-xl z-10">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className="p-2 text-white hover:text-primary hover:bg-white/10 rounded-full transition-all"
              title="Toggle Grid"
            >
              <Grid3x2 className="size-4" />
            </button>
            <button
              className="p-2 text-white hover:text-primary hover:bg-white/10 rounded-full transition-all"
              title="Reset View"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>

          <div className="absolute top-4 left-4 bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 text-xs font-medium text-primary z-10">
            {(selectedProduct?.name ?? designConfig.productType).toUpperCase()} MODE
          </div>
        </>
      )}
    </div>
  );
}
