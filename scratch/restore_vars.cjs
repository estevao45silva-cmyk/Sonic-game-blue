const fs = require('fs');
let c = fs.readFileSync('src/game/PhaserGame.ts', 'utf8');

c = c.replace(/\/\/ Look ahead\n    let targetOffsetX = 0;/, `// --- Dynamic Camera (Lookahead) & Boost FX ---\n    const cameraVelX = this.player.body.velocity.x;\n    const absVelX = Math.abs(cameraVelX);\n\n    // Look ahead\n    let targetOffsetX = 0;`);

fs.writeFileSync('src/game/PhaserGame.ts', c);
console.log('Restored cameraVelX');
