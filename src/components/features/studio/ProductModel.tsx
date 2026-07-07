'use client';

import { Text } from '@react-three/drei';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import {
  configureTexture,
  type ProductSlug,
} from '@/lib/designStudio';

interface ProductModelProps {
  productSlug: ProductSlug;
  textureUrl: string | null;
  textureScale: number;
  textureRotation: number;
  color: string;
  metalness: number;
  roughness: number;
  brandText: string;
  textColor: string;
  textSize: number;
}

function TexturedMaterial({
  texture,
  color,
  metalness,
  roughness,
}: {
  texture: THREE.Texture | null;
  color: string;
  metalness: number;
  roughness: number;
}) {
  return (
    <meshStandardMaterial
      key={texture?.uuid ?? 'no-texture'}
      map={texture ?? undefined}
      color={texture ? '#ffffff' : color}
      metalness={metalness}
      roughness={roughness}
    />
  );
}

function BrandLabel({
  text,
  textColor,
  textSize,
  position,
  rotation,
}: {
  text: string;
  textColor: string;
  textSize: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  if (!text.trim()) return null;

  return (
    <Text
      position={position}
      rotation={rotation ?? [0, 0, 0]}
      fontSize={0.22 * textSize}
      color={textColor}
      anchorX="center"
      anchorY="middle"
      maxWidth={2}
    >
      {text}
    </Text>
  );
}

export default function ProductModel({
  productSlug,
  textureUrl,
  textureScale,
  textureRotation,
  color,
  metalness,
  roughness,
  brandText,
  textColor,
  textSize,
}: ProductModelProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let mounted = true;
    let loadedTexture: THREE.Texture | null = null;

    if (!textureUrl) {
      setTexture(null);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (tex) => {
        if (!mounted) {
          tex.dispose();
          return;
        }
        configureTexture(tex, {
          scale: textureScale,
          rotation: textureRotation,
          productSlug,
        });
        loadedTexture = tex;
        setTexture((prev) => {
          if (prev) prev.dispose();
          return tex;
        });
      },
      undefined,
      (err) => {
        console.warn('Failed to load texture:', err);
        if (mounted) setTexture(null);
      }
    );

    return () => {
      mounted = false;
      if (loadedTexture) loadedTexture.dispose();
    };
  }, [textureUrl, productSlug]);

  useEffect(() => {
    if (!texture) return;
    configureTexture(texture, {
      scale: textureScale,
      rotation: textureRotation,
      productSlug,
    });
  }, [texture, textureScale, textureRotation, productSlug]);

  switch (productSlug) {
    case 'cup':
      return (
        <group>
          <mesh rotation={[0.1, 0.6, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.9, 1.0, 1.8, 48]} />
            <TexturedMaterial texture={texture} color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <BrandLabel
            text={brandText}
            textColor={textColor}
            textSize={textSize}
            position={[0, 0.3, 0.95]}
            rotation={[0, 0.6, 0]}
          />
        </group>
      );

    case 'bag':
      return (
        <group position={[0, -0.1, 0]}>
          <mesh rotation={[0.05, 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.6, 2.0, 0.6]} />
            <TexturedMaterial texture={texture} color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh rotation={[-0.2, 0, 0]} position={[0.6, 0.95, 0.25]} castShadow>
            <torusGeometry args={[0.2, 0.04, 16, 40]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.4} />
          </mesh>
          <mesh rotation={[-0.2, 0, 0]} position={[-0.6, 0.95, 0.25]} castShadow>
            <torusGeometry args={[0.2, 0.04, 16, 40]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.4} />
          </mesh>
          <BrandLabel
            text={brandText}
            textColor={textColor}
            textSize={textSize}
            position={[0, 0.2, 0.35]}
            rotation={[0, 0.6, 0]}
          />
        </group>
      );

    case 'pizza-box':
      return (
        <group position={[0, -0.3, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.6, 0.12, 2.6]} />
            <TexturedMaterial texture={texture} color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0.06, -1.25]} rotation={[0.001, 0, 0]} castShadow>
            <boxGeometry args={[2.6, 0.02, 2.6]} />
            <TexturedMaterial texture={texture} color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <BrandLabel text={brandText} textColor={textColor} textSize={textSize} position={[0, 0.2, 0]} />
        </group>
      );

    case 'box':
    default:
      return (
        <group>
          <mesh rotation={[0.15, 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.2, 1.2, 2.0]} />
            <TexturedMaterial texture={texture} color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <BrandLabel
            text={brandText}
            textColor={textColor}
            textSize={textSize}
            position={[0, 0, 1.05]}
            rotation={[0, 0.6, 0]}
          />
        </group>
      );
  }
}
