import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { COLORS, type SatelliteStatus } from '../../lib/constants';

export interface SatelliteNodeProps {
  position: [number, number, number];
  status: SatelliteStatus | string;
  id: string;
  name?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export const SatelliteNode: React.FC<SatelliteNodeProps> = ({
  position,
  status,
  id,
  name,
  isSelected = false,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const selectionRingRef = useRef<THREE.Mesh>(null);
  const thrustRef = useRef<THREE.Mesh>(null);

  // Status color mapping
  const getColor = (s: string): string => {
    switch (s.toLowerCase()) {
      case 'nominal':
        return COLORS.NOMINAL;
      case 'alert':
        return COLORS.ALERT;
      case 'critical':
        return COLORS.CRITICAL;
      case 'maneuvering':
        return COLORS.MANEUVERING;
      case 'migrating':
        return COLORS.MIGRATING;
      default:
        return COLORS.NOMINAL;
    }
  };

  const nodeColor = getColor(status);
  const isManeuvering = status.toLowerCase() === 'maneuvering';

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Subtle tumbling/rotation of satellite node
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.6;
      meshRef.current.rotation.y = t * 0.9;
    }

    // Pulsing selection ring
    if (selectionRingRef.current && isSelected) {
      const pulse = 1.0 + 0.25 * Math.sin(t * 5);
      selectionRingRef.current.scale.set(pulse, pulse, pulse);
      const mat = selectionRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.5 + 0.4 * Math.sin(t * 5);
      }
    }

    // Maneuvering thrust flame flicker
    if (thrustRef.current && isManeuvering) {
      const flicker = 0.9 + 0.3 * Math.sin(t * 20);
      thrustRef.current.scale.set(flicker, 1 + flicker * 0.4, flicker);
    }
  });

  return (
    <group position={position}>
      {/* Interactive Hit Area and Satellite Core Geometry */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <octahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isSelected ? 1.0 : hovered ? 0.8 : 0.4}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Solar Panel Wings */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.26, 0.015, 0.05]} />
        <meshStandardMaterial
          color="#1e3a8a"
          emissive="#2563eb"
          emissiveIntensity={0.2}
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>

      {/* Maneuvering Thrust Vector Indicator */}
      {isManeuvering && (
        <group position={[0, -0.11, 0]} rotation={[Math.PI, 0, 0]}>
          <mesh ref={thrustRef}>
            <coneGeometry args={[0.035, 0.12, 12]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <pointLight color="#00ffff" intensity={0.5} distance={0.5} />
        </group>
      )}

      {/* Pulsing Selection Ring */}
      {isSelected && (
        <mesh ref={selectionRingRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.18, 0.22, 32]} />
          <meshBasicMaterial
            color={nodeColor}
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Hover or Selected Beacon Halo */}
      {(hovered || isSelected) && (
        <mesh>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial
            color={nodeColor}
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Satellite Info Label on Hover or Selection */}
      {(hovered || isSelected) && (
        <Html
          position={[0, 0.22, 0]}
          center
          distanceFactor={18}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div className="flex flex-col items-center pointer-events-none">
            <div className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 backdrop-blur-md shadow-lg shadow-black/60 text-xs font-mono whitespace-nowrap">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full inline-block "
                  style={{ backgroundColor: nodeColor }}
                />
                <span className="font-semibold text-slate-100">{id}</span>
                {name && <span className="text-slate-400">({name})</span>}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                Status: <span style={{ color: nodeColor }}>{status}</span>
              </div>
            </div>
            {/* Small pointer tick */}
            <div className="w-1.5 h-1.5 bg-slate-800 rotate-45 -mt-1 border-r border-b border-slate-700" />
          </div>
        </Html>
      )}
    </group>
  );
};

export default SatelliteNode;
