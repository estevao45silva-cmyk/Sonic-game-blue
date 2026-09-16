const fs = require('fs');

const filepath = 'src/game/PhaserGame.ts';
let lines = fs.readFileSync(filepath, 'utf8').split('\n');

// Find the line with "} // Close level 3 else"
const insertIndex = lines.findIndex(line => line.includes('} // Close level 3 else'));

const checkpointLogic = `         // Checkpoints
         if (x % 200 === 0 && x > 0 && !hasObject) {
            const cp = this.add.sprite(worldX + 32, groundY - 25, 'checkpoint_ph');
            this.physics.add.existing(cp, true);
            this.physics.add.overlap(this.player, cp, () => {
              if (!this.lastCheckpoint || this.lastCheckpoint.x < worldX) {
                this.lastCheckpoint = { x: worldX, y: groundY - 100 };
                const flash = this.add.circle(cp.x, cp.y, 40, 0x00FF00);
                this.tweens.add({ targets: flash, alpha: 0, duration: 500, onComplete: () => flash.destroy() });
              }
            });
         }`;

// Insert checkpoint logic before the close
lines.splice(insertIndex, 0, checkpointLogic);

// Find the start of the duplicate block
const startIndex = lines.findIndex(line => line.includes('// COMMON ELEMENTS (Rings, Monitors'));
// Find the end of the duplicate block
const endIndex = lines.findIndex((line, idx) => idx > startIndex && line.includes('} // End of for loop'));

if (startIndex !== -1 && endIndex !== -1) {
    // Delete the duplicate block
    lines.splice(startIndex, endIndex - startIndex + 1);
    console.log('Duplicate block removed successfully.');
} else {
    console.log('Duplicate block not found!');
}

fs.writeFileSync(filepath, lines.join('\n'), 'utf8');
console.log('File updated.');
