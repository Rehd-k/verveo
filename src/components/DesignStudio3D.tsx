'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface DesignStudio3DProps {
  imageSrc?: string | null;
  productType?: 'cup' | 'box' | 'bag' | 'pizza-box';
  onCapture?: (dataUrl: string) => void;
}

function BoxMesh({ texture }: { texture: THREE.Texture | null }) {
  return (
    <mesh rotation={[0.15, 0.6, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.2, 1.2, 2.0]} />
      <meshStandardMaterial 
        map={texture || undefined} 
        color={texture ? '#ffffff' : '#FF6B9D'}
        metalness={0.1}
        roughness={0.6}
      />
    </mesh>
  );
}

function CupMesh({ texture }: { texture: THREE.Texture | null }) {
  return (
    <mesh rotation={[0.1, 0.6, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.9, 1.0, 1.8, 48]} />
      <meshStandardMaterial 
        map={texture || undefined} 
        color={texture ? '#ffffff' : '#00D4FF'}
        metalness={0.05}
        roughness={0.5}
      />
    </mesh>
  );
}

function BagWithHandles({ texture }: { texture: THREE.Texture | null }) {
  return (
    <group position={[0, -0.1, 0]}>
      <mesh rotation={[0.05, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 2.0, 0.6]} />
        <meshStandardMaterial 
          map={texture || undefined} 
          color={texture ? '#ffffff' : '#FFA500'}
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>
      <mesh rotation={[-0.2, 0, 0]} position={[0.6, 0.95, 0.25]} castShadow>
        <torusGeometry args={[0.2, 0.04, 16, 40]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh rotation={[-0.2, 0, 0]} position={[-0.6, 0.95, 0.25]} castShadow>
        <torusGeometry args={[0.2, 0.04, 16, 40]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

function PizzaBoxWithLid({ texture, lidOpen = false }: { texture: THREE.Texture | null; lidOpen?: boolean }) {
  return (
    <group position={[0, -0.3, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.12, 2.6]} />
        <meshStandardMaterial 
          map={texture || undefined} 
          color={texture ? '#ffffff' : '#FF4757'}
          metalness={0.05}
          roughness={0.7}
        />
      </mesh>
      <mesh 
        position={[0, 0.06, -1.25]} 
        rotation={[lidOpen ? -Math.PI / 2 : 0.001, 0, 0]}
        castShadow
      >
        <boxGeometry args={[2.6, 0.02, 2.6]} />
        <meshStandardMaterial 
          map={texture || undefined} 
          color={texture ? '#ffffff' : '#FF6348'}
          metalness={0.05}
          roughness={0.7}
        />
      </mesh>
    </group>
  );
}

export default function DesignStudio3D({ imageSrc, productType = 'cup', onCapture }: DesignStudio3DProps) {
  const defaultDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAocB9U3oE6kAAAAASUVORK5CYII=';
  const texture = useLoader(THREE.TextureLoader, imageSrc || defaultDataUrl);
  const glRef = useRef<any>(null);
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [lidOpen, setLidOpen] = React.useState(false);

  useEffect(() => {
    if (texture) {
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
    <div className="relative w-full h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl overflow-hidden shadow-2xl">
      <Canvas
        camera={{ position: cameraPos as any, fov: 50 }}
        onCreated={({ gl }) => {
          glRef.current = gl;
          gl.setPixelRatio(window.devicePixelRatio || 1);
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        <PerspectiveCamera makeDefault position={cameraPos} fov={50} />
        
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.5} color="#ffffff" />
        <directionalLight intensity={1.2} position={[5, 10, 7]} castShadow color="#fff9e6" />
        <directionalLight intensity={0.4} position={[-5, 5, -7]} color="#a0d8ff" />
        <pointLight intensity={0.6} position={[0, 5, 0]} color="#ff6b9d" />
        
        {/* Enhanced Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial 
            color="#0f172a" 
            metalness={0.2} 
            roughness={0.8}
          />
        </mesh>

        {productType === 'box' && <BoxMesh texture={texture} />}
        {productType === 'cup' && <CupMesh texture={texture} />}
        {productType === 'bag' && <BagWithHandles texture={texture} />}
        {productType === 'pizza-box' && <PizzaBoxWithLid texture={texture} lidOpen={lidOpen} />}

        <OrbitControls makeDefault enablePan={false} autoRotate autoRotateSpeed={2} />
      </Canvas>

      {/* Control Panel */}
      <div className="absolute left-4 top-4 z-40 flex flex-col gap-3 max-w-xs">
        <div className="backdrop-blur-md bg-linear-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 p-4 rounded-lg">
          <label className="text-sm font-semibold text-foreground mb-2 block">Texture Scale</label>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setScale((s) => Math.max(0.2, +(s - 0.2).toFixed(2)))} 
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-md text-foreground font-semibold transition"
            >
              −
            </button>
            <div className="px-4 py-2 bg-card/10 rounded-md text-foreground text-center flex-1 font-mono">{scale.toFixed(1)}x</div>
            <button 
              onClick={() => setScale((s) => +(s + 0.2).toFixed(2))} 
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-md text-foreground font-semibold transition"
            >
              +
            </button>
          </div>
        </div>

        <div className="backdrop-blur-md bg-linear-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 p-4 rounded-lg">
          <label className="text-sm font-semibold text-foreground mb-2 block">Rotation</label>
          <div className="flex gap-2">
            <button 
              onClick={() => setRotation((r) => r - Math.PI / 8)} 
              className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-foreground font-semibold transition"
            >
              ⟲
            </button>
            <button 
              onClick={() => setRotation((r) => r + Math.PI / 8)} 
              className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-foreground font-semibold transition"
            >
              ⟳
            </button>
          </div>
        </div>

        {productType === 'pizza-box' && (
          <div className="backdrop-blur-md bg-linear-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 p-4 rounded-lg">
            <label className="text-sm font-semibold text-foreground mb-2 block">Pizza Box Lid</label>
            <button 
              onClick={() => setLidOpen((v) => !v)} 
              className={`w-full px-4 py-2 rounded-md font-semibold transition ${
                lidOpen 
                  ? 'bg-destructive hover:brightness-110 text-foreground' 
                  : 'bg-orange-600 hover:bg-orange-500 text-foreground'
              }`}
            >
              {lidOpen ? '🔓 Close Lid' : '🔒 Open Lid'}
            </button>
          </div>
        )}
      </div>

      {/* Capture Button */}
      <div className="absolute right-4 bottom-4 z-40">
        <button
          onClick={handleCapture}
          className="group relative px-6 py-3 bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg text-foreground font-bold shadow-lg hover:shadow-pink-500/50 transition-all"
        >
          ✨ Capture Preview
        </button>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
