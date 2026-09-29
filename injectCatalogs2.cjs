// Verify constellation catalogs in catalogGenerator.ts (variant 2)
const fs = require('fs');
const path = require('path');

const targetPath = path.join('C:', 'VSCode Folder', 'NASASpaceApps2026', 'src', 'lib', 'catalogGenerator.ts');

if (!fs.existsSync(targetPath)) {
  console.error('ERROR: catalogGenerator.ts not found');
  process.exit(1);
}

const content = fs.readFileSync(targetPath, 'utf8');

const checks = [
  "'kuiper':", "'guowang':", "'iridium-next':", "'gps-nav':",
  'generateKuiperCatalog', 'generateGuowangCatalog',
  'generateIridiumCatalog', 'generateGpsCatalog',
];

let ok = true;
for (const c of checks) {
  const found = content.includes(c);
  if (!found) ok = false;
  console.log(`  ${c}: ${found ? 'OK' : 'MISSING'}`);
}

console.log(ok ? 'Verification passed.' : 'Some entries missing.');
process.exit(ok ? 0 : 1);