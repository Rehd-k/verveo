'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { useCampaignStore } from '@/store/useCampaignStore';
import { resolveProductSlug } from '@/lib/designStudio';
import { Grid3x2, RotateCcw } from 'lucide-react';
import ProductModel from './ProductModel';
import { cn } from '@/lib/cn';

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
  /** When true, shift chrome so it doesn't collide with mobile action bar */
  mobileChrome?: boolean;
}

export default function PackagingCanvas({
  compact = false,
  mobileChrome = false,
}: PackagingCanvasProps) {
  const { designConfig, selectedProduct } = useCampaignStore();
  const [showGrid, setShowGrid] = useState(!compact);
  const [controlsKey, setControlsKey] = useState(0);

  const productSlug = resolveProductSlug(
    selectedProduct?.name,
    designConfig.productType
  );

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-linear-to-br from-muted to-background',
        compact ? 'h-96' : 'h-full min-h-70'
      )}
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 8], fov: 50 }}
        className="touch-none"
        style={{ width: '100%', height: '100%' }}
      >
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
          key={controlsKey}
          makeDefault
          enablePan={false}
          autoRotate
          autoRotateSpeed={2}
          minDistance={5}
          maxDistance={15}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>

      {!compact && (
        <>
          <div
            className={cn(
              'absolute left-3 z-10 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary sm:left-4 sm:px-3 sm:py-2 sm:text-xs',
              mobileChrome ? 'top-3' : 'top-4'
            )}
          >
            {(selectedProduct?.name ?? designConfig.productType).toUpperCase()} MODE
          </div>

          {/* Tools: top-left under badge on mobile; bottom-center on desktop */}
          <div
            className={cn(
              'absolute z-10 flex gap-1 rounded-full border border-border bg-popover p-1.5 shadow-xl',
              mobileChrome
                ? 'left-3 top-12 sm:top-13'
                : 'bottom-8 left-1/2 -translate-x-1/2 gap-2 p-3'
            )}
          >
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent hover:text-primary"
              title="Toggle Grid"
              aria-label="Toggle grid"
              aria-pressed={showGrid}
            >
              <Grid3x2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setControlsKey((k) => k + 1)}
              className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent hover:text-primary"
              title="Reset View"
              aria-label="Reset camera view"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
