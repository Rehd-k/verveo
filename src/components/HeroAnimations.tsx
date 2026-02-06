'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function MapHighlight({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group | null>(null);
  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.z += dt * 0.1;
    ref.current.scale.x = THREE.MathUtils.lerp(ref.current.scale.x, active ? 1.05 : 0.9, 0.05);
    ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, active ? 1.05 : 0.9, 0.05);
  });
  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, 0]}>
        <circleGeometry args={[2.0, 64]} />
        <meshBasicMaterial color="#FFD36B" transparent opacity={0.12} />
      </mesh>
      <mesh position={[0, 0.6, 0.05]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color="#FFD36B" />
      </mesh>
    </group>
  );
}

function BoxMorph({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh | null>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.6;
    ref.current.scale.x = THREE.MathUtils.lerp(ref.current.scale.x, active ? 1.02 : 0.95, 0.06);
    ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, active ? 1.02 : 0.95, 0.06);
    ref.current.scale.z = THREE.MathUtils.lerp(ref.current.scale.z, active ? 1.02 : 0.95, 0.06);
  });

  return (
    <mesh ref={ref} position={[0, -0.1, 0]}>
      <boxGeometry args={[1.6, 0.9, 1.6]} />
      <meshStandardMaterial color={active ? '#D4AF37' : '#ddd'} metalness={0.6} roughness={0.2} />
    </mesh>
  );
}

function PhoneScan({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group | null>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, active ? -0.15 : 0, 0.08);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, active ? -0.05 : -0.1, 0.08);
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.9, 1.6, 0.08]} />
        <meshStandardMaterial color={'#0f1724'} metalness={0.2} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.25, 0.05]}>
        <planeGeometry args={[0.7, 0.9]} />
        <meshBasicMaterial color={'#ff7a59'} />
      </mesh>
    </group>
  );
}

export default function HeroAnimations() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<number>(0);

  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const height = rect.height || window.innerHeight;
      // Compute percentage of the container that has been scrolled into view
      const visibleTop = Math.max(0, -rect.top);
      const pct = Math.min(1, Math.max(0, visibleTop / (height * 0.9)));
      const band = Math.min(2, Math.floor(pct * 3));
      setActive(band);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={containerRef} className="sticky top-24 h-[60vh] md:h-[72vh] flex items-center">
      <div className="mx-auto w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 items-center gap-6">
        <div className="text-left hidden md:block px-6">
          <div className={`mb-6 ${active === 0 ? 'text-primary' : 'text-white/60'}`}>
            <div className="uppercase font-black tracking-widest">01</div>
            <h3 className="text-2xl font-bold mt-2">Select a Zone</h3>
            <p className="text-white/60 mt-2">Highlight a district on a 3D map and target your audience precisely.</p>
          </div>
          <div className={`mb-6 ${active === 1 ? 'text-primary' : 'text-white/60'}`}>
            <div className="uppercase font-black tracking-widest">02</div>
            <h3 className="text-2xl font-bold mt-2">Design the Box</h3>
            <p className="text-white/60 mt-2">Watch your plain packaging morph into premium branded touchpoints.</p>
          </div>
          <div className={`${active === 2 ? 'text-primary' : 'text-white/60'}`}>
            <div className="uppercase font-black tracking-widest">03</div>
            <h3 className="text-2xl font-bold mt-2">Track Results</h3>
            <p className="text-white/60 mt-2">A smartphone scan updates your dashboard in real time — instant insights.</p>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 p-4 rounded-2xl bg-[#0b0b0d] border border-white/5 shadow-xl">
          <div className="w-full h-80 md:h-[52vh]">
            <Canvas camera={{ position: [0, 0.6, 4] }}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[5, 10, 7]} intensity={0.6} />
              <group position={[0, -0.1, 0]}>
                <MapHighlight active={active === 0} />
                <BoxMorph active={active === 1} />
                <PhoneScan active={active === 2} />
              </group>
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  );
}
