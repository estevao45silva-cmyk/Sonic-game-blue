const fs = require('fs');
const targetFile = 'src/game/PhaserGame.ts';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Sky Gradient
const skyOld = `    } else if (this.currentLevel === 2) {
      this.bgSky.fillGradientStyle(0x1a052b, 0x1a052b, 0x48195a, 0x48195a, 1);
    } else {
      this.bgSky.fillGradientStyle(0x0a0a2a, 0x0a0a2a, 0x1a1a4a, 0x1a1a4a, 1);
    }`;
const skyNew = `    } else if (this.currentLevel === 2) {
      this.bgSky.fillGradientStyle(0x1a052b, 0x1a052b, 0x48195a, 0x48195a, 1);
    } else if (this.currentLevel === 3) {
      this.bgSky.fillGradientStyle(0x0a0a2a, 0x0a0a2a, 0x1a1a4a, 0x1a1a4a, 1);
    } else if (this.currentLevel === 4) {
      this.bgSky.fillGradientStyle(0x110022, 0x110022, 0x330066, 0x330066, 1);
    } else {
      this.bgSky.fillGradientStyle(0x330000, 0x330000, 0x660000, 0x660000, 1);
    }`;
content = content.replace(skyOld, skyNew);

// 2. Mountains Tint
const mountOld = `    if (this.currentLevel === 2) this.bgMountainsNear.setTint(0x8b0000);
    else if (this.currentLevel === 3) this.bgMountainsNear.setTint(0x4b0082);`;
const mountNew = `    if (this.currentLevel === 2) this.bgMountainsNear.setTint(0x8b0000);
    else if (this.currentLevel === 3) this.bgMountainsNear.setTint(0x4b0082);
    else if (this.currentLevel === 4) this.bgMountainsNear.setTint(0xff00ff);
    else if (this.currentLevel === 5) this.bgMountainsNear.setTint(0x333333);`;
content = content.replace(mountOld, mountNew);

// 3. Water Tint
const waterOld = `    if (this.currentLevel === 2)
      this.bgWater.setTint(0xff0000); // Lava
    else if (this.currentLevel === 3) this.bgWater.setTint(0x8800ff); // Neon sludge`;
const waterNew = `    if (this.currentLevel === 2) this.bgWater.setTint(0xff0000); // Lava
    else if (this.currentLevel === 3) this.bgWater.setTint(0x8800ff); // Neon sludge
    else if (this.currentLevel === 4) this.bgWater.setTint(0xff00ff); // Casino neon
    else if (this.currentLevel === 5) this.bgWater.setTint(0x660000); // Blood/Lava`;
content = content.replace(waterOld, waterNew);

// 4. TileKeys
const tileOld = `      if (this.currentLevel === 2) tileKey = "checker_marble";

      if (this.currentLevel === 3) tileKey = "checker_starlight";`;
const tileNew = `      if (this.currentLevel === 2) tileKey = "checker_marble";
      if (this.currentLevel === 3) tileKey = "checker_starlight";
      if (this.currentLevel === 4) tileKey = "checker_starlight";
      if (this.currentLevel === 5) tileKey = "checker_marble";`;
content = content.replace(tileOld, tileNew);

// 5. Boss HP
const bossHPOld = `this.boss.hp = 5; // Placeholder HP`;
const bossHPNew = `this.boss.hp = 2 + this.currentLevel;`;
content = content.replace(bossHPOld, bossHPNew);
if (!content.includes(bossHPNew)) {
    // maybe it wasn't exactly that string
    content = content.replace(/this\.boss\.hp\s*=\s*\d+;/, 'this.boss.hp = 2 + this.currentLevel;');
}

// 6. Level Generation Logic (inject before Boss spawn)
// the boss spawn happens at `if (x === mapCols - 10) {`
const genOld = `      // Boss fight area
      if (x === mapCols - 10) {`;

const genNew = `      // LEVEL 4: CASINO NIGHT
      else if (this.currentLevel === 4) {
        if (x % 50 > 45) continue; // gaps
        const isBouncy = (x % 15 === 0);
        
        const plat = this.add.tileSprite(worldX + 32, groundY + 32, blockSize, blockSize, tileKey);
        plat.setTint(0xff00ff);
        this.physics.add.existing(plat, true);
        this.platforms.add(plat);
        
        if (isBouncy && !hasObject) {
           this.springs.create(worldX + 32, groundY - 32, "spring_ph");
           hasObject = true;
        }

        if (x > 10 && x % 40 === 0 && !hasObject) {
           const enemy = this.enemies.create(worldX + 32, groundY - 64, "flyer_ph");
           enemy.setScale(0.128);
           enemy.body.allowGravity = false;
           (enemy as any).startX = worldX + 32;
           (enemy as any).state = "patrol";
           hasObject = true;
        }
        
        if (x % 30 === 5 && !hasObject) {
           this.rings.create(worldX + 32, groundY - 64, "ring_ph");
           hasObject = true;
        }
      }
      
      // LEVEL 5: DEATH EGG
      else if (this.currentLevel === 5) {
        // HUGE gaps
        if (x % 40 > 30) {
            const lava = this.waterPools.create(worldX + 32, groundY + 32, "water_ph");
            (lava as any).setTint(0xff0000);
            (lava as any).setAlpha(0.9);
            const spike = this.spikes.create(worldX + 32, groundY + 32, "spike_ph");
            spike.setAlpha(0);
            
            if (x % 8 === 0) {
              const mPlat = this.movingPlatforms.create(worldX + 32, groundY - 120, tileKey);
              mPlat.setTint(0x333333);
              mPlat.body.allowGravity = false;
              mPlat.setImmovable(true);
              mPlat.setVelocityX(250); // fast!
              (mPlat as any).startX = worldX + 32;
            }
            continue;
        }
        
        const plat = this.add.tileSprite(worldX + 32, groundY + 32, blockSize, blockSize, tileKey);
        plat.setTint(0x550000);
        this.physics.add.existing(plat, true);
        this.platforms.add(plat);
        
        if (x > 10 && x % 20 === 0 && !hasObject) {
           this.spikes.create(worldX + 32, groundY - 32, "spike_ph");
           hasObject = true;
        }
        
        if (x > 10 && x % 25 === 0 && !hasObject) {
           const enemy = this.enemies.create(worldX + 32, groundY - 64, "enemy_ph");
           enemy.setScale(0.128);
           enemy.body.allowGravity = true;
           (enemy as any).startX = worldX + 32;
           hasObject = true;
        }
      }

      // Boss fight area
      if (x === mapCols - 10) {`;
content = content.replace(genOld, genNew);


fs.writeFileSync(targetFile, content);
console.log("update_levels.cjs finished successfully");
