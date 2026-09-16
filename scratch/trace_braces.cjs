const fs = require('fs');
const lines = fs.readFileSync('src/game/PhaserGame.ts', 'utf8').split('\n');
let depth = 1;
for (let i = 1244; i < 1690; i++) {
    const l = lines[i];
    const cleanL = l.replace(/(['"`]).*?\1/g, '').replace(/\/\/.*/, '');
    const open = (cleanL.match(/\{/g) || []).length;
    const close = (cleanL.match(/\}/g) || []).length;
    depth += open;
    depth -= close;
    if (i >= 1590 && i <= 1681 && (open > 0 || close > 0)) {
        console.log(`${i + 1} d:${depth} +${open} -${close} ${l.trim()}`);
    }
}
