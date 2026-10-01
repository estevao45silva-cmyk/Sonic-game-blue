import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Pinball: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [uiScore, setUiScore] = useState(0);
  const [uiLevel, setUiLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  
  const gameState = useRef({
     level: 1,
     score: 0,
     ball: { x: 380, y: 550, vx: 0, vy: -15, radius: 15 }, // Bola maior e mais lenta
     leftFlipperUp: false,
     rightFlipperUp: false,
     bumpers: [] as any[],
     targets: [] as any[]
  });

  const generateLevelData = (lvl: number) => {
     let data = { bumpers: [] as any[], targets: [] as any[] };
     // Fácil e visualmente bonito
     data.bumpers = [
        { x: 130, y: 150, r: 35, active: 0, pts: 100, color: '#00d2ff' },
        { x: 270, y: 150, r: 35, active: 0, pts: 100, color: '#00d2ff' },
        { x: 200, y: 250, r: 45, active: 0, pts: 200, color: '#ff007f' },
     ];
     // Targets maiores e mais fáceis
     for(let i=0; i < (2 + lvl); i++) {
        data.targets.push({ x: 100 + i*50, y: 80, w: 40, h: 20, active: true, color: '#FFD700' });
     }
     return data;
  };

  useEffect(() => {
    if (!started || gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lvlData = generateLevelData(gameState.current.level);
    gameState.current.bumpers = lvlData.bumpers;
    gameState.current.targets = lvlData.targets;
    
    let animationFrame: number;

    const keyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') gameState.current.leftFlipperUp = true;
      if (e.key === 'ArrowRight') gameState.current.rightFlipperUp = true;
    };
    const keyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') gameState.current.leftFlipperUp = false;
      if (e.key === 'ArrowRight') gameState.current.rightFlipperUp = false;
    };
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    const draw = () => {
      let state = gameState.current;
      ctx.clearRect(0, 0, 400, 600);
      
      // Fundo premium (Glassmorphism Casino style)
      let grad = ctx.createLinearGradient(0, 0, 0, 600);
      grad.addColorStop(0, '#0f0c29');
      grad.addColorStop(0.5, '#302b63');
      grad.addColorStop(1, '#24243e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 600);

      // Grid sutil no fundo
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for(let i=0; i<400; i+=40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 600); ctx.stroke(); }
      for(let i=0; i<600; i+=40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(400, i); ctx.stroke(); }

      // Física MUITO mais lenta e fácil
      state.ball.vy += 0.15; // Gravidade baixissima
      if (state.ball.vy > 8) state.ball.vy = 8;
      state.ball.x += state.ball.vx;
      state.ball.y += state.ball.vy;

      // Paredes
      if (state.ball.x > 390 - state.ball.radius && state.ball.y > 150) { state.ball.vx *= -1; state.ball.x = 390 - state.ball.radius; }
      if (state.ball.x < 10 + state.ball.radius) { state.ball.vx *= -1; state.ball.x = 10 + state.ball.radius; }
      if (state.ball.y < 20 + state.ball.radius) { state.ball.vy *= -1; state.ball.y = 20 + state.ball.radius; }

      // Rampas/Funil inferiores super gentis (empurram a bola de volta pro jogo)
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath(); ctx.moveTo(0, 400); ctx.lineTo(130, 480); ctx.lineTo(0, 480); ctx.fill();
      ctx.strokeStyle = '#00d2ff'; ctx.lineWidth = 2; ctx.stroke();
      if (state.ball.x < 130 && state.ball.y > 400) {
         let lineY = 400 + (state.ball.x / 130) * 80;
         if (state.ball.y + state.ball.radius > lineY) {
            state.ball.y = lineY - state.ball.radius;
            state.ball.vy = -3;
            state.ball.vx = 4; // Impulso pra direita
         }
      }
      
      ctx.beginPath(); ctx.moveTo(400, 400); ctx.lineTo(270, 480); ctx.lineTo(400, 480); ctx.fill();
      ctx.stroke();
      if (state.ball.x > 270 && state.ball.y > 400) {
         let lineY = 400 + ((400 - state.ball.x) / 130) * 80;
         if (state.ball.y + state.ball.radius > lineY) {
            state.ball.y = lineY - state.ball.radius;
            state.ball.vy = -3;
            state.ball.vx = -4;
         }
      }

      // Game Over
      if (state.ball.y > 630) setGameOver(true);

      // Bumpers com Glow
      state.bumpers.forEach(b => {
        const dx = state.ball.x - b.x;
        const dy = state.ball.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < state.ball.radius + b.r) {
          state.ball.vx = (dx / dist) * 8; // Rebate leve
          state.ball.vy = (dy / dist) * 8;
          state.score += b.pts;
          b.active = 10;
        }
        
        ctx.save();
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r + (b.active > 0 ? 5 : 0), 0, Math.PI * 2);
        ctx.fillStyle = b.active > 0 ? '#FFF' : 'rgba(255,255,255,0.1)';
        ctx.fill();
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 4;
        ctx.shadowColor = b.color; ctx.shadowBlur = b.active > 0 ? 30 : 10;
        ctx.stroke();
        ctx.restore();
        if (b.active > 0) b.active--;
      });

      // Targets (Vidro)
      let activeTargets = 0;
      state.targets.forEach(t => {
         if (!t.active) return;
         activeTargets++;
         ctx.save();
         ctx.fillStyle = 'rgba(255,215,0,0.3)';
         ctx.fillRect(t.x, t.y, t.w, t.h);
         ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2;
         ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 15;
         ctx.strokeRect(t.x, t.y, t.w, t.h);
         ctx.restore();
         
         if (state.ball.x + state.ball.radius > t.x && state.ball.x - state.ball.radius < t.x + t.w &&
             state.ball.y + state.ball.radius > t.y && state.ball.y - state.ball.radius < t.y + t.h) {
             t.active = false;
             state.score += 500;
             state.ball.vy *= -1;
         }
      });

      if (activeTargets === 0 && state.targets.length > 0) {
         state.level++;
         setUiLevel(state.level);
         let newData = generateLevelData(state.level);
         state.bumpers = newData.bumpers;
         state.targets = newData.targets;
         state.ball = { x: 380, y: 550, vx: 0, vy: -15, radius: 15 };
      }

      // Flippers Mágicos Gigantes (Cobrem quase o meio todo)
      const drawFlipper = (pivotX: number, pivotY: number, length: number, isLeft: boolean) => {
        let angle = (isLeft ? state.leftFlipperUp : state.rightFlipperUp) ? (isLeft ? -30 : 30) : (isLeft ? 15 : -15);
        let rad = angle * Math.PI / 180;
        let endX = pivotX + Math.cos(rad) * length * (isLeft ? 1 : -1);
        let endY = pivotY + Math.sin(rad) * length;

        ctx.save();
        ctx.translate(pivotX, pivotY);
        ctx.rotate(rad);
        ctx.beginPath();
        if (isLeft) ctx.roundRect(0, -10, length, 20, 10);
        else ctx.roundRect(-length, -10, length, 20, 10);
        ctx.fillStyle = '#ff007f'; ctx.fill();
        ctx.shadowColor = '#ff007f'; ctx.shadowBlur = 20;
        ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();
        
        // Colisão simplificada ultra-generosa
        if (state.ball.y > 450 && state.ball.y < 520) {
           let inRange = isLeft ? state.ball.x < 210 : state.ball.x > 190;
           if (inRange && ((isLeft && state.leftFlipperUp) || (!isLeft && state.rightFlipperUp))) {
               state.ball.vy = -14; 
               state.ball.vx = isLeft ? 5 : -5;
               state.ball.y = 440;
           }
        }
      };

      drawFlipper(120, 480, 85, true);
      drawFlipper(280, 480, 85, false);

      // Desenhar Bola com Reflexo
      ctx.beginPath(); ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; ctx.fill();
      ctx.shadowColor = '#FFF'; ctx.shadowBlur = 15;
      ctx.fillStyle = '#00d2ff'; ctx.beginPath(); ctx.arc(state.ball.x - 3, state.ball.y - 3, state.ball.radius/2, 0, Math.PI*2); ctx.fill();

      setUiScore(state.score);
      animationFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      cancelAnimationFrame(animationFrame);
    };
  }, [started, gameOver]);

  if (!started) {
     return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: 'Inter, sans-serif' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', padding: '50px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', maxWidth: '500px' }}>
             <h1 style={{ color: '#00d2ff', fontSize: '40px', fontWeight: '900', margin: '0 0 10px 0', textShadow: '0 0 20px rgba(0, 210, 255, 0.5)' }}>Neon Pinball</h1>
             <p style={{ color: '#AAA', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
                Relaxe e divirta-se. Use as setas <b>Esquerda</b> e <b>Direita</b>. A bola agora cai devagar, os flippers são gigantes e a diversão é garantida.
             </p>
             <motion.button 
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px #ff007f' }} whileTap={{ scale: 0.95 }}
                onClick={() => { gameState.current.score=0; gameState.current.level=1; setGameOver(false); setStarted(true); }} 
                style={{ padding: '15px 40px', background: 'linear-gradient(90deg, #ff007f, #ff00cc)', color: '#FFF', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>
                Jogar Agora
             </motion.button>
          </div>
        </motion.div>
     );
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0f0c29', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'space-between', padding: '15px 20px', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', borderRadius: '20px 20px 0 0', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }}>
         <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00d2ff' }}>LVL {uiLevel}</div>
         <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{uiScore} PTS</div>
      </div>

      <div style={{ width: '100%', maxWidth: '400px', aspectRatio: '4/6', position: 'relative', overflow: 'hidden' }}>
         <canvas ref={canvasRef} width={400} height={600} style={{ width: '100%', height: '100%', display: 'block' }} />
         
         {gameOver && (
             <motion.div initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(15, 12, 41, 0.9)', backdropFilter: 'blur(5px)' }}>
                <h2 style={{ color: '#ff007f', fontSize: '30px', fontWeight: '900', marginBottom: '20px', textShadow: '0 0 20px #ff007f' }}>Game Over</h2>
                <button onClick={() => { gameState.current.score=0; gameState.current.level=1; gameState.current.ball={x:380,y:550,vx:0,vy:-15,radius:15}; setGameOver(false); }} style={{ padding: '15px 30px', background: '#00d2ff', border: 'none', borderRadius: '30px', color: '#000', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>Tentar Novamente</button>
             </motion.div>
         )}
      </div>

      <button onClick={onClose} style={{ marginTop: '30px', padding: '12px 30px', background: 'transparent', color: '#AAA', border: '1px solid #555', borderRadius: '30px', cursor: 'pointer' }}>
         Voltar ao Menu
      </button>
    </div>
  );
};
export default Pinball;
