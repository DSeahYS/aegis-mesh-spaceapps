// Verify that all constellation catalogs are present in catalogGenerator.ts
// This script is now a no-op verification check ? catalogs are maintained directly in source.
const fs = require('fs');
const path = require('path');

const targetPath = path.join('C:', 'VSCode Folder', 'NASASpaceApps2026', 'src', 'lib', 'catalogGenerator.ts');

if (!fs.existsSync(targetPath)) {
  console.error('ERROR: catalogGenerator.ts not found at', targetPath);
  process.exit(1);
}

const content = fs.readFileSync(targetPath, 'utf8');

const required = [
  { key: 'kuiper', generator: 'generateKuiperCatalog' },
  { key: 'guowang', generator: 'generateGuowangCatalog' },
  { key: 'iridium-next', generator: 'generateIridiumCatalog' },
  { key: 'gps-nav', generator: 'generateGpsCatalog' },
];

let allPresent = true;
for (const { key, generator } of required) {
  const hasDef = content.includes(`'${key}':`) || content.includes(`"${key}":`);
  const hasGen = content.includes(generator);
  const status = hasDef && hasGen ? 'OK' : 'MISSING';
  if (status !== 'OK') allPresent = false;
  console.log(`  ${key}: definition=${hasDef} generator=${hasGen} [${status}]`);
}

if (allPresent) {
  console.log('All constellation catalogs present. No injection needed.');
} else {
  console.error('Some catalogs are missing. Run updateCatalogs.cjs to repair.');
  process.exit(1);
}