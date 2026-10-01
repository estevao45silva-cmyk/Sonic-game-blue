import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UISound } from "../../utils/audio";
import { motion } from 'framer-motion';

export default function FlappyTails({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerGifRef = useRef<HTMLImageElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER' | 'PAUSED'>('START');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('flappy_best') || '0'));

  const gameData = useRef({
    birdY: 0, birdVy: 0, birdAngle: 0,
    pipes: [] as { x: number; gapY: number; scored: boolean }[],
    frame: 0, width: 0, height: 0,
    cloudX: [0, 200, 420, 650],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; size: number }[],
    groundScroll: 0, bgScroll: 0,
  });

  const GRAVITY = 0.32;
  const JUMP = -6.5;
  const PIPE_SPEED = 2.8;
  const GAP = 210;
  const PIPE_W = 65;
  const BIRD_R = 18;

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement!;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    gameData.current.width = canvas.width;
    gameData.current.height = canvas.height;
  }, []);

  const resetGame = useCallback(() => {
    const g = gameData.current;
    g.birdY = g.height * 0.4;
    g.birdVy = 0;
    g.pipes = [];
    g.frame = 0;
    g.birdAngle = 0;
    g.particles = [];
  }, []);

  const jump = useCallback(() => { UISound.play('jump');
    if (gameState === 'START') {
      resetGame();
      setScore(0);
      setGameState('PLAYING');
      gameData.current.birdVy = JUMP;
    } else if (gameState === 'PLAYING') {
      gameData.current.birdVy = JUMP;
      const g = gameData.current;
      for (let i = 0; i < 4; i++) {
        g.particles.push({ x: g.width * 0.15, y: g.birdY, vx: -1 - Math.random() * 2, vy: Math.random() * 2 + 1, life: 20, size: 2 + Math.random() * 3 });
      }
    } else {
      resetGame();
      setScore(0);
      setGameState('START');
    }
  }, [gameState, resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    resize();
    window.addEventListener('resize', resize);
    let animId: number;

    const drawCloud = (cx: number, cy: number, scale: number) => {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.shadowColor = 'rgba(255,255,255,0.3)';
      ctx.shadowBlur = 15;
      const s = scale;
      ctx.beginPath(); ctx.ellipse(cx, cy, 55 * s, 22 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 28 * s, cy - 12 * s, 38 * s, 18 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx - 22 * s, cy + 5 * s, 30 * s, 15 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 10 * s, cy - 18 * s, 25 * s, 14 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawPipe = (x: number, topH: number, bottomY: number, H: number, groundH: number) => {
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 15;
      
      const pGrad = ctx.createLinearGradient(x, 0, x + PIPE_W, 0);
      pGrad.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
      pGrad.addColorStop(0.5, 'rgba(0, 229, 255, 0.8)');
      pGrad.addColorStop(1, 'rgba(0, 229, 255, 0.4)');
      
      ctx.fillStyle = pGrad;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      
      // Top Pipe
      ctx.beginPath();
      ctx.roundRect(x, 0, PIPE_W, topH, [0, 0, 10, 10]);
      ctx.fill();
      ctx.stroke();
      
      // Bottom Pipe
      ctx.beginPath();
      ctx.roundRect(x, bottomY, PIPE_W, H - bottomY, [10, 10, 0, 0]);
      ctx.fill();
      ctx.stroke();
      
      // Internal Glow / Detail line
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 0;
      ctx.fillRect(x + PIPE_W / 2 - 2, 0, 4, topH - 10);
      ctx.fillRect(x + PIPE_W / 2 - 2, bottomY + 10, 4, H - bottomY);
    };

    const draw = () => {
      const g = gameData.current;
      const W = g.width, H = g.height;
      if (W === 0) { animId = requestAnimationFrame(draw); return; }
      const groundH = 65;

      // Gorgeous Vibrant Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, '#FF512F');   // Deep sunset orange/red
      skyGrad.addColorStop(0.3, '#F09819'); // Vibrant orange
      skyGrad.addColorStop(0.7, '#FFDCA8'); // Warm peach
      skyGrad.addColorStop(1, '#A0E0FF');   // Soft blue horizon
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Glowing Sun
      const sunX = W * 0.5;
      const sunY = H * 0.45;
      const pulse = Math.sin(g.frame * 0.05) * 10;
      
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 20, sunX, sunY, 150 + pulse);
      sunGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
      sunGlow.addColorStop(0.2, 'rgba(255, 235, 59, 0.8)');
      sunGlow.addColorStop(0.5, 'rgba(255, 152, 0, 0.4)');
      sunGlow.addColorStop(1, 'rgba(255, 87, 34, 0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(0, 0, W, H);

      // Rotating God Rays
      ctx.save();
      ctx.translate(sunX, sunY);
      ctx.rotate(g.frame * 0.002);
      for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        const rayGrad = ctx.createLinearGradient(0, 0, 0, H);
        rayGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
        rayGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.lineTo(W, H);
        ctx.lineTo(-W, H);
        ctx.fill();
      }
      ctx.restore();

      // Distant Parallax Mountains
      if (gameState === 'PLAYING') g.bgScroll = (g.bgScroll + PIPE_SPEED * 0.2) % W;
      ctx.fillStyle = '#C67A7C'; // Distant purple/red tint
      ctx.beginPath(); ctx.moveTo(0, H - groundH);
      for (let x = 0; x <= W + 200; x += 100) {
        ctx.lineTo(x - (g.bgScroll * 0.5 % 100), H - groundH - 80 - Math.sin(x * 0.02) * 50);
      }
      ctx.lineTo(W, H - groundH); ctx.fill();

      // Closer Mountains
      ctx.fillStyle = '#8B5A65';
      ctx.beginPath(); ctx.moveTo(0, H - groundH);
      for (let x = 0; x <= W + 200; x += 80) {
        ctx.lineTo(x - (g.bgScroll % 80), H - groundH - 40 - Math.sin(x * 0.03 + 2) * 40);
      }
      ctx.lineTo(W, H - groundH); ctx.fill();

      // Ground Base
      const gGrad = ctx.createLinearGradient(0, H - groundH, 0, H);
      gGrad.addColorStop(0, '#4CAF50'); // Vibrant Green
      gGrad.addColorStop(0.3, '#388E3C');
      gGrad.addColorStop(1, '#1B5E20');
      ctx.fillStyle = gGrad;
      ctx.fillRect(0, H - groundH, W, groundH);
      
      // Detailed Grass Tufts
      ctx.fillStyle = '#81C784';
      if (gameState === 'PLAYING') g.groundScroll = (g.groundScroll + PIPE_SPEED) % 20;
      for (let i = -20; i < W + 20; i += 20) {
        const gx = i - (g.groundScroll || 0);
        ctx.beginPath();
        ctx.moveTo(gx - 8, H - groundH + 2);
        ctx.quadraticCurveTo(gx - 4, H - groundH - 12, gx, H - groundH + 2);
        ctx.quadraticCurveTo(gx + 4, H - groundH - 16, gx + 8, H - groundH + 2);
        ctx.fill();
      }
      // Top Ground Border
      ctx.strokeStyle = '#A5D6A7'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, H - groundH); ctx.lineTo(W, H - groundH); ctx.stroke();

      // Clouds Overlay
      g.cloudX.forEach((cx, i) => {
        drawCloud(cx, H * 0.08 + i * 55, 0.8 + i * 0.15);
        if (gameState === 'PLAYING') g.cloudX[i] -= 0.6 + i * 0.2;
        if (g.cloudX[i] < -120) g.cloudX[i] = W + 120;
      });

      // Game logic
      if (gameState === 'PLAYING') {
        g.frame++;
        g.birdVy += GRAVITY;
        g.birdY += g.birdVy;
        g.birdAngle = Math.min(Math.max(g.birdVy * 4, -35), 80);

        if (g.frame % 110 === 0 || g.pipes.length === 0) {
          const gapY = 100 + Math.random() * (H - groundH - GAP - 100);
          g.pipes.push({ x: W + 20, gapY, scored: false });
        }
        for (let p of g.pipes) {
          p.x -= PIPE_SPEED;
          if (!p.scored && p.x + PIPE_W < W * 0.15) { p.scored = true; setScore(s => s + 1); }
        }
        g.pipes = g.pipes.filter(p => p.x > -PIPE_W - 10);

        const birdX = W * 0.15;
        let died = g.birdY < 0 || g.birdY + BIRD_R > H - groundH;
        if (!died) {
          for (let p of g.pipes) {
            const inX = birdX + BIRD_R > p.x && birdX - BIRD_R < p.x + PIPE_W;
            if (inX && (g.birdY - BIRD_R < p.gapY || g.birdY + BIRD_R > p.gapY + GAP)) died = true;
          }
        }
        if (died) {
          UISound.play('lose'); setGameState('GAMEOVER');
          setScore(s => { const best = Math.max(s, bestScore); setBestScore(best); localStorage.setItem('flappy_best', best.toString()); return s; });
        }

        // Particles
        g.particles = g.particles.filter(p => { p.x += p.vx; p.y += p.vy; p.life--; return p.life > 0; });
      }

      // Draw pipes
      for (let p of g.pipes) {
        drawPipe(p.x, p.gapY, p.gapY + GAP, H, groundH);
      }

      // Draw particles
      for (let p of g.particles) {
        ctx.fillStyle = `rgba(255,165,0,${p.life / 20})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      }

      // Draw Tails (GIF)
      const birdX = W * 0.15;
      const by = g.birdY || H * 0.4;
      if (playerGifRef.current) {
        playerGifRef.current.style.transform = `translate(${birdX - 25}px, ${by - 25}px) rotate(${g.birdAngle || 0}deg)`;
      }

      // Score
      ctx.fillStyle = '#FFF'; ctx.font = 'bold 48px Arial'; ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 5;
      ctx.strokeText(score.toString(), W / 2, 60);
      ctx.fillText(score.toString(), W / 2, 60);

      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [gameState, score, bestScore, resize]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { 
      if (e.code === 'Space') { 
        e.preventDefault(); 
        jump(); 
      }
      if (e.code === 'Escape') {
        e.preventDefault();
        setGameState(prev => {
          if (prev === 'PLAYING') return 'PAUSED';
          if (prev === 'PAUSED') return 'PLAYING';
          return prev;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', maxWidth: '500px' }}>
        <canvas ref={canvasRef} onClick={(e) => { UISound.play("click"); jump(e); }} onTouchStart={(e) => { e.preventDefault(); jump(); }}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }} />
        
        <img
          ref={playerGifRef}
          src="/imagens/dg96skq-28d97178-f8c8-455d-aa3f-ff258fb295da.gif"
          style={{ position: 'absolute', top: 0, left: 0, width: '50px', height: '50px', objectFit: 'contain', pointerEvents: 'none' }}
          alt="Tails"
        />

        {gameState === 'START' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(5px)' }}>
            <motion.div animate={{ y: [0, -18, 0] }} transition={{ repeat: Infinity, duration: 1.3 }}>
              <img src="/imagens/dg96skq-28d97178-f8c8-455d-aa3f-ff258fb295da.gif" alt="Tails" style={{ width: '100px', height: '100px', filter: 'drop-shadow(0 0 20px rgba(0, 229, 255, 0.8))' }} />
            </motion.div>
            <h2 style={{ color: '#00E5FF', fontFamily: '"Press Start 2P", monospace', fontSize: '24px', textShadow: '0 0 15px #00E5FF', margin: '20px 0 10px 0', textAlign: 'center' }}>FLAPPY TAILS</h2>
            <p style={{ color: '#FFF', fontSize: '14px', textShadow: '1px 1px 4px rgba(0,0,0,0.8)', letterSpacing: '1px' }}>Toque ou Espaço para voar!</p>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 20px', borderRadius: '30px', marginTop: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <p style={{ color: '#FFD700', fontSize: '14px', textShadow: '0 0 10px rgba(255,215,0,0.8)', margin: 0, fontWeight: 'bold' }}>🏆 Recorde: {bestScore}</p>
            </div>
          </div>
        )}
        {gameState === 'GAMEOVER' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', pointerEvents: 'none' }}>
            <motion.h2 initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={{ color: '#FF1744', fontFamily: '"Press Start 2P", monospace', fontSize: '28px', textShadow: '0 0 20px #FF1744', textAlign: 'center' }}>GAME OVER</motion.h2>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))', borderRadius: '20px', padding: '30px 50px', margin: '25px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <p style={{ color: '#FFF', fontSize: '18px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>Score</p>
              <p style={{ color: '#00E5FF', fontSize: '48px', fontWeight: '900', margin: '0 0 20px 0', textShadow: '0 0 15px #00E5FF' }}>{score}</p>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', width: '100%', marginBottom: '15px' }} />
              <p style={{ color: '#FFD700', fontSize: '14px', margin: 0, fontWeight: 'bold' }}>Melhor: {bestScore}</p>
            </motion.div>
            <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ color: '#FFF', fontSize: '14px', letterSpacing: '1px' }}>Toque para recomeçar</motion.p>
          </div>
        )}
        
        {gameState === 'PAUSED' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 50 }}>
            <h2 style={{ color: '#FFF', fontFamily: '"Press Start 2P", monospace', fontSize: '30px', marginBottom: '40px' }}>PAUSADO</h2>
            <button onClick={() => { UISound.play("click"); setGameState('PLAYING')}} style={{ padding: '15px 30px', fontSize: '20px', backgroundColor: '#FFD700', color: '#000', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: '"Press Start 2P", monospace', marginBottom: '20px' }}>
              Voltar a jogar
            </button>
            <button onClick={(e) => { UISound.play("click"); onClose(e); }} style={{ padding: '15px 30px', fontSize: '20px', backgroundColor: '#FF0000', color: '#FFF', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: '"Press Start 2P", monospace' }}>
              Sair
            </button>
          </div>
        )}
      </div>
      <button onClick={(e) => { UISound.play("click"); onClose(e); }} style={{ position: 'absolute', top: 15, left: 15, padding: '8px 18px', background: 'rgba(0,0,0,0.6)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', backdropFilter: 'blur(5px)', zIndex: 10 }}>Voltar</button>
    </motion.div>
  );
}
