import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HalfPipe: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  
  const stateRef = useRef({ 
    rings: 0, 
    level: 1, 
    playerAngle: Math.PI / 2, // 90 degrees (bottom)
    items: [] as { id: number, z: number, angle: number, type: 'ring' | 'bomb', active: boolean }[],
    particles: [] as { x: number, y: number, vx: number, vy: number, life: number, color: string }[],
    speed: 20,
    zOffset: 0,
    itemId: 0
  });

  useEffect(() => {
    if (!started || gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let keys: Record<string, boolean> = {};

    const keyDown = (e: KeyboardEvent) => { keys[e.key] = true; };
    const keyUp = (e: KeyboardEvent) => { keys[e.key] = false; };
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    const handleMouseMove = (e: MouseEvent) => {
      const pct = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
      const targetAngle = Math.PI - (pct * Math.PI);
      stateRef.current.playerAngle = Math.max(0.2, Math.min(Math.PI - 0.2, targetAngle));
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;
      const pct = Math.max(0, Math.min(1, e.touches[0].clientX / window.innerWidth));
      const targetAngle = Math.PI - (pct * Math.PI);
      stateRef.current.playerAngle = Math.max(0.2, Math.min(Math.PI - 0.2, targetAngle));
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const draw = () => {
      const state = stateRef.current;
      
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
      }

      const focalLength = 300;
      const cx = canvas.width / 2;
      const cy = canvas.height / 3;
      const R = 300;

      const project = (angle: number, z: number) => {
        const zSafe = Math.max(z, -focalLength + 1);
        const scale = focalLength / (focalLength + zSafe);
        const x = cx + Math.cos(angle) * R * scale;
        const y = cy + Math.sin(angle) * R * scale;
        return { x, y, scale };
      };

      const themes = [
        { bg1: '#090a0f', bg2: '#1b1130', line1: '0, 242, 254', line2: '255, 65, 108', player: '#00f2fe' }, // Synthwave
        { bg1: '#020d02', bg2: '#002200', line1: '0, 255, 0', line2: '0, 150, 0', player: '#55ff55' }, // Matrix
        { bg1: '#2b1d06', bg2: '#4a2c00', line1: '255, 215, 0', line2: '255, 69, 0', player: '#ffd700' }, // Golden
        { bg1: '#1a0033', bg2: '#330066', line1: '255, 0, 255', line2: '0, 255, 255', player: '#ff00ff' }, // Plasma
        { bg1: '#051122', bg2: '#002266', line1: '170, 221, 255', line2: '0, 200, 255', player: '#ffffff' }, // Ice
      ];
      const theme = themes[(state.level - 1) % themes.length];

      // Fundo Dinâmico
      let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, theme.bg1);
      bgGrad.addColorStop(0.5, theme.bg2);
      bgGrad.addColorStop(1, theme.bg1);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sol / Portal no horizonte
      const sunGrad = ctx.createRadialGradient(cx, cy - 50, 0, cx, cy - 50, 150);
      sunGrad.addColorStop(0, `rgba(${theme.line2}, 0.8)`);
      sunGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Keyboard Input (Fallback se não usar o mouse)
      if (keys['ArrowLeft'] || keys['a']) state.playerAngle = Math.min(Math.PI - 0.2, state.playerAngle + 0.1);
      if (keys['ArrowRight'] || keys['d']) state.playerAngle = Math.max(0.2, state.playerAngle - 0.1);

      state.zOffset += state.speed;

      // Spawn items
      if (Math.random() < 0.05 + state.level * 0.015) {
         state.items.push({
           id: state.itemId++,
           z: 3000,
           angle: Math.random() * (Math.PI - 0.4) + 0.2,
           type: Math.random() < 0.15 ? 'bomb' : 'ring',
           active: true
         });
      }

      // Draw Tunnel Floor (Grid)
      ctx.lineWidth = 2;
      for (let a = 0; a <= Math.PI; a += Math.PI / 12) {
        ctx.beginPath();
        let p1 = project(a, 0);
        let p2 = project(a, 3000);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(${theme.line1}, 0.3)`;
        ctx.stroke();
      }

      for (let z = state.zOffset % 200; z < 3000; z += 200) {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI; a += 0.1) {
           let p = project(a, z);
           if (a === 0) ctx.moveTo(p.x, p.y);
           else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = `rgba(${theme.line2}, ${1 - z/3000})`;
        ctx.stroke();
      }

      // Sort items back to front for proper 3D rendering
      state.items.sort((a, b) => b.z - a.z);

      state.items.forEach(item => {
        if (!item.active) return;
        item.z -= state.speed;
        
        let p = project(item.angle, item.z);
        if (item.z < -focalLength) item.active = false;

        // Collision Check
        if (Math.abs(item.z - 50) < 60 && Math.abs(item.angle - state.playerAngle) < 0.35) {
           item.active = false;
           if (item.type === 'ring') {
              state.rings++;
              setScore(state.rings);
              if (state.rings % 20 === 0) {
                 state.level++;
                 setLevel(state.level);
                 state.speed += 3; // Fica mais rápido a cada nível
                 // Flash tela
                 ctx.fillStyle = 'rgba(255,255,255,0.8)';
                 ctx.fillRect(0,0,canvas.width,canvas.height);
              }
              for(let i=0; i<20; i++) {
                 state.particles.push({
                    x: p.x, y: p.y,
                    vx: (Math.random()-0.5)*20, vy: (Math.random()-0.5)*20,
                    life: 1, color: '#f6d365'
                 });
              }
           } else if (item.type === 'bomb') {
              setGameOver(true);
           }
        }

        if (item.z > -focalLength + 50 && item.z < 3000 && item.active) {
           if (item.type === 'ring') {
              ctx.beginPath();
              ctx.arc(p.x, p.y, Math.max(2, 45 * p.scale), 0, Math.PI * 2);
              ctx.strokeStyle = '#f6d365';
              ctx.lineWidth = Math.max(2, 12 * p.scale);
              ctx.shadowColor = '#f6d365'; ctx.shadowBlur = 20;
              ctx.stroke();
              ctx.shadowBlur = 0;
           } else {
              ctx.beginPath();
              ctx.arc(p.x, p.y, Math.max(2, 40 * p.scale), 0, Math.PI * 2);
              ctx.fillStyle = '#ff416c';
              ctx.fill();
              ctx.shadowColor = '#ff416c'; ctx.shadowBlur = 25;
              ctx.fill();
              ctx.shadowBlur = 0;
              // Detalhe da bomba
              ctx.beginPath();
              ctx.arc(p.x, p.y, Math.max(1, 10 * p.scale), 0, Math.PI * 2);
              ctx.fillStyle = '#fff';
              ctx.fill();
           }
        }
      });

      state.items = state.items.filter(i => i.active);

      // Draw Particles
      state.particles.forEach(p => {
         p.x += p.vx; p.y += p.vy; p.life -= 0.04;
         ctx.fillStyle = p.color;
         ctx.globalAlpha = Math.max(0, p.life);
         const radius = Math.max(0.1, 5 * p.life);
         ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI*2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      state.particles = state.particles.filter(p => p.life > 0);

      // Draw Player (Energy Orb)
      let pp = project(state.playerAngle, 50);
      
      // Halo exterior
      ctx.beginPath();
      ctx.arc(pp.x, pp.y, 50 * pp.scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${theme.line1}, 0.3)`;
      ctx.fill();
      
      // Núcleo
      ctx.beginPath();
      ctx.arc(pp.x, pp.y, 35 * pp.scale, 0, Math.PI * 2);
      ctx.fillStyle = theme.player;
      ctx.shadowColor = theme.player; ctx.shadowBlur = 40;
      ctx.fill();
      ctx.shadowBlur = 0;

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrame);
    };
  }, [started, gameOver]);

  if (!started) {
     return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: 'radial-gradient(circle at center, #0f0c29, #302b63, #24243e)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: 'Inter, sans-serif' }}>
          <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', padding: '50px', borderRadius: '30px', border: '1px solid rgba(0,242,254,0.3)', textAlign: 'center', maxWidth: '500px', boxShadow: '0 0 60px rgba(0,242,254,0.1)' }}>
             <h1 style={{ color: '#00f2fe', fontSize: '48px', fontWeight: '900', margin: '0 0 10px 0', textShadow: '0 0 20px #00f2fe', letterSpacing: '2px' }}>NEON HALFPIPE</h1>
             <p style={{ color: '#CCC', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
                Deslize pelo túnel infinito. Colete argolas. Desvie das bombas vermelhas.<br/>A velocidade e o ambiente mudam a cada nível.<br/>Use o <strong>Mouse</strong>, <strong>Toque</strong> ou <strong>Setas Esquerda/Direita</strong>.
             </p>
             <motion.button 
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px #f6d365' }} whileTap={{ scale: 0.95 }}
                onClick={() => setStarted(true)} 
                style={{ padding: '15px 40px', background: 'linear-gradient(90deg, #f6d365, #fda085)', color: '#000', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Acelerar
             </motion.button>
          </div>
        </motion.div>
     );
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: '#05030f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: 'Inter, sans-serif' }}>
      
      {/* HUD Moderno */}
      <div style={{ position: 'absolute', top: 40, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 50px', color: '#FFF', zIndex: 10 }}>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '15px', border: '1px solid rgba(246, 211, 101, 0.3)', backdropFilter: 'blur(10px)' }}>
           <div style={{ fontSize: '12px', color: '#f6d365', textTransform: 'uppercase', letterSpacing: '2px' }}>Argolas</div>
           <div style={{ fontSize: '24px', fontWeight: '900', textShadow: '0 0 10px #f6d365' }}>{score}</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '15px', border: '1px solid rgba(0, 242, 254, 0.3)', backdropFilter: 'blur(10px)', textAlign: 'right' }}>
           <div style={{ fontSize: '12px', color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '2px' }}>Velocidade</div>
           <div style={{ fontSize: '24px', fontWeight: '900', textShadow: '0 0 10px #00f2fe' }}>Nível {level}</div>
        </div>
      </div>
      
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
         <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      <AnimatePresence>
         {gameOver && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', padding: '50px', borderRadius: '30px', border: '1px solid #ff416c', textAlign: 'center', boxShadow: '0 0 100px rgba(255,65,108,0.3)', zIndex: 20 }}>
               <h2 style={{ color: '#ff416c', fontSize: '40px', margin: '0 0 20px 0', textShadow: '0 0 20px #ff416c' }}>COLISÃO DETECTADA</h2>
               <div style={{ fontSize: '20px', color: '#FFF', marginBottom: '30px' }}>Você coletou <strong style={{ color: '#f6d365' }}>{score}</strong> argolas.</div>
               <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => { 
                      stateRef.current = { rings: 0, level: 1, playerAngle: Math.PI / 2, items: [], particles: [], speed: 20, zOffset: 0, itemId: 0 };
                      setScore(0); setLevel(1); setGameOver(false); 
                  }} style={{ padding: '15px 40px', background: '#ff416c', color: '#FFF', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>Reiniciar Corrida</motion.button>
                  <button onClick={onClose} style={{ padding: '15px 30px', background: 'transparent', color: '#AAA', border: '1px solid #555', borderRadius: '30px', cursor: 'pointer' }}>Sair</button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {!gameOver && (
         <button onClick={onClose} style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', padding: '12px 30px', background: 'rgba(0,0,0,0.5)', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', cursor: 'pointer', backdropFilter: 'blur(5px)', zIndex: 10 }}>Sair da Simulação</button>
      )}
    </div>
  );
};
export default HalfPipe;

