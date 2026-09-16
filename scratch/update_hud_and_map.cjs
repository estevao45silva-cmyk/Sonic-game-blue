const fs = require('fs');
let c = fs.readFileSync('src/game/PhaserGame.ts', 'utf8');

// 1. Map length
c = c.replace('let mapCols = 800; // Level 1 size', 'let mapCols = 250; // Level 1 size');
c = c.replace('if (this.currentLevel === 2) mapCols = 1000;', 'if (this.currentLevel === 2) mapCols = 300;');
c = c.replace('if (this.currentLevel === 3) mapCols = 1200;', 'if (this.currentLevel === 3) mapCols = 350;');

// 2. Enemy density
c = c.replace(`if (x % 15 === 0 && !hasObject) {
            const enemy = this.enemies.create(worldX + 32, currentGroundY - 64, 'enemy_ph');`, `if (x % 30 === 0 && !hasObject) {
            const enemy = this.enemies.create(worldX + 32, currentGroundY - 64, 'enemy_ph');`);

c = c.replace(`if (x % 20 === 0 && !isLava && !hasObject) {
                 this.enemies.create(worldX + 32, groundY - 64, 'enemy_ph');`, `if (x % 40 === 0 && !isLava && !hasObject) {
                 this.enemies.create(worldX + 32, groundY - 64, 'enemy_ph');`);

// 3. UI replacement
const oldUI = `    const textStyle = { 

      fontFamily: '"Press Start 2P", Orbitron, sans-serif', 

      fontSize: '20px', 

      color: '#FACC15', // Yellow font for SCORE/TIME/RINGS

      stroke: '#000000',

      strokeThickness: 4,

      shadow: { offsetX: 2, offsetY: 2, color: '#000000', fill: true }

    };



    const valStyle = {

      fontFamily: '"Press Start 2P", Orbitron, sans-serif', 

      fontSize: '20px', 

      color: '#FFFFFF',

      stroke: '#000000',

      strokeThickness: 4

    };



    this.add.text(40, 40, 'SCORE', textStyle);

    this.scoreText = this.add.text(140, 40, '0', valStyle);



    this.add.text(40, 75, 'TIME', textStyle);

    this.timeText = this.add.text(140, 75, '0:00', valStyle);

    

    this.add.text(40, 110, 'RINGS', textStyle);

    this.ringsText = this.add.text(140, 110, '0', valStyle);

    

    // Flashing Red Text automatically if starting with 0

    this.ringsText.setColor('#FF0000');

    

    // Classic Lives Box HUD (Small blue square with text)

    // (We will redraw the box inside the resize event)

    const charName = data.character === 'sonic' ? 'SONIC' : 'SHADOW';

    const charNameText = this.add.text(40, this.cameras.main.height - 50, charName, { fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#FFFFFF' });

    this.livesText = this.add.text(70, this.cameras.main.height - 40, \`x \${data.lives ?? 3}\`, { fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#FFFFFF' });

    
    const livesBox = this.add.rectangle(70, this.cameras.main.height - 40, 80, 40, 0x000000, 0.5);
    livesBox.setDepth(-1); // behind text

    // Handling resize
    this.scale.on('resize', (gameSize: any) => {
       const w = gameSize.width;
       const h = gameSize.height;
       
       livesBox.setPosition(70, h - 40);
       charNameText.setPosition(40, h - 50);
       this.livesText.setPosition(70, h - 40);
       if (backBtn) backBtn.setPosition(w - 150, 40);
    });`;

const newUI = `    // UI HUD - Glassmorphism
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x000000, 0.4);
    hudBg.fillRoundedRect(10, 20, 260, 130, 15);
    hudBg.setDepth(10);
    hudBg.setScrollFactor(0);

    const textStyle = { 
      fontFamily: '"Press Start 2P", Orbitron, sans-serif', 
      fontSize: '16px', 
      color: '#FACC15', 
      stroke: '#000000',
      strokeThickness: 4,
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
    };
    const valStyle = {
      fontFamily: '"Press Start 2P", Orbitron, sans-serif', 
      fontSize: '18px', 
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 5
    };

    this.add.text(25, 35, 'SCORE', textStyle).setDepth(10);
    this.scoreText = this.add.text(120, 35, '0', valStyle).setDepth(10);

    this.add.text(25, 75, 'TIME', textStyle).setDepth(10);
    this.timeText = this.add.text(120, 75, '0:00', valStyle).setDepth(10);
    
    // Rings with Icon
    const ringIcon = this.add.sprite(45, 115, 'ring_ph').setScale(1.5).setScrollFactor(0).setDepth(10);
    this.tweens.add({ targets: ringIcon, scaleX: -1.5, yoyo: true, repeat: -1, duration: 600 });
    this.ringsText = this.add.text(80, 105, '0', valStyle).setDepth(10);
    this.ringsText.setColor('#FF0000');
    
    // Lives UI
    const livesBg = this.add.graphics();
    livesBg.fillStyle(0x000000, 0.4);
    livesBg.fillRoundedRect(10, this.cameras.main.height - 70, 160, 60, 15);
    livesBg.setDepth(10);
    livesBg.setScrollFactor(0);

    const charName = data.character === 'sonic' ? 'SONIC' : 'SHADOW';
    const charColor = data.character === 'sonic' ? 0x0000FF : 0x000000;
    
    // Character Face Placeholder
    const charIcon = this.add.circle(40, this.cameras.main.height - 40, 20, charColor);
    charIcon.setStrokeStyle(3, 0xFFFFFF);
    charIcon.setDepth(10);
    charIcon.setScrollFactor(0);
    this.add.text(40, this.cameras.main.height - 40, charName[0], { fontFamily: '"Press Start 2P"', fontSize: '18px', color: '#FFF' }).setOrigin(0.5).setDepth(10);

    this.livesText = this.add.text(80, this.cameras.main.height - 50, \`x \${data.lives ?? 3}\`, { fontFamily: '"Press Start 2P"', fontSize: '20px', color: '#FFFFFF', stroke: '#000', strokeThickness: 5 }).setDepth(10);

    this.scale.on('resize', (gameSize: any) => {
       const w = gameSize.width;
       const h = gameSize.height;
       
       livesBg.clear();
       livesBg.fillStyle(0x000000, 0.4);
       livesBg.fillRoundedRect(10, h - 70, 160, 60, 15);
       
       charIcon.setPosition(40, h - 40);
       this.livesText.setPosition(80, h - 50);
       
       if (backBtn) backBtn.setPosition(w - 150, 40);
    });`;

if (c.includes('const textStyle = {')) {
    c = c.replace(oldUI, newUI);
} else {
    console.log("Could not find old UI block");
}

fs.writeFileSync('src/game/PhaserGame.ts', c);
console.log("Updated HUD and Map Length!");
