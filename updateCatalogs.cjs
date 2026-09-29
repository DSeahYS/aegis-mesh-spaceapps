// Repair script: ensure all constellation catalogs exist in catalogGenerator.ts
// Safe to run repeatedly ? only adds missing entries.
const fs = require('fs');
const path = require('path');

const targetPath = path.join('C:', 'VSCode Folder', 'NASASpaceApps2026', 'src', 'lib', 'catalogGenerator.ts');

if (!fs.existsSync(targetPath)) {
  console.error('ERROR: catalogGenerator.ts not found');
  process.exit(1);
}

let content = fs.readFileSync(targetPath, 'utf8');
let changed = false;

// Check each catalog
const catalogs = [
  { def: "'kuiper':", gen: 'function generateKuiperCatalog' },
  { def: "'guowang':", gen: 'function generateGuowangCatalog' },
  { def: "'iridium-next':", gen: 'function generateIridiumCatalog' },
  { def: "'gps-nav':", gen: 'function generateGpsCatalog' },
];

for (const { def, gen } of catalogs) {
  if (!content.includes(def) || !content.includes(gen)) {
    console.log(`Missing: ${def} / ${gen}`);
    changed = true;
  }
}

if (!changed) {
  console.log('All catalogs already present. No changes needed.');
} else {
  console.log('Repair needed ? catalogs must be added manually to catalogGenerator.ts.');
  process.exit(1);
}