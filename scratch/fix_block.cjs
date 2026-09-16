const fs = require('fs');
let c = fs.readFileSync('src/game/PhaserGame.ts', 'utf8');

const anchor1 = "if (this.playerGif) {";
const anchor2 = "// Zoom out in High Speed";

const index1 = c.indexOf(anchor1);
const index2 = c.indexOf(anchor2, index1);

if (index1 !== -1 && index2 !== -1) {
    const fixedContent = `if (this.playerGif) {
      this.playerGif.setPosition(this.player.x, this.player.y);
      if (this.player.flipX !== this.currentFlipX) {
        this.currentFlipX = this.player.flipX;
        this.playerGif.setScale(this.currentFlipX ? -1 : 1, 1);
      }
    }

    // --- Dynamic Camera (Lookahead) & Boost FX ---
    const cameraVelX = this.player.body.velocity.x;
    const absVelX = Math.abs(cameraVelX);

    // Look ahead
    let targetOffsetX = 0;
    if (absVelX > 400) {
       targetOffsetX = (cameraVelX > 0) ? 150 : -150;
    }
    this.cameras.main.setFollowOffset(
       Phaser.Math.Linear(this.cameras.main.followOffset.x, targetOffsetX, 0.05),
       Phaser.Math.Linear(this.cameras.main.followOffset.y, 0, 0.05)
    );
    
    `;

    c = c.substring(0, index1) + fixedContent + c.substring(index2);
    fs.writeFileSync('src/game/PhaserGame.ts', c);
    console.log("Successfully rebuilt the block!");
} else {
    console.log("Could not find anchors");
}
