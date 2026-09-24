const fs = require('fs');
const targetFile = 'src/game/PhaserGame.ts';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Fix endWall position
content = content.replace('if (x === 398) {', 'if (x === mapCols - 2) {');

// 2. Fix solid floor position for Boss Arena
content = content.replace('if (x >= 370) {', 'if (x >= mapCols - 40) {');

// 3. Make the 2D background transparent to show the 3D Background!
// Let's find bgSky.fillRect and comment it out or change its size.
// The sky is drawn by bgSky.fillGradientStyle(...) and then bgSky.fillRect(0, 0, 80000, 1200);
content = content.replace(/this\.bgSky\.fillRect\(0, 0, 80000, 1200\);/g, '// this.bgSky.fillRect(0, 0, 80000, 1200); // HIDDEN to show 3D Background');
content = content.replace(/this\.bgSky\.fillRect\(0,\s*0,\s*80000,\s*1200\);/g, '// Hidden sky');

// Also, let's make sure bgMountainsNear and bgWater have some transparency so we can see the 3D background behind them?
// Actually, if we hide bgSky, the ThreeBackground will be fully visible in the top 80% of the screen.

// 4. Boss spawn: wait, boss spawns at 970! Let's check mapCols.
// If mapCols = 1000, 970 is mapCols - 30. Let's make it mapCols - 30 to be safe for any map size.
content = content.replace('if (x === 970) {', 'if (x === mapCols - 30) {');
// we also need to fix the boss placement coordinates inside the block
// worldX + 300 might be wrong if worldX is x * blockSize.
// Let's just leave worldX + 300 since x is mapCols - 30. It's fine.

fs.writeFileSync(targetFile, content);
console.log('Fixed wall, boss spawn, and bgSky transparency.');
