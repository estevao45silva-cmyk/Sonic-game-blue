import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UISound } from "../../utils/audio";
import { motion } from 'framer-motion';

// ═══════════════════════════════════════════
//  ZONES — Visual themes that change as you run
// ═══════════════════════════════════════════
const ZONES = [
  { name: 'GREEN HILL', skyTop: '#87CEEB', skyBot: '#E8F5E9', ground: '#4CAF50', groundDark: '#2E7D32', accent: '#8BC34A', distance: 0 },
  { name: 'CASINO NIGHT', skyTop: '#0D0221', skyBot: '#1A0533', ground: '#4A148C', groundDark: '#12005E', accent: '#E040FB', distance: 1500 },
  { name: 'ICE CAP', skyTop: '#B3E5FC', skyBot: '#E1F5FE', ground: '#B3E5FC', groundDark: '#4FC3F7', accent: '#00BCD4', distance: 3500 },
  { name: 'LAVA REEF', skyTop: '#BF360C', skyBot: '#FF6F00', ground: '#D84315', groundDark: '#BF360C', accent: '#FF9800', distance: 6000 },
  { name: 'STAR LIGHT', skyTop: '#0A001A', skyBot: '#1A0044', ground: '#1A237E', groundDark: '#0D47A1', accent: '#00E5FF', distance: 9000 },
];

interface Obstacle { x: number; lane: number; type: 'rock' | 'spike' | 'badnik' | 'barrier'; w: number; h: number; }
interface Ring { x: number; y: number; lane: number; collected: boolean; sparkle: number; }
interface PowerUp { x: number; lane: number; type: 'magnet' | 'shield' | 'super'; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; s: number; }

export default function SonicRunner({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerGifRef = useRef<HTMLImageElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [rings, setRings] = useState(0);
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('runner_best2') || '0'));
  const [currentZone, setCurrentZone] = useState(ZONES[0]);
  const [zoneFlash, setZoneFlash] = useState('');
  const [combo, setCombo] = useState(0);
  const [powerUpActive, setPowerUpActive] = useState<string | null>(null);

  const gameData = useRef({
    playerLane: 1, // 0=left, 1=center, 2=right
    playerY: 0, playerVy: 0, groundY: 0,
    targetLane: 1, playerX: 0,
    isJumping: false, isSliding: false, slideTimer: 0,
    obstacles: [] as Obstacle[],
    rings: [] as Ring[],
    powerUps: [] as PowerUp[],
    particles: [] as Particle[],
    width: 0, height: 0, speed: 6, frame: 0,
    distance: 0, ringsCollected: 0, comboCount: 0, comboTimer: 0,
    groundScroll: 0,
    clouds: Array.from({ length: 8 }, (_, i) => ({ x: i * 150, y: 20 + Math.random() * 50, s: 0.5 + Math.random() * 0.8 })),
    // Power-up state
    magnetActive: false, magnetTimer: 0,
    shieldActive: false, shieldHits: 0,
    superActive: false, superTimer: 0,
    laneWidth: 0,
    zoneIndex: 0,
  });

  const GRAVITY = 0.5; const JUMP = -12; const PLAYER_W = 40; const PLAYER_H = 50;
  const SLIDE_DURATION = 30;

  const resize = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const container = canvas.parentElement!;
    canvas.width = container.clientWidth; canvas.height = container.clientHeight;
    const g = gameData.current;
    g.width = canvas.width; g.height = canvas.height;
    g.groundY = canvas.height * 0.72;
    g.laneWidth = Math.min(canvas.width * 0.22, 120);
  }, []);

  const resetGame = useCallback(() => {
    const g = gameData.current;
    g.playerLane = 1; g.targetLane = 1;
    g.playerY = g.groundY - PLAYER_H; g.playerVy = 0;
    g.playerX = g.width / 2;
    g.obstacles = []; g.rings = []; g.powerUps = []; g.particles = [];
    g.speed = 6; g.frame = 0; g.distance = 0;
    g.isJumping = false; g.isSliding = false; g.slideTimer = 0;
    g.groundScroll = 0; g.ringsCollected = 0; g.comboCount = 0; g.comboTimer = 0;
    g.magnetActive = false; g.magnetTimer = 0;
    g.shieldActive = false; g.shieldHits = 0;
    g.superActive = false; g.superTimer = 0;
    g.zoneIndex = 0;
  }, []);

  const getLaneX = useCallback((lane: number) => {
    const g = gameData.current;
    const center = g.width / 2;
    return center + (lane - 1) * g.laneWidth;
  }, []);

  const handleInput = useCallback((action: 'jump' | 'slide' | 'left' | 'right') => {
    if (gameState === 'START' || gameState === 'GAMEOVER') {
      resetGame(); setScore(0); setRings(0); setCombo(0); setPowerUpActive(null);
      setCurrentZone(ZONES[0]); setGameState('PLAYING'); return;
    }
    const g = gameData.current;
    if (action === 'jump' && !g.isJumping) {
      g.playerVy = JUMP; UISound.play('jump'); UISound.play('jump'); g.isJumping = true;
      for (let i = 0; i < 5; i++) g.particles.push({ x: g.playerX, y: g.groundY, vx: (Math.random()-0.5)*3, vy: -Math.random()*4, life: 15, color: '#FFF', s: 2+Math.random()*2 });
    }
    if (action === 'slide' && !g.isJumping && !g.isSliding) {
      g.isSliding = true; g.slideTimer = SLIDE_DURATION;
    }
    if (action === 'left' && g.targetLane > 0) g.targetLane--;
    if (action === 'right' && g.targetLane < 2) g.targetLane++;
  }, [gameState, resetGame]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); handleInput('jump'); }
      if (e.code === 'ArrowDown') { e.preventDefault(); handleInput('slide'); }
      if (e.code === 'ArrowLeft') { e.preventDefault(); handleInput('left'); }
      if (e.code === 'ArrowRight') { e.preventDefault(); handleInput('right'); }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [handleInput]);

  // Touch controls
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (gameState !== 'PLAYING') { handleInput('jump'); return; }
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      const absDx = Math.abs(dx), absDy = Math.abs(dy);
      if (absDx < 20 && absDy < 20) { handleInput('jump'); }
      else if (absDx > absDy) { handleInput(dx > 0 ? 'right' : 'left'); }
      else { handleInput(dy > 0 ? 'slide' : 'jump'); }
      touchStart.current = null;
    };
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => { window.removeEventListener('touchstart', onTouchStart); window.removeEventListener('touchend', onTouchEnd); };
  }, [handleInput, gameState]);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    resize(); window.addEventListener('resize', resize);
    let animId: number;

    const draw = () => {
      const g = gameData.current; const W = g.width, H = g.height;
      if (W === 0) { animId = requestAnimationFrame(draw); return; }

      // Current zone
      const zone = ZONES[g.zoneIndex];

      // === SKY ===
      const sky = ctx.createLinearGradient(0, 0, 0, g.groundY);
      sky.addColorStop(0, zone.skyTop); sky.addColorStop(1, zone.skyBot);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

      // Casino Night stars
      if (g.zoneIndex === 1 || g.zoneIndex === 4) {
        for (let i = 0; i < 60; i++) {
          const sx = (i * 37 + g.frame * 0.1) % W;
          const sy = (i * 53) % (g.groundY * 0.8);
          const twinkle = Math.sin(g.frame * 0.05 + i) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(255,255,255,${twinkle * 0.8})`;
          ctx.beginPath(); ctx.arc(sx, sy, 1 + twinkle, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Clouds (skip for dark zones)
      if (g.zoneIndex !== 1 && g.zoneIndex !== 4) {
        g.clouds.forEach(c => {
          const cx = ((c.x - g.groundScroll * 0.03) % (W + 200) + W + 200) % (W + 200) - 80;
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.beginPath(); ctx.ellipse(cx, c.y, 45 * c.s, 15 * c.s, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(cx + 20 * c.s, c.y - 6 * c.s, 30 * c.s, 12 * c.s, 0, 0, Math.PI * 2); ctx.fill();
        });
      }

      // === GROUND ===
      const gGrad = ctx.createLinearGradient(0, g.groundY, 0, H);
      gGrad.addColorStop(0, zone.ground); gGrad.addColorStop(0.3, zone.groundDark);
      gGrad.addColorStop(1, '#111'); ctx.fillStyle = gGrad; ctx.fillRect(0, g.groundY, W, H - g.groundY);

      // Checkerboard on ground
      const checkSize = 40;
      for (let row = 0; row < 4; row++) {
        for (let i = -1; i < W / checkSize + 2; i++) {
          const cx = ((i * checkSize - g.groundScroll) % (checkSize * 2) + checkSize * 4) % (checkSize * 2) - checkSize;
          if ((i + row) % 2 === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(cx, g.groundY + row * 15, checkSize, 15);
          }
        }
      }

      // Lane markers
      for (let l = 0; l < 3; l++) {
        const lx = getLaneX(l);
        ctx.strokeStyle = `rgba(255,255,255,0.15)`;
        ctx.setLineDash([15, 25]);
        ctx.beginPath(); ctx.moveTo(lx, g.groundY); ctx.lineTo(lx, g.groundY + 60); ctx.stroke();
        ctx.setLineDash([]);
      }

      // ══ GAME LOGIC (only when playing) ══
      if (gameState === 'PLAYING') {
        g.frame++; g.groundScroll += g.speed;
        g.distance += g.speed * 0.1;

        // Speed increase every 500 distance
        if (Math.floor(g.distance) % 500 === 0 && g.distance > 0 && g.frame % 60 === 0) {
          g.speed = Math.min(16, g.speed + 0.3);
        }

        // Zone transitions
        for (let i = ZONES.length - 1; i >= 0; i--) {
          if (g.distance >= ZONES[i].distance && g.zoneIndex !== i) {
            g.zoneIndex = i;
            setCurrentZone(ZONES[i]);
            setZoneFlash(ZONES[i].name);
            setTimeout(() => setZoneFlash(''), 2000);
            break;
          }
        }

        // Player physics
        g.playerVy += GRAVITY; g.playerY += g.playerVy;
        if (g.playerY >= g.groundY - PLAYER_H) { g.playerY = g.groundY - PLAYER_H; g.playerVy = 0; g.isJumping = false; }

        // Slide timer
        if (g.isSliding) { g.slideTimer--; if (g.slideTimer <= 0) g.isSliding = false; }

        // Smooth lane movement
        const targetX = getLaneX(g.targetLane);
        g.playerX += (targetX - g.playerX) * 0.2;
        g.playerLane = g.targetLane;

        // Combo timer
        if (g.comboTimer > 0) { g.comboTimer--; } else { g.comboCount = 0; setCombo(0); }

        // Power-up timers
        if (g.magnetActive) { g.magnetTimer--; if (g.magnetTimer <= 0) { g.magnetActive = false; setPowerUpActive(null); } }
        if (g.superActive) { g.superTimer--; if (g.superTimer <= 0) { g.superActive = false; setPowerUpActive(null); } }

        // Spawn obstacles
        if (g.frame % Math.max(35, 80 - Math.floor(g.distance / 200)) === 0) {
          const lane = Math.floor(Math.random() * 3);
          const types: Obstacle['type'][] = ['rock', 'spike', 'badnik', 'barrier'];
          const type = types[Math.floor(Math.random() * types.length)];
          const h = type === 'barrier' ? 25 : (35 + Math.random() * 20);
          const w = type === 'barrier' ? g.laneWidth * 0.8 : (25 + Math.random() * 15);
          g.obstacles.push({ x: W + 50, lane, type, w, h });
        }

        // Spawn rings
        if (g.frame % 25 === 0) {
          const lane = Math.floor(Math.random() * 3);
          const y = g.groundY - PLAYER_H - 10 - Math.random() * 40;
          g.rings.push({ x: W + 50, y, lane, collected: false, sparkle: Math.random() * Math.PI * 2 });
        }

        // Spawn power-ups (rare)
        if (g.frame % 400 === 0 && Math.random() > 0.4) {
          const lane = Math.floor(Math.random() * 3);
          const types: PowerUp['type'][] = ['magnet', 'shield', 'super'];
          g.powerUps.push({ x: W + 50, lane, type: types[Math.floor(Math.random() * types.length)] });
        }

        // Move obstacles
        for (let o of g.obstacles) o.x -= g.speed;
        g.obstacles = g.obstacles.filter(o => o.x > -80);

        // Move rings + magnet attraction
        for (let r of g.rings) {
          r.x -= g.speed;
          r.sparkle += 0.1;
          if (g.magnetActive && !r.collected) {
            const dx = g.playerX - r.x; const dy = g.playerY + PLAYER_H / 2 - r.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) { r.x += dx * 0.08; r.y += dy * 0.08; }
          }
        }
        g.rings = g.rings.filter(r => r.x > -30 && !r.collected);

        // Move power-ups
        for (let p of g.powerUps) p.x -= g.speed;
        g.powerUps = g.powerUps.filter(p => p.x > -50);

        // Collision: Rings
        for (let r of g.rings) {
          if (r.collected) continue;
          const rx = r.x; const ry = r.y;
          if (Math.abs(rx - g.playerX) < 35 && Math.abs(ry - (g.playerY + PLAYER_H / 2)) < 35) {
            r.collected = true;
            g.ringsCollected++;
            g.comboCount++; g.comboTimer = 60;
            setRings(g.ringsCollected); setCombo(g.comboCount);
            for (let i = 0; i < 4; i++) g.particles.push({ x: rx, y: ry, vx: (Math.random()-0.5)*4, vy: -Math.random()*5, life: 20, color: '#FFD700', s: 2+Math.random()*2 });
          }
        }

        // Collision: Power-ups
        for (let i = g.powerUps.length - 1; i >= 0; i--) {
          const p = g.powerUps[i];
          const px = getLaneX(p.lane);
          if (Math.abs(px - g.playerX) < 40 && g.playerY + PLAYER_H > g.groundY - 60) {
            if (p.type === 'magnet') { g.magnetActive = true; g.magnetTimer = 300; setPowerUpActive('🧲 ÍMÃ'); }
            if (p.type === 'shield') { g.shieldActive = true; g.shieldHits = 3; setPowerUpActive('🛡️ ESCUDO'); }
            if (p.type === 'super') { g.superActive = true; g.superTimer = 300; setPowerUpActive('⚡ SUPER!'); }
            for (let j = 0; j < 10; j++) g.particles.push({ x: px, y: g.groundY - 30, vx: (Math.random()-0.5)*6, vy: -Math.random()*6, life: 25, color: p.type === 'magnet' ? '#FF00FF' : p.type === 'shield' ? '#00BFFF' : '#FFD700', s: 3+Math.random()*3 });
            g.powerUps.splice(i, 1);
          }
        }

        // Collision: Obstacles
        for (let o of g.obstacles) {
          const ox = getLaneX(o.lane);
          const isInLane = Math.abs(ox - g.playerX) < g.laneWidth * 0.4;
          if (!isInLane) continue;

          if (o.type === 'barrier') {
            // Barriers must be jumped over
            if (g.playerY + PLAYER_H > g.groundY - o.h && o.x < g.playerX + 20 && o.x + o.w > g.playerX - 20) {
              if (g.superActive) { /* immune */ o.x = -999; for (let i = 0; i < 8; i++) g.particles.push({ x: ox, y: g.groundY - o.h, vx: (Math.random()-0.5)*8, vy: -Math.random()*6, life: 20, color: '#FF4444', s: 3 }); continue; }
              if (g.shieldActive) { g.shieldHits--; if (g.shieldHits <= 0) { g.shieldActive = false; setPowerUpActive(null); } o.x = -999; continue; }
              UISound.play('lose'); setGameState('GAMEOVER');
              setScore(s => { const best = Math.max(Math.floor(g.distance), bestScore); setBestScore(best); localStorage.setItem('runner_best2', best.toString()); return Math.floor(g.distance); });
            }
          } else if (o.type === 'badnik') {
            // Badniks can be jumped on (from above) to destroy
            if (g.isJumping && g.playerVy > 0 && g.playerY + PLAYER_H > g.groundY - o.h - 5 && g.playerY + PLAYER_H < g.groundY - o.h + 20 && o.x < g.playerX + 25 && o.x + o.w > g.playerX - 25) {
              g.playerVy = JUMP * 0.7; // Bounce off
              o.x = -999;
              g.ringsCollected += 5; setRings(g.ringsCollected);
              for (let i = 0; i < 10; i++) g.particles.push({ x: ox, y: g.groundY - o.h, vx: (Math.random()-0.5)*8, vy: -Math.random()*8, life: 25, color: '#FF6600', s: 3+Math.random()*3 });
              continue;
            }
            if (g.playerY + PLAYER_H > g.groundY - o.h + 5 && o.x < g.playerX + 18 && o.x + o.w > g.playerX - 18) {
              if (g.superActive) { o.x = -999; for (let i = 0; i < 8; i++) g.particles.push({ x: ox, y: g.groundY - o.h, vx: (Math.random()-0.5)*8, vy: -Math.random()*6, life: 20, color: '#FF4444', s: 3 }); continue; }
              if (g.shieldActive) { g.shieldHits--; if (g.shieldHits <= 0) { g.shieldActive = false; setPowerUpActive(null); } o.x = -999; continue; }
              UISound.play('lose'); setGameState('GAMEOVER');
              setScore(s => { const best = Math.max(Math.floor(g.distance), bestScore); setBestScore(best); localStorage.setItem('runner_best2', best.toString()); return Math.floor(g.distance); });
            }
          } else {
            // Rock/spike: must jump or slide
            const slideOk = g.isSliding && o.type === 'spike';
            if (!slideOk && g.playerY + PLAYER_H > g.groundY - o.h + 5 && o.x < g.playerX + 18 && o.x + o.w > g.playerX - 18) {
              if (g.superActive) { o.x = -999; continue; }
              if (g.shieldActive) { g.shieldHits--; if (g.shieldHits <= 0) { g.shieldActive = false; setPowerUpActive(null); } o.x = -999; continue; }
              UISound.play('lose'); setGameState('GAMEOVER');
              setScore(s => { const best = Math.max(Math.floor(g.distance), bestScore); setBestScore(best); localStorage.setItem('runner_best2', best.toString()); return Math.floor(g.distance); });
            }
          }
        }

        // Running particles
        if (!g.isJumping && g.frame % 3 === 0) {
          g.particles.push({ x: g.playerX - 10, y: g.groundY, vx: -1 - Math.random() * 2, vy: -Math.random() * 2, life: 15, color: zone.accent, s: 2 + Math.random() * 2 });
        }

        setScore(Math.floor(g.distance));
      }

      // === DRAW RINGS ===
      for (let r of g.rings) {
        if (r.collected) continue;
        const glow = Math.sin(r.sparkle) * 0.3 + 0.7;
        ctx.save();
        ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 10 * glow;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath(); ctx.ellipse(r.x, r.y, 10, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFF8E1';
        ctx.beginPath(); ctx.ellipse(r.x, r.y, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // === DRAW POWER-UPS ===
      for (let p of g.powerUps) {
        const px = getLaneX(p.lane);
        const py = g.groundY - 40;
        const bob = Math.sin(g.frame * 0.08) * 5;
        ctx.save();
        ctx.shadowColor = p.type === 'magnet' ? '#FF00FF' : p.type === 'shield' ? '#00BFFF' : '#FFD700';
        ctx.shadowBlur = 20;
        ctx.fillStyle = p.type === 'magnet' ? '#FF00FF' : p.type === 'shield' ? '#00BFFF' : '#FFD700';
        ctx.beginPath(); ctx.roundRect(p.x - 18, py - 18 + bob, 36, 36, 8); ctx.fill();
        ctx.fillStyle = '#FFF'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'center';
        ctx.fillText(p.type === 'magnet' ? '🧲' : p.type === 'shield' ? '🛡️' : '⚡', p.x, py + 6 + bob);
        ctx.restore();
      }

      // === DRAW OBSTACLES ===
      for (let o of g.obstacles) {
        const ox = getLaneX(o.lane);
        ctx.save();
        if (o.type === 'rock') {
          const rGrad = ctx.createLinearGradient(o.x, g.groundY - o.h, o.x + o.w, g.groundY);
          rGrad.addColorStop(0, '#9E9E9E'); rGrad.addColorStop(1, '#616161');
          ctx.fillStyle = rGrad;
          ctx.beginPath(); ctx.moveTo(o.x, g.groundY); ctx.lineTo(o.x + o.w * 0.2, g.groundY - o.h);
          ctx.lineTo(o.x + o.w * 0.5, g.groundY - o.h - 5); ctx.lineTo(o.x + o.w * 0.8, g.groundY - o.h);
          ctx.lineTo(o.x + o.w, g.groundY); ctx.fill();
        } else if (o.type === 'spike') {
          ctx.fillStyle = '#FF5252';
          for (let s = 0; s < 3; s++) {
            ctx.beginPath();
            ctx.moveTo(o.x + s * 12, g.groundY);
            ctx.lineTo(o.x + s * 12 + 6, g.groundY - o.h);
            ctx.lineTo(o.x + s * 12 + 12, g.groundY);
            ctx.fill();
          }
        } else if (o.type === 'badnik') {
          const bGrad = ctx.createLinearGradient(o.x, g.groundY - o.h, o.x + o.w, g.groundY);
          bGrad.addColorStop(0, '#EF5350'); bGrad.addColorStop(1, '#C62828');
          ctx.fillStyle = bGrad;
          ctx.beginPath(); ctx.roundRect(o.x, g.groundY - o.h, o.w, o.h, 6); ctx.fill();
          ctx.fillStyle = '#FFEB3B';
          ctx.beginPath(); ctx.arc(o.x + o.w * 0.3, g.groundY - o.h + 10, 4, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(o.x + o.w * 0.7, g.groundY - o.h + 10, 4, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#000';
          ctx.beginPath(); ctx.arc(o.x + o.w * 0.3, g.groundY - o.h + 10, 2, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(o.x + o.w * 0.7, g.groundY - o.h + 10, 2, 0, Math.PI * 2); ctx.fill();
        } else if (o.type === 'barrier') {
          ctx.fillStyle = 'rgba(255,255,0,0.3)';
          ctx.fillRect(o.x, g.groundY - o.h, o.w, o.h);
          ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
          ctx.strokeRect(o.x, g.groundY - o.h, o.w, o.h); ctx.setLineDash([]);
        }
        ctx.restore();
      }

      // === DRAW PARTICLES ===
      g.particles = g.particles.filter(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--; return p.life > 0; });
      for (let p of g.particles) {
        ctx.globalAlpha = p.life / 25; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // === DRAW PLAYER (via GIF overlay) ===
      const px = g.playerX || getLaneX(1);
      const py = g.playerY || (g.groundY - PLAYER_H);
      if (playerGifRef.current) {
        const scaleY = g.isSliding ? 0.5 : 1;
        const offsetY = g.isSliding ? PLAYER_H * 0.4 : 0;
        playerGifRef.current.style.transform = `translate(${px - 30}px, ${py - 10 + offsetY}px) scaleY(${scaleY})`;
        playerGifRef.current.style.filter = g.superActive ? 'brightness(2) hue-rotate(40deg) drop-shadow(0 0 15px gold)' : 'none';
      }

      // Shield visual
      if (g.shieldActive) {
        ctx.save();
        ctx.strokeStyle = `rgba(0,191,255,${0.5 + Math.sin(g.frame * 0.1) * 0.3})`;
        ctx.lineWidth = 3; ctx.shadowColor = '#00BFFF'; ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.arc(px, py + PLAYER_H / 2, 35, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }

      // Super aura
      if (g.superActive) {
        ctx.save();
        ctx.fillStyle = `rgba(255,215,0,${0.15 + Math.sin(g.frame * 0.15) * 0.1})`;
        ctx.beginPath(); ctx.arc(px, py + PLAYER_H / 2, 45 + Math.sin(g.frame * 0.1) * 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // === HUD ===
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.roundRect(W - 180, 10, 170, 70, 12); ctx.fill();
      ctx.fillStyle = '#FFF'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'right';
      ctx.fillText(`${Math.floor(g.distance)}m`, W - 20, 35);
      ctx.fillStyle = '#FFD700'; ctx.font = 'bold 13px Arial';
      ctx.fillText(`💍 ${g.ringsCollected}`, W - 20, 55);
      if (g.comboCount > 1) {
        ctx.fillStyle = '#00FF9D'; ctx.font = 'bold 12px Arial';
        ctx.fillText(`COMBO x${g.comboCount}`, W - 20, 72);
      }

      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [gameState, bestScore, resize, getLaneX]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', maxWidth: '900px' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }} />
        <img
          ref={playerGifRef}
          src="/imagens/download (3).gif"
          style={{ position: 'absolute', top: 0, left: 0, width: '70px', height: '70px', objectFit: 'contain', pointerEvents: 'none', transition: 'filter 0.3s' }}
          alt="Player"
        />

        {/* Zone flash */}
        {zoneFlash && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', border: `2px solid ${currentZone.accent}`, borderRadius: '15px', padding: '15px 40px', zIndex: 20 }}>
            <h3 style={{ color: currentZone.accent, fontSize: '22px', fontFamily: 'Arial Black', margin: 0, textShadow: `0 0 20px ${currentZone.accent}` }}>
              ~ {zoneFlash} ZONE ~
            </h3>
          </motion.div>
        )}

        {/* Power-up indicator */}
        {powerUpActive && (
          <div style={{ position: 'absolute', top: 90, right: 20, background: 'rgba(0,0,0,0.6)', borderRadius: '12px', padding: '8px 16px', color: '#FFF', fontSize: '14px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.2)', zIndex: 15 }}>
            {powerUpActive}
          </div>
        )}

        {/* START Screen */}
        {gameState === 'START' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', zIndex: 20 }}>
            <h2 style={{ color: '#FFF', fontFamily: 'Arial Black', fontSize: '36px', textShadow: '2px 3px 8px rgba(0,0,0,0.5)', margin: '10px 0' }}>SONIC DASH</h2>
            <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '15px', padding: '20px 30px', textAlign: 'center', maxWidth: '350px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ color: '#CCC', fontSize: '13px', lineHeight: 1.6, margin: '0 0 10px' }}>
                ⬆️ Pular · ⬇️ Deslizar<br/>
                ⬅️ ➡️ Trocar de pista<br/>
                📱 Swipe no celular
              </p>
              <p style={{ color: '#FFD700', fontSize: '13px' }}>5 Zonas · Power-ups · Combos</p>
              <p style={{ color: '#AAA', fontSize: '12px', marginTop: '10px' }}>Recorde: {bestScore}m</p>
            </div>
            <p style={{ color: '#FFF', fontSize: '16px', marginTop: '25px', animation: 'pulse 1.5s infinite' }}>TOQUE PARA COMEÇAR</p>
          </div>
        )}

        {/* GAME OVER Screen */}
        {gameState === 'GAMEOVER' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', zIndex: 20 }}>
            <h2 style={{ color: '#FF5252', fontFamily: 'Arial Black', fontSize: '36px', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>GAME OVER</h2>
            <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '18px', padding: '22px 45px', margin: '15px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ color: '#FFF', fontSize: '20px' }}>Distância: <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{score}m</span></p>
              <p style={{ color: '#FFD700', fontSize: '16px', marginTop: '8px' }}>💍 Anéis: {rings}</p>
              <p style={{ color: '#00FFFF', fontSize: '14px', marginTop: '6px' }}>Zona: {currentZone.name}</p>
              <p style={{ color: '#aaa', fontSize: '13px', marginTop: '8px' }}>Melhor: {bestScore}m</p>
            </div>
            <p style={{ color: '#FFF', fontSize: '14px' }}>Toque para recomeçar</p>
          </div>
        )}
      </div>
      <button onClick={(e) => { UISound.play("click"); onClose(e); }} style={{ position: 'absolute', top: 15, left: 15, padding: '8px 18px', background: 'rgba(0,0,0,0.6)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', backdropFilter: 'blur(5px)', zIndex: 30 }}>Voltar</button>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </motion.div>
  );
}
