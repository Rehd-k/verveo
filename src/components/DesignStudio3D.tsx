'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface DesignStudio3DProps {
  imageSrc?: string | null;
  productType?: 'cup' | 'box' | 'bag' | 'pizza-box';
  onCapture?: (dataUrl: string) => void;
}

function BoxMesh({ texture }: { texture: THREE.Texture | null }) {
  return (
    <mesh rotation={[0.15, 0.6, 0]}>
      <boxGeometry args={[2.2, 1.2, 2.0]} />
      <meshStandardMaterial map={texture || undefined} color={texture ? undefined : '#D4AF37'} />
    </mesh>
  );
}

function CupMesh({ texture }: { texture: THREE.Texture | null }) {
  return (
    <mesh rotation={[0.1, 0.6, 0]}>
      {/* Slightly tapered cylinder to mimic a cup */}
      <cylinderGeometry args={[0.9, 1.0, 1.8, 48]} />
      <meshStandardMaterial map={texture || undefined} color={texture ? undefined : '#E0E0E0'} />
    </mesh>
  );
}

function BagMesh({ texture }: { texture: THREE.Texture | null }) {
  return (
    <mesh rotation={[0.05, 0.6, 0]} position={[0, -0.1, 0]}>
      <boxGeometry args={[1.6, 2.0, 0.6]} />
      <meshStandardMaterial map={texture || undefined} color={texture ? undefined : '#C0B283'} />
    </mesh>
  );
}

function PizzaBoxMesh({ texture }: { texture: THREE.Texture | null }) {
  return (
    <mesh rotation={[0.05, 0.6, 0]} position={[0, -0.3, 0]} castShadow>
      <boxGeometry args={[2.6, 0.2, 2.6]} />
      <meshStandardMaterial map={texture || undefined} color={texture ? undefined : '#F3E5AB'} />
    </mesh>
  );
}

function BagWithHandles({ texture }: { texture: THREE.Texture | null }) {
  return (
    <group position={[0, -0.1, 0]}>
      <mesh rotation={[0.05, 0.6, 0]}>
        <boxGeometry args={[1.6, 2.0, 0.6]} />
        <meshStandardMaterial map={texture || undefined} color={texture ? undefined : '#C0B283'} />
      </mesh>
      {/* simple handles */}
      <mesh rotation={[-0.2, 0, 0]} position={[0.6, 0.95, 0.25]}>
        <torusGeometry args={[0.2, 0.04, 16, 40]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh rotation={[-0.2, 0, 0]} position={[-0.6, 0.95, 0.25]}>
        <torusGeometry args={[0.2, 0.04, 16, 40]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

function PizzaBoxWithLid({ texture, lidOpen = false }: { texture: THREE.Texture | null; lidOpen?: boolean }) {
  return (
    <group position={[0, -0.3, 0]}>
      <mesh>
        <boxGeometry args={[2.6, 0.12, 2.6]} />
        <meshStandardMaterial map={texture || undefined} color={texture ? undefined : '#F3E5AB'} />
      </mesh>
      {/* lid as a separate mesh */}
      <mesh position={[0, 0.06, -1.25]} rotation={[lidOpen ? -Math.PI / 2 : 0.001, 0, 0]}>
        <boxGeometry args={[2.6, 0.02, 2.6]} />
        <meshStandardMaterial map={texture || undefined} color={texture ? undefined : '#E8DDB5'} />
      </mesh>
    </group>
  );
}

export default function DesignStudio3D({ imageSrc, productType = 'box', onCapture }: DesignStudio3DProps) {
  const defaultDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAocB9U3oE6kAAAAASUVORK5CYII=';
  const texture = useLoader(THREE.TextureLoader, imageSrc || defaultDataUrl);
  const glRef = useRef<any>(null);
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [lidOpen, setLidOpen] = React.useState(false);

  useEffect(() => {
    if (texture) {
      // Default wrapping and repeat
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      if (productType === 'cup') {
        texture.repeat.set(2 * scale, 1 * scale);
      } else if (productType === 'bag') {
        texture.repeat.set(1 * scale, 1.6 * scale);
      } else if (productType === 'pizza-box') {
        texture.repeat.set(1.4 * scale, 1.4 * scale);
      } else {
        texture.repeat.set(1 * scale, 1 * scale);
      }
      texture.rotation = rotation;
      texture.center.set(0.5, 0.5);
      texture.needsUpdate = true;
    }
  }, [texture, productType, scale, rotation]);

  const handleCapture = () => {
    if (glRef.current && glRef.current.domElement) {
      try {
        const dataUrl = glRef.current.domElement.toDataURL('image/png');
        onCapture?.(dataUrl);
      } catch (e) {
        console.error('Capture failed', e);
      }
    }
  };

  const cameraPos: [number, number, number] = React.useMemo(() => {
    switch (productType) {
      case 'cup':
        return [0, 1.0, 4];
      case 'bag':
        return [0, 1.2, 5];
      case 'pizza-box':
        return [0, 1.6, 5];
      default:
        return [0, 1.2, 4];
    }
  }, [productType]);

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: cameraPos as any }}
        onCreated={({ gl }) => {
          glRef.current = gl;
          gl.setPixelRatio(window.devicePixelRatio || 1);
          gl.shadowMap.enabled = true;
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight intensity={0.8} position={[5, 10, 7]} castShadow />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#111" metalness={0} roughness={1} />
        </mesh>

        {productType === 'box' && <BoxMesh texture={texture} />}
        {productType === 'cup' && <CupMesh texture={texture} />}
        {productType === 'bag' && <BagWithHandles texture={texture} />}
        {productType === 'pizza-box' && <PizzaBoxWithLid texture={texture} lidOpen={lidOpen} />}

        <OrbitControls makeDefault enablePan={false} />
      </Canvas>

      <div className="absolute left-4 top-4 z-40 flex flex-col gap-2">
        <div className="rounded-md bg-white/5 p-2 text-white/90 flex items-center gap-2">
          <label className="text-xs">Scale</label>
          <button onClick={() => setScale((s) => Math.max(0.2, +(s - 0.2).toFixed(2)))} className="px-2 py-1 bg-white/10 rounded">-</button>
          <div className="px-2">{scale.toFixed(1)}x</div>
          <button onClick={() => setScale((s) => +(s + 0.2).toFixed(2))} className="px-2 py-1 bg-white/10 rounded">+</button>
        </div>
        <div className="rounded-md bg-white/5 p-2 text-white/90 flex items-center gap-2">
          <label className="text-xs">Rotate</label>
          <button onClick={() => setRotation((r) => r - Math.PI / 8)} className="px-2 py-1 bg-white/10 rounded">⟲</button>
          <button onClick={() => setRotation((r) => r + Math.PI / 8)} className="px-2 py-1 bg-white/10 rounded">⟳</button>
        </div>
        {productType === 'pizza-box' && (
          <div className="rounded-md bg-white/5 p-2 text-white/90 flex items-center gap-2">
            <label className="text-xs">Lid</label>
            <button onClick={() => setLidOpen((v) => !v)} className="px-3 py-1 bg-white/10 rounded">{lidOpen ? 'Close' : 'Open'}</button>
          </div>
        )}
      </div>

      <div className="absolute right-4 bottom-4 z-40">
        <button
          onClick={handleCapture}
          className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-black hover:brightness-110"
        >
          Capture Preview
        </button>
      </div>
    </div>
  );
}
