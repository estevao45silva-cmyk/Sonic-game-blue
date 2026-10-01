import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UISound } from "../../utils/audio";
import { motion, AnimatePresence } from 'framer-motion';

const CELL_SIZE = 50;

const BlueSphere: React.FC<{ onClose: () => void, addGlobalRings: (a: number) => void }> = ({ onClose, addGlobalRings }) => {
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [grid, setGrid] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [targetScore, setTargetScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [particles, setParticles] = useState<{id:number, x:number, y:number, color:string}[]>([]);

  const particleId = useRef(0);

  const spawnParticles = (x: number, y: number, color: string) => {
    const newParticles = Array.from({ length: 5 }).map(() => ({
      id: particleId.current++, x, y, color
    }));
    setParticles(p => [...p, ...newParticles]);
    setTimeout(() => {
      setParticles(p => p.filter(part => !newParticles.find(np => np.id === part.id)));
    }, 600);
  };

  const generateGrid = useCallback((lvl: number) => {
    let size = Math.min(12, 5 + lvl); 
    let winTarget = 5 + lvl * 3;
    let redCount = lvl * 2;
    
    let newGrid = Array(size).fill(0).map(() => Array(size).fill(0));
    let blues = 0;
    while (blues < winTarget) {
      let rx = Math.floor(Math.random() * size);
      let ry = Math.floor(Math.random() * size);
      if (newGrid[ry][rx] === 0 && (rx !== 0 || ry !== 0)) { newGrid[ry][rx] = 1; blues++; }
    }
    
    let reds = 0;
    while (reds < redCount) {
      let rx = Math.floor(Math.random() * size);
      let ry = Math.floor(Math.random() * size);
      if (newGrid[ry][rx] === 0 && (rx !== 0 || ry !== 0)) { newGrid[ry][rx] = 2; reds++; }
    }
    
    setTargetScore(winTarget);
    setGrid(newGrid);
    setPlayer({ x: 0, y: 0 });
    setScore(0);
    setWin(false);
    setGameOver(false);
  }, []);

  useEffect(() => { generateGrid(level); }, [level, generateGrid]);

  useEffect(() => {
    if (!started || gameOver || win) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      let { x, y } = player;
      let size = grid.length;
      if (e.key === 'ArrowUp') x = Math.max(0, x - 1);
      if (e.key === 'ArrowDown') x = Math.min(size - 1, x + 1);
      if (e.key === 'ArrowLeft') y = Math.max(0, y - 1);
      if (e.key === 'ArrowRight') y = Math.min(size - 1, y + 1);

      if (x !== player.x || y !== player.y) {
        let cell = grid[x][y];
        if (cell === 2) {
          UISound.play('lose'); setGameOver(true);
        } else if (cell === 1) {
          let newGrid = [...grid];
          newGrid[x][y] = 3; 
          setGrid(newGrid);
          spawnParticles(x, y, '#4FACFE');
          if (score + 1 >= targetScore) setWin(true);
          setScore(s => s + 1);
          addGlobalRings(1); // Give a point/ring globally for every sphere collected
        }
        setPlayer({ x, y });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, player, grid, gameOver, win, score, targetScore]);

  if (!started) {
     return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: 'radial-gradient(circle at center, #1a0b2e, #000)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: 'Inter, sans-serif' }}>
          <div style={{ background: 'rgba(20, 10, 40, 0.6)', backdropFilter: 'blur(20px)', padding: '50px', borderRadius: '30px', border: '1px solid rgba(138, 43, 226, 0.3)', textAlign: 'center', maxWidth: '500px', boxShadow: '0 0 50px rgba(138, 43, 226, 0.2)' }}>
             <h1 style={{ color: '#00f2fe', textShadow: '0 0 20px #00f2fe', fontSize: '48px', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '2px' }}>NEON SPHERE</h1>
             <p style={{ color: '#b3a0cc', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
                Navegue no grid cibernético com as setas.<br/>Colete as orbes azuis. Evite as vermelhas.<br/>Bem-vindo ao próximo nível.
             </p>
             <motion.button 
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px #00f2fe' }} whileTap={{ scale: 0.95 }}
                onClick={() => { UISound.play("click"); setStarted(true)}} 
                style={{ padding: '15px 40px', background: 'linear-gradient(90deg, #4FACFE, #00f2fe)', color: '#000', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Iniciar Sistema
             </motion.button>
          </div>
        </motion.div>
     );
  }

  const boardSize = grid.length * CELL_SIZE;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: 'radial-gradient(circle at top, #1a0b2e, #000)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      
      {/* HUD Moderno */}
      <div style={{ position: 'absolute', top: 40, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 50px', color: '#FFF' }}>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '15px', border: '1px solid rgba(0,242,254,0.3)', backdropFilter: 'blur(10px)' }}>
           <div style={{ fontSize: '12px', color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '2px' }}>Progresso</div>
           <div style={{ fontSize: '24px', fontWeight: '900', textShadow: '0 0 10px #00f2fe' }}>{score} / {targetScore}</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '15px', border: '1px solid rgba(138,43,226,0.3)', backdropFilter: 'blur(10px)', textAlign: 'right' }}>
           <div style={{ fontSize: '12px', color: '#8a2be2', textTransform: 'uppercase', letterSpacing: '2px' }}>Estágio</div>
           <div style={{ fontSize: '24px', fontWeight: '900', textShadow: '0 0 10px #8a2be2' }}>{level}</div>
        </div>
      </div>

      {/* Grid Isométrico */}
      <div style={{ position: 'relative', width: boardSize, height: boardSize, perspective: '1000px', transformStyle: 'preserve-3d', transform: 'rotateX(60deg) rotateZ(-45deg)', transition: 'all 0.5s ease-in-out' }}>
        {/* Chão */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(138, 43, 226, 0.05)', border: '2px solid rgba(138, 43, 226, 0.3)', boxShadow: '0 0 50px rgba(138, 43, 226, 0.1) inset', display: 'grid', gridTemplateColumns: `repeat(${grid.length}, 1fr)`, gridTemplateRows: `repeat(${grid.length}, 1fr)` }}>
          {Array.from({ length: grid.length * grid.length }).map((_, i) => (
             <div key={i} style={{ border: '1px solid rgba(0, 242, 254, 0.1)' }} />
          ))}
        </div>

        {/* Células e Objetos */}
        {grid.map((row, x) => row.map((cell, y) => {
          if (cell === 0) return null;
          return (
             <div key={`cell-${x}-${y}`} style={{ position: 'absolute', left: y * CELL_SIZE, top: x * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE, transformStyle: 'preserve-3d' }}>
               <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', transform: 'rotateZ(45deg) rotateX(-60deg) translateY(-20px)' }}>
                  {cell === 1 && (
                     <motion.div animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} style={{ width: '25px', height: '25px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #fff, #00f2fe)', boxShadow: '0 0 20px #00f2fe, inset 0 0 10px #fff' }} />
                  )}
                  {cell === 2 && (
                     <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #fff, #ff416c)', boxShadow: '0 0 30px #ff416c, inset 0 0 10px #fff' }} />
                  )}
                  {cell === 3 && (
                     <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.2)', border: '1px solid rgba(0, 242, 254, 0.5)' }} />
                  )}
               </div>
             </div>
          );
        }))}

        {/* Partículas */}
        {particles.map(p => (
           <motion.div key={p.id} initial={{ x: p.y * CELL_SIZE + 25, y: p.x * CELL_SIZE + 25, opacity: 1, scale: 1 }} animate={{ x: p.y * CELL_SIZE + 25 + (Math.random() - 0.5) * 100, y: p.x * CELL_SIZE + 25 + (Math.random() - 0.5) * 100, opacity: 0, scale: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', background: p.color, boxShadow: `0 0 10px ${p.color}`, pointerEvents: 'none' }} />
        ))}

        {/* Jogador */}
        <motion.div initial={false} animate={{ left: player.y * CELL_SIZE, top: player.x * CELL_SIZE }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} style={{ position: 'absolute', width: CELL_SIZE, height: CELL_SIZE, transformStyle: 'preserve-3d' }}>
           <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', transform: 'rotateZ(45deg) rotateX(-60deg) translateY(-25px)' }}>
              <motion.div animate={{ rotateY: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #fff, #8a2be2)', boxShadow: '0 0 30px #8a2be2, 0 0 60px #8a2be2' }} />
           </div>
           {/* Rastro no chão */}
           <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(138,43,226,0.8) 0%, transparent 70%)', transform: 'translateZ(1px)' }} />
        </motion.div>
      </div>

      <AnimatePresence>
         {(win || gameOver) && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', padding: '50px', borderRadius: '30px', border: `1px solid ${win ? '#00f2fe' : '#ff416c'}`, textAlign: 'center', boxShadow: `0 0 100px ${win ? 'rgba(0,242,254,0.3)' : 'rgba(255,65,108,0.3)'}` }}>
               <h2 style={{ color: win ? '#00f2fe' : '#ff416c', fontSize: '40px', margin: '0 0 20px 0', textShadow: `0 0 20px ${win ? '#00f2fe' : '#ff416c'}` }}>
                  {win ? 'SISTEMA INVADIDO' : 'FALHA CRÍTICA'}
               </h2>
               <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
                  {win ? (
                     <motion.button whileHover={{ scale: 1.05 }} onClick={() => { UISound.play("click"); setLevel(l => l + 1)}} style={{ padding: '15px 40px', background: '#00f2fe', color: '#000', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>Próximo Nível</motion.button>
                  ) : (
                     <motion.button whileHover={{ scale: 1.05 }} onClick={() => { UISound.play("click");  setLevel(1); generateGrid(1);}} style={{ padding: '15px 40px', background: '#ff416c', color: '#FFF', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>Reiniciar</motion.button>
                  )}
                  <button onClick={(e) => { UISound.play("click"); onClose(e); }} style={{ padding: '15px 30px', background: 'transparent', color: '#AAA', border: '1px solid #555', borderRadius: '30px', cursor: 'pointer' }}>Sair</button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {!win && !gameOver && (
         <button onClick={(e) => { UISound.play("click"); onClose(e); }} style={{ position: 'absolute', bottom: 40, padding: '12px 30px', background: 'rgba(0,0,0,0.5)', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', cursor: 'pointer', backdropFilter: 'blur(5px)' }}>Abortar Missão</button>
      )}
    </div>
  );
};
export default BlueSphere;

