import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EARTH_RADIUS_KM, SCALE_FACTOR } from '../../lib/constants';

const EARTH_RADIUS = EARTH_RADIUS_KM * SCALE_FACTOR; // ~6.371 units

export const Earth: React.FC = () => {
  const earthGroupRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.y += 0.001;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0013;
    }
    if (atmosphereRef.current) {
      // Subtle atmospheric pulsation
      const time = performance.now() * 0.001;
      const s = 1.02 + Math.sin(time * 0.8) * 0.003;
      atmosphereRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      {/* Rotating Earth Body */}
      <group ref={earthGroupRef}>
        {/* Main Earth Sphere with deep ocean and emissive glow */}
        <mesh receiveShadow castShadow>
          <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
          <meshStandardMaterial
            color="#1a3a5c"
            roughness={0.65}
            metalness={0.15}
            emissive="#0d243a"
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* Subtle high-tech latitude/longitude geographic grid overlay */}
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS * 1.001, 36, 18]} />
          <meshBasicMaterial
            color="#2a6496"
            wireframe
            transparent
            opacity={0.06}
          />
        </mesh>

        {/* Subtle cloud / continental swirl layer */}
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[EARTH_RADIUS * 1.008, 48, 48]} />
          <meshStandardMaterial
            color="#60a5fa"
            transparent
            opacity={0.08}
            roughness={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Polar caps indicator rings */}
        <mesh position={[0, EARTH_RADIUS * 0.96, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, EARTH_RADIUS * 0.28, 32]} />
          <meshBasicMaterial color="#b0d4f1" transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -EARTH_RADIUS * 0.96, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, EARTH_RADIUS * 0.28, 32]} />
          <meshBasicMaterial color="#b0d4f1" transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Transparent Atmosphere Shell (1.02x Earth radius) */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer Atmospheric Halo Glow */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * 1.05, 32, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Faint Equatorial Glow Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[EARTH_RADIUS * 1.04, EARTH_RADIUS * 1.28, 64]} />
        <meshBasicMaterial
          color="#2563eb"
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default Earth;
