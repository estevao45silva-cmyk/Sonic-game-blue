const fs = require('fs');
const targetFile = 'src/game/PhaserGame.ts';
let content = fs.readFileSync(targetFile, 'utf8');

// Fix scene restart to preserve onGameOver and onAiTrigger
const replaceSearch = `          onLevelComplete: this.sys.settings.data.onLevelComplete,
          onBackToMenu: this.sys.settings.data.onBackToMenu,`;
          
const replaceWith = `          onLevelComplete: this.sys.settings.data.onLevelComplete,
          onBackToMenu: this.sys.settings.data.onBackToMenu,
          onGameOver: this.sys.settings.data.onGameOver,
          onAiTrigger: this.sys.settings.data.onAiTrigger,`;

if (content.includes(replaceSearch)) {
  content = content.replace(replaceSearch, replaceWith);
  fs.writeFileSync(targetFile, content);
  console.log('Restart data fixed!');
} else {
  console.log('Could not find replace string.');
}
