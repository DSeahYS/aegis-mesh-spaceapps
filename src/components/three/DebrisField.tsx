import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EARTH_RADIUS_KM, SCALE_FACTOR } from '../../lib/constants';

export interface DebrisParticleInfo {
  catalogId: string;
  catalogName: string;
  altitudeKm: number;
  inclinationDeg: number;
  color: string;
  dangerLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE';
}

export interface DebrisFieldProps {
  activeCatalogs?: string[];
  pointSize?: number;
  opacity?: number;
  isPropagating?: boolean;
  propagationSpeed?: number;
  visible?: boolean;
  count?: number;
  altitudeRange?: [number, number];
  onParticleHover?: (particle: DebrisParticleInfo | null) => void;
  onParticleClick?: (particle: DebrisParticleInfo) => void;
}

// Fast seeded PRNG (Mulberry32) for deterministic debris generation
function createSeededRng(seed: number) {
  let s = Math.imul(seed, 0x6d2b79f5);
  return () => {
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    s = (s + 0x6d2b79f5) | 0;
    return ((t >>> 0) / 4294967296);
  };
}

// Procedural radial circular glow texture for realistic aerospace particle rendering
function createGlowPointTexture(): THREE.Texture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

interface RawCatalogData {
  id: string;
  name: string;
  count: number;
  color: string;
  dangerLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE';
  positions: Float32Array;
  colors: Float32Array;
}

/**
 * Pre-generate massive space debris catalogs (total ~35,000 realistic particles)
 */
function buildPrecomputedCatalogs(): Record<string, RawCatalogData> {
  const result: Record<string, RawCatalogData> = {};

  // 1. Cosmos-1408 ASAT Debris Field (4,000 particles)
  // Russian DA-ASAT intercept (Nov 2021), 485 km polar inclination (82.6°)
  {
    const rng = createSeededRng(14082021);
    const count = 4000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const baseColor = new THREE.Color('#f97316');
    const parentAlt = 485;
    const parentInc = (82.6 * Math.PI) / 180;
    const parentRaan = (114.5 * Math.PI) / 180;

    for (let i = 0; i < count; i++) {
      const u = rng() - 0.5;
      const impulse = Math.sign(u) * Math.pow(Math.abs(u), 1.6) * 380;
      const altKm = parentAlt + impulse;
      const r = (EARTH_RADIUS_KM + altKm) * SCALE_FACTOR;

      const inc = parentInc + (rng() - 0.5) * 0.08;
      const raan = parentRaan + (rng() - 0.5) * 0.35;
      const nu = rng() * Math.PI * 2;

      const xOrb = r * Math.cos(nu);
      const yOrb = r * Math.sin(nu);
      pos[i * 3] = xOrb * Math.cos(raan) - yOrb * Math.sin(raan) * Math.cos(inc);
      pos[i * 3 + 1] = xOrb * Math.sin(raan) + yOrb * Math.cos(raan) * Math.cos(inc);
      pos[i * 3 + 2] = yOrb * Math.sin(inc);

      // Color variation
      col[i * 3] = baseColor.r * (0.8 + rng() * 0.4);
      col[i * 3 + 1] = baseColor.g * (0.8 + rng() * 0.4);
      col[i * 3 + 2] = baseColor.b * (0.8 + rng() * 0.4);
    }

    result['cosmos-1408'] = {
      id: 'cosmos-1408',
      name: 'Cosmos-1408 ASAT Debris Field',
      count,
      color: '#f97316',
      dangerLevel: 'HIGH',
      positions: pos,
      colors: col,
    };
  }

  // 2. Fengyun-1C Breakup Cloud (6,500 particles)
  // SC-19 ASAT kinetic impact (Jan 2007), 865 km retrograde sun-sync (98.6°)
  {
    const rng = createSeededRng(11012007);
    const count = 6500;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const baseColor = new THREE.Color('#ff3355');
    const parentAlt = 865;
    const parentInc = (98.6 * Math.PI) / 180;
    const parentRaan = (24.2 * Math.PI) / 180;

    for (let i = 0; i < count; i++) {
      const u = rng() - 0.5;
      const impulse = Math.sign(u) * Math.pow(Math.abs(u), 1.35) * 1100;
      const altKm = Math.max(180, parentAlt + impulse);
      const r = (EARTH_RADIUS_KM + altKm) * SCALE_FACTOR;

      const inc = parentInc + (rng() - 0.5) * 0.12;
      const raan = parentRaan + (rng() - 0.5) * 0.65;
      const nu = rng() * Math.PI * 2;

      const xOrb = r * Math.cos(nu);
      const yOrb = r * Math.sin(nu);
      pos[i * 3] = xOrb * Math.cos(raan) - yOrb * Math.sin(raan) * Math.cos(inc);
      pos[i * 3 + 1] = xOrb * Math.sin(raan) + yOrb * Math.cos(raan) * Math.cos(inc);
      pos[i * 3 + 2] = yOrb * Math.sin(inc);

      col[i * 3] = baseColor.r * (0.85 + rng() * 0.3);
      col[i * 3 + 1] = baseColor.g * (0.85 + rng() * 0.3);
      col[i * 3 + 2] = baseColor.b * (0.85 + rng() * 0.3);
    }

    result['fengyun-1c'] = {
      id: 'fengyun-1c',
      name: 'Fengyun-1C Breakup Cloud',
      count,
      color: '#ff3355',
      dangerLevel: 'CRITICAL',
      positions: pos,
      colors: col,
    };
  }

  // 3. Iridium-33 / Cosmos-2251 Remnants (4,500 particles)
  // Accidental collision cloud (Feb 2009), 790 km altitude, 86.4° inclination
  {
    const rng = createSeededRng(10022009);
    const count = 4500;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const baseColor = new THREE.Color('#fbbf24');
    const parentAlt = 790;
    const parentInc = (86.4 * Math.PI) / 180;
    const parentRaan = (210.0 * Math.PI) / 180;

    for (let i = 0; i < count; i++) {
      const u = rng() - 0.5;
      const impulse = Math.sign(u) * Math.pow(Math.abs(u), 1.5) * 450;
      const altKm = Math.max(200, parentAlt + impulse);
      const r = (EARTH_RADIUS_KM + altKm) * SCALE_FACTOR;

      const inc = parentInc + (rng() - 0.5) * 0.09;
      const raan = parentRaan + (rng() - 0.5) * 0.45;
      const nu = rng() * Math.PI * 2;

      const xOrb = r * Math.cos(nu);
      const yOrb = r * Math.sin(nu);
      pos[i * 3] = xOrb * Math.cos(raan) - yOrb * Math.sin(raan) * Math.cos(inc);
      pos[i * 3 + 1] = xOrb * Math.sin(raan) + yOrb * Math.cos(raan) * Math.cos(inc);
      pos[i * 3 + 2] = yOrb * Math.sin(inc);

      col[i * 3] = baseColor.r * (0.8 + rng() * 0.35);
      col[i * 3 + 1] = baseColor.g * (0.8 + rng() * 0.35);
      col[i * 3 + 2] = baseColor.b * (0.8 + rng() * 0.35);
    }

    result['iridium-33'] = {
      id: 'iridium-33',
      name: 'Iridium-33 Collision Remnants',
      count,
      color: '#fbbf24',
      dangerLevel: 'HIGH',
      positions: pos,
      colors: col,
    };
  }

  // 4. Uncatalogued Micro-Debris Swarm (12,000 particles)
  // Lethal non-trackable high-density fragment cloud
  {
    const rng = createSeededRng(31415926);
    const count = 12000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const baseColor = new THREE.Color('#eab308');
    const popularIncs = [28.5, 51.6, 53.2, 65.0, 74.0, 82.6, 98.6].map((deg) => (deg * Math.PI) / 180);

    for (let i = 0; i < count; i++) {
      const dice = rng();
      let altKm: number;
      if (dice < 0.4) {
        altKm = 720 + rng() * 160;
      } else if (dice < 0.7) {
        altKm = 510 + rng() * 120;
      } else {
        altKm = 360 + rng() * 800;
      }

      const r = (EARTH_RADIUS_KM + altKm) * SCALE_FACTOR;
      const baseInc = popularIncs[Math.floor(rng() * popularIncs.length)];
      const inc = baseInc + (rng() - 0.5) * 0.06;
      const raan = rng() * Math.PI * 2;
      const nu = rng() * Math.PI * 2;

      const xOrb = r * Math.cos(nu);
      const yOrb = r * Math.sin(nu);
      pos[i * 3] = xOrb * Math.cos(raan) - yOrb * Math.sin(raan) * Math.cos(inc);
      pos[i * 3 + 1] = xOrb * Math.sin(raan) + yOrb * Math.cos(raan) * Math.cos(inc);
      pos[i * 3 + 2] = yOrb * Math.sin(inc);

      col[i * 3] = baseColor.r * (0.75 + rng() * 0.45);
      col[i * 3 + 1] = baseColor.g * (0.75 + rng() * 0.45);
      col[i * 3 + 2] = baseColor.b * (0.75 + rng() * 0.45);
    }

    result['uncatalogued'] = {
      id: 'uncatalogued',
      name: 'Uncatalogued Micro-Debris Swarm',
      count,
      color: '#eab308',
      dangerLevel: 'HIGH',
      positions: pos,
      colors: col,
    };
  }

  // 5. SL-16 Derelict Upper Stages & Rocket Bodies (3,000 particles)
  {
    const rng = createSeededRng(8819273);
    const count = 3000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const baseColor = new THREE.Color('#d946ef');
    const parentInc = (71.0 * Math.PI) / 180;

    for (let i = 0; i < count; i++) {
      const altKm = 600 + rng() * 400;
      const r = (EARTH_RADIUS_KM + altKm) * SCALE_FACTOR;
      const inc = parentInc + (rng() - 0.5) * 0.08;
      const raan = rng() * Math.PI * 2;
      const nu = rng() * Math.PI * 2;

      const xOrb = r * Math.cos(nu);
      const yOrb = r * Math.sin(nu);
      pos[i * 3] = xOrb * Math.cos(raan) - yOrb * Math.sin(raan) * Math.cos(inc);
      pos[i * 3 + 1] = xOrb * Math.sin(raan) + yOrb * Math.cos(raan) * Math.cos(inc);
      pos[i * 3 + 2] = yOrb * Math.sin(inc);

      col[i * 3] = baseColor.r * (0.8 + rng() * 0.3);
      col[i * 3 + 1] = baseColor.g * (0.8 + rng() * 0.3);
      col[i * 3 + 2] = baseColor.b * (0.8 + rng() * 0.3);
    }

    result['sl-16'] = {
      id: 'sl-16',
      name: 'SL-16 Derelict Rocket Stages',
      count,
      color: '#d946ef',
      dangerLevel: 'ELEVATED',
      positions: pos,
      colors: col,
    };
  }

  // 6. Tracked LEO General Catalog (5,000 particles)
  {
    const rng = createSeededRng(5029184);
    const count = 5000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const baseColor = new THREE.Color('#38bdf8');

    for (let i = 0; i < count; i++) {
      const altKm = 350 + rng() * 1050;
      const r = (EARTH_RADIUS_KM + altKm) * SCALE_FACTOR;
      const inc = rng() * Math.PI;
      const raan = rng() * Math.PI * 2;
      const nu = rng() * Math.PI * 2;

      const xOrb = r * Math.cos(nu);
      const yOrb = r * Math.sin(nu);
      pos[i * 3] = xOrb * Math.cos(raan) - yOrb * Math.sin(raan) * Math.cos(inc);
      pos[i * 3 + 1] = xOrb * Math.sin(raan) + yOrb * Math.cos(raan) * Math.cos(inc);
      pos[i * 3 + 2] = yOrb * Math.sin(inc);

      col[i * 3] = baseColor.r * (0.75 + rng() * 0.4);
      col[i * 3 + 1] = baseColor.g * (0.75 + rng() * 0.4);
      col[i * 3 + 2] = baseColor.b * (0.75 + rng() * 0.4);
    }

    result['leo-general'] = {
      id: 'leo-general',
      name: 'General LEO Cataloged Debris',
      count,
      color: '#38bdf8',
      dangerLevel: 'MODERATE',
      positions: pos,
      colors: col,
    };
  }

  return result;
}

// Global cached dataset to guarantee zero recomputation lag across re-renders
const PRECOMPUTED_CATALOGS = buildPrecomputedCatalogs();
const MAX_DEBRIS_CAPACITY = 40000;

export const DebrisField: React.FC<DebrisFieldProps> = ({
  activeCatalogs,
  pointSize = 0.038,
  opacity = 0.85,
  isPropagating = true,
  propagationSpeed = 1.0,
  visible = true,
  onParticleHover,
  onParticleClick,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const glowTexture = useMemo(() => createGlowPointTexture(), []);

  // Normalize active catalogs selection
  const selectedCatalogs = useMemo(() => {
    if (!activeCatalogs || activeCatalogs.length === 0) {
      // Default to high-threat active debris clouds (total 27,000 particles)
      return ['cosmos-1408', 'fengyun-1c', 'uncatalogued', 'iridium-33'];
    }

    const lowered = activeCatalogs.map((c) => c.toLowerCase().trim());
    if (lowered.includes('all') || lowered.includes('all-debris')) {
      return Object.keys(PRECOMPUTED_CATALOGS);
    }

    // Match catalog keys flexibly
    const matched: string[] = [];
    for (const key of Object.keys(PRECOMPUTED_CATALOGS)) {
      if (
        lowered.some((item) => {
          return item === key || item.includes(key) || key.includes(item);
        })
      ) {
        matched.push(key);
      }
    }

    // If activeCatalogs only has constellation tags (e.g. ['aegis-mesh']), provide default debris
    if (matched.length === 0) {
      return ['cosmos-1408', 'fengyun-1c', 'uncatalogued', 'iridium-33'];
    }

    return matched;
  }, [activeCatalogs]);

  // Track particle ranges per catalog for raycast lookup
  const catalogRanges = useRef<{ id: string; name: string; start: number; end: number; color: string; dangerLevel: any }[]>([]);

  // Fixed pre-allocated BufferGeometry with capacity for 40,000 particles
  const { geometry, positionAttr, colorAttr } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(MAX_DEBRIS_CAPACITY * 3);
    const col = new Float32Array(MAX_DEBRIS_CAPACITY * 3);

    const pAttr = new THREE.BufferAttribute(pos, 3);
    const cAttr = new THREE.BufferAttribute(col, 3);
    pAttr.setUsage(THREE.DynamicDrawUsage);
    cAttr.setUsage(THREE.DynamicDrawUsage);

    geom.setAttribute('position', pAttr);
    geom.setAttribute('color', cAttr);
    return { geometry: geom, positionAttr: pAttr, colorAttr: cAttr };
  }, []);

  // Update geometry buffers when selectedCatalogs changes
  useEffect(() => {
    let offset = 0;
    const ranges: { id: string; name: string; start: number; end: number; color: string; dangerLevel: any }[] = [];

    const posArray = positionAttr.array as Float32Array;
    const colArray = colorAttr.array as Float32Array;

    for (const catId of selectedCatalogs) {
      const data = PRECOMPUTED_CATALOGS[catId];
      if (!data) continue;

      const count = data.count;
      if (offset + count > MAX_DEBRIS_CAPACITY) break;

      posArray.set(data.positions, offset * 3);
      colArray.set(data.colors, offset * 3);

      ranges.push({
        id: data.id,
        name: data.name,
        start: offset,
        end: offset + count,
        color: data.color,
        dangerLevel: data.dangerLevel,
      });

      offset += count;
    }

    catalogRanges.current = ranges;
    geometry.setDrawRange(0, offset);
    positionAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    geometry.computeBoundingSphere();
  }, [selectedCatalogs, geometry, positionAttr, colorAttr]);

  // Slow realistic drift & orbital precession of debris fields
  useFrame((_, delta) => {
    if (!isPropagating || !pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.008 * propagationSpeed;
    pointsRef.current.rotation.x += delta * 0.0018 * propagationSpeed;
  });

  // Raycast hover lookup
  const handlePointerMove = useCallback(
    (e: any) => {
      e.stopPropagation();
      const index = e.index;
      if (index === undefined || index < 0) return;

      const ranges = catalogRanges.current;
      for (const range of ranges) {
        if (index >= range.start && index < range.end) {
          onParticleHover?.({
            catalogId: range.id,
            catalogName: range.name,
            altitudeKm: 550,
            inclinationDeg: 53.0,
            color: range.color,
            dangerLevel: range.dangerLevel,
          });
          return;
        }
      }
    },
    [onParticleHover]
  );

  const handlePointerOut = useCallback(
    (e: any) => {
      e.stopPropagation();
      onParticleHover?.(null);
    },
    [onParticleHover]
  );

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      const index = e.index;
      if (index === undefined || index < 0) return;

      const ranges = catalogRanges.current;
      for (const range of ranges) {
        if (index >= range.start && index < range.end) {
          onParticleClick?.({
            catalogId: range.id,
            catalogName: range.name,
            altitudeKm: 550,
            inclinationDeg: 53.0,
            color: range.color,
            dangerLevel: range.dangerLevel,
          });
          return;
        }
      }
    },
    [onParticleClick]
  );

  if (!visible) return null;

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      frustumCulled={true}
    >
      <pointsMaterial
        size={pointSize}
        map={glowTexture ?? undefined}
        vertexColors
        transparent
        opacity={opacity}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default DebrisField;
