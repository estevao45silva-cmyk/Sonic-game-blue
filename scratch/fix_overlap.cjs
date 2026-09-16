const fs = require('fs');
let c = fs.readFileSync('src/game/PhaserGame.ts', 'utf8');

const regex = /\/\/ Parallax Far Mountains \(Infinite\)[\s\S]*?\/\/ Foreground Flora/m;

const replacement = `// Parallax Far Mountains (Infinite)
    this.bgMountainsFar = this.add.tileSprite(0, horizonY - 40, 28000, 200, 'bg_mountains_ph');
    this.bgMountainsFar.setOrigin(0, 1);
    this.bgMountainsFar.setScrollFactor(0.2, 0.05);
    this.bgMountainsFar.setTint(this.currentLevel === 1 ? 0x2266aa : (this.currentLevel === 2 ? 0x662200 : 0x221144));

    // Parallax Near Mountains (Infinite)
    this.bgMountainsNear = this.add.tileSprite(0, horizonY, 28000, 200, 'bg_mountains_ph');
    this.bgMountainsNear.setOrigin(0, 1);
    this.bgMountainsNear.setScrollFactor(0.4, 0.05);
    if (this.currentLevel === 1) this.bgMountainsNear.setTint(0x44aa44);
    else if (this.currentLevel === 2) this.bgMountainsNear.setTint(0x8B2200);
    else if (this.currentLevel === 3) this.bgMountainsNear.setTint(0x4B0082);

    // Parallax Waterfalls (Level 1 only)
    if (this.currentLevel === 1) {
        for (let i = 0; i < 30; i++) {
            const wf = this.add.image(i * 900 + (Math.random() * 500), horizonY, 'waterfall_ph');
            wf.setOrigin(0.5, 1);
            wf.setScrollFactor(0.4, 0.05);
            wf.setScale(1.5, 1.5);
            wf.setAlpha(0.6);
        }
    }

    // Horizon Glow (Blend)
    const horizonGlow = this.add.graphics();
    horizonGlow.fillGradientStyle(0xffffff, 0xffffff, 0xffffff, 0xffffff, 0, 0, 0.5, 0.5);
    horizonGlow.fillRect(0, horizonY - 20, 8000, 40);
    horizonGlow.setBlendMode(Phaser.BlendModes.ADD);
    horizonGlow.setScrollFactor(0, 0.05);

    // Classic Water Layer (Starts exactly at Horizon)
    this.bgWater = this.add.tileSprite(0, horizonY, 8000, 400, 'bg_water_ph');
    if (this.currentLevel === 2) this.bgWater.setTint(0xFF0000);
    else if (this.currentLevel === 3) this.bgWater.setTint(0x8800FF);
    else this.bgWater.setTint(0x0088FF);
    this.bgWater.setOrigin(0, 0);
    this.bgWater.setScrollFactor(0, 0.05);
    this.bgWater.setAlpha(0.85);
    this.bgWater.setBlendMode(Phaser.BlendModes.ADD); // Beautiful shiny water

    // Foreground Flora`;

if (c.match(regex)) {
    c = c.replace(regex, replacement);
    fs.writeFileSync('src/game/PhaserGame.ts', c);
    console.log("Replaced perfectly");
} else {
    console.log("Could not match the regex");
}
