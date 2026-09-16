const fs = require('fs');
let c = fs.readFileSync('src/game/SonicGame.tsx', 'utf8');

c = c.replace(/import \{ MainScene, UIScene \} from '\.\/PhaserGame';/, `import { MainScene, UIScene } from './PhaserGame';\nimport ThreeBackground from '../components/ThreeBackground';`);
c = c.replace(/backgroundColor: '#1E90FF',/, `transparent: true,`);
c = c.replace(/<div id="game-container" ref=\{gameRef\} style=\{\{ width: '100%', height: '100%' \}\}\ \/>/, `<ThreeBackground level={level} />\n      <div id="game-container" ref={gameRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 10 }} />`);

fs.writeFileSync('src/game/SonicGame.tsx', c);
console.log('SonicGame.tsx updated');
