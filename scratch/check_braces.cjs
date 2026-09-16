const fs = require('fs');
const lines = fs.readFileSync('src/game/PhaserGame.ts', 'utf8').split('\n');
let depth = 1;
for(let i=1244; i<1690; i++) {
    const l = lines[i];
    // remove string literals and line comments to avoid false positives
    const cleanL = l.replace(/(['"`]).*?\1/g, '').replace(/\/\/.*/, '');
    const open = (cleanL.match(/\{/g) || []).length;
    const close = (cleanL.match(/\}/g) || []).length;
    depth += open;
    depth -= close;
    if (depth < 2) {
        console.log(`Depth dropped to ${depth} at line ${i+1}: ${l}`);
    }
}
console.log('Final depth at 1690:', depth);
