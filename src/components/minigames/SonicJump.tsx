import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UISound } from "../../utils/audio";
import { motion } from 'framer-motion';

// ═══════════════════════════════════════════
//  ZONES — Visual themes by height
// ═══════════════════════════════════════════
const ZONES = [
  { name: 'GREEN HILL', hueBase: 120, satBase: 60, lightBase: 55, accent: '#4CAF50' },
  { name: 'MARBLE', hueBase: 30, satBase: 50, lightBase: 40, accent: '#FF9800' },
  { name: 'SPRING YARD', hueBase: 280, satBase: 60, lightBase: 45, accent: '#9C27B0' },
  { name: 'STAR LIGHT', hueBase: 220, satBase: 80, lightBase: 20, accent: '#2196F3' },
  { name: 'SCRAP BRAIN', hueBase: 0, satBase: 70, lightBase: 30, accent: '#F44336' },
  { name: 'FINAL ZONE', hueBase: 260, satBase: 90, lightBase: 10, accent: '#00E5FF' },
];

type PlatType = 'normal' | 'spring' | 'moving' | 'crumble' | 'ice' | 'explosive';
interface Plat { x: number; y: number; w: number; type: PlatType; moveDir?: number; crumbleTimer?: number; exploded?: boolean; }
interface Enemy { x: number; y: number; vx: number; alive: boolean; }
interface RingItem { x: number; y: number; collected: boolean; sparkle: number; }
interface PowerUpItem { x: number; y: number; type: 'rocket' | 'parachute'; collected: boolean; }

export default function SonicJump({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerGifRef = useRef<HTMLImageElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER' | 'PAUSED'>('START');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('jump_best2') || '0'));
  const [currentZone, setCurrentZone] = useState(ZONES[0]);
  const [zoneFlash, setZoneFlash] = useState('');
  const [ringsCount, setRingsCount] = useState(0);

  const gameData = useRef({
    playerX: 0, playerY: 0, playerVy: 0,
    platforms: [] as Plat[],
    enemies: [] as Enemy[],
    rings: [] as RingItem[],
    powerUps: [] as PowerUpItem[],
    width: 0, height: 0, scrollOffset: 0, frame: 0, targetX: 0,
    stars: Array.from({ length: 100 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.8 + 0.3, speed: Math.random() * 0.5 + 0.1 })),
    nebulas: Array.from({ length: 5 }, () => ({ x: Math.random(), y: Math.random(), r: 60 + Math.random() * 100, hue: Math.random() * 360 })),
    jumpTrail: [] as { x: number; y: number; age: number }[],
    zoneIndex: 0, ringsCollected: 0,
    rocketActive: false, rocketTimer: 0,
    parachuteActive: false, parachuteTimer: 0,
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string; s: number }[],
  });

  const GRAVITY = 0.25; const JUMP = -9; const SPRING_JUMP = -14; const ROCKET_JUMP = -20;
  const PLAT_W = 72; const PLAT_H = 13; const PLAYER_R = 15;

  const resize = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const container = canvas.parentElement!;
    canvas.width = container.clientWidth; canvas.height = container.clientHeight;
    gameData.current.width = canvas.width; gameData.current.height = canvas.height;
  }, []);

  const getRandomPlatType = (height: number): PlatType => {
    const r = Math.random();
    if (height > 4000 && r > 0.9) return 'explosive';
    if (height > 2000 && r > 0.85) return 'crumble';
    if (height > 3000 && r > 0.82) return 'ice';
    if (r > 0.85) return 'spring';
    if (r > 0.75) return 'moving';
    return 'normal';
  };

  const initPlatforms = useCallback(() => {
    const g = gameData.current; const W = g.width || 400; const H = g.height || 700;
    g.platforms = []; g.enemies = []; g.rings = []; g.powerUps = []; g.particles = [];
    g.platforms.push({ x: W / 2 - 50, y: H - 80, w: 100, type: 'normal' });
    for (let i = 1; i < 15; i++) {
      const y = H - 80 - i * 70;
      g.platforms.push({ x: Math.random() * (W - PLAT_W), y, w: PLAT_W, type: getRandomPlatType(0), moveDir: Math.random() > 0.5 ? 1 : -1 });
    }
    g.playerX = W / 2; g.playerY = H - 100; g.playerVy = JUMP; UISound.play('jump'); UISound.play('jump'); g.scrollOffset = 0; g.frame = 0; g.targetX = W / 2; g.jumpTrail = [];
    g.zoneIndex = 0; g.ringsCollected = 0;
    g.rocketActive = false; g.rocketTimer = 0;
    g.parachuteActive = false; g.parachuteTimer = 0;
  }, []);

  const startGame = useCallback(() => { initPlatforms(); setScore(0); setRingsCount(0); setCurrentZone(ZONES[0]); setGameState('PLAYING'); }, [initPlatforms]);

  const handleInput = useCallback((clientX: number) => {
    if (gameState !== 'PLAYING') { startGame(); return; }
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    gameData.current.targetX = ((clientX - rect.left) / rect.width) * gameData.current.width;
  }, [gameState, startGame]);

  const handleMove = useCallback((clientX: number) => {
    if (gameState !== 'PLAYING') return;
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    gameData.current.targetX = ((clientX - rect.left) / rect.width) * gameData.current.width;
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    resize(); window.addEventListener('resize', resize);
    
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

    let animId: number;

    const draw = () => {
      const g = gameData.current; const W = g.width, H = g.height;
      if (W === 0) { animId = requestAnimationFrame(draw); return; }

      // Map Progression based on score (Height)
      const progress = Math.min(score / 5000, 1); 
      const hyperProgress = Math.max(0, (score - 5000) / 3000); 
      const hueShift = (hyperProgress * 80) % 360;

      // Dynamic Sky Gradient (Earth to Space)
      const hTop = 190 + progress * 50 + hueShift;
      const sTop = 85;
      const lTop = 65 - progress * 60;
      
      const hBot = 210 + progress * 50 + hueShift;
      const lBot = 85 - progress * 65;

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, `hsl(${hTop}, ${sTop}%, ${lTop}%)`);
      bg.addColorStop(1, `hsl(${hBot}, ${sTop}%, ${lBot}%)`);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // Earth Atmosphere (Sun & Clouds) fading out
      if (progress < 0.6) {
        const atmAlpha = 1 - (progress / 0.6);
        ctx.globalAlpha = atmAlpha;
        
        // Sun
        const sunY = (H * 0.3) + (g.scrollOffset * 0.3);
        if (sunY < H + 100) {
          const sunGrad = ctx.createRadialGradient(W*0.8, sunY, 10, W*0.8, sunY, 100);
          sunGrad.addColorStop(0, 'rgba(255,255,255,1)');
          sunGrad.addColorStop(0.2, 'rgba(255,235,59,0.8)');
          sunGrad.addColorStop(1, 'rgba(255,235,59,0)');
          ctx.fillStyle = sunGrad; ctx.fillRect(0, 0, W, H);
        }
        
        // Procedural Clouds (based on stars array for pseudo-random positions)
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.shadowColor = 'rgba(255,255,255,0.4)';
        ctx.shadowBlur = 20;
        g.stars.slice(0, 6).forEach((s, i) => {
          const cy = ((s.y * H * 2 + g.scrollOffset * 0.5) % (H * 2)) - 100;
          if (cy > -50 && cy < H + 50) {
            const cx = (s.x * W + g.frame * 0.2 * s.speed) % (W + 150) - 50;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 40 * s.s, 15 * s.s, 0, 0, Math.PI * 2);
            ctx.ellipse(cx + 20 * s.s, cy - 10 * s.s, 25 * s.s, 20 * s.s, 0, 0, Math.PI * 2);
            ctx.ellipse(cx - 20 * s.s, cy - 5 * s.s, 20 * s.s, 15 * s.s, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // Space & Nebulas fading in
      if (progress > 0.3) {
        const spaceAlpha = Math.min(1, (progress - 0.3) / 0.5);
        ctx.globalAlpha = spaceAlpha;
        
        g.nebulas.forEach(n => {
          const ny = ((n.y * H + g.scrollOffset * 0.02) % (H + n.r * 2)) - n.r;
          const grad = ctx.createRadialGradient(n.x * W, ny, 0, n.x * W, ny, n.r);
          grad.addColorStop(0, `hsla(${(n.hue + hueShift) % 360}, 80%, 60%, 0.3)`);
          grad.addColorStop(0.5, `hsla(${(n.hue + hueShift) % 360}, 60%, 40%, 0.1)`);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
        });

        g.stars.forEach(s => {
          const speedBoost = 1 + hyperProgress * 2;
          const sy = ((s.y * H + g.scrollOffset * s.speed * 0.04 * speedBoost) % H + H) % H;
          const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(g.frame * 0.02 + s.x * 20));
          ctx.fillStyle = `hsla(${(180 + hueShift) % 360}, 100%, 85%, ${twinkle})`;
          ctx.beginPath(); 
          const stretch = 1 + (g.playerVy < -3 ? -g.playerVy * 0.4 : 0) * hyperProgress;
          ctx.ellipse(s.x * W, sy, s.s, s.s * stretch, 0, 0, Math.PI * 2); 
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      // Game Logic Update
      if (gameState === 'PLAYING') {
        g.frame++;
        g.playerX += (g.targetX - g.playerX) * 0.15;

        // Rocket power-up
        if (g.rocketActive) {
          g.rocketTimer--;
          g.playerVy = -12;
          if (g.rocketTimer <= 0) g.rocketActive = false;
        } else if (g.parachuteActive && g.playerVy > 0) {
          g.playerVy = Math.min(g.playerVy, 1.5); // Slow fall
          g.parachuteTimer--;
          if (g.parachuteTimer <= 0) g.parachuteActive = false;
        } else {
          g.playerVy += GRAVITY;
        }
        g.playerY += g.playerVy;

        g.jumpTrail.push({ x: g.playerX, y: g.playerY, age: 0 });
        g.jumpTrail = g.jumpTrail.map(t => ({ ...t, age: t.age + 1 })).filter(t => t.age < 12);

        // Zone transitions
        const newZoneIdx = Math.min(ZONES.length - 1, Math.floor(g.scrollOffset / 1500));
        if (newZoneIdx !== g.zoneIndex) {
          g.zoneIndex = newZoneIdx;
          setCurrentZone(ZONES[newZoneIdx]);
          setZoneFlash(ZONES[newZoneIdx].name);
          setTimeout(() => setZoneFlash(''), 2000);
        }

        // Scroll camera
        if (g.playerY < H * 0.35) {
          const diff = H * 0.35 - g.playerY; g.playerY = H * 0.35; g.scrollOffset += diff;
          setScore(s => s + Math.floor(diff));
          for (let p of g.platforms) p.y += diff;
          for (let e of g.enemies) e.y += diff;
          for (let r of g.rings) r.y += diff;
          for (let pu of g.powerUps) pu.y += diff;
          g.platforms = g.platforms.filter(p => p.y < H + 50);
          g.enemies = g.enemies.filter(e => e.y < H + 80);
          g.rings = g.rings.filter(r => r.y < H + 50);
          g.powerUps = g.powerUps.filter(pu => pu.y < H + 50);

          while (g.platforms.length < 14) {
            const highest = Math.min(...g.platforms.map(p => p.y));
            const newY = highest - (55 + Math.random() * 40);
            g.platforms.push({ x: Math.random() * (W - PLAT_W), y: newY, w: PLAT_W, type: getRandomPlatType(g.scrollOffset), moveDir: Math.random() > 0.5 ? 1 : -1 });

            // Spawn ring above some platforms
            if (Math.random() > 0.5) {
              g.rings.push({ x: Math.random() * (W - 30) + 15, y: newY - 30, collected: false, sparkle: Math.random() * Math.PI * 2 });
            }
            // Spawn enemies rarely
            if (g.scrollOffset > 800 && Math.random() > 0.92) {
              g.enemies.push({ x: Math.random() > 0.5 ? -20 : W + 20, y: newY - 20, vx: Math.random() > 0.5 ? 1.5 : -1.5, alive: true });
            }
            // Spawn power-ups very rarely
            if (Math.random() > 0.97) {
              g.powerUps.push({ x: Math.random() * (W - 30) + 15, y: newY - 40, type: Math.random() > 0.5 ? 'rocket' : 'parachute', collected: false });
            }
          }
        }

        // Platform logic
        for (let p of g.platforms) {
          if (p.type === 'moving') { p.x += (p.moveDir || 1) * (1.5 + hyperProgress); if (p.x < 0 || p.x + p.w > W) p.moveDir = -(p.moveDir || 1); }
          if (p.type === 'crumble' && p.crumbleTimer !== undefined) { p.crumbleTimer--; if (p.crumbleTimer <= 0) p.y = H + 999; }
        }

        // Platform collision (falling down)
        if (g.playerVy > 0 && !g.rocketActive) {
          for (let p of g.platforms) {
            if (p.exploded) continue;
            if (g.playerX > p.x - 5 && g.playerX < p.x + p.w + 5 && g.playerY + PLAYER_R >= p.y && g.playerY + PLAYER_R <= p.y + PLAT_H + g.playerVy + 2) {
              g.playerY = p.y - PLAYER_R;
              if (p.type === 'spring') g.playerVy = SPRING_JUMP;
              else if (p.type === 'explosive') {
                g.playerVy = ROCKET_JUMP; p.exploded = true;
                for (let i = 0; i < 12; i++) g.particles.push({ x: p.x + p.w/2, y: p.y, vx: (Math.random()-0.5)*8, vy: -Math.random()*8, life: 25, color: '#FF6600', s: 3+Math.random()*3 });
              } else if (p.type === 'ice') {
                g.playerVy = JUMP; UISound.play('jump'); UISound.play('jump'); g.targetX += (Math.random() - 0.5) * 60; // Slide!
              } else if (p.type === 'crumble') {
                g.playerVy = JUMP; UISound.play('jump'); UISound.play('jump'); p.crumbleTimer = 15; // Starts crumbling
              } else {
                g.playerVy = JUMP; UISound.play('jump'); UISound.play('jump');
              }
            }
          }
        }

        // Enemy logic
        for (let e of g.enemies) {
          if (!e.alive) continue;
          e.x += e.vx;
          if (e.x < -30 || e.x > W + 30) e.vx = -e.vx;
          // Player stomps enemy
          if (g.playerVy > 0 && Math.abs(g.playerX - e.x) < 25 && Math.abs((g.playerY + PLAYER_R) - e.y) < 20) {
            e.alive = false; g.playerVy = JUMP * 0.8;
            g.ringsCollected += 5; setRingsCount(g.ringsCollected);
            for (let i = 0; i < 8; i++) g.particles.push({ x: e.x, y: e.y, vx: (Math.random()-0.5)*6, vy: -Math.random()*6, life: 20, color: '#FF4444', s: 3 });
          }
          // Enemy hits player from side
          if (e.alive && Math.abs(g.playerX - e.x) < 18 && Math.abs(g.playerY - e.y) < 18 && g.playerVy <= 0) {
            UISound.play('lose'); setGameState('GAMEOVER');
            setScore(s => { const best = Math.max(s, bestScore); setBestScore(best); localStorage.setItem('jump_best2', best.toString()); return s; });
          }
        }

        // Ring collection
        for (let r of g.rings) {
          if (r.collected) continue;
          r.sparkle += 0.1;
          if (Math.abs(g.playerX - r.x) < 25 && Math.abs(g.playerY - r.y) < 25) {
            r.collected = true; g.ringsCollected++; setRingsCount(g.ringsCollected);
            for (let i = 0; i < 4; i++) g.particles.push({ x: r.x, y: r.y, vx: (Math.random()-0.5)*4, vy: -Math.random()*4, life: 15, color: '#FFD700', s: 2 });
          }
        }

        // Power-up collection
        for (let pu of g.powerUps) {
          if (pu.collected) continue;
          if (Math.abs(g.playerX - pu.x) < 25 && Math.abs(g.playerY - pu.y) < 30) {
            pu.collected = true;
            if (pu.type === 'rocket') { g.rocketActive = true; g.rocketTimer = 80; }
            if (pu.type === 'parachute') { g.parachuteActive = true; g.parachuteTimer = 120; }
          }
        }

        // Particles
        g.particles = g.particles.filter(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--; return p.life > 0; });

        if (g.playerX < -PLAYER_R) g.playerX = W + PLAYER_R;
        if (g.playerX > W + PLAYER_R) g.playerX = -PLAYER_R;
        if (g.playerY > H + 50) {
          UISound.play('lose'); setGameState('GAMEOVER');
          setScore(s => { const best = Math.max(s, bestScore); setBestScore(best); localStorage.setItem('jump_best2', best.toString()); return s; });
        }
      }

      // Draw Trail
      for (let t of g.jumpTrail) {
        const alpha = 1 - t.age / 12;
        ctx.fillStyle = `hsla(${(200 + hueShift) % 360}, 100%, 70%, ${alpha * 0.5})`;
        ctx.beginPath(); ctx.arc(t.x, t.y, PLAYER_R * (1 - t.age / 12), 0, Math.PI * 2); ctx.fill();
      }

      // Draw Rings
      for (let r of g.rings) {
        if (r.collected) continue;
        const glow = Math.sin(r.sparkle) * 0.3 + 0.7;
        ctx.save(); ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 8 * glow;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath(); ctx.ellipse(r.x, r.y, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFF8E1';
        ctx.beginPath(); ctx.ellipse(r.x, r.y, 4, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // Draw Power-ups
      for (let pu of g.powerUps) {
        if (pu.collected) continue;
        const bob = Math.sin(g.frame * 0.08) * 4;
        ctx.save(); ctx.shadowColor = pu.type === 'rocket' ? '#FF6600' : '#00BCD4'; ctx.shadowBlur = 15;
        ctx.fillStyle = pu.type === 'rocket' ? '#FF6600' : '#00BCD4';
        ctx.beginPath(); ctx.roundRect(pu.x - 14, pu.y - 14 + bob, 28, 28, 7); ctx.fill();
        ctx.fillStyle = '#FFF'; ctx.font = '16px Arial'; ctx.textAlign = 'center';
        ctx.fillText(pu.type === 'rocket' ? '🚀' : '🪂', pu.x, pu.y + 6 + bob);
        ctx.restore();
      }

      // Draw Enemies
      for (let e of g.enemies) {
        if (!e.alive) continue;
        ctx.save();
        ctx.fillStyle = '#EF5350';
        ctx.beginPath(); ctx.arc(e.x, e.y, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath(); ctx.arc(e.x - 4, e.y - 3, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e.x + 4, e.y - 3, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(e.x - 4, e.y - 3, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e.x + 4, e.y - 3, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // Draw Particles
      for (let p of g.particles) {
        ctx.globalAlpha = p.life / 25; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw Platforms
      for (let p of g.platforms) {
        if (p.exploded) continue;
        const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + PLAT_H);
        let glowColor = '#4CAF50'; let label = '';
        if (p.type === 'spring') { 
          grad.addColorStop(0, '#FFCA28'); grad.addColorStop(1, '#FF8F00'); 
          glowColor = '#FFCA28'; label = 'BOOST';
        } else if (p.type === 'moving') { 
          grad.addColorStop(0, '#4DD0E1'); grad.addColorStop(1, '#00838F'); 
          glowColor = '#00E5FF'; 
        } else if (p.type === 'crumble') {
          const alpha = p.crumbleTimer !== undefined ? Math.max(0.2, p.crumbleTimer / 15) : 1;
          grad.addColorStop(0, `rgba(158,158,158,${alpha})`); grad.addColorStop(1, `rgba(97,97,97,${alpha})`);
          glowColor = '#9E9E9E';
        } else if (p.type === 'ice') {
          grad.addColorStop(0, '#B3E5FC'); grad.addColorStop(1, '#4FC3F7');
          glowColor = '#4FC3F7';
        } else if (p.type === 'explosive') {
          grad.addColorStop(0, '#FF5722'); grad.addColorStop(1, '#BF360C');
          glowColor = '#FF5722'; label = '💥';
        } else { 
          grad.addColorStop(0, `hsl(${100 + progress * 100 + hueShift}, 60%, 60%)`); 
          grad.addColorStop(1, `hsl(${100 + progress * 100 + hueShift}, 70%, 30%)`); 
          glowColor = `hsl(${100 + progress * 100 + hueShift}, 80%, 50%)`;
        }
        ctx.shadowColor = glowColor; 
        ctx.shadowBlur = 12 + Math.sin(g.frame * 0.1) * 3;
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.roundRect(p.x, p.y, p.w, PLAT_H, 7); ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.roundRect(p.x + 2, p.y + 2, p.w - 4, PLAT_H / 2, 5); ctx.fill();
        
        if (label) {
          ctx.fillStyle = '#FFF'; ctx.font = '900 10px Arial'; ctx.textAlign = 'center';
          ctx.fillText(label, p.x + p.w / 2, p.y + 11);
        }
      }

      // Parachute visual
      if (g.parachuteActive && g.playerVy > 0) {
        const px = g.playerX, py = g.playerY || H * 0.5;
        ctx.save(); ctx.strokeStyle = '#FFF'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px - 5, py - PLAYER_R); ctx.lineTo(px - 20, py - PLAYER_R - 30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px + 5, py - PLAYER_R); ctx.lineTo(px + 20, py - PLAYER_R - 30); ctx.stroke();
        ctx.fillStyle = 'rgba(0,188,212,0.5)';
        ctx.beginPath(); ctx.arc(px, py - PLAYER_R - 30, 22, Math.PI, 0); ctx.fill();
        ctx.restore();
      }

      // Draw Player
      const px = g.playerX, py = g.playerY || H * 0.5;
      const flip = (g.targetX < g.playerX) ? -1 : 1;
      
      // Update HTML Image overlay position
      if (playerGifRef.current) {
        const imgSize = PLAYER_R * 4.5;
        const squash = Math.max(0.7, Math.min(1.3, 1 + g.playerVy * 0.02));
        const stretch = Math.max(0.7, Math.min(1.3, 1 - g.playerVy * 0.02));
        playerGifRef.current.style.transform = `translate(${px - imgSize/2}px, ${py - imgSize/2}px) scale(${flip * stretch}, ${squash})`;
        playerGifRef.current.style.width = `${imgSize}px`;
        playerGifRef.current.style.height = `${imgSize}px`;
        playerGifRef.current.style.display = gameState === 'PLAYING' ? 'block' : 'none';
      }

      // Score
      // HUD
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.roundRect(W/2 - 80, 8, 160, 55, 12); ctx.fill();
      ctx.fillStyle = '#FFF'; ctx.font = 'bold 24px Arial'; ctx.textAlign = 'center';
      const displayScore = Math.floor(score / 10);
      ctx.fillText(`${displayScore}m`, W / 2, 35);
      ctx.fillStyle = '#FFD700'; ctx.font = 'bold 13px Arial';
      ctx.fillText(`💍 ${g.ringsCollected}`, W / 2, 55);

      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => { 
      cancelAnimationFrame(animId); 
      window.removeEventListener('resize', resize); 
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, score, bestScore, resize]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', maxWidth: '500px' }}>
        <canvas ref={canvasRef}
          onClick={(e) => { UISound.play("click"); handleInput(e.clientX); }}
          onTouchStart={(e) => { e.preventDefault(); handleInput(e.touches[0].clientX); }}
          onMouseMove={(e) => handleMove(e.clientX)}
          onTouchMove={(e) => { e.preventDefault(); handleMove(e.touches[0].clientX); }}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }} />
        
        <img
          ref={playerGifRef}
          src="/imagens/download (6).gif"
          style={{ position: 'absolute', top: 0, left: 0, objectFit: 'contain', pointerEvents: 'none', display: 'none', filter: 'drop-shadow(0 0 10px #00E5FF)' }}
          alt="Player In Game"
        />

        {/* Zone flash */}
        {zoneFlash && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', top: '12%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', border: `2px solid ${currentZone.accent}`, borderRadius: '15px', padding: '12px 35px', zIndex: 20 }}>
            <h3 style={{ color: currentZone.accent, fontSize: '18px', fontFamily: 'Arial Black', margin: 0, textShadow: `0 0 20px ${currentZone.accent}` }}>
              ~ {zoneFlash} ZONE ~
            </h3>
          </motion.div>
        )}

        {gameState === 'START' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
              <img src="/imagens/download (6).gif" alt="Player" style={{ width: 80, height: 80, filter: 'drop-shadow(0 0 20px #00E5FF)' }} />
            </motion.div>
            <h2 style={{ color: '#00E5FF', fontFamily: '"Press Start 2P", monospace', fontSize: '24px', textShadow: '0 0 15px #00E5FF', margin: '20px 0 10px 0', textAlign: 'center' }}>HYPER JUMP</h2>
            <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '15px', padding: '15px 25px', textAlign: 'center', maxWidth: '300px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ color: '#FFF', fontSize: '13px', margin: '0 0 8px' }}>Mova o mouse/dedo para guiar</p>
              <p style={{ color: '#FFCA28', fontSize: '12px', fontWeight: 'bold', margin: '0 0 5px' }}>🟡 Boost · 🧊 Gelo · 💥 Explosivo · ⬛ Quebrável</p>
              <p style={{ color: '#4CAF50', fontSize: '12px', margin: 0 }}>🚀 Foguete · 🪂 Paraquedas · 💍 Anéis</p>
            </div>
            <p style={{ color: '#FFD700', fontSize: '14px', marginTop: '15px', fontWeight: 'bold' }}>🏆 Recorde: {Math.floor(bestScore / 10)}m</p>
          </div>
        )}
        {gameState === 'GAMEOVER' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', pointerEvents: 'none' }}>
            <h2 style={{ color: '#FF5252', fontFamily: 'Arial Black', fontSize: '36px', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>CAIU!</h2>
            <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: '18px', padding: '22px 45px', margin: '15px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ color: '#FFF', fontSize: '20px' }}>Altura: <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{Math.floor(score / 10)}m</span></p>
              <p style={{ color: '#FFD700', fontSize: '16px', marginTop: '8px' }}>💍 Anéis: {ringsCount}</p>
              <p style={{ color: '#00FFFF', fontSize: '13px', marginTop: '6px' }}>Zona: {currentZone.name}</p>
              <p style={{ color: '#aaa', fontSize: '13px', marginTop: '8px' }}>Melhor: {Math.floor(bestScore / 10)}m</p>
            </div>
            <p style={{ color: '#FFF', fontSize: '14px' }}>Toque para recomeçar</p>
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
