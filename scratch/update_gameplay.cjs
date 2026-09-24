const fs = require('fs');

const targetFile = 'src/game/PhaserGame.ts';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Update collectRing to grant 1 life every 20 rings
const collectRingOriginal = `
  private collectRing(_player: any, ring: any) {
    if (ring.canBeCollected === false) return; // Ignore if it's a recently spilled ring

    ring.disableBody(true, true);

    this.ringCount++;

    this.events.emit("updateRings", this.ringCount);

    RetroAudio.play("ring");

    const flash = this.add.circle(ring.x, ring.y, 25, 0xffffff);

    this.tweens.add({
      targets: flash,
`;
const collectRingNew = `
  private collectRing(_player: any, ring: any) {
    if (ring.canBeCollected === false) return; // Ignore if it's a recently spilled ring

    ring.disableBody(true, true);

    this.ringCount++;
    this.events.emit("updateRings", this.ringCount);

    if (this.ringCount % 20 === 0) {
      this.lives++;
      this.events.emit("updateLives", this.lives);
      // Opcional: tocar um som diferente ou apenas o som de ring duplo
      RetroAudio.play("ring");
      setTimeout(() => RetroAudio.play("ring"), 150);
    } else {
      RetroAudio.play("ring");
    }

    const flash = this.add.circle(ring.x, ring.y, 25, 0xffffff);

    this.tweens.add({
      targets: flash,
`;
content = content.replace(collectRingOriginal, collectRingNew);


// 2. Rewrite takeDamage
const takeDamageOriginalRegex = /private takeDamage\(player: any\) \{[\s\S]*?else \{\s*this\.currentState = PlayerState\.DEAD;[\s\S]*?this\.events\.emit\("gameOver"\);\s*\}\s*\}\s*\}\s*\}/;

const takeDamageNew = `private takeDamage(player: any) {
    if (this.isInvincible || (player as any).isRecovering) return;
    this.cameras.main.shake(300, 0.02);

    if (this.currentShield !== "none") {
      RetroAudio.play("damage");
      this.currentShield = "none";
      this.shieldGraphic.setVisible(false);

      player.setVelocityY(-500);
      player.setVelocityX(player.body.velocity.x > 0 ? -400 : 400);

      (player as any).isRecovering = true;
      if (this.playerGif && this.playerGif.node) (this.playerGif.node as HTMLElement).style.opacity = "0.5";
      
      this.time.delayedCall(2000, () => {
        if (player && player.scene) {
          (player as any).isRecovering = false;
          if (this.playerGif && this.playerGif.node) (this.playerGif.node as HTMLElement).style.opacity = "1";
        }
      });
      return;
    }

    RetroAudio.play("damage");

    // Nova Regra: Perde 1 vida e 10 moedas ao tomar dano!
    this.lives--;
    this.ringCount = Math.max(0, this.ringCount - 10);
    
    this.events.emit("updateLives", this.lives);
    this.events.emit("updateRings", this.ringCount);

    if (this.lives <= 0) {
      // GAME OVER
      this.currentState = PlayerState.DEAD;
      player.body.checkCollision.none = true;

      if (this.playerGif && this.playerGif.node) {
        (this.playerGif.node as HTMLElement).style.filter = "grayscale(100%) brightness(50%)";
      }

      player.setVelocityY(-1000);
      this.time.delayedCall(2000, () => {
         this.events.emit("gameOver");
      });
    } else {
      // Sobreviveu (apenas perdeu 1 vida e 10 moedas). Knockback e pisca.
      this.spillRings(); // Mantemos o efeito de espalhar as argolas
      
      player.setVelocityY(-700);
      player.setVelocityX(player.body.velocity.x > 0 ? -600 : 600);

      (player as any).isRecovering = true;
      if (this.playerGif && this.playerGif.node) (this.playerGif.node as HTMLElement).style.opacity = "0.5";

      this.time.delayedCall(2000, () => {
        if (player && player.scene) {
          (player as any).isRecovering = false;
          if (this.playerGif && this.playerGif.node) (this.playerGif.node as HTMLElement).style.opacity = "1";
        }
      });
    }
  }`;

content = content.replace(takeDamageOriginalRegex, takeDamageNew);


fs.writeFileSync(targetFile, content);
console.log('PhaserGame.ts updated with new lives and coins logic.');
