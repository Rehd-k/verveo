'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Decal } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import { useCampaignStore } from '@/store/useCampaignStore';
import { Grid3x2, ChevronLeft } from 'lucide-react';
import * as THREE from 'three';

// Loading fallback component
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#d4c5a6" wireframe />
    </mesh>
  );
}

// Product Model Component with proper GLB loading and fallback
function ProductModel({ productType, textureUrl, color, metalness, roughness, decalUrl, decalPosition, decalScale, brandText, textColor, textSize }: {

  productType: string;
  textureUrl: string | null;
  color: string;
  metalness: number;
  roughness: number;
  decalUrl: string | null;
  decalPosition: string;
  decalScale: number;
  brandText: string;
  textColor: string;
  textSize: number;
}) {
  let meshConfig: any = {};
  let geometry: any;
  let position: [number, number, number] = [0, 0, 0];
  let rotation: [number, number, number] = [0, 0, 0];

  // Define product geometries
  switch (productType) {
    case 'Disposable Cup':
      geometry = { type: 'cylinder', args: [0.9, 1.0, 1.8, 48] };
      meshConfig.rotation = [0.1, 0.6, 0];
      break;
    case 'Food Box':
      geometry = { type: 'box', args: [1.6, 2.0, 0.6, 10, 10, 10] };
      meshConfig.rotation = [0.05, 0.6, 0];
      position = [0, -0.1, 0];
      break;
    case 'Paper Bag':
      geometry = { type: 'box', args: [2.6, 0.12, 2.6] };
      meshConfig.rotation = [0, 0, 0];
      position = [0, -0.3, 0];
      break;
    case 'Takeaway Box':
      geometry = {
        type: "cylinder",
        args: [1.1, 0.75, 1.0, 4, 1],
      };
      meshConfig.rotation = [0, 0, 0];
      position = [0, -0.3, 0];
      break;
    case 'Box':
    default:
      geometry = { type: 'box', args: [3, 4, 1] };
      meshConfig.rotation = [0, Math.PI / 4, 0];
  }

  // Load textures safely using effects (avoid conditional hook calls)
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [decalTexture, setDecalTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!textureUrl) {
      setTexture(null);
      return () => {
        mounted = false;
      };
    }
    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (tex) => {
        if (mounted) setTexture(tex);
      },
      undefined,
      (err) => {
        console.warn('Failed to load texture:', err);
        if (mounted) setTexture(null);
      }
    );
    return () => {
      mounted = false;
    };
  }, [textureUrl]);

  useEffect(() => {
    let mounted = true;
    if (!decalUrl) {
      setDecalTexture(null);
      return () => {
        mounted = false;
      };
    }
    const loader = new THREE.TextureLoader();
    loader.load(
      decalUrl,
      (tex) => {
        if (mounted) setDecalTexture(tex);
      },
      undefined,
      (err) => {
        console.warn('Failed to load decal texture:', err);
        if (mounted) setDecalTexture(null);
      }
    );
    return () => {
      mounted = false;
    };
  }, [decalUrl]);

  // Render appropriate geometry
  const renderGeometry = () => {
    switch (geometry.type) {
      case 'cylinder':
        return <cylinderGeometry args={geometry.args} />;
      case 'box':
      default:
        return <boxGeometry args={geometry.args} />;
    }
  };

  return (
    <group position={position}>
      <mesh castShadow receiveShadow rotation={meshConfig.rotation}>
        {renderGeometry()}
        <meshStandardMaterial
          map={texture ?? undefined}
          color={texture ? '#ffffff' : color}
          metalness={metalness}
          roughness={roughness}
        />

        {/* Decal for logo/design */}
        {decalTexture && (
          <Decal
            position={[0, 0, 0.5]}
            rotation={[0, 0, 0]}
            scale={decalScale}
            map={decalTexture}
          />
        )}
      </mesh>
    </group>
  );
}

export default function PackagingCanvas() {
  const { designConfig, selectedProduct } = useCampaignStore();
  const [showGrid, setShowGrid] = useState(true);

  return (
    <div className="w-full h-full bg-linear-to-br from-[#181711] to-[#0f0d0a] relative overflow-hidden">
   
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8], fov: 50 }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Lighting Setup */}
          <ambientLight intensity={0.5} color="#ffffff" />
          <directionalLight
            intensity={1.2}
            position={[5, 10, 7]}
            castShadow
            color="#fff9e6"
          />
          <directionalLight intensity={0.4} position={[-5, 5, -7]} color="#a0d8ff" />
          <pointLight intensity={0.6} position={[0, 5, 0]} color="#ff6b9d" />

          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#0f172a" metalness={0.2} roughness={0.8} />
          </mesh>

          {/* Grid Helper */}
          {showGrid && (
            <gridHelper
              args={[20, 20, 0xffffff, 0x333333]}
              position={[0, -1.99, 0]}
            />
          )}

          {/* Product Model */}
          <ProductModel
            productType={selectedProduct?.name || 'Takeaway Box'}
            textureUrl={designConfig.textureUrl}
            color={designConfig.color}
            metalness={designConfig.metalness}
            roughness={designConfig.roughness}
            decalUrl={designConfig.logo}
            decalPosition={designConfig.decalPosition}
            decalScale={designConfig.decalScale}
            brandText={designConfig.brandText}
            textColor={designConfig.textColor}
            textSize={designConfig.textSize}
          />
        </Suspense>

        {/* Camera Controls */}
        <OrbitControls
          makeDefault
          enablePan={false}
          autoRotate
          autoRotateSpeed={2}
          minDistance={5}
          maxDistance={15}
        />
      </Canvas>

      {/* Overlay Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-surface-dark/90 backdrop-blur border border-border-dark rounded-full p-3 flex gap-4 shadow-xl z-10">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className="p-2 text-white hover:text-primary hover:bg-white/10 rounded-full transition-all material-symbols-outlined text-lg"
          title="Toggle Grid"
        >
          <Grid3x2 className='size-4' />
        </button>
        <button
          className="p-2 text-white hover:text-primary hover:bg-white/10 rounded-full transition-all material-symbols-outlined text-lg"
          title="Reset View"
        >
          <ChevronLeft className='size-4' />
        </button>
      </div>

      {/* Info Badge */}
      <div className="absolute top-4 left-4 bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 text-xs font-medium text-primary z-10">
        {selectedProduct?.name?.toUpperCase()} MODE
      </div>
    </div>
  );
}