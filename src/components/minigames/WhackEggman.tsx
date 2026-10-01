import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UISound } from "../../utils/audio";
import { motion, AnimatePresence } from 'framer-motion';

const HOLES = [
  { x: 15, y: 20 }, { x: 50, y: 20 }, { x: 85, y: 20 },
  { x: 15, y: 50 }, { x: 50, y: 50 }, { x: 85, y: 50 },
  { x: 15, y: 80 }, { x: 50, y: 80 }, { x: 85, y: 80 },
];

interface Mole {
  holeIndex: number;
  type: 'eggman' | 'badnik' | 'ring';
  timeLeft: number;
  whacked: boolean;
  appearing: boolean;
}

export default function WhackEggman({ onClose }: { onClose: () => void }) {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('whack_best') || '0'));
  const [timeLeft, setTimeLeft] = useState(30);
  const [moles, setMoles] = useState<Mole[]>([]);
  const [whackEffects, setWhackEffects] = useState<{ x: number; y: number; text: string; color: string; id: number }[]>([]);

  const gameInterval = useRef<ReturnType<typeof setInterval>>();
  const spawnInterval = useRef<ReturnType<typeof setInterval>>();

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(30);
    setMoles([]);
    setWhackEffects([]);
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
            localStorage.setItem('whack_best', best.toString());
            return s;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, bestScore]);

  // Spawn moles
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const spawn = () => {
      setMoles(prev => {
        const occupied = new Set(prev.filter(m => !m.whacked).map(m => m.holeIndex));
        const available = Array.from({ length: 9 }, (_, i) => i).filter(i => !occupied.has(i));
        if (available.length === 0) return prev;
        
        const holeIndex = available[Math.floor(Math.random() * available.length)];
        const rand = Math.random();
        const type = rand > 0.8 ? 'ring' : (rand > 0.4 ? 'eggman' : 'badnik');
        const newMole: Mole = {
          holeIndex,
          type,
          timeLeft: type === 'ring' ? 60 : (type === 'eggman' ? 80 : 50),
          whacked: false,
          appearing: true,
        };
        return [...prev, newMole];
      });
    };

    spawnInterval.current = setInterval(spawn, 800);
    return () => clearInterval(spawnInterval.current);
  }, [gameState]);

  // Update moles
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    gameInterval.current = setInterval(() => {
      setMoles(prev => prev.map(m => ({ ...m, timeLeft: m.timeLeft - 1 })).filter(m => m.timeLeft > 0 || m.whacked));
    }, 50);
    return () => clearInterval(gameInterval.current);
  }, [gameState]);

  const whackMole = useCallback((holeIndex: number) => {
    if (gameState !== 'PLAYING') return;
    
    setMoles(prev => {
      const mole = prev.find(m => m.holeIndex === holeIndex && !m.whacked);
      if (!mole) return prev;

      const hole = HOLES[holeIndex];
      let points = 0;
      let text = '';
      let color = '';

      if (mole.type === 'eggman') {
        points = 10;
        text = '+10';
        color = '#FFD700';
      } else if (mole.type === 'badnik') {
        points = 5;
        text = '+5';
        color = '#4CAF50';
      } else {
        points = -3;
        text = '-3';
        color = '#FF5252';
      }

      setScore(s => Math.max(0, s + points));
      setWhackEffects(prev => [...prev, { x: hole.x, y: hole.y - 8, text, color, id: Math.random() }]);
      setTimeout(() => {
        setWhackEffects(prev => prev.slice(1));
      }, 800);

      return prev.map(m => m.holeIndex === holeIndex && !m.whacked ? { ...m, whacked: true, timeLeft: 15 } : m);
    });
  }, [gameState]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'linear-gradient(180deg, #42A5F5 0%, #64B5F6 15%, #90CAF9 30%, #81C784 50%, #66BB6A 60%, #43A047 75%, #2E7D32 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, fontFamily: 'Arial, sans-serif', overflow: 'hidden'
      }}
    >
      <button onClick={(e) => { UISound.play("click"); onClose(e); }} style={{
        position: 'absolute', top: 15, left: 15, padding: '8px 18px',
        background: 'rgba(0,0,0,0.5)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '8px', cursor: 'pointer', fontSize: '14px', zIndex: 10
      }}>Voltar</button>

      {/* Sun with rays */}
      <div style={{
        position: 'absolute', top: '3%', right: '8%', width: '90px', height: '90px',
        borderRadius: '50%', background: 'radial-gradient(circle, #FFF9C4, #FFEB3B)',
        boxShadow: '0 0 50px #FFD700, 0 0 100px rgba(255,152,0,0.4), 0 0 150px rgba(255,152,0,0.15)'
      }} />
      {/* Sun rays */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div key={`ray${i}`}
          animate={{ opacity: [0.08, 0.15, 0.08] }}
          transition={{ repeat: Infinity, duration: 3, delay: i * 0.3 }}
          style={{
            position: 'absolute', top: '3%', right: '8%',
            width: '3px', height: '120px',
            background: 'linear-gradient(to bottom, #FFD700, transparent)',
            transformOrigin: '50% 0', transform: `rotate(${i * 45}deg)`,
            pointerEvents: 'none'
          }}
        />
      ))}

      {/* Clouds - Layer 1 */}
      <motion.div animate={{ x: [0, 40, 0] }} transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '6%', left: '10%' }}>
        <div style={{ width: '110px', height: '38px', borderRadius: '22px', background: 'rgba(255,255,255,0.85)', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }} />
        <div style={{ width: '65px', height: '28px', borderRadius: '16px', background: 'rgba(255,255,255,0.85)', marginTop: '-16px', marginLeft: '35px' }} />
      </motion.div>
      <motion.div animate={{ x: [0, -25, 0] }} transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '12%', left: '55%' }}>
        <div style={{ width: '80px', height: '28px', borderRadius: '16px', background: 'rgba(255,255,255,0.7)' }} />
        <div style={{ width: '50px', height: '22px', borderRadius: '12px', background: 'rgba(255,255,255,0.7)', marginTop: '-12px', marginLeft: '20px' }} />
      </motion.div>

      {/* Butterflies */}
      <motion.div animate={{ x: [0, 100, 200, 100, 0], y: [0, -30, 0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '25%', left: '5%', fontSize: '18px', pointerEvents: 'none' }}>🦋</motion.div>
      <motion.div animate={{ x: [0, -80, -160, -80, 0], y: [0, 20, 0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '20%', right: '15%', fontSize: '14px', pointerEvents: 'none' }}>🦋</motion.div>

      {/* Flowers at bottom */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div key={`flower${i}`}
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 2 + i * 0.3, ease: 'easeInOut' }}
          style={{
            position: 'absolute', bottom: `${2 + (i % 3) * 3}%`,
            left: `${5 + i * 8}%`, fontSize: `${10 + (i % 3) * 4}px`,
            pointerEvents: 'none', transformOrigin: 'bottom center'
          }}
        >{['🌻', '🌸', '🌼', '🌺'][i % 4]}</motion.div>
      ))}

      {gameState === 'START' && (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ textAlign: 'center', zIndex: 5 }}>
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>
            <div style={{ fontSize: '60px' }}>🔨</div>
          </motion.div>
          <h2 style={{ fontSize: '32px', fontFamily: 'Arial Black', color: '#FFF', textShadow: '2px 3px 5px rgba(0,0,0,0.3)', margin: '10px 0' }}>WHACK-A-EGGMAN</h2>
          <p style={{ color: '#FFF', fontSize: '15px', textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>Acerte o Eggman e os robôs!</p>
          <p style={{ color: '#FFD700', fontSize: '14px' }}>Eggman = +10 | Robô = +5</p>
          <p style={{ color: '#FF5252', fontSize: '14px' }}>Anel = -3 (não acerte!)</p>
          <p style={{ color: '#FFF', fontSize: '14px', marginTop: '10px' }}>Recorde: {bestScore}</p>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={(e) => { UISound.play("click"); startGame(e); }}
            style={{
              marginTop: '20px', padding: '14px 40px', fontSize: '18px', fontWeight: 'bold',
              background: 'linear-gradient(135deg, #F44336, #C62828)', color: '#FFF',
              border: 'none', borderRadius: '12px', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(244,67,54,0.4)'
            }}
          >JOGAR!</motion.button>
        </motion.div>
      )}

      {(gameState === 'PLAYING' || gameState === 'GAMEOVER') && (
        <>
          {/* Stats */}
          <div style={{
            position: 'absolute', top: 15, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '30px', fontSize: '18px', fontWeight: 'bold', color: '#FFF',
            textShadow: '1px 1px 3px rgba(0,0,0,0.3)', zIndex: 5
          }}>
            <span>Score: <span style={{ color: '#FFD700' }}>{score}</span></span>
            <span style={{ color: timeLeft <= 5 ? '#FF5252' : '#FFF' }}>{timeLeft}s</span>
          </div>

          {/* Game Board */}
          <div style={{
            position: 'relative', width: '90vw', maxWidth: '450px', aspectRatio: '1',
            cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 40 40\'><text y=\'30\' font-size=\'30\'>🔨</text></svg>") 20 20, pointer'
          }}>
            {HOLES.map((hole, i) => {
              const mole = moles.find(m => m.holeIndex === i && !m.whacked);
              const whackedMole = moles.find(m => m.holeIndex === i && m.whacked);

              return (
                <div
                  key={i}
                  onClick={() => { UISound.play("click"); whackMole(i)}}
                  style={{
                    position: 'absolute',
                    left: `${hole.x - 12}%`,
                    top: `${hole.y - 8}%`,
                    width: '24%',
                    height: '16%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                    cursor: 'inherit',
                  }}
                >
                  {/* Mole character */}
                  <AnimatePresence>
                    {mole && (
                      <motion.div
                        initial={{ y: 50, scale: 0.5 }}
                        animate={{ y: 0, scale: 1 }}
                        exit={{ y: 50, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        style={{
                          fontSize: 'clamp(28px, 6vw, 45px)', lineHeight: 1,
                          filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))',
                          zIndex: 3
                        }}
                      >
                        {mole.type === 'eggman' ? '🥸' : (mole.type === 'badnik' ? '🤖' : '💍')}
                      </motion.div>
                    )}
                    {whackedMole && (
                      <motion.div
                        initial={{ scale: 1.3, rotate: 0 }}
                        animate={{ scale: 0, rotate: 45, y: -20 }}
                        transition={{ duration: 0.3 }}
                        style={{ position: 'absolute', fontSize: 'clamp(28px, 6vw, 45px)', zIndex: 3 }}
                      >
                        {whackedMole.type === 'eggman' ? '😵' : (whackedMole.type === 'badnik' ? '💥' : '😢')}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hole */}
                  <div style={{
                    width: '100%', height: '40%', borderRadius: '50%',
                    background: 'radial-gradient(ellipse, #3E2723, #5D4037)',
                    border: '3px solid #4E342E',
                    boxShadow: 'inset 0 5px 15px rgba(0,0,0,0.6)',
                    zIndex: 2
                  }} />
                </div>
              );
            })}

            {/* Whack effects */}
            <AnimatePresence>
              {whackEffects.map(e => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -40, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{
                    position: 'absolute', left: `${e.x}%`, top: `${e.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: '24px', fontWeight: 'bold', color: e.color,
                    textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                    pointerEvents: 'none', zIndex: 10
                  }}
                >{e.text}</motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Game Over overlay */}
          <AnimatePresence>
            {gameState === 'GAMEOVER' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', zIndex: 20
                }}
              >
                <h2 style={{ fontSize: '36px', fontFamily: 'Arial Black', color: '#FFD700' }}>TEMPO ESGOTADO!</h2>
                <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '15px', padding: '20px 40px', margin: '15px', textAlign: 'center' }}>
                  <p style={{ color: '#FFF', fontSize: '22px' }}>Score: <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{score}</span></p>
                  <p style={{ color: '#aaa', fontSize: '14px', marginTop: '5px' }}>Melhor: {bestScore}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={(e) => { UISound.play("click"); startGame(e); }}
                  style={{
                    marginTop: '15px', padding: '12px 35px', fontSize: '16px', fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #F44336, #C62828)', color: '#FFF',
                    border: 'none', borderRadius: '12px', cursor: 'pointer'
                  }}
                >JOGAR DE NOVO</motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
