import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UISound } from "../../utils/audio";
import { motion } from 'framer-motion';

interface SliceTarget {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'badnik' | 'ring' | 'bomb';
  sliced: boolean;
  radius: number;
  rotation: number;
  sliceAngle: number;
}

export default function BladeRush({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('blade_best') || '0'));
  const [lives, setLives] = useState(3);

  const gameData = useRef({
    targets: [] as SliceTarget[],
    trail: [] as { x: number; y: number; age: number }[],
    width: 0,
    height: 0,
    frame: 0,
    nextSpawn: 60,
    sliceSparks: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    missedBadniks: 0,
    isMouseDown: false,
    lastMouse: { x: 0, y: 0 },
  });

  const GRAVITY = 0.15;

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement!;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    gameData.current.width = canvas.width;
    gameData.current.height = canvas.height;
  }, []);

  const startGame = useCallback(() => {
    const g = gameData.current;
    g.targets = [];
    g.trail = [];
    g.frame = 0;
    g.nextSpawn = 40;
    g.sliceSparks = [];
    g.missedBadniks = 0;
    setScore(0);
    setLives(3);
    setGameState('PLAYING');
  }, []);

  const spawnTargets = useCallback(() => {
    const g = gameData.current;
    const W = g.width, H = g.height;
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const x = 80 + Math.random() * (W - 160);
      const rand = Math.random();
      const type: 'badnik' | 'ring' | 'bomb' = rand > 0.85 ? 'bomb' : (rand > 0.5 ? 'ring' : 'badnik');
      const radius = type === 'bomb' ? 28 : (type === 'ring' ? 22 : 30);

      g.targets.push({
        id: Math.random(),
        x,
        y: H + 50,
        vx: (Math.random() - 0.5) * 4,
        vy: -(8 + Math.random() * 4),
        type,
        sliced: false,
        radius,
        rotation: 0,
        sliceAngle: 0,
      });
    }
  }, []);

  const checkSlice = useCallback((mx: number, my: number) => {
    const g = gameData.current;
    for (let t of g.targets) {
      if (t.sliced) continue;
      const dist = Math.hypot(t.x - mx, t.y - my);
      if (dist < t.radius + 15) {
        t.sliced = true;
        t.sliceAngle = Math.atan2(my - t.y, mx - t.x);

        // Sparks
        const color = t.type === 'bomb' ? '#FF5252' : (t.type === 'ring' ? '#FFD700' : '#00BCD4');
        for (let i = 0; i < 8; i++) {
          const angle = Math.random() * Math.PI * 2;
          g.sliceSparks.push({
            x: t.x, y: t.y,
            vx: Math.cos(angle) * (3 + Math.random() * 5),
            vy: Math.sin(angle) * (3 + Math.random() * 5),
            life: 30,
            color,
          });
        }

        if (t.type === 'bomb') {
          setLives(l => {
            if (l <= 1) {
              UISound.play('lose'); setGameState('GAMEOVER');
              setScore(s => {
                const best = Math.max(s, bestScore);
                setBestScore(best);
                localStorage.setItem('blade_best', best.toString());
                return s;
              });
            }
            return l - 1;
          });
        } else if (t.type === 'ring') {
          setScore(s => s + 5);
        } else {
          setScore(s => s + 10);
        }
      }
    }
  }, [bestScore]);

  const handlePointerDown = useCallback((clientX: number, clientY: number) => {
    if (gameState === 'START' || gameState === 'GAMEOVER') {
      startGame();
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (clientX - rect.left) / rect.width * gameData.current.width;
    const my = (clientY - rect.top) / rect.height * gameData.current.height;
    gameData.current.isMouseDown = true;
    gameData.current.lastMouse = { x: mx, y: my };
    gameData.current.trail.push({ x: mx, y: my, age: 0 });
    checkSlice(mx, my);
  }, [gameState, startGame, checkSlice]);

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!gameData.current.isMouseDown || gameState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (clientX - rect.left) / rect.width * gameData.current.width;
    const my = (clientY - rect.top) / rect.height * gameData.current.height;
    gameData.current.trail.push({ x: mx, y: my, age: 0 });
    gameData.current.lastMouse = { x: mx, y: my };
    checkSlice(mx, my);
  }, [gameState, checkSlice]);

  const handlePointerUp = useCallback(() => {
    gameData.current.isMouseDown = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    resize();
    window.addEventListener('resize', resize);

    let animId: number;
    const draw = () => {
      const g = gameData.current;
      const W = g.width, H = g.height;
      if (W === 0) { animId = requestAnimationFrame(draw); return; }

      // Background - deep cyberpunk
      const bgGrad = ctx.createLinearGradient(0, 0, W * 0.3, H);
      bgGrad.addColorStop(0, '#0a0a1a');
      bgGrad.addColorStop(0.3, '#0d1025');
      bgGrad.addColorStop(0.6, '#101535');
      bgGrad.addColorStop(1, '#0a1030');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Aurora shimmer at top
      const auroraGrad = ctx.createLinearGradient(0, 0, W, H * 0.3);
      auroraGrad.addColorStop(0, `hsla(${(g.frame * 0.5) % 360}, 70%, 40%, 0.06)`);
      auroraGrad.addColorStop(0.5, `hsla(${(g.frame * 0.5 + 120) % 360}, 60%, 50%, 0.04)`);
      auroraGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = auroraGrad;
      ctx.fillRect(0, 0, W, H * 0.4);

      // Animated hex grid
      ctx.strokeStyle = 'rgba(0,255,255,0.04)';
      ctx.lineWidth = 1;
      const hexSize = 35;
      const hexH = hexSize * Math.sqrt(3);
      for (let row = -1; row < H / hexH + 1; row++) {
        for (let col = -1; col < W / (hexSize * 1.5) + 1; col++) {
          const cx = col * hexSize * 1.5 + ((g.frame * 0.2) % (hexSize * 3));
          const cy = row * hexH + (col % 2 ? hexH / 2 : 0);
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 3 * i;
            const px = cx + hexSize * 0.4 * Math.cos(angle);
            const py = cy + hexSize * 0.4 * Math.sin(angle);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Floating energy particles
      for (let i = 0; i < 15; i++) {
        const px = ((i * 73 + g.frame * 0.3) % W);
        const py = ((i * 97 + g.frame * 0.5) % H);
        const alpha = 0.15 + 0.15 * Math.sin(g.frame * 0.03 + i);
        ctx.fillStyle = `rgba(0,255,255,${alpha})`;
        ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
      }

      if (gameState === 'PLAYING') {
        g.frame++;

        // Spawn
        g.nextSpawn--;
        if (g.nextSpawn <= 0) {
          spawnTargets();
          g.nextSpawn = 50 + Math.floor(Math.random() * 40);
        }

        // Move targets
        for (let t of g.targets) {
          t.x += t.vx;
          t.y += t.vy;
          t.vy += GRAVITY;
          t.rotation += 0.05;
        }

        // Remove fallen targets
        g.targets = g.targets.filter(t => {
          if (t.y > H + 80 && !t.sliced && (t.type === 'badnik' || t.type === 'ring')) {
            // Missed a target
            g.missedBadniks++;
            if (g.missedBadniks >= 5) {
              setLives(l => {
                if (l <= 1) {
                  UISound.play('lose'); setGameState('GAMEOVER');
                  setScore(s => {
                    const best = Math.max(s, bestScore);
                    setBestScore(best);
                    localStorage.setItem('blade_best', best.toString());
                    return s;
                  });
                }
                return l - 1;
              });
              g.missedBadniks = 0;
            }
            return false;
          }
          return t.y < H + 100;
        });

        // Sparks
        g.sliceSparks = g.sliceSparks.filter(s => {
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.1;
          s.life--;
          return s.life > 0;
        });

        // Trail aging
        g.trail = g.trail.map(t => ({ ...t, age: t.age + 1 })).filter(t => t.age < 15);
      }

      // Draw targets
      for (let t of g.targets) {
        if (t.sliced) {
          // Sliced halves
          ctx.save();
          ctx.translate(t.x, t.y);
          ctx.globalAlpha = Math.max(0, 1 - (g.frame % 100) * 0.05);

          // Half 1
          ctx.save();
          ctx.translate(-8, -5);
          ctx.rotate(t.sliceAngle + 0.3);
          ctx.beginPath();
          ctx.arc(0, 0, t.radius * 0.7, 0, Math.PI);
          ctx.fillStyle = t.type === 'bomb' ? '#333' : (t.type === 'ring' ? '#FFD700' : '#78909C');
          ctx.fill();
          ctx.restore();

          // Half 2
          ctx.save();
          ctx.translate(8, 5);
          ctx.rotate(t.sliceAngle - 0.3);
          ctx.beginPath();
          ctx.arc(0, 0, t.radius * 0.7, Math.PI, Math.PI * 2);
          ctx.fillStyle = t.type === 'bomb' ? '#222' : (t.type === 'ring' ? '#FFC107' : '#546E7A');
          ctx.fill();
          ctx.restore();

          ctx.globalAlpha = 1;
          ctx.restore();
          continue;
        }

        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.rotation);

        if (t.type === 'badnik') {
          // Robot body
          const rGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, t.radius);
          rGrad.addColorStop(0, '#B0BEC5');
          rGrad.addColorStop(1, '#546E7A');
          ctx.fillStyle = rGrad;
          ctx.beginPath();
          ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#37474F';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Eyes
          ctx.fillStyle = '#F44336';
          ctx.beginPath();
          ctx.arc(-8, -5, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(8, -5, 5, 0, Math.PI * 2);
          ctx.fill();

          // Mouth
          ctx.fillStyle = '#263238';
          ctx.fillRect(-10, 5, 20, 6);
          ctx.fillStyle = '#F44336';
          for (let i = 0; i < 4; i++) ctx.fillRect(-8 + i * 5, 5, 3, 6);
        } else if (t.type === 'ring') {
          // Golden ring
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 15;
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(0, 0, t.radius - 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Inner shine
          ctx.strokeStyle = '#FFF8E1';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, t.radius - 8, -0.5, 0.8);
          ctx.stroke();
        } else {
          // Bomb
          ctx.fillStyle = '#263238';
          ctx.shadowColor = '#F44336';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Skull / X
          ctx.strokeStyle = '#F44336';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-8, -8); ctx.lineTo(8, 8);
          ctx.moveTo(8, -8); ctx.lineTo(-8, 8);
          ctx.stroke();

          // Fuse
          ctx.strokeStyle = '#795548';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, -t.radius);
          ctx.lineTo(5, -t.radius - 10);
          ctx.stroke();

          // Spark
          ctx.fillStyle = '#FF9800';
          ctx.beginPath();
          ctx.arc(5, -t.radius - 12, 4 + Math.sin(g.frame * 0.3) * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Draw sparks
      for (let s of g.sliceSparks) {
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.life / 30;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw trail (blade)
      if (g.trail.length > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 1; i < g.trail.length; i++) {
          const prev = g.trail[i - 1];
          const cur = g.trail[i];
          const alpha = 1 - cur.age / 15;
          const width = (1 - cur.age / 15) * 6;
          
          ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(cur.x, cur.y);
          ctx.stroke();

          // Glow
          ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.3})`;
          ctx.lineWidth = width * 3;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(cur.x, cur.y);
          ctx.stroke();
        }
      }

      // UI - Score and Lives
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${score}`, 20, 45);

      // Lives as hearts
      ctx.font = '24px Arial';
      ctx.textAlign = 'right';
      let heartsStr = '';
      for (let i = 0; i < lives; i++) heartsStr += '❤️ ';
      ctx.fillText(heartsStr, W - 15, 40);

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [gameState, score, lives, bestScore, resize, spawnTargets]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%', maxWidth: '700px' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
          onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={(e) => { e.preventDefault(); handlePointerDown(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchMove={(e) => { e.preventDefault(); handlePointerMove(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchEnd={handlePointerUp}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
        />

        {gameState === 'START' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', pointerEvents: 'none' }}>
            <h2 style={{ color: '#00BCD4', fontFamily: 'Arial Black', fontSize: '32px', textShadow: '0 0 20px #00BCD4', margin: '10px 0' }}>CORTA-ROBOS</h2>
            <p style={{ color: '#FFF', fontSize: '15px', margin: '5px' }}>Arraste para cortar os robos!</p>
            <p style={{ color: '#FFD700', fontSize: '14px' }}>Aneis = 5 pts  |  Robos = 10 pts</p>
            <p style={{ color: '#FF5252', fontSize: '14px' }}>Cuidado com as bombas!</p>
            <p style={{ color: '#FFD700', fontSize: '14px', marginTop: '10px' }}>Recorde: {bestScore}</p>
            <p style={{ color: '#FFF', fontSize: '16px', marginTop: '15px' }}>Toque para começar!</p>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }}>
            <h2 style={{ color: '#FF5252', fontFamily: 'Arial Black', fontSize: '36px' }}>GAME OVER</h2>
            <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '15px', padding: '20px 40px', margin: '15px', textAlign: 'center' }}>
              <p style={{ color: '#FFF', fontSize: '22px' }}>Score: <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{score}</span></p>
              <p style={{ color: '#aaa', fontSize: '14px', marginTop: '5px' }}>Melhor: {bestScore}</p>
            </div>
            <p style={{ color: '#FFF', fontSize: '14px' }}>Toque para recomeçar</p>
          </div>
        )}
      </div>

      <button onClick={(e) => { UISound.play("click"); onClose(e); }} style={{
        position: 'absolute', top: 15, left: 15, padding: '8px 18px',
        background: 'rgba(0,0,0,0.6)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '8px', cursor: 'pointer', fontSize: '14px', backdropFilter: 'blur(5px)', zIndex: 10
      }}>Voltar</button>
    </motion.div>
  );
}
