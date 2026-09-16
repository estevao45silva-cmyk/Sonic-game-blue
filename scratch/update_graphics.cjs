const fs = require('fs');
let content = fs.readFileSync('src/game/PhaserGame.ts', 'utf8');

// 1. Melhorar Céu e adicionar Sol / Lua
const skyOld = `    if (this.currentLevel === 1) {

       // Classic Sonic Deep Blue Sky

       this.bgSky.fillGradientStyle(0x0000C0, 0x0000C0, 0x0055FF, 0x0055FF, 1);

    } else if (this.currentLevel === 2) {

       this.bgSky.fillGradientStyle(0x1a052b, 0x1a052b, 0x48195a, 0x48195a, 1);

    } else {

       this.bgSky.fillGradientStyle(0x020111, 0x020111, 0x20124d, 0x20124d, 1);

    }`;

const skyNew = `    if (this.currentLevel === 1) {
       // Vibrant Sonic Sky (Cyan to Deep Blue)
       this.bgSky.fillGradientStyle(0x00A3FF, 0x00A3FF, 0x0055FF, 0x0055FF, 1);
    } else if (this.currentLevel === 2) {
       // Sunset / Lava level
       this.bgSky.fillGradientStyle(0xFF4500, 0xFF4500, 0x8B0000, 0x8B0000, 1);
    } else {
       // Night / Neon level
       this.bgSky.fillGradientStyle(0x110033, 0x110033, 0x330066, 0x330066, 1);
    }
    
    // Ambient Glow (Sun / Moon)
    const glowColor = this.currentLevel === 1 ? 0xFFFF88 : (this.currentLevel === 2 ? 0xFFaa00 : 0xaa88FF);
    const sun = this.add.circle(400, 300, 150, glowColor, 0.4);
    sun.setScrollFactor(0.02, 0.05); // Move very slowly
    sun.setBlendMode(Phaser.BlendModes.ADD);
    
    const sunCore = this.add.circle(400, 300, 80, 0xFFFFFF, 0.8);
    sunCore.setScrollFactor(0.02, 0.05);
    sunCore.setBlendMode(Phaser.BlendModes.ADD);`;

content = content.replace(skyOld, skyNew);

// 2. Melhorar Speed Trails (Ghosts) no update
const ghostOld = `            const ghost = this.add.rectangle(this.player.x, this.player.y, 60, 60, ghostColor, 0.4);`;
const ghostNew = `            const ghost = this.add.rectangle(this.player.x, this.player.y, 60, 60, ghostColor, 0.6);
            ghost.setBlendMode(Phaser.BlendModes.ADD);
            const spark = this.add.circle(this.player.x, this.player.y, 10, 0xFFFFFF, 0.8);
            spark.setBlendMode(Phaser.BlendModes.ADD);
            this.tweens.add({ targets: spark, alpha: 0, scale: 0, duration: 200, onComplete: () => spark.destroy() });`;

content = content.replace(ghostOld, ghostNew);

// 3. Melhorar as montanhas com tint vibrante
const mountFarOld = `    this.bgMountainsFar.setTint(0x4B3A2A); // Darker tint for distance`;
const mountFarNew = `    this.bgMountainsFar.setTint(this.currentLevel === 1 ? 0x2266aa : (this.currentLevel === 2 ? 0x662200 : 0x221144));`;

content = content.replace(mountFarOld, mountFarNew);

const mountNearOld = `    if (this.currentLevel === 2) this.bgMountainsNear.setTint(0x8B0000);

    else if (this.currentLevel === 3) this.bgMountainsNear.setTint(0x4B0082);`;

const mountNearNew = `    if (this.currentLevel === 1) this.bgMountainsNear.setTint(0x44aa44);
    else if (this.currentLevel === 2) this.bgMountainsNear.setTint(0x8B2200);
    else if (this.currentLevel === 3) this.bgMountainsNear.setTint(0x4B0082);`;

content = content.replace(mountNearOld, mountNearNew);

// 4. Efeito especial no spawnDust
const dustOld = `    const dust = this.add.image(x, y, 'dust_ph');`;
const dustNew = `    const dust = this.add.image(x, y, 'dust_ph');
    dust.setBlendMode(Phaser.BlendModes.ADD); // Fica com cara de energia/faísca
    dust.setTint(0xAAFFFF);`;
    
content = content.replace(dustOld, dustNew);


fs.writeFileSync('src/game/PhaserGame.ts', content);
console.log("Graphics updated!");
