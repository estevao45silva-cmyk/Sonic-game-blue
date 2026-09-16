const fs = require('fs');
let c = fs.readFileSync('src/game/PhaserGame.ts', 'utf8');

const anchor = '  }\n\n  private spawnDust';
const index = c.indexOf(anchor);

if (index !== -1) {
    const bossLogic = `
    // Update Boss
    if (this.boss && this.boss.active && (this.boss as any).hp > 0) {
       const b = this.boss as any;
       
       if (this.bossGif) {
           this.bossGif.setPosition(b.x, b.y);
           if (b.body.velocity.x > 0) this.bossGif.setScale(-1, 1);
           else if (b.body.velocity.x < 0) this.bossGif.setScale(1, 1);
       }
       
       // Partículas dos propulsores da nave do Eggman
       if (Math.random() > 0.3) {
           const engineY = b.y + 70; 
           const flame = this.add.circle(b.x, engineY, 10, Math.random() > 0.5 ? 0xFF8800 : 0xFF2200);
           this.tweens.add({ targets: flame, alpha: 0, y: engineY + 40, scale: 0.5, duration: 300, onComplete: () => flame.destroy() });
       }
       
       if (Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y) < 1500) {
          b.timer += dt;
          
          if (b.state === 'idle') {
             // Movimento pendular suave (Hovercraft)
             b.y = b.startY + Math.sin(b.timer * 3) * 50;
             const speed = 250;
             if (b.x > this.player.x + 100) b.setVelocityX(-speed);
             else if (b.x < this.player.x - 100) b.setVelocityX(speed);
             else b.setVelocityX(0);
             
             if (b.timer > 3) {
                 if (Math.random() > 0.5) {
                     b.state = 'shoot_homing';
                     b.shotFired = false;
                 } else {
                     b.state = 'swoop_prep';
                 }
                 b.timer = 0;
                 b.setVelocityX(0);
                 b.setVelocityY(0);
             }
          } else if (b.state === 'shoot_homing') {
             // Dispara um míssil teleguiado (agora maior e vermelho)
             if (!b.shotFired) {
                 const proj = this.enemyProjectiles.create(b.x, b.y + 30, 'projectile_ph');
                 proj.setScale(0.08); // Tamanho aumentado
                 proj.setTint(0xFF3333); // Fica ameaçador
                 proj.body.allowGravity = false; // Míssil não sofre gravidade
                 proj.isHoming = true;
                 b.shotFired = true;
             }
             if (b.timer > 0.5) {
                 b.state = 'idle';
                 b.timer = 0;
             }
          } else if (b.state === 'swoop_prep') {
             // Para e mira no jogador
             if (b.timer > 0.5) {
                b.state = 'swoop';
                b.timer = 0;
                this.physics.moveTo(b, this.player.x, this.player.y + 50, 800);
             }
          } else if (b.state === 'swoop') {
             // Mergulha em direção ao chão
             if (b.y >= this.player.y || b.body.blocked.down || b.body.touching.down) {
                 b.state = 'recover';
                 b.setVelocityX(b.body.velocity.x * 0.5); // Desacelera no X
                 b.setVelocityY(-400); // Sobe rápido
                 b.timer = 0;
             }
          } else if (b.state === 'recover') {
             // Retorna ao hover
             if (b.y <= b.startY) {
                 b.state = 'idle';
                 b.timer = 0;
                 b.setVelocityY(0);
             }
          }
       }
    } else if (this.bossGif) {
       this.bossGif.destroy();
       this.bossGif = undefined;
    }
  }

  private spawnDust`;

    c = c.substring(0, index) + bossLogic + c.substring(index + anchor.length);
    fs.writeFileSync('src/game/PhaserGame.ts', c);
    console.log("Successfully appended Boss logic and fixed brace!");
} else {
    console.log("Could not find anchor: " + anchor);
}
