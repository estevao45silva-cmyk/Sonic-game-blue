const fs = require('fs');
const targetFile = 'src/game/PhaserGame.ts';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Remove the old Game Over UI block
// It starts with `mainScene.events.on("gameOver", () => {`
// and ends right before `// Victory Screen`
const gameOverRegex = /mainScene\.events\.on\("gameOver", \(\) => \{[\s\S]*?\/\/ Victory Screen/g;
if (gameOverRegex.test(content)) {
  content = content.replace(gameOverRegex, '// Victory Screen');
}

// 2. Call the new onGameOver callback
content = content.replace(/this\.events\.emit\("gameOver"\);/g, `this.events.emit("gameOver");\n        if (this.sys.settings.data.onGameOver) this.sys.settings.data.onGameOver();\n        this.scene.pause();`);

fs.writeFileSync(targetFile, content);
console.log('Game Over logic updated in PhaserGame.ts');
