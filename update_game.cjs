const fs = require('fs');
const path = require('path');

const gamePath = 'd:/Users/943046/Desktop/sonic/sonic-game/src/game/PhaserGame.ts';
let content = fs.readFileSync(gamePath, 'utf8');

// 1. Melhorar geração procedimental (Monitor, Ring, Spike, Spring)
content = content.replace(
    /\/\/ Monitor[\s\S]*?graphics\.clear\(\);[\s\S]*?\/\/ Ring[\s\S]*?graphics\.clear\(\);[\s\S]*?\/\/ Spike[\s\S]*?graphics\.clear\(\);/m,
`// Monitor (Sonic style)
    graphics.fillStyle(0x444444, 1);
    graphics.fillRoundedRect(0, 0, 40, 40, 8);
    graphics.fillStyle(0x000000, 1);
    graphics.fillRoundedRect(5, 5, 30, 20, 4);
    graphics.fillStyle(0x88CCFF, 1); // Tela
    graphics.fillRoundedRect(7, 7, 26, 16, 2);
    graphics.fillStyle(0xFFFFFF, 0.5); // Brilho tela
    graphics.fillRect(7, 7, 26, 5);
    graphics.generateTexture('monitor_ph', 40, 40);
    graphics.clear();

    // Ring (3D look)
    graphics.lineStyle(4, 0xFFD700, 1);
    graphics.strokeCircle(16, 16, 12);
    graphics.lineStyle(2, 0xFFF8AA, 1); // Highlight
    graphics.strokeCircle(16, 16, 12);
    graphics.lineStyle(2, 0xDAA520, 1); // Shadow
    graphics.beginPath();
    graphics.arc(16, 16, 12, 0, Math.PI, false);
    graphics.strokePath();
    graphics.generateTexture('ring_ph', 32, 32);
    graphics.clear();

    // Spike (Metallic)
    graphics.fillStyle(0x888888, 1);
    graphics.fillTriangle(25, 0, 40, 50, 10, 50);
    graphics.fillStyle(0xAAAAAA, 1);
    graphics.fillTriangle(25, 0, 25, 50, 10, 50); // Highlight side
    graphics.fillStyle(0x555555, 1);
    graphics.fillRect(10, 40, 30, 10); // Base
    graphics.generateTexture('spike_ph', 50, 50);
    graphics.clear();`
);

content = content.replace(
    /\/\/ Spring[\s\S]*?graphics\.clear\(\);/m,
`// Spring (Classic Red)
    graphics.fillStyle(0x555555, 1);
    graphics.fillRect(0, 48, 64, 16); // Base
    graphics.fillStyle(0xAAAAAA, 1);
    graphics.fillRect(16, 32, 32, 16); // Coil
    graphics.fillStyle(0xFF0000, 1);
    graphics.fillRect(8, 16, 48, 16); // Top Pad
    graphics.fillStyle(0xFF8888, 1);
    graphics.fillRect(8, 16, 48, 4); // Top highlight
    graphics.generateTexture('spring_ph', 64, 64);
    graphics.clear();`
);

// 2. Refatorar createMassiveLevel
const newCreateMassiveLevel = `  private createMassiveLevel() {
    const blockSize = 64;
    let mapCols = 800;
    if (this.currentLevel === 2) mapCols = 1000;
    if (this.currentLevel === 3) mapCols = 1200;
    const mapRows = 12;
    const startY = 1200 - (mapRows * blockSize);

    let tileKey = 'checker_perfect_1';
    if (this.currentLevel === 2) tileKey = 'checker_marble';
    if (this.currentLevel === 3) tileKey = 'checker_starlight';

    let x = 0;
    while (x < mapCols) {
      const worldX = x * blockSize;
      const groundY = startY + (11 * blockSize);

      // Safe zones (Inicio e Fim)
      if (x < 20 || (x > mapCols - 40)) {
         const plat = this.add.tileSprite(worldX + 32, groundY + 32, blockSize, blockSize, tileKey);
         this.physics.add.existing(plat, true);
         this.platforms.add(plat as unknown as Phaser.Physics.Arcade.Image);
         
         // BOSS FIGHT ARENA (Fim)
         if (x === mapCols - 30) {
            this.boss = this.physics.add.sprite(worldX + 300, groundY - 300, 'boss_ph');
            this.boss.setDisplaySize(192, 192);
            this.boss.body.setSize(120, 120);
            if (this.boss.body) (this.boss.body as Phaser.Physics.Arcade.Body).allowGravity = false;
            (this.boss as any).hp = 3;
            (this.boss as any).state = 'idle';
            (this.boss as any).startX = worldX + 300;
            (this.boss as any).startY = groundY - 300;
            (this.boss as any).timer = 0;
            this.boss.setAlpha(0);
            this.bossGif = this.add.dom(worldX + 300, groundY - 300, 'img', 'width: 192px; pointer-events: none;');
            (this.bossGif.node as HTMLImageElement).src = '/imagens/eggman_boss.gif.gif';
            this.physics.add.overlap(this.player, this.boss, this.hitBoss, undefined, this);
         }
         
         if (x === mapCols - 5) {
            const goal = this.physics.add.sprite(worldX + 32, groundY - 100, 'goal_ph');
            goal.body.allowGravity = false;
            goal.body.setImmovable(true);
            goal.setAlpha(0.5);
            (goal as any).isActive = false;
            this.physics.add.overlap(this.player, goal, () => {
              if (!this.isLevelComplete && (goal as any).isActive) {
                this.isLevelComplete = true;
                let timeBonus = 50000 - (Math.floor(this.gameTime) * 100);
                if (timeBonus < 0) timeBonus = 0;
                let ringBonus = this.ringCount * 100;
                this.score += timeBonus + ringBonus;
                this.events.emit('updateScore', this.score);
                this.events.emit('levelComplete', { timeBonus, ringBonus });
                this.player.body.setAccelerationX(0);
                this.player.body.setDrag(this.DRAG * 2, 0);
              }
            });
            this.events.on('bossDefeated', () => {
               if (goal.scene) {
                  goal.setAlpha(1);
                  (goal as any).isActive = true;
                  this.tweens.add({ targets: goal, y: goal.y - 50, yoyo: true, duration: 500 });
               }
            });
         }
         
         if (x === mapCols - 2) {
            const endWall = this.add.rectangle(worldX + 32, groundY - 1000, 64, 4000, 0x000000, 0);
            this.physics.add.existing(endWall, true);
            this.platforms.add(endWall as unknown as Phaser.Physics.Arcade.Image);
         }
         
         x++;
         continue;
      }

      // Chunk Generation System
      const chunkType = Math.floor(Math.random() * 10);
      const chunkSize = 10; // Blocks per chunk
      
      for (let i = 0; i < chunkSize && x < mapCols - 40; i++, x++) {
          const cWorldX = x * blockSize;
          let currentGroundY = groundY;
          
          if (this.currentLevel === 1) { // Green Hill Chunks
             // Smooth Hills
             if (chunkType === 1 || chunkType === 2) {
                 currentGroundY = groundY - Math.floor(Math.sin((i / chunkSize) * Math.PI) * 3) * blockSize;
             }
             
             // Base Ground
             if (chunkType !== 3 || i < 2 || i > 7) { // Chunk 3 is a gap
                const plat = this.add.tileSprite(cWorldX + 32, currentGroundY + 32, blockSize, blockSize, tileKey);
                this.physics.add.existing(plat, true); 
                this.platforms.add(plat as unknown as Phaser.Physics.Arcade.Image);
                
                // Underneath filler
                const underPlat = this.add.tileSprite(cWorldX + 32, currentGroundY + 64 + 320, blockSize, 640, tileKey);
                this.physics.add.existing(underPlat, true); 
                this.platforms.add(underPlat as unknown as Phaser.Physics.Arcade.Image);
                
                // Objects placement
                if (i === 4) {
                    if (chunkType === 0) { // Rings
                        this.rings.create(cWorldX + 32, currentGroundY - 64, 'ring_ph');
                        this.rings.create(cWorldX + 32 + 64, currentGroundY - 64, 'ring_ph');
                        this.rings.create(cWorldX + 32 - 64, currentGroundY - 64, 'ring_ph');
                    } else if (chunkType === 4) { // Spring
                        this.springs.create(cWorldX + 32, currentGroundY - 32, 'spring_ph');
                    } else if (chunkType === 5) { // Spikes
                        this.spikes.create(cWorldX + 32, currentGroundY - 32, 'spike_ph');
                    } else if (chunkType === 6) { // Enemy
                        const enemy = this.enemies.create(cWorldX + 32, currentGroundY - 64, 'enemy_ph');
                        enemy.setScale(0.128);
                        enemy.body.allowGravity = true;
                        (enemy as any).startX = cWorldX + 32;
                    } else if (chunkType === 7) { // Loop
                        if (i === 4 && x < mapCols - 50) {
                            this.createLoopVisual(cWorldX, currentGroundY);
                        }
                    } else if (chunkType === 8) { // Monitor
                        const mon = this.monitors.create(cWorldX + 32, currentGroundY - 32, 'monitor_ph');
                        mon.body.allowGravity = true;
                        (mon as any).itemType = Math.floor(Math.random() * 4);
                    }
                }
             }
          }
          else if (this.currentLevel === 2) { // Marble Chunks
             if (chunkType <= 2 && i > 2 && i < 8) { // Lava gap
                 const plat = this.add.tileSprite(cWorldX + 32, groundY + 96, blockSize, blockSize, tileKey);
                 this.physics.add.existing(plat, true); 
                 this.platforms.add(plat as unknown as Phaser.Physics.Arcade.Image);
     
                 const lava = this.waterPools.create(cWorldX + 32, groundY + 32, 'water_ph');
                 (lava as any).setTint(0xFF0000);
                 (lava as any).setAlpha(0.9);
                 
                 const spike = this.spikes.create(cWorldX + 32, groundY + 32, 'spike_ph');
                 spike.setAlpha(0);
                 
                 if (i === 5) { // Moving Platform over lava
                    const mPlat = this.movingPlatforms.create(cWorldX + 32, groundY - 64, tileKey);
                    mPlat.body.allowGravity = false;
                    mPlat.setImmovable(true);
                    mPlat.setVelocityX(150);
                    (mPlat as any).startX = cWorldX + 32;
                 }
             } else {
                 const plat = this.add.tileSprite(cWorldX + 32, groundY + 32, blockSize, blockSize, tileKey);
                 this.physics.add.existing(plat, true); 
                 this.platforms.add(plat as unknown as Phaser.Physics.Arcade.Image);
                 
                 if (i === 5 && chunkType > 2) {
                     if (chunkType % 2 === 0) {
                        const enemy = this.enemies.create(cWorldX + 32, groundY - 64, 'enemy_ph');
                        enemy.setScale(0.128);
                        enemy.body.allowGravity = true;
                        (enemy as any).startX = cWorldX + 32;
                     } else {
                        this.rings.create(cWorldX + 32, groundY - 64, 'ring_ph');
                     }
                 }
             }
          }
          else { // Star Light Chunks
             if (chunkType === 0 && i > 2 && i < 8) continue; // Gap
             
             const plat = this.add.tileSprite(cWorldX + 32, groundY + 32, blockSize, blockSize, tileKey);
             this.physics.add.existing(plat, true); 
             this.platforms.add(plat as unknown as Phaser.Physics.Arcade.Image);
             
             if (i === 4 || i === 8) {
                 if (chunkType === 1) { // Flyer Enemy
                     const flyer = this.flyingEnemies.create(cWorldX + 32, groundY - 200, 'flyer_ph');
                     flyer.setScale(0.128);
                     flyer.body.allowGravity = false;
                     (flyer as any).startX = cWorldX + 32;
                     (flyer as any).timer = 0;
                 } else if (chunkType === 2) { // Rings
                     this.rings.create(cWorldX + 32, groundY - 64, 'ring_ph');
                 } else if (chunkType === 3) { // Spikes
                     this.spikes.create(cWorldX + 32, groundY - 32, 'spike_ph');
                 }
             }
          }
      }
    }
  }`;

content = content.replace(
    /  private createMassiveLevel\(\) \{[\s\S]*?  \}\n\n  createLoopVisual/m,
    newCreateMassiveLevel + '\n\n  createLoopVisual'
);

// 3. Melhorar AI em update()
content = content.replace(
    /\/\/ Update Enemies Patrol \(Motobug\)[\s\S]*?if \(!enemy\.active\) return;/g,
`// Update Enemies Patrol (Motobug)
    this.enemies.getChildren().forEach((enemy: any) => {
      if (!enemy.active) return;
      if (!enemy.state) {
          enemy.state = 'patrol';
          enemy.direction = Math.random() > 0.5 ? 1 : -1;
          enemy.startX = enemy.x;
      }
      
      // Checar se bateu na borda
      if (enemy.body.blocked.right) enemy.direction = -1;
      if (enemy.body.blocked.left) enemy.direction = 1;
      
      if (enemy.state === 'patrol') {
          enemy.setVelocityX(50 * enemy.direction);
          enemy.flipX = enemy.direction === 1;
          
          if (Math.abs(enemy.x - enemy.startX) > 200) {
              enemy.direction *= -1;
              enemy.startX = enemy.x; 
          }
      }
      
      const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      const isPlayerNear = distToPlayer < 250 && Math.abs(enemy.y - this.player.y) < 50;
      
      if (isPlayerNear && this.currentState !== PlayerState.DEAD) {
        enemy.state = 'charge';
      } else if (distToPlayer > 300) {
        enemy.state = 'patrol';
      }
      
      if (enemy.state === 'charge') {
        const direction = this.player.x > enemy.x ? 1 : -1;
        enemy.direction = direction;
        enemy.flipX = direction === 1;
        enemy.setVelocityX(150 * direction);
      }
    });

    // Update Flying Enemies (Buzz Bomber)
    this.flyingEnemies.getChildren().forEach((flyer: any) => {
       if (!flyer.active) return;
       if (!flyer.state) {
           flyer.state = 'patrol';
           flyer.direction = 1;
           flyer.startX = flyer.x;
           flyer.startY = flyer.y;
           flyer.timer = 0;
       }
       
       const distToPlayerX = Math.abs(flyer.x - this.player.x);
       const isPlayerBelow = distToPlayerX < 150 && flyer.y < this.player.y && this.player.y - flyer.y < 300;
       
       if (flyer.state === 'patrol') {
           flyer.setVelocityX(100 * flyer.direction);
           flyer.y = flyer.startY + Math.sin(this.time.now / 300) * 20; // Hover
           flyer.flipX = flyer.direction === 1;
           
           if (Math.abs(flyer.x - flyer.startX) > 300) {
               flyer.direction *= -1;
               flyer.startX = flyer.x;
           }
           
           if (isPlayerBelow && this.time.now > flyer.timer + 2000 && this.currentState !== PlayerState.DEAD) {
               flyer.state = 'fire';
               flyer.setVelocityX(0);
               flyer.timer = this.time.now;
           }
       }
       
       if (flyer.state === 'fire') {
           if (this.time.now > flyer.timer + 500) {
               // Fire projectile
               const proj = this.enemyProjectiles.create(flyer.x, flyer.y + 20, 'projectile_ph');
               if (proj) {
                   proj.body.allowGravity = true;
                   this.physics.moveToObject(proj, this.player, 300);
               }
               flyer.state = 'patrol';
               flyer.timer = this.time.now;
           }
       }
    });
    
    const DO_NOT_EXECUTE = false; 
    if (DO_NOT_EXECUTE) {
        this.enemies.getChildren().forEach((enemy: any) => {
          if (!enemy.active) return;`
);

// 4. Update Boss Logic
content = content.replace(
    /if \(this\.boss && this\.boss\.active\) \{[\s\S]*?this\.bossGif\.setPosition\(this\.boss\.x, this\.boss\.y\);\n\s*\}/m,
`if (this.boss && this.boss.active) {
      const boss = this.boss as any;
      if (!boss.state) boss.state = 'idle';
      
      const distToPlayer = Phaser.Math.Distance.Between(boss.x, boss.y, this.player.x, this.player.y);
      
      if (boss.state === 'idle' && distToPlayer < 600) {
         boss.state = 'hover';
         boss.timer = this.time.now;
      }
      
      if (boss.state === 'hover') {
         // Hovering figure 8 pattern
         const time = (this.time.now - boss.timer) / 1000;
         boss.x = boss.startX + Math.sin(time) * 150;
         boss.y = boss.startY + Math.sin(time * 2) * 50;
         
         if (time > 3) {
             boss.state = 'attack';
             boss.timer = this.time.now;
             // Dash to player
             this.physics.moveToObject(boss, this.player, 400);
         }
      }
      
      if (boss.state === 'attack') {
         if (this.time.now > boss.timer + 1500) {
             boss.setVelocity(0, 0);
             boss.state = 'fire';
             boss.timer = this.time.now;
         }
      }
      
      if (boss.state === 'fire') {
         if (this.time.now > boss.timer + 500) {
             // Fire 3 projectiles
             for (let i = -1; i <= 1; i++) {
                 const proj = this.enemyProjectiles.create(boss.x, boss.y + 40, 'projectile_ph');
                 if (proj) {
                     proj.body.allowGravity = false;
                     proj.setVelocity(Math.cos(Math.PI/2 + i*0.5) * 300, Math.sin(Math.PI/2 + i*0.5) * 300);
                 }
             }
             boss.state = 'hover';
             boss.timer = this.time.now;
         }
      }
      
      if (this.bossGif) {
         this.bossGif.setPosition(this.boss.x, this.boss.y);
      }
    }`
);

fs.writeFileSync(gamePath, content);
console.log("Updated PhaserGame.ts successfully!");
