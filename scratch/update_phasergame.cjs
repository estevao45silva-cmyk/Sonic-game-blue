const fs = require('fs');
let c = fs.readFileSync('src/game/PhaserGame.ts', 'utf8');

// 1. Emit scroll event in update()
// Let's find: this.events.emit('updateTime', this.gameTime);
// And add our window event there.
c = c.replace(/this\.events\.emit\('updateTime', this\.gameTime\);/, `this.events.emit('updateTime', this.gameTime);
    window.dispatchEvent(new CustomEvent('phaser-scroll', { detail: { scrollX: this.cameras.main.scrollX, scrollY: this.cameras.main.scrollY } }));`);

// 2. Remove the old backgrounds
// From `this.bgSky = this.add.graphics();` all the way to `// Foreground Flora`
const bgRegex = /this\.bgSky = this\.add\.graphics\(\);[\s\S]*?\/\/ Foreground Flora/;
c = c.replace(bgRegex, '// Foreground Flora');

// Also remove `this.bgSky`, `this.bgClouds`, `this.bgMountainsFar`, `this.bgMountainsNear`, `this.bgWater` declarations from the class properties.
c = c.replace(/private bgSky!: Phaser\.GameObjects\.Graphics;/g, '');
c = c.replace(/private bgClouds!: Phaser\.GameObjects\.TileSprite;/g, '');
c = c.replace(/private bgMountainsFar!: Phaser\.GameObjects\.TileSprite;/g, '');
c = c.replace(/private bgMountainsNear!: Phaser\.GameObjects\.TileSprite;/g, '');
c = c.replace(/private bgWater!: Phaser\.GameObjects\.TileSprite;/g, '');

// And remove the scroll factor updates for the backgrounds in `update()`
const scrollUpdatesRegex = /if \(this\.bgClouds\)[ \s\S]*?this\.bgWater\.tilePositionX \+= 1;/;
c = c.replace(scrollUpdatesRegex, '');

fs.writeFileSync('src/game/PhaserGame.ts', c);
console.log('PhaserGame.ts updated');
