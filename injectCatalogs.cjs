const fs = require('fs');
const path = require('path');

const targetPath = path.join('C:', 'VSCode Folder', 'NASASpaceApps2026', 'src', 'lib', 'catalogGenerator.ts');
let content = fs.readFileSync(targetPath, 'utf8');

// Insert after 'uncatalogued' definition block
const injectionPoint = content.indexOf('  },', content.indexOf("'uncatalogued':")) + 4;

const newDefinitions = \
  'kuiper': {
    id: 'kuiper',
    name: 'Project Kuiper Constellation',
    category: 'constellation',
    count: 3236,
    description: 'Amazon broadband mega-constellation nodes in low earth orbit',
    nominalAltitudeKm: '590 - 630 km',
    inclination: '33.0° / 42.0° / 51.9°',
    color: '#fbbf24',
    accentBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    badge: 'ACTIVE COOPERATIVE',
    dangerLevel: 'LOW',
  },
  'guowang': {
    id: 'guowang',
    name: 'Guowang (GW) Network',
    category: 'constellation',
    count: 12992,
    description: 'Massive Chinese national broadband mega-constellation (planned deployment)',
    nominalAltitudeKm: '500 - 1,145 km',
    inclination: '30.0° - 85.0°',
    color: '#ef4444',
    accentBg: 'bg-red-500/10 border-red-500/30 text-red-300',
    badge: 'ACTIVE UNCOOPERATIVE',
    dangerLevel: 'MED',
  },
  'iridium-next': {
    id: 'iridium-next',
    name: 'Iridium NEXT',
    category: 'constellation',
    count: 75,
    description: 'L-band satellite constellation in 6 polar orbital planes',
    nominalAltitudeKm: '780 km',
    inclination: '86.4°',
    color: '#8b5cf6',
    accentBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    badge: 'ACTIVE COOPERATIVE',
    dangerLevel: 'LOW',
  },
  'gps-nav': {
    id: 'gps-nav',
    name: 'GPS / GLONASS / Galileo',
    category: 'constellation',
    count: 98,
    description: 'Global Navigation Satellite Systems operating in MEO',
    nominalAltitudeKm: '19,100 - 23,200 km',
    inclination: '55.0° - 64.8°',
    color: '#3b82f6',
    accentBg: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    badge: 'ACTIVE COOPERATIVE',
    dangerLevel: 'LOW',
  },\;

content = content.substring(0, injectionPoint) + newDefinitions + content.substring(injectionPoint);

const switchCases = \
      case 'kuiper':
        generated = generateKuiperCatalog(3236);
        break;
      case 'guowang':
        generated = generateGuowangCatalog(12992);
        break;
      case 'iridium-next':
        generated = generateIridiumCatalog(75);
        break;
      case 'gps-nav':
        generated = generateGpsCatalog(98);
        break;\;

content = content.replace(/case 'oneweb':[\s\S]*?break;/, \case 'oneweb':
        generated = generateOneWebCatalog(648);
        break;\\);

const generatorFunctions = \
function generateKuiperCatalog(count: number): CatalogObject[] {
  const rng = createSeededRandom(443322);
  const items: CatalogObject[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const altKm = 590 + (rng() - 0.5) * 40;
    const incDeg = 51.9 + (rng() - 0.5) * 2;
    
    const sma = EARTH_RADIUS_KM + altKm;
    const incRad = incDeg * (Math.PI / 180);
    const elements: OrbitalElements = {
      semiMajorAxis: sma, eccentricity: 0.001, inclination: incRad,
      raan: rng() * 2 * Math.PI, argumentOfPerigee: 0, trueAnomaly: rng() * 2 * Math.PI
    };
    const cart = keplerianToCartesian(elements);

    items[i] = {
      id: 'kuiper-' + i, position: cart.position, velocity: cart.velocity,
      type: 'kuiper', name: 'Kuiper-' + i, altitudeKm: altKm, inclinationDeg: incDeg,
      sizeCm: 250, rcs: 'large',
    };
  }
  return items;
}

function generateGuowangCatalog(count: number): CatalogObject[] {
  const rng = createSeededRandom(998877);
  const items: CatalogObject[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const altKm = 500 + (rng() * 645);
    const incDeg = 30 + (rng() * 55);
    
    const sma = EARTH_RADIUS_KM + altKm;
    const incRad = incDeg * (Math.PI / 180);
    const elements: OrbitalElements = {
      semiMajorAxis: sma, eccentricity: 0.001, inclination: incRad,
      raan: rng() * 2 * Math.PI, argumentOfPerigee: 0, trueAnomaly: rng() * 2 * Math.PI
    };
    const cart = keplerianToCartesian(elements);

    items[i] = {
      id: 'gw-' + i, position: cart.position, velocity: cart.velocity,
      type: 'guowang', name: 'GW-' + i, altitudeKm: altKm, inclinationDeg: incDeg,
      sizeCm: 200, rcs: 'large',
    };
  }
  return items;
}

function generateIridiumCatalog(count: number): CatalogObject[] {
  const rng = createSeededRandom(112233);
  const items: CatalogObject[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const altKm = 780 + (rng() - 0.5) * 5;
    const incDeg = 86.4 + (rng() - 0.5) * 0.1;
    
    const sma = EARTH_RADIUS_KM + altKm;
    const incRad = incDeg * (Math.PI / 180);
    const elements: OrbitalElements = {
      semiMajorAxis: sma, eccentricity: 0.001, inclination: incRad,
      raan: rng() * 2 * Math.PI, argumentOfPerigee: 0, trueAnomaly: rng() * 2 * Math.PI
    };
    const cart = keplerianToCartesian(elements);

    items[i] = {
      id: 'iridium-' + i, position: cart.position, velocity: cart.velocity,
      type: 'iridium-next', name: 'Iridium-' + i, altitudeKm: altKm, inclinationDeg: incDeg,
      sizeCm: 300, rcs: 'large',
    };
  }
  return items;
}

function generateGpsCatalog(count: number): CatalogObject[] {
  const rng = createSeededRandom(556677);
  const items: CatalogObject[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const altKm = 20000 + (rng() - 0.5) * 1000;
    const incDeg = 55.0 + (rng() * 10);
    
    const sma = EARTH_RADIUS_KM + altKm;
    const incRad = incDeg * (Math.PI / 180);
    const elements: OrbitalElements = {
      semiMajorAxis: sma, eccentricity: 0.001, inclination: incRad,
      raan: rng() * 2 * Math.PI, argumentOfPerigee: 0, trueAnomaly: rng() * 2 * Math.PI
    };
    const cart = keplerianToCartesian(elements);

    items[i] = {
      id: 'gnss-' + i, position: cart.position, velocity: cart.velocity,
      type: 'gps-nav', name: 'GNSS-' + i, altitudeKm: altKm, inclinationDeg: incDeg,
      sizeCm: 400, rcs: 'large',
    };
  }
  return items;
}
\;

content = content.replace('export function getAvailableCatalogTypes', generatorFunctions + '\\n\\nexport function getAvailableCatalogTypes');

fs.writeFileSync(targetPath, content);
console.log('Successfully injected massive constellations');
