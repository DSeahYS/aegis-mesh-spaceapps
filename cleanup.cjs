const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            
            // Remove hardcoded neon shadows
            content = content.replace(/shadow-\[0_0_[^\]]+\]/g, 'shadow-md');
            content = content.replace(/drop-shadow-\[0_0_[^\]]+\]/g, 'drop-shadow-sm');
            content = content.replace(/ring-2 ring-yellow-300/g, 'ring-1 ring-yellow-500/50');
            content = content.replace(/animate-pulse/g, ''); // Tone down the pulsing
            content = content.replace(/animate-ping/g, '');

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Cleaned:', fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
console.log('UI cleanup script complete.');
