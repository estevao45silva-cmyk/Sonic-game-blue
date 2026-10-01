import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UISound } from "../../utils/audio";
import { motion } from 'framer-motion';

export default function RingCatcher({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER' | 'PAUSED'>('START');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('catcher_best') || '0'));
  const [timeLeft, setTimeLeft] = useState(30);

  const gameData = useRef({
    playerX: 0,
    width: 0,
    height: 0,
    frame: 0,
    items: [] as { x: number; y: number; vy: number; type: 'ring' | 'redring' | 'shield' | 'bomb'; rotation: number; caught: boolean }[],
    catchEffect: [] as { x: number; y: number; text: string; color: string; life: number }[],
    stars: Array.from({ length: 50 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 2 + 0.5, twinkle: Math.random() * Math.PI * 2 })),
    targetX: 0,
  });

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement!;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    gameData.current.width = canvas.width;
    gameData.current.height = canvas.height;
    if (gameData.current.playerX === 0) {
      gameData.current.playerX = canvas.width / 2;
      gameData.current.targetX = canvas.width / 2;
    }
  }, []);

  const startGame = useCallback(() => {
    const g = gameData.current;
    g.playerX = g.width / 2;
    g.targetX = g.width / 2;
    g.items = [];
    g.catchEffect = [];
    g.frame = 0;
    setScore(0);
    setTimeLeft(30);
    setGameState('PLAYING');
  }, []);

  // Timer
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          UISound.play('lose'); setGameState('GAMEOVER');
          setScore(s => {
            const best = Math.max(s, bestScore);
            setBestScore(best);
            localStorage.setItem('catcher_best', best.toString());
            return s;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, bestScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGameState(prev => {
          if (prev === 'PLAYING') return 'PAUSED';
          if (prev === 'PAUSED') return 'PLAYING';
          return prev;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMove = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    gameData.current.targetX = ((clientX - rect.left) / rect.width) * gameData.current.width;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    resize();
    window.addEventListener('resize', resize);
    
    const playerImg = new Image();
    playerImg.src = "/imagens/Design%20sem%20nome%20(1).png";

    let animId: number;
    const draw = () => {
      const g = gameData.current;
      const W = g.width, H = g.height;
      if (W === 0) { animId = requestAnimationFrame(draw); return; }

      const difficulty = Math.min(1, score / 50 + (30 - timeLeft) / 30);
      const intensity = difficulty * 100;
      
      // Dynamic Background that gets more intense
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, `hsl(${230 - intensity * 0.3}, 60%, 10%)`);
      bg.addColorStop(0.5, `hsl(${220 - intensity * 0.3}, 70%, 15%)`);
      bg.addColorStop(1, `hsl(${210 - intensity * 0.3}, 80%, 25%)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Aurora / Energy waves
      const auroraY = H * 0.2;
      for (let i = 0; i < 4; i++) {
        const aGrad = ctx.createLinearGradient(0, auroraY - 50 + i * 30, 0, auroraY + 70 + i * 30);
        const hue = (g.frame * (0.2 + difficulty * 0.5) + i * 50) % 360;
        aGrad.addColorStop(0, 'transparent');
        aGrad.addColorStop(0.3, `hsla(${hue}, 80%, 60%, ${0.05 + difficulty * 0.1})`);
        aGrad.addColorStop(0.5, `hsla(${hue + 30}, 90%, 70%, ${0.08 + difficulty * 0.15})`);
        aGrad.addColorStop(0.7, `hsla(${hue + 60}, 80%, 60%, ${0.04 + difficulty * 0.08})`);
        aGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = aGrad;
        ctx.fillRect(0, 0, W, H * 0.6);
      }

      // Stars with halos
      g.stars.forEach(s => {
        const alpha = 0.4 + 0.5 * Math.sin(g.frame * 0.03 + s.twinkle);
        // Halo
        if (s.s > 1) {
          ctx.fillStyle = `rgba(200,220,255,${alpha * 0.15})`;
          ctx.beginPath(); ctx.arc(s.x * W, s.y * H * 0.6, s.s * 4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H * 0.6, s.s, 0, Math.PI * 2); ctx.fill();
      });

      // Shooting star (occasional)
      if (g.frame % 300 < 15) {
        const t = (g.frame % 300) / 15;
        const sx = W * 0.8 - t * W * 0.5;
        const sy = H * 0.05 + t * H * 0.15;
        ctx.strokeStyle = `rgba(255,255,255,${1 - t})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 40, sy - 15); ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${1 - t})`;
        ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2); ctx.fill();
      }

      // Moon with glow rings
      const moonX = W * 0.15, moonY = H * 0.12;
      ctx.beginPath(); ctx.arc(moonX, moonY, 50, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,210,230,0.05)'; ctx.fill();
      ctx.beginPath(); ctx.arc(moonX, moonY, 42, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(210,220,240,0.08)'; ctx.fill();
      ctx.beginPath(); ctx.arc(moonX, moonY, 35, 0, Math.PI * 2);
      ctx.fillStyle = '#E8EAF6'; ctx.shadowColor = '#B0BEC5'; ctx.shadowBlur = 40; ctx.fill(); ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
      ctx.fillStyle = '#ECEFF1'; ctx.fill();
      // Craters
      ctx.fillStyle = '#CFD8DC';
      ctx.beginPath(); ctx.arc(moonX - 10, moonY - 8, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(moonX + 10, moonY + 6, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(moonX - 5, moonY + 10, 4, 0, Math.PI * 2); ctx.fill();

      // Ground
      const groundY = H * 0.85;
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
      groundGrad.addColorStop(0, '#1B5E20');
      groundGrad.addColorStop(0.3, '#2E7D32');
      groundGrad.addColorStop(1, '#1B5E20');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, W, H - groundY);

      // Grass blades
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      for (let i = 0; i < W; i += 8) {
        const h = 5 + Math.sin(i * 0.3 + g.frame * 0.05) * 3;
        ctx.beginPath();
        ctx.moveTo(i, groundY);
        ctx.lineTo(i + 2, groundY - h);
        ctx.stroke();
      }

      if (gameState === 'PLAYING') {
        g.frame++;

        // Smooth player movement
        g.playerX += (g.targetX - g.playerX) * 0.15;
        g.playerX = Math.max(30, Math.min(g.playerX, W - 30));

        // Progressive Difficulty Spawning
        const spawnInterval = Math.max(10, Math.floor(35 - difficulty * 25));
        
        if (g.frame % spawnInterval === 0) {
          const rand = Math.random();
          const bombChance = 0.05 + difficulty * 0.15;
          const shieldChance = 0.1 - difficulty * 0.05;
          const redringChance = 0.15 + difficulty * 0.05;
          
          let type: 'bomb' | 'shield' | 'redring' | 'ring' = 'ring';
          if (rand < bombChance) type = 'bomb';
          else if (rand < bombChance + shieldChance) type = 'shield';
          else if (rand < bombChance + shieldChance + redringChance) type = 'redring';

          g.items.push({
            x: 40 + Math.random() * (W - 80),
            y: -30,
            vy: 3 + difficulty * 6 + Math.random() * (2 + difficulty * 2),
            type,
            rotation: 0,
            caught: false,
          });
        }

        // Move items
        for (let item of g.items) {
          item.y += item.vy;
          item.rotation += 0.06;

          // Catch detection
          if (!item.caught && item.y + 15 > groundY - 45 && item.y < groundY - 10) {
            if (Math.abs(item.x - g.playerX) < 40) {
              item.caught = true;
              if (item.type === 'ring') {
                setScore(s => s + 1);
                g.catchEffect.push({ x: item.x, y: item.y, text: '+1', color: '#FFD700', life: 40 });
              } else if (item.type === 'redring') {
                setScore(s => s + 3);
                g.catchEffect.push({ x: item.x, y: item.y, text: '+3', color: '#FF5252', life: 40 });
              } else if (item.type === 'shield') {
                setScore(s => s + 5);
                g.catchEffect.push({ x: item.x, y: item.y, text: '+5', color: '#2196F3', life: 40 });
              } else if (item.type === 'bomb') {
                setScore(s => Math.max(0, s - 5));
                g.catchEffect.push({ x: item.x, y: item.y, text: '-5', color: '#FF1744', life: 40 });
              }
            }
          }
        }
        g.items = g.items.filter(i => i.y < H + 30 && !i.caught);

        // Effects
        g.catchEffect = g.catchEffect.filter(e => {
          e.y -= 1.5;
          e.life--;
          return e.life > 0;
        });
      }

      // Draw items
      for (let item of g.items) {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);

        if (item.type === 'ring') {
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 12;
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = '#FFF8E1';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 10, -0.5, 0.8);
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (item.type === 'redring') {
          ctx.shadowColor = '#FF1744';
          ctx.shadowBlur = 12;
          ctx.strokeStyle = '#FF1744';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = '#FF8A80';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 10, -0.5, 0.8);
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (item.type === 'shield') {
          ctx.shadowColor = '#2196F3';
          ctx.shadowBlur = 15;
          ctx.fillStyle = '#42A5F5';
          ctx.beginPath();
          ctx.moveTo(0, -16);
          ctx.lineTo(14, -6);
          ctx.lineTo(14, 6);
          ctx.lineTo(0, 16);
          ctx.lineTo(-14, 6);
          ctx.lineTo(-14, -6);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#1565C0';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#FFF';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('S', 0, 5);
        } else {
          ctx.fillStyle = '#263238';
          ctx.shadowColor = '#F44336';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#F44336';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-6, -6); ctx.lineTo(6, 6);
          ctx.moveTo(6, -6); ctx.lineTo(-6, 6);
          ctx.stroke();
          // Fuse
          ctx.strokeStyle = '#795548';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -16);
          ctx.lineTo(3, -22);
          ctx.stroke();
          ctx.fillStyle = '#FF9800';
          ctx.beginPath();
          ctx.arc(3, -24, 3 + Math.sin(g.frame * 0.4) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw player (Image)
      const px = g.playerX;
      const py = groundY - 50;
      ctx.save();
      ctx.translate(px, py);

      // Bounce/Squash based on movement
      const speedX = g.targetX - g.playerX;
      const tilt = Math.max(-0.2, Math.min(0.2, speedX * 0.01));
      ctx.rotate(tilt);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 45, 30, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      if (playerImg.complete && playerImg.naturalWidth > 0) {
        const imgW = 90;
        const imgH = 90;
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 15;
        // Flip based on direction
        const flip = speedX < 0 ? -1 : 1;
        ctx.scale(flip, 1);
        ctx.drawImage(playerImg, -imgW / 2, -imgH / 2, imgW, imgH);
      } else {
        ctx.fillStyle = '#00E5FF';
        ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      // Draw catch effects
      for (let e of g.catchEffect) {
        ctx.fillStyle = e.color;
        ctx.globalAlpha = e.life / 40;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(e.text, e.x, e.y);
      }
      ctx.globalAlpha = 1;

      // UI
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Anéis: ${score}`, 15, 35);

      ctx.textAlign = 'right';
      const timerColor = timeLeft <= 5 ? '#FF5252' : (timeLeft <= 10 ? '#FFD700' : '#FFF');
      ctx.fillStyle = timerColor;
      ctx.fillText(`${timeLeft}s`, W - 15, 35);

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [gameState, score, timeLeft, resize]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%', maxWidth: '500px' }}>
        <canvas
          ref={canvasRef}
          onClick={(e) => { UISound.play("click"); if (gameState !== 'PLAYING') startGame(); }}
          onMouseMove={(e) => handleMove(e.clientX)}
          onTouchStart={(e) => { e.preventDefault(); if (gameState !== 'PLAYING') startGame(); handleMove(e.touches[0].clientX); }}
          onTouchMove={(e) => { e.preventDefault(); handleMove(e.touches[0].clientX); }}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'none' }}
        />

        {gameState === 'START' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
            <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
              <img src="/imagens/Design%20sem%20nome%20(1).png" alt="Catch" style={{ width: 90, height: 90, filter: 'drop-shadow(0 0 20px #00E5FF)' }} />
            </motion.div>
            <h2 style={{ color: '#00E5FF', fontFamily: '"Press Start 2P", monospace', fontSize: '22px', textShadow: '0 0 15px #00E5FF', margin: '20px 0 10px 0', textAlign: 'center' }}>RING CATCHER</h2>
            <p style={{ color: '#FFF', fontSize: '14px', textShadow: '1px 1px 4px #000' }}>Mova para pegar os anéis!</p>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '15px', marginTop: '15px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
              <p style={{ color: '#FFD700', fontSize: '13px', margin: '5px 0' }}>Anel = +1 | Vermelho = +3 | Escudo = +5</p>
              <p style={{ color: '#FF5252', fontSize: '13px', margin: '5px 0', fontWeight: 'bold' }}>Bomba = -5 pontos</p>
            </div>
            <p style={{ color: '#FFD700', fontSize: '15px', marginTop: '15px', fontWeight: 'bold' }}>🏆 Recorde: {bestScore}</p>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', pointerEvents: 'none' }}>
            <motion.h2 initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={{ color: '#FF1744', fontFamily: '"Press Start 2P", monospace', fontSize: '24px', textShadow: '0 0 20px #FF1744', textAlign: 'center' }}>TEMPO ESGOTADO!</motion.h2>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))', borderRadius: '20px', padding: '30px 50px', margin: '25px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <p style={{ color: '#FFF', fontSize: '18px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>Anéis Coletados</p>
              <p style={{ color: '#FFD700', fontSize: '48px', fontWeight: '900', margin: '0 0 20px 0', textShadow: '0 0 15px #FFD700' }}>{score}</p>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', width: '100%', marginBottom: '15px' }} />
              <p style={{ color: '#00E5FF', fontSize: '14px', margin: 0, fontWeight: 'bold' }}>Melhor: {bestScore}</p>
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

      <button onClick={(e) => { UISound.play("click"); onClose(e); }} style={{

        position: 'absolute', top: 15, left: 15, padding: '8px 18px',
        background: 'rgba(0,0,0,0.6)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '8px', cursor: 'pointer', fontSize: '14px', backdropFilter: 'blur(5px)', zIndex: 10
      }}>Voltar</button>
    </motion.div>
  );
}
