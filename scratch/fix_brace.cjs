const fs = require('fs');
let c = fs.readFileSync('src/game/PhaserGame.ts', 'utf8');

c = c.replace(/\/\/ --- Dynamic Camera \(Lookahead\) & Boost FX ---/, `    }\n\n    // --- Dynamic Camera (Lookahead) & Boost FX ---`);

fs.writeFileSync('src/game/PhaserGame.ts', c);
console.log('Restored missing brace');
