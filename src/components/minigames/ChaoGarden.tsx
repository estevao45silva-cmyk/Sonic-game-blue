import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UISound } from "../../utils/audio";
import { motion, AnimatePresence } from 'framer-motion';

/* ════════════════════════════════════════════════
   HOOK: localStorage persistente
   ════════════════════════════════════════════════ */
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try { const item = window.localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; }
    catch { return initialValue; }
  });
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const v = value instanceof Function ? value(storedValue) : value;
      setStoredValue(v);
      window.localStorage.setItem(key, JSON.stringify(v));
    } catch (e) { console.error(e); }
  };
  return [storedValue, setValue] as const;
}

/* ════════════════════════════════════════════════
   ESTILOS GLOBAIS DO PET
   ════════════════════════════════════════════════ */
const COLORS = {
  primary: '#00f2fe',
  secondary: '#4FACFE',
  accent: '#f6d365',
  danger: '#ff416c',
  success: '#2ecc71',
  purple: '#a18cd1',
  dark: '#0a0a1a',
  card: 'rgba(15, 15, 35, 0.85)',
  cardBorder: 'rgba(255,255,255,0.08)',
  text: '#FFFFFF',
  textMuted: '#8892b0',
};

const glassCard: React.CSSProperties = {
  background: COLORS.card,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: `1px solid ${COLORS.cardBorder}`,
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

const btnBase: React.CSSProperties = {
  border: 'none',
  borderRadius: '16px',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'inherit',
  fontSize: '14px',
};

/* ════════════════════════════════════════════════
   MINIGAME 1: PET RUNNER (melhorado)
   ════════════════════════════════════════════════ */
const RunnerGame: React.FC<{
  onEnd: (coins: number) => void;
  skin: string | null;
}> = ({ onEnd, skin }) => {
  const [phase, setPhase] = useState<'menu' | 'play' | 'over'>('menu');
  const [isJumping, setIsJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [obstacleX, setObstacleX] = useState(400);
  const [groundY] = useState(140);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== 'play') return;
    const interval = setInterval(() => {
      setObstacleX(x => {
        if (x < -40) { setScore(s => s + 1); return 400 + Math.random() * 400; }
        return x - 4 - score * 0.1; // Velocidade reduzida
      });
    }, 30);
    return () => clearInterval(interval);
  }, [phase, score]);

  useEffect(() => {
    if (phase !== 'play') return;
    if (obstacleX < 90 && obstacleX > 20 && !isJumping) {
      setPhase('over');
      setTimeout(() => onEnd(score * 15), 2000);
    }
  }, [obstacleX, isJumping, phase, score, onEnd]);

  const jump = () => {
    if (phase !== 'play' || isJumping) return;
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 550);
  };

  // Touch support
  useEffect(() => {
    if (phase !== 'play') return;
    const handler = (e: KeyboardEvent) => { if (e.code === 'Space' || e.key === 'ArrowUp' || e.code === 'KeyW') jump(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, isJumping]);

  const petEmoji = skin === 'Fantasma' ? '👻' : skin === 'Demônio' ? '😈' : skin === 'Anjo' ? '😇' : skin === 'Dourado' ? '⭐' : '🐾';

  if (phase === 'menu') {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏃‍♂️</div>
        <h3 style={{ margin: '0 0 6px', fontSize: '20px', color: COLORS.primary, fontWeight: '800' }}>Pet Runner</h3>
        <p style={{ color: COLORS.textMuted, fontSize: '13px', marginBottom: '16px' }}>Pule os obstáculos de fogo! Toque ou pressione Espaço.</p>
        <button onClick={() => { UISound.play("click");  setScore(0); setObstacleX(400); setPhase('play');}}
          style={{ ...btnBase, padding: '12px 32px', background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.primary})`, color: '#000', fontSize: '16px' }}>
          Jogar 🔥
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} onClick={(e) => { UISound.play("click"); jump(e); }} onTouchStart={jump}
      style={{ position: 'relative', width: '100%', height: '200px', background: 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%)', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Score */}
      <div style={{ position: 'absolute', top: 12, right: 16, color: COLORS.accent, fontWeight: '900', fontSize: '22px', textShadow: '0 0 10px rgba(246,211,101,0.5)' }}>
        {score}
      </div>
      {/* Ground */}
      <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '30px', background: 'linear-gradient(90deg, #2d1b69, #1a0b2e)' }}>
        <div style={{ position: 'absolute', top: 0, width: '100%', height: '2px', background: `linear-gradient(90deg, transparent, ${COLORS.primary}, transparent)` }} />
      </div>
      {/* Pet */}
      <motion.div animate={{ y: isJumping ? -100 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{ position: 'absolute', left: '50px', bottom: '32px', fontSize: '36px', filter: 'drop-shadow(0 0 10px rgba(79,172,254,0.6))' }}>
        {petEmoji}
      </motion.div>
      {/* Obstacle */}
      <motion.div animate={{ x: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.3 }}
        style={{ position: 'absolute', left: obstacleX, bottom: '30px', fontSize: '36px' }}>
        🔥
      </motion.div>
      {/* Game Over */}
      {phase === 'over' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#FFF' }}>
          <h2 style={{ fontSize: '28px', color: COLORS.danger, margin: '0 0 8px' }}>GAME OVER</h2>
          <p style={{ fontSize: '18px' }}>+<strong style={{ color: COLORS.accent }}>{score * 15}</strong> moedas!</p>
        </motion.div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════
   MINIGAME 2: CHUVA DE FRUTAS (melhorado, touch)
   ════════════════════════════════════════════════ */
const CatcherGame: React.FC<{ onEnd: (coins: number) => void }> = ({ onEnd }) => {
  const [phase, setPhase] = useState<'menu' | 'play' | 'over'>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [fruits, setFruits] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [basketX, setBasketX] = useState(50);

  const fruitEmojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐'];

  useEffect(() => {
    if (phase !== 'play') return;
    const interval = setInterval(() => {
      setFruits(prev => {
        const next = prev.map(f => ({ ...f, y: f.y + 2.5 })).filter(f => f.y < 200); // Mais lento
        if (Math.random() > 0.90) { // Um pouco menos frequente, mais fácil de pegar
          next.push({ id: Date.now() + Math.random(), x: Math.random() * 80 + 10, y: -20, emoji: fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)] });
        }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [phase]);

  // Collision
  useEffect(() => {
    if (phase !== 'play') return;
    setFruits(prev => {
      let caught = 0;
      const remaining = prev.filter(f => {
        if (f.y > 150 && f.y < 195 && Math.abs(f.x - basketX) < 15) { caught++; return false; }
        return true;
      });
      if (caught > 0) setScore(s => s + caught);
      return remaining;
    });
  }, [fruits, basketX, phase]);

  // Timer
  useEffect(() => {
    if (phase !== 'play') return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setPhase('over'); setTimeout(() => onEnd(score * 10), 2000); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, score, onEnd]);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(5, Math.min(95, pct)));
  };

  // Keyboard support for WASD and Arrows
  useEffect(() => {
    if (phase !== 'play') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.code === 'KeyA') {
        setBasketX(prev => Math.max(5, prev - 10));
      } else if (e.key === 'ArrowRight' || e.code === 'KeyD') {
        setBasketX(prev => Math.min(95, prev + 10));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase]);

  if (phase === 'menu') {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🧺</div>
        <h3 style={{ margin: '0 0 6px', fontSize: '20px', color: COLORS.accent, fontWeight: '800' }}>Chuva de Frutas</h3>
        <p style={{ color: COLORS.textMuted, fontSize: '13px', marginBottom: '16px' }}>Mova a cesta para pegar frutas! 30 segundos.</p>
        <button onClick={() => { UISound.play("click");  setScore(0); setTimeLeft(30); setFruits([]); setPhase('play');}}
          style={{ ...btnBase, padding: '12px 32px', background: `linear-gradient(135deg, ${COLORS.accent}, #fda085)`, color: '#000', fontSize: '16px' }}>
          Jogar 🍎
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} onMouseMove={handleMove} onTouchMove={handleMove}
      style={{ position: 'relative', width: '100%', height: '200px', background: 'linear-gradient(to bottom, #0d1117, #161b22)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', touchAction: 'none' }}>
      {/* HUD */}
      <div style={{ position: 'absolute', top: 10, left: 16, color: COLORS.accent, fontWeight: '800', fontSize: '16px' }}>🍎 {score}</div>
      <div style={{ position: 'absolute', top: 10, right: 16, color: timeLeft <= 5 ? COLORS.danger : '#FFF', fontWeight: '800', fontSize: '16px' }}>⏱ {timeLeft}s</div>
      {/* Fruits */}
      {fruits.map(f => (
        <div key={f.id} style={{ position: 'absolute', left: `${f.x}%`, top: f.y, fontSize: '24px', transform: 'translateX(-50%)' }}>{f.emoji}</div>
      ))}
      {/* Basket */}
      <div style={{ position: 'absolute', left: `${basketX}%`, bottom: 5, transform: 'translateX(-50%)', fontSize: '32px' }}>🧺</div>
      {/* Game Over */}
      {phase === 'over' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#FFF' }}>
          <h2 style={{ fontSize: '28px', color: COLORS.accent, margin: '0 0 8px' }}>TEMPO!</h2>
          <p style={{ fontSize: '18px' }}>+<strong style={{ color: COLORS.accent }}>{score * 10}</strong> moedas!</p>
        </motion.div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════
   MINIGAME 3: ARENA DE BATALHA RPG (melhorado)
   ════════════════════════════════════════════════ */
const BattleArena: React.FC<{ petLevel: number; petSkin: string | null; onEnd: (coins: number, won: boolean) => void }> = ({ petLevel, petSkin, onEnd }) => {
  const [phase, setPhase] = useState<'menu' | 'play' | 'over'>('menu');
  const [hp, setHp] = useState(200 + petLevel * 20); // Mais vida pro jogador
  const [enemyHp, setEnemyHp] = useState(80 + petLevel * 5); // Menos vida pro inimigo
  const [log, setLog] = useState<string[]>([]);
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const maxHp = 100 + petLevel * 10;
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const attack = (type: 'light' | 'heavy' | 'heal') => {
    if (turn !== 'player' || result) return;
    if (type === 'light') {
      const dmg = 20 + Math.random() * 15; // Mais dano
      setLog(p => [...p, `⚡ Ataque Rápido: ${Math.floor(dmg)} dano!`]);
      setEnemyHp(h => Math.max(0, h - dmg));
    } else if (type === 'heavy') {
      if (Math.random() > 0.15) { // Erra menos (15% chance de erro em vez de 30%)
        const dmg = 30 + Math.random() * 20;
        setLog(p => [...p, `💥 Crítico! ${Math.floor(dmg)} de dano!`]);
        setEnemyHp(h => Math.max(0, h - dmg));
      } else {
        setLog(p => [...p, `💨 Ataque Pesado errou!`]);
      }
    } else {
      const h = 30;
      setHp(prev => Math.min(maxHp, prev + h));
      setLog(p => [...p, `💚 Curou ${h} HP!`]);
    }
    setTurn('enemy');
  };

  useEffect(() => {
    if (result) return;
    if (enemyHp <= 0) {
      setResult('win');
      setLog(p => [...p, `🏆 VITÓRIA!`]);
      setTimeout(() => onEnd(300 + petLevel * 50, true), 2500);
      return;
    }
    if (hp <= 0) {
      setResult('lose');
      setLog(p => [...p, `💀 Derrota...`]);
      setTimeout(() => onEnd(50, false), 2500);
      return;
    }
    if (turn === 'enemy') {
      setTimeout(() => {
        const dmg = 10 + Math.random() * 15 + petLevel * 2;
        setHp(h => Math.max(0, h - dmg));
        setLog(p => [...p, `👾 Monstro atacou: ${Math.floor(dmg)} dano!`]);
        setTurn('player');
      }, 1200);
    }
  }, [turn, enemyHp, hp, result]);

  const petEmoji = petSkin === 'Demônio' ? '😈' : petSkin === 'Fantasma' ? '👻' : petSkin === 'Anjo' ? '😇' : '🐶';

  if (phase === 'menu') {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚔️</div>
        <h3 style={{ margin: '0 0 6px', fontSize: '20px', color: COLORS.danger, fontWeight: '800' }}>Arena de Batalha</h3>
        <p style={{ color: COLORS.textMuted, fontSize: '13px', marginBottom: '16px' }}>Enfrente monstros! Ganhe XP e Moedas se vencer.</p>
        <button onClick={() => { UISound.play("click");  setHp(maxHp); setEnemyHp(maxHp); setLog([]); setTurn('player'); setResult(null); setPhase('play');}}
          style={{ ...btnBase, padding: '12px 32px', background: `linear-gradient(135deg, ${COLORS.danger}, #ff4b2b)`, color: '#FFF', fontSize: '16px' }}>
          Lutar ⚔️
        </button>
      </div>
    );
  }

  const HpBar = ({ value, max, color, label }: { value: number; max: number; color: string; label: string }) => (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: COLORS.textMuted, marginBottom: '4px' }}>
        <span>{label}</span><span>{Math.floor(value)}/{max}</span>
      </div>
      <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
        <motion.div animate={{ width: `${(value / max) * 100}%` }} transition={{ duration: 0.3 }}
          style={{ height: '100%', background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: '4px' }} />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Combatants */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <motion.div animate={{ x: turn === 'player' ? [0, 10, 0] : 0 }} style={{ fontSize: '40px', marginBottom: '8px' }}>{petEmoji}</motion.div>
          <HpBar value={hp} max={maxHp} color={COLORS.primary} label="Seu Pet" />
        </div>
        <div style={{ fontSize: '24px', color: COLORS.textMuted }}>⚔️</div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <motion.div animate={{ x: turn === 'enemy' ? [0, -10, 0] : 0 }} style={{ fontSize: '40px', marginBottom: '8px' }}>👾</motion.div>
          <HpBar value={enemyHp} max={maxHp} color={COLORS.danger} label="Monstro" />
        </div>
      </div>
      {/* Log */}
      <div ref={logRef} style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '10px', height: '80px', overflowY: 'auto', fontSize: '12px', color: COLORS.textMuted }}>
        {log.map((l, i) => <div key={i} style={{ marginBottom: '4px' }}>{l}</div>)}
      </div>
      {/* Actions */}
      {!result && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <button onClick={() => { UISound.play("click"); attack('light')}} disabled={turn !== 'player'}
            style={{ ...btnBase, padding: '10px', background: turn === 'player' ? COLORS.secondary : '#333', color: '#FFF', opacity: turn === 'player' ? 1 : 0.5 }}>
            ⚡ Rápido
          </button>
          <button onClick={() => { UISound.play("click"); attack('heavy')}} disabled={turn !== 'player'}
            style={{ ...btnBase, padding: '10px', background: turn === 'player' ? COLORS.danger : '#333', color: '#FFF', opacity: turn === 'player' ? 1 : 0.5 }}>
            💥 Pesado
          </button>
          <button onClick={() => { UISound.play("click"); attack('heal')}} disabled={turn !== 'player'}
            style={{ ...btnBase, padding: '10px', background: turn === 'player' ? COLORS.success : '#333', color: '#FFF', opacity: turn === 'player' ? 1 : 0.5 }}>
            💚 Curar
          </button>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════
   MINIGAME 4: QUIZ DO PET (NOVO!)
   ════════════════════════════════════════════════ */
const QuizGame: React.FC<{ onEnd: (coins: number) => void }> = ({ onEnd }) => {
  const allQuestions = [
    { q: 'Qual planeta é conhecido como o Planeta Vermelho?', opts: ['Marte', 'Júpiter', 'Vênus', 'Saturno'], answer: 0 },
    { q: 'Quantas patas tem uma aranha?', opts: ['6', '8', '10', '4'], answer: 1 },
    { q: 'Qual o oceano mais profundo?', opts: ['Atlântico', 'Índico', 'Pacífico', 'Ártico'], answer: 2 },
    { q: 'Qual é o maior animal terrestre?', opts: ['Rinoceronte', 'Hipopótamo', 'Elefante', 'Girafa'], answer: 2 },
    { q: 'Qual é a capital do Japão?', opts: ['Osaka', 'Tóquio', 'Kyoto', 'Nagoia'], answer: 1 },
    { q: 'Quantos ossos tem o corpo humano adulto?', opts: ['150', '206', '300', '180'], answer: 1 },
    { q: 'Qual gás as plantas absorvem?', opts: ['Oxigênio', 'Nitrogênio', 'CO2', 'Hélio'], answer: 2 },
    { q: 'Qual a cor primária que NÃO é?', opts: ['Vermelho', 'Azul', 'Verde', 'Amarelo'], answer: 2 },
  ];
  const [phase, setPhase] = useState<'menu' | 'play' | 'over'>('menu');
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [questions] = useState(() => [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 5));

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === questions[qIndex].answer) setCorrect(c => c + 1);
    setTimeout(() => {
      if (qIndex + 1 >= questions.length) {
        setPhase('over');
        const finalCorrect = i === questions[qIndex].answer ? correct + 1 : correct;
        setTimeout(() => onEnd(finalCorrect * 50), 1500);
      } else {
        setQIndex(q => q + 1);
        setSelected(null);
      }
    }, 1000);
  };

  if (phase === 'menu') {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🧠</div>
        <h3 style={{ margin: '0 0 6px', fontSize: '20px', color: COLORS.purple, fontWeight: '800' }}>Quiz do Pet</h3>
        <p style={{ color: COLORS.textMuted, fontSize: '13px', marginBottom: '16px' }}>5 perguntas rápidas! 50 moedas por acerto.</p>
        <button onClick={() => { UISound.play("click");  setQIndex(0); setCorrect(0); setSelected(null); setPhase('play');}}
          style={{ ...btnBase, padding: '12px 32px', background: `linear-gradient(135deg, ${COLORS.purple}, #fbc2eb)`, color: '#000', fontSize: '16px' }}>
          Começar 🧠
        </button>
      </div>
    );
  }

  if (phase === 'over') {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#FFF' }}>
        <h3 style={{ color: COLORS.accent, fontSize: '24px' }}>Resultado!</h3>
        <p style={{ fontSize: '40px', margin: '10px 0' }}>{correct}/{questions.length}</p>
        <p style={{ color: COLORS.accent }}>+{correct * 50} moedas</p>
      </div>
    );
  }

  const q = questions[qIndex];
  return (
    <div style={{ padding: '16px', color: '#FFF' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: COLORS.textMuted, marginBottom: '12px' }}>
        <span>Pergunta {qIndex + 1}/{questions.length}</span>
        <span>✅ {correct}</span>
      </div>
      <p style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', lineHeight: '1.4' }}>{q.q}</p>
      <div style={{ display: 'grid', gap: '8px' }}>
        {q.opts.map((opt, i) => {
          let bg = 'rgba(255,255,255,0.08)';
          if (selected !== null) {
            if (i === q.answer) bg = COLORS.success;
            else if (i === selected) bg = COLORS.danger;
          }
          return (
            <button key={i} onClick={() => { UISound.play("click"); handleAnswer(i)}}
              style={{ ...btnBase, padding: '12px', background: bg, color: '#FFF', textAlign: 'left', border: '1px solid rgba(255,255,255,0.1)' }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════
   COMPONENTE PRINCIPAL: OASIS PET DX+
   ════════════════════════════════════════════════ */
const ChaoGarden: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [started, setStarted] = useState(false);

  // === Status ===
  const [hunger, setHunger] = useLocalStorage('pet_hunger', 50);
  const [energy, setEnergy] = useLocalStorage('pet_energy', 100);
  const [affection, setAffection] = useLocalStorage('pet_affection', 50);
  const [hygiene, setHygiene] = useLocalStorage('pet_hygiene', 100);
  const [health, setHealth] = useLocalStorage('pet_health', 100);

  const [level, setLevel] = useLocalStorage('pet_level', 1);
  const [xp, setXp] = useLocalStorage('pet_xp', 0);
  const [coins, setCoins] = useLocalStorage('pet_coins', 1000);

  // === Customização ===
  const [personality, setPersonality] = useLocalStorage('pet_personality', '');
  const [evolution, setEvolution] = useLocalStorage<'neutral' | 'hero' | 'dark' | 'dragon' | 'mecha'>('pet_evolution', 'neutral');
  const [inventory, setInventory] = useLocalStorage<string[]>('pet_inventory', []);
  const [foodStock, setFoodStock] = useLocalStorage<Record<string, number>>('pet_foodstock', { apple: 5, pizza: 2, soap: 3, potion: 1, seed: 0 });
  const [equippedHat, setEquippedHat] = useLocalStorage<string | null>('pet_hat', null);
  const [equippedSkin, setEquippedSkin] = useLocalStorage<string | null>('pet_skin', null);
  const [equippedBg, setEquippedBg] = useLocalStorage<string | null>('pet_bg', null);
  const [equippedMinipet, setEquippedMinipet] = useLocalStorage<string | null>('pet_minipet', null);
  const [petHue, setPetHue] = useLocalStorage<number>('pet_hue', 0);
  const [profession, setProfession] = useLocalStorage<string | null>('pet_profession', null);

  // === Sistemas ===
  const [skills, setSkills] = useLocalStorage('pet_skills', { hungerResist: 0, coinBoost: 0, xpBoost: 0 });
  const [skillPoints, setSkillPoints] = useLocalStorage('pet_sp', 0);
  const [furniture, setFurniture] = useLocalStorage<{ id: number; type: string; x: number; y: number }[]>('pet_furn', []);
  const [garden, setGarden] = useLocalStorage<{ id: number; stage: number; plantedAt: number }[]>('pet_garden', []);

  const defaultQuests = [
    { id: 1, type: 'feed', target: 5, current: 0, reward: 200, desc: 'Dê comida 5 vezes' },
    { id: 2, type: 'play', target: 3, current: 0, reward: 300, desc: 'Jogue 3 minigames' },
    { id: 3, type: 'bath', target: 2, current: 0, reward: 150, desc: 'Dê banho 2 vezes' },
  ];
  const [quests, setQuests] = useLocalStorage('pet_quests', defaultQuests);
  const [lastVisit, setLastVisit] = useLocalStorage('pet_last_visit', Date.now());

  // === UI State ===
  const [isSleeping, setIsSleeping] = useState(false);
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'pet'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'games' | 'shop' | 'custom' | 'skills' | 'quests'>('home');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [weather, setWeather] = useLocalStorage<'sun' | 'rain' | 'snow' | 'storm'>('pet_weather', 'sun');
  const [eventMsg, setEventMsg] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  // === Animations ===
  const [isEating, setIsEating] = useState(false);
  const [isBathing, setIsBathing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const xpNeeded = level * 100;

  // ─── Clima ───
  useEffect(() => {
    if (!started) return;
    const wList: ('sun' | 'rain' | 'snow' | 'storm')[] = ['sun', 'sun', 'sun', 'rain', 'snow', 'storm'];
    const int = setInterval(() => setWeather(wList[Math.floor(Math.random() * wList.length)]), 60000);
    return () => clearInterval(int);
  }, [started]);

  // ─── Eventos Aleatórios ───
  useEffect(() => {
    if (!started) return;
    const int = setInterval(() => {
      if (Math.random() > 0.8) {
        setEventMsg('🛸 Um OVNI passou e deixou 100 moedas!');
        setCoins(c => c + 100);
        setTimeout(() => setEventMsg(null), 4000);
      }
    }, 120000);
    return () => clearInterval(int);
  }, [started]);

  // ─── Farm Growth ───
  useEffect(() => {
    if (!started) return;
    const int = setInterval(() => {
      setGarden(prev => prev.map(p => {
        if (p.stage < 3 && Date.now() - p.plantedAt > 60000) return { ...p, stage: p.stage + 1, plantedAt: Date.now() };
        return p;
      }));
    }, 10000);
    return () => clearInterval(int);
  }, [started]);

  // ─── Quest Update ───
  const updateQuest = useCallback((type: string) => {
    setQuests(prev => prev.map(q => {
      if (q.type === type && q.current < q.target) {
        const next = q.current + 1;
        if (next === q.target) {
          setCoins(c => c + q.reward);
          setEventMsg(`🎯 Missão Cumprida: +${q.reward} moedas!`);
          setTimeout(() => setEventMsg(null), 3000);
        }
        return { ...q, current: next };
      }
      return q;
    }));
  }, []);

  // ─── XP System ───
  const gainXp = useCallback((amount: number) => {
    const bonus = 1 + skills.xpBoost * 0.2;
    let newXp = xp + Math.floor(amount * bonus);
    if (newXp >= xpNeeded) {
      newXp -= xpNeeded;
      setLevel(l => l + 1);
      setSkillPoints(sp => sp + 1);
      setCoins(c => c + 500);
      setChatLog(prev => [...prev, { sender: 'pet', text: `🎉 NÍVEL ${level + 1}! Me sinto imparável!` }]);
      if (level + 1 === 20 && evolution === 'neutral') setEvolution('dragon');
    }
    setXp(newXp);
  }, [xp, xpNeeded, level, skills.xpBoost, evolution]);

  // ─── AI Chat ───
  const generateAIResponse = async (userText: string) => {
    setIsTyping(true);
    setChatLog(prev => [...prev, { sender: 'user', text: userText }]);
    let context = `Pet virtual chamado Oasis. Você é ${personality}. Nível ${level}. `;
    if (profession) context += `Sua profissão é ${profession}. `;
    if (health < 50) context += 'Você está doente. ';
    if (weather === 'storm') context += 'Está tendo uma tempestade. ';
    if (equippedSkin) context += `Skin: ${equippedSkin}. `;
    context += `O usuário disse: "${userText}". Responda em Português do Brasil em 1 frase curta.`;
    const seed = Math.floor(Math.random() * 999999);
    try {
      const response = await fetch(`https://text.pollinations.ai/prompt/${encodeURIComponent(context + ` [ID:${seed}]`)}`);
      if (response.ok) {
        let text = await response.text();
        setChatLog(prev => [...prev, { sender: 'pet', text: text.replace(/^"|"$/g, '').trim() }]);
      } else { setChatLog(prev => [...prev, { sender: 'pet', text: '*Te olha com carinho* 🥰' }]); }
    } catch { setChatLog(prev => [...prev, { sender: 'pet', text: '*Pula animado* 🐾' }]); }
    setIsTyping(false);
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatLog]);

  // ─── Degradação Status ───
  useEffect(() => {
    if (!started) return;
    const hoursAway = (Date.now() - lastVisit) / (1000 * 60 * 60);
    if (hoursAway > 1) {
      setHunger(h => Math.max(0, h - Math.floor(hoursAway * 5)));
      setEnergy(e => Math.max(0, e - Math.floor(hoursAway * 3)));
    }
    setLastVisit(Date.now());
    if (!personality) setPersonality(['Preguiçoso', 'Aventureiro', 'Gênio', 'Rei do Camarote'][Math.floor(Math.random() * 4)]);

    const interval = setInterval(() => {
      const hungerDrain = 1 - skills.hungerResist * 0.15;
      if (!isSleeping) {
        setHunger(h => Math.max(0, h - hungerDrain));
        setEnergy(e => Math.max(0, e - 1));
        setAffection(a => Math.max(0, a - 1));
        setHygiene(hy => Math.max(0, hy - 1));
      } else {
        setEnergy(e => Math.min(100, e + 5));
        if (energy >= 100) setIsSleeping(false);
      }
      if (weather === 'rain' && equippedHat === null && !isSleeping) setHealth(he => Math.max(0, he - 2));
      if (hunger < 20 || hygiene < 20) setHealth(he => Math.max(0, he - 2));
      else if (health < 100 && hunger > 50 && hygiene > 50) setHealth(he => Math.min(100, he + 1));
    }, 10000);
    return () => clearInterval(interval);
  }, [started, weather, equippedHat, isSleeping, skills]);

  // ─── Actions ───
  const feedPet = (type: string) => {
    if (isSleeping || foodStock[type] <= 0) return;
    setFoodStock(s => ({ ...s, [type]: s[type] - 1 }));
    updateQuest('feed');
    if (type === 'apple') { setIsEating(true); setHunger(h => Math.min(100, h + 30)); gainXp(15); }
    else if (type === 'pizza') { setIsEating(true); setHunger(h => Math.min(100, h + 60)); setEnergy(e => Math.max(0, e - 10)); gainXp(25); }
    else if (type === 'soap') { setIsBathing(true); setHygiene(100); gainXp(20); updateQuest('bath'); }
    else if (type === 'potion') { setIsEating(true); setHealth(100); setEnergy(100); gainXp(50); }
    setTimeout(() => { setIsEating(false); setIsBathing(false); }, 600);
  };

  const plantSeed = () => {
    if (foodStock['seed'] > 0 && garden.length < 3) {
      setFoodStock(s => ({ ...s, seed: s.seed - 1 }));
      setGarden(g => [...g, { id: Date.now(), stage: 0, plantedAt: Date.now() }]);
    }
  };

  const harvestPlant = (id: number, stage: number) => {
    if (stage === 3) {
      setGarden(g => g.filter(p => p.id !== id));
      setFoodStock(s => ({ ...s, apple: s.apple + 2 }));
      gainXp(50);
    }
  };

  const buyItem = (item: string, cost: number) => {
    if (coins >= cost && !inventory.includes(item)) {
      setCoins(c => c - cost);
      setInventory(prev => [...prev, item]);
      if (item.startsWith('Furn_')) setFurniture(f => [...f, { id: Date.now(), type: item.replace('Furn_', ''), x: 0, y: 0 }]);
    }
  };

  const buyFood = (type: string, cost: number) => {
    if (coins >= cost) {
      setCoins(c => c - cost);
      setFoodStock(s => ({ ...s, [type]: (s[type] || 0) + 1 }));
    }
  };

  const buyLootBox = () => {
    if (coins >= 50) {
      setCoins(c => c - 50);
      const rewards = ['apple', 'pizza', 'soap', 'potion', 'seed', 'coins_200', 'coins_500'];
      const prize = rewards[Math.floor(Math.random() * rewards.length)];
      if (prize.startsWith('coins_')) {
        const val = parseInt(prize.split('_')[1]);
        setCoins(c => c + val);
        setEventMsg(`🎁 Caixa Surpresa: Ganhou ${val} Moedas!`);
      } else {
        setFoodStock(s => ({ ...s, [prize]: (s[prize] || 0) + 2 }));
        const names: any = { apple: '2x Maçãs', pizza: '2x Pizzas', soap: '2x Banhos', potion: '2x Poções', seed: '2x Sementes' };
        setEventMsg(`🎁 Caixa Surpresa: Ganhou ${names[prize]}!`);
      }
      setTimeout(() => setEventMsg(null), 3000);
    }
  };

  // ─── Mood System ───
  const getMood = () => {
    const avg = (hunger + energy + hygiene + health + affection) / 5;
    if (avg > 80) return { emoji: '😄', text: 'Muito Feliz', color: COLORS.success };
    if (avg > 60) return { emoji: '🙂', text: 'Feliz', color: COLORS.primary };
    if (avg > 40) return { emoji: '😐', text: 'Normal', color: COLORS.accent };
    if (avg > 20) return { emoji: '😟', text: 'Triste', color: '#ff9800' };
    return { emoji: '😢', text: 'Muito Triste', color: COLORS.danger };
  };
  const mood = getMood();

  // ─── BG ───
  let bgGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  if (weather === 'rain' || weather === 'storm') bgGradient = 'linear-gradient(135deg, #2c3e50, #0f2027)';
  if (weather === 'snow') bgGradient = 'linear-gradient(135deg, #E0EAFC, #CFDEF3)';
  if (equippedBg === 'Praia') bgGradient = 'linear-gradient(135deg, #0099F7, #F11712 200%)';
  if (equippedBg === 'Cyberpunk') bgGradient = 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)';
  if (equippedBg === 'Arcade') bgGradient = 'linear-gradient(135deg, #2c003e, #ff0055)';

  const weatherIcon = weather === 'sun' ? '☀️' : weather === 'rain' ? '🌧️' : weather === 'snow' ? '❄️' : '⛈️';

  let petSize = Math.min(160, 90 + Math.min(70, level * 4));
  if (evolution === 'dragon' || evolution === 'mecha') petSize += 30;

  // ─── STATUS BAR ───
  const StatusBar = ({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
          <span style={{ fontSize: '11px', fontWeight: '700', color }}>{Math.floor(value)}%</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
          <motion.div initial={false} animate={{ width: `${value}%` }} transition={{ duration: 0.5 }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: '3px' }} />
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  //  TELA INICIAL
  // ═══════════════════════════════════════════
  if (!started) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, #1a1a3e 0%, #0a0a1a 70%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
        {/* Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div key={i} animate={{ y: [-20, -400], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 3 + Math.random() * 4, delay: Math.random() * 3 }}
            style={{ position: 'absolute', bottom: 0, left: `${Math.random() * 100}%`, width: '3px', height: '3px', borderRadius: '50%', background: COLORS.primary, boxShadow: `0 0 6px ${COLORS.primary}` }} />
        ))}
        <div style={{ ...glassCard, padding: 'clamp(30px, 8vw, 60px)', textAlign: 'center', maxWidth: '420px', width: '90%' }}>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}
            style={{ fontSize: 'clamp(60px, 15vw, 80px)', marginBottom: '16px' }}>🐾</motion.div>
          <h1 style={{ background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 'clamp(36px, 8vw, 52px)', fontWeight: '900', margin: '0 0 8px', letterSpacing: '-1px' }}>
            OASIS PET
          </h1>
          <p style={{ color: '#666', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '24px' }}>DX+ PREMIUM EDITION</p>
          <p style={{ color: COLORS.textMuted, fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
            Seu pet virtual definitivo. Alimente, jogue, evolua e conquiste.
          </p>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => { UISound.play("click"); setStarted(true)}}
            style={{ ...btnBase, padding: '16px 48px', background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, color: '#000', fontSize: '18px', fontWeight: '900', letterSpacing: '1px', boxShadow: `0 0 30px ${COLORS.primary}44` }}>
            ENTRAR
          </motion.button>
        </div>
        {/* Back */}
        <button onClick={(e) => { UISound.play("click"); onClose(e); }}
          style={{ ...btnBase, position: 'absolute', top: 20, left: 20, padding: '10px 20px', background: 'rgba(255,255,255,0.05)', color: COLORS.textMuted, border: '1px solid rgba(255,255,255,0.1)' }}>
          ← Voltar
        </button>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════
  //  TAB CONTENTS
  // ═══════════════════════════════════════════

  const renderTabContent = () => {
    // ─── HOME ───
    if (activeTab === 'home') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Level & Coins Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>Nível</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: COLORS.primary }}>{level}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>{mood.emoji}</div>
              <div style={{ fontSize: '11px', color: mood.color, fontWeight: '700' }}>{mood.text}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>Moedas</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: COLORS.accent }}>🪙 {coins}</div>
            </div>
          </div>

          {/* XP Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: COLORS.textMuted }}>XP</span>
              <span style={{ fontSize: '11px', color: COLORS.primary }}>{xp}/{xpNeeded}</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div animate={{ width: `${(xp / xpNeeded) * 100}%` }}
                style={{ height: '100%', background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`, borderRadius: '4px' }} />
            </div>
          </div>

          {/* Status Bars */}
          <div style={{ display: 'grid', gap: '10px' }}>
            <StatusBar label="Fome" value={hunger} color="#ff9a9e" icon="🍖" />
            <StatusBar label="Energia" value={energy} color="#f6d365" icon="⚡" />
            <StatusBar label="Higiene" value={hygiene} color="#84fab0" icon="🧼" />
            <StatusBar label="Saúde" value={health} color="#ff4b2b" icon="❤️" />
            <StatusBar label="Carinho" value={affection} color="#a18cd1" icon="💜" />
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '4px' }}>
            <button onClick={() => { UISound.play("click");  if (!isSleeping) { setAffection(a => Math.min(100, a + 20)); gainXp(10);} }}
              style={{ ...btnBase, padding: '12px', background: 'rgba(161,140,209,0.15)', color: COLORS.purple, border: '1px solid rgba(161,140,209,0.2)' }}>
              🤗 Acariciar
            </button>
            <button onClick={() => { UISound.play("click"); setIsSleeping(!isSleeping)}}
              style={{ ...btnBase, padding: '12px', background: isSleeping ? 'rgba(79,172,254,0.2)' : 'rgba(255,255,255,0.05)', color: isSleeping ? COLORS.primary : COLORS.textMuted, border: `1px solid ${isSleeping ? 'rgba(79,172,254,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
              {isSleeping ? '⏰ Acordar' : '😴 Dormir'}
            </button>
          </div>

          {/* Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: COLORS.textMuted, padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span>{weatherIcon} {weather === 'sun' ? 'Ensolarado' : weather === 'rain' ? 'Chuva' : weather === 'snow' ? 'Neve' : 'Tempestade'}</span>
            <span>{personality && `🧬 ${personality}`}</span>
            {profession && <span>💼 {profession}</span>}
          </div>
        </div>
      );
    }

    // ─── GAMES ───
    if (activeTab === 'games') {
      if (activeGame) {
        return (
          <div>
            <button onClick={() => { UISound.play("click"); setActiveGame(null)}}
              style={{ ...btnBase, padding: '8px 16px', background: 'rgba(255,255,255,0.05)', color: COLORS.textMuted, marginBottom: '12px', fontSize: '12px' }}>
              ← Voltar aos Jogos
            </button>
            {activeGame === 'runner' && <RunnerGame skin={equippedSkin} onEnd={c => { setCoins(v => v + c); gainXp(c); updateQuest('play'); setActiveGame(null); }} />}
            {activeGame === 'catcher' && <CatcherGame onEnd={c => { setCoins(v => v + c); gainXp(c); updateQuest('play'); setActiveGame(null); }} />}
            {activeGame === 'battle' && <BattleArena petLevel={level} petSkin={equippedSkin} onEnd={(c, w) => { setCoins(v => v + c); gainXp(c * 2); updateQuest('play'); setActiveGame(null); }} />}
            {activeGame === 'quiz' && <QuizGame onEnd={c => { setCoins(v => v + c); gainXp(c); updateQuest('play'); setActiveGame(null); }} />}
          </div>
        );
      }
      const games = [
        { id: 'runner', icon: '🏃', name: 'Pet Runner', desc: 'Pule obstáculos!', color: COLORS.primary },
        { id: 'catcher', icon: '🧺', name: 'Chuva de Frutas', desc: 'Pegue as frutas!', color: COLORS.accent },
        { id: 'battle', icon: '⚔️', name: 'Arena de Batalha', desc: 'Enfrente monstros!', color: COLORS.danger },
        { id: 'quiz', icon: '🧠', name: 'Quiz do Pet', desc: 'Teste seu conhecimento!', color: COLORS.purple },
      ];
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {games.map(g => (
            <motion.button key={g.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { UISound.play("click"); setActiveGame(g.id)}}
              style={{ ...btnBase, padding: '20px 12px', background: `linear-gradient(135deg, ${g.color}22, ${g.color}08)`, color: '#FFF', border: `1px solid ${g.color}33`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', borderRadius: '20px' }}>
              <span style={{ fontSize: '32px' }}>{g.icon}</span>
              <span style={{ fontWeight: '800', fontSize: '13px' }}>{g.name}</span>
              <span style={{ fontSize: '11px', color: COLORS.textMuted }}>{g.desc}</span>
            </motion.button>
          ))}
        </div>
      );
    }

    // ─── SHOP ───
    if (activeTab === 'shop') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '14px', color: COLORS.accent, fontWeight: '800' }}>🪙 {coins} moedas</div>

          <div>
            <h4 style={{ color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Alimentos e Itens</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { type: 'apple', icon: '🍎', name: 'Maçã', cost: 5 },
                { type: 'pizza', icon: '🍕', name: 'Pizza', cost: 15 },
                { type: 'soap', icon: '🧼', name: 'Banho', cost: 10 },
                { type: 'potion', icon: '💉', name: 'Poção', cost: 40 },
                { type: 'seed', icon: '🌱', name: 'Semente', cost: 20 },
              ].map(item => (
                <button key={item.type} onClick={() => { UISound.play("click"); buyFood(item.type, item.cost)}}
                  disabled={coins < item.cost}
                  style={{ ...btnBase, padding: '10px', background: coins >= item.cost ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)', color: coins >= item.cost ? '#FFF' : '#555', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{item.icon} {item.name} ({foodStock[item.type] || 0})</span>
                  <span style={{ color: COLORS.accent, fontSize: '12px' }}>{item.cost}</span>
                </button>
              ))}
              <button onClick={(e) => { UISound.play("click"); buyLootBox(e); }} disabled={coins < 50}
                style={{ ...btnBase, padding: '10px', background: 'linear-gradient(135deg, #f6d365, #fda085)', color: '#000', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '900' }}>
                <span>🎁 Caixa Misteriosa</span>
                <span style={{ fontSize: '12px' }}>50</span>
              </button>
            </div>
          </div>

          <div>
            <h4 style={{ color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Skins Premium</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { n: 'Fantasma', c: 100 }, { n: 'Demônio', c: 150 },
                { n: 'Anjo', c: 200 }, { n: 'Ciborgue', c: 300 }, { n: 'Dourado', c: 500 },
              ].map(skin => {
                const owned = inventory.includes(`Skin_${skin.n}`);
                const equipped = equippedSkin === skin.n;
                return (
                  <button key={skin.n}
                    onClick={() => { UISound.play("click"); owned ? setEquippedSkin(equipped ? null : skin.n) : buyItem(`Skin_${skin.n}`, skin.c); }}
                    disabled={!owned && coins < skin.c}
                    style={{ ...btnBase, padding: '10px', background: equipped ? `${COLORS.primary}22` : 'rgba(255,255,255,0.04)', color: equipped ? COLORS.primary : owned ? '#FFF' : '#666', border: `1px solid ${equipped ? COLORS.primary + '44' : 'rgba(255,255,255,0.06)'}` }}>
                    {skin.n} {owned ? (equipped ? '✓' : '') : `🪙${skin.c}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 style={{ color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Minipets</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {[
                { n: 'Morcego', c: 150, i: '🦇' }, { n: 'Fada', c: 200, i: '🧚' }, { n: 'Robô', c: 300, i: '🤖' },
              ].map(m => {
                const owned = inventory.includes(`Minipet_${m.n}`);
                const equipped = equippedMinipet === m.n;
                return (
                  <button key={m.n}
                    onClick={() => { UISound.play("click"); owned ? setEquippedMinipet(equipped ? null : m.n) : buyItem(`Minipet_${m.n}`, m.c); }}
                    disabled={!owned && coins < m.c}
                    style={{ ...btnBase, padding: '10px', background: equipped ? `${COLORS.success}22` : 'rgba(255,255,255,0.04)', color: equipped ? COLORS.success : '#FFF', border: `1px solid ${equipped ? COLORS.success + '44' : 'rgba(255,255,255,0.06)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '24px' }}>{m.i}</span>
                    <span style={{ fontSize: '11px' }}>{owned ? m.n : `🪙${m.c}`}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 style={{ color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Cenários</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {[
                { n: 'Padrão', c: 0 }, { n: 'Praia', c: 100 }, { n: 'Cyberpunk', c: 150 }, { n: 'Arcade', c: 200 },
              ].map(bg => {
                const owned = bg.c === 0 || inventory.includes(`Bg_${bg.n}`);
                const equipped = equippedBg === bg.n || (bg.n === 'Padrão' && !equippedBg);
                return (
                  <button key={bg.n}
                    onClick={() => { UISound.play("click"); 
                      if (bg.n === 'Padrão') { setEquippedBg(null); return;}
                      if (owned) setEquippedBg(equipped ? null : bg.n);
                      else buyItem(`Bg_${bg.n}`, bg.c);
                    }}
                    disabled={!owned && coins < bg.c}
                    style={{ ...btnBase, padding: '8px', background: equipped ? `${COLORS.purple}22` : 'rgba(255,255,255,0.04)', color: equipped ? COLORS.purple : '#FFF', border: `1px solid ${equipped ? COLORS.purple + '44' : 'rgba(255,255,255,0.06)'}`, fontSize: '12px' }}>
                    {bg.n} {!owned && bg.c > 0 ? `🪙${bg.c}` : equipped ? '✓' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // ─── CUSTOM ───
    if (activeTab === 'custom') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Cor RGB</h4>
            <input type="range" min="0" max="360" value={petHue} onChange={e => setPetHue(Number(e.target.value))}
              style={{ width: '100%', accentColor: COLORS.primary }} />
          </div>

          <div>
            <h4 style={{ color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Jardim 🌱</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={(e) => { UISound.play("click"); plantSeed(e); }} disabled={foodStock['seed'] <= 0 || garden.length >= 3}
                style={{ ...btnBase, padding: '10px 16px', background: foodStock['seed'] > 0 ? COLORS.success + '22' : 'rgba(255,255,255,0.04)', color: COLORS.success, border: `1px solid ${COLORS.success}33` }}>
                🌱 Plantar ({foodStock['seed']})
              </button>
              {garden.map(g => (
                <motion.button key={g.id} whileTap={{ scale: 0.9 }} onClick={() => { UISound.play("click"); harvestPlant(g.id, g.stage)}}
                  style={{ ...btnBase, padding: '10px', background: g.stage === 3 ? COLORS.accent + '22' : 'rgba(255,255,255,0.04)', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', fontSize: '24px' }}>
                  {g.stage === 0 ? '🌱' : g.stage === 1 ? '🌿' : g.stage === 2 ? '🌳' : '🍎'}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Evolução</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['neutral', 'dragon', 'mecha', 'hero', 'dark'] as const).map(e => (
                <button key={e} onClick={() => { UISound.play("click");  if (level >= 20 || e === 'neutral') setEvolution(e);}}
                  disabled={level < 20 && e !== 'neutral'}
                  style={{ ...btnBase, padding: '8px 14px', background: evolution === e ? `${COLORS.primary}22` : 'rgba(255,255,255,0.04)', color: evolution === e ? COLORS.primary : level < 20 && e !== 'neutral' ? '#444' : '#AAA', border: `1px solid ${evolution === e ? COLORS.primary + '44' : 'rgba(255,255,255,0.06)'}`, fontSize: '12px' }}>
                  {e === 'neutral' ? '🐾 Normal' : e === 'dragon' ? '🐉 Dragão' : e === 'mecha' ? '🤖 Mecha' : e === 'hero' ? '🦸 Herói' : '😈 Dark'}
                </button>
              ))}
            </div>
            {level < 20 && <p style={{ fontSize: '11px', color: COLORS.danger, marginTop: '4px' }}>Alcance Nível 20 para evoluir</p>}
          </div>
        </div>
      );
    }

    // ─── SKILLS ───
    if (activeTab === 'skills') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: COLORS.success }}>Habilidades</h3>
            <span style={{ fontSize: '13px', color: COLORS.primary, fontWeight: '700' }}>🔮 {skillPoints} pontos</span>
          </div>

          {[
            { key: 'hungerResist' as const, name: 'Resistência à Fome', desc: 'Fome cai mais devagar', icon: '🍖', max: 5 },
            { key: 'xpBoost' as const, name: 'Mestre do XP', desc: '+20% XP por nível', icon: '📈', max: 5 },
            { key: 'coinBoost' as const, name: 'Caça-Moedas', desc: '+10% moedas (futuro)', icon: '🪙', max: 5 },
          ].map(skill => (
            <div key={skill.key} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700' }}>{skill.icon} {skill.name}</span>
                <span style={{ fontSize: '12px', color: COLORS.primary }}>{skills[skill.key]}/{skill.max}</span>
              </div>
              <p style={{ fontSize: '11px', color: COLORS.textMuted, margin: '0 0 8px' }}>{skill.desc}</p>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                {Array.from({ length: skill.max }).map((_, i) => (
                  <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i < skills[skill.key] ? COLORS.success : 'rgba(255,255,255,0.1)' }} />
                ))}
              </div>
              <button onClick={() => { UISound.play("click"); 
                if (skillPoints > 0 && skills[skill.key] < skill.max) {
                  setSkillPoints(s => s - 1);
                  setSkills(s => ({ ...s, [skill.key]: s[skill.key] + 1}));
                }
              }}
                disabled={skillPoints === 0 || skills[skill.key] >= skill.max}
                style={{ ...btnBase, padding: '8px 16px', background: skillPoints > 0 && skills[skill.key] < skill.max ? COLORS.success : '#333', color: '#FFF', fontSize: '12px' }}>
                Melhorar
              </button>
            </div>
          ))}

          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ fontSize: '14px', margin: '0 0 8px' }}>💼 Profissão {level < 10 ? '(Nível 10+)' : ''}</h4>
            {level < 10 ? (
              <p style={{ fontSize: '12px', color: COLORS.danger }}>Alcance Nível 10 primeiro.</p>
            ) : (
              <div style={{ display: 'flex', gap: '6px' }}>
                {['Cientista', 'Mago', 'Gamer'].map(prof => (
                  <button key={prof} onClick={() => { UISound.play("click"); setProfession(prof)}}
                    disabled={profession !== null && profession !== prof}
                    style={{ ...btnBase, flex: 1, padding: '10px', background: profession === prof ? `${COLORS.primary}22` : 'rgba(255,255,255,0.04)', color: profession === prof ? COLORS.primary : '#AAA', border: `1px solid ${profession === prof ? COLORS.primary + '44' : 'rgba(255,255,255,0.06)'}`, fontSize: '12px' }}>
                    {prof === 'Cientista' ? '🔬' : prof === 'Mago' ? '🧙' : '🎮'} {prof}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // ─── QUESTS ───
    if (activeTab === 'quests') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#e67e22' }}>📋 Missões Diárias</h3>
          {quests.map(q => {
            const done = q.current >= q.target;
            return (
              <div key={q.id} style={{ background: done ? 'rgba(46,204,113,0.08)' : 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '14px', border: `1px solid ${done ? COLORS.success + '33' : 'rgba(255,255,255,0.06)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: done ? COLORS.success : '#FFF' }}>{done ? '✅ ' : ''}{q.desc}</div>
                  <div style={{ fontSize: '12px', color: COLORS.accent, marginTop: '2px' }}>Recompensa: {q.reward} 🪙</div>
                </div>
                <div style={{ fontWeight: '800', fontSize: '16px', color: done ? COLORS.success : COLORS.primary }}>
                  {q.current}/{q.target}
                </div>
              </div>
            );
          })}
          <button onClick={() => { UISound.play("click"); setQuests(defaultQuests)}}
            style={{ ...btnBase, padding: '10px', background: 'rgba(255,255,255,0.04)', color: COLORS.textMuted, border: '1px solid rgba(255,255,255,0.06)', marginTop: '8px', fontSize: '12px' }}>
            🔄 Resetar Missões
          </button>
        </div>
      );
    }

    return null;
  };

  // ═══════════════════════════════════════════
  //  MAIN RENDER
  // ═══════════════════════════════════════════
  const tabs = [
    { id: 'home' as const, icon: '🏠', label: 'Home' },
    { id: 'games' as const, icon: '🎮', label: 'Jogos' },
    { id: 'shop' as const, icon: '🛍️', label: 'Loja' },
    { id: 'custom' as const, icon: '🎨', label: 'Custom' },
    { id: 'skills' as const, icon: '⚡', label: 'Skills' },
    { id: 'quests' as const, icon: '📋', label: 'Quests' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: bgGradient,
      display: 'flex', flexDirection: 'column',
      zIndex: 1000, fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: COLORS.text, overflow: 'hidden',
    }}>
      {/* Weather Effects */}
      {weather === 'snow' && <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#FFF 2px, transparent 2px)', backgroundSize: '30px 30px', opacity: 0.3, pointerEvents: 'none', animation: 'snow 10s linear infinite' }} />}
      {weather === 'storm' && <motion.div animate={{ opacity: [0, 0, 0.6, 0, 0, 0.4, 0] }} transition={{ repeat: Infinity, duration: 5 }} style={{ position: 'absolute', inset: 0, background: '#FFF', pointerEvents: 'none', mixBlendMode: 'overlay' }} />}
      <style>{`@keyframes snow { 0% { background-position: 0 0; } 100% { background-position: 500px 1000px; } }`}</style>

      {/* Event Toast */}
      <AnimatePresence>
        {eventMsg && (
          <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 16, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
            style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', ...glassCard, background: 'rgba(246,211,101,0.95)', color: '#000', padding: '12px 24px', fontWeight: '700', zIndex: 200, fontSize: '14px', whiteSpace: 'nowrap' }}>
            {eventMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', flexShrink: 0 }}>
        <button onClick={(e) => { UISound.play("click"); onClose(e); }}
          style={{ ...btnBase, padding: '8px 16px', background: 'rgba(255,255,255,0.05)', color: COLORS.textMuted, border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px' }}>
          ← Sair
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: '800', color: COLORS.accent }}>🪙 {coins}</span>
          <span style={{ fontSize: '14px' }}>{weatherIcon}</span>
        </div>
      </div>

      {/* Pet Area */}
      <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0 6px', position: 'relative', minHeight: '180px' }}>
        {/* Minipet */}
        {equippedMinipet && (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
            style={{ position: 'absolute', width: '200px', height: '200px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 1 }}
              style={{ fontSize: '32px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>
              {equippedMinipet === 'Morcego' ? '🦇' : equippedMinipet === 'Fada' ? '🧚' : '🤖'}
            </motion.div>
          </motion.div>
        )}

        {/* Shadow */}
        <div style={{ position: 'absolute', top: '80%', width: petSize * 1.2, height: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '50%', filter: 'blur(8px)' }} />

        {/* THE PET */}
        <motion.div
          drag dragConstraints={{ top: -80, bottom: 30, left: -150, right: 150 }} whileDrag={{ scale: 1.12, rotate: 10, cursor: 'grabbing' }}
          animate={{
            y: isEating ? [0, -30, 0] : isBathing ? [0, 8, -8, 8, 0] : isSleeping ? [0, 6, 0] : [0, -12, 0],
            scale: isEating ? [1, 1.1, 1] : 1,
            rotate: isSleeping ? 12 : isBathing ? [-10, 10, -10, 10, 0] : 0,
            filter: `hue-rotate(${petHue}deg)`,
          }}
          transition={{ repeat: Infinity, duration: isEating ? 0.3 : isSleeping ? 4 : isBathing ? 0.5 : 2.5, ease: 'easeInOut' }}
          style={{
            width: petSize, height: petSize,
            background: evolution === 'dragon' ? 'linear-gradient(135deg, #ff416c, #800000)' : evolution === 'mecha' ? 'linear-gradient(135deg, #b8c6db, #283e51)' : 'radial-gradient(circle at 30% 30%, #a1c4fd, #c2e9fb)',
            borderRadius: evolution === 'dragon' ? '30% 70% 70% 30% / 30% 30% 70% 70%' : evolution === 'mecha' ? '16px' : '50% 50% 45% 45%',
            boxShadow: `0 16px 40px rgba(0,0,0,0.35), inset 0 -8px 16px rgba(0,0,0,0.25)`,
            cursor: 'grab', position: 'relative', zIndex: 30, display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}>
          {/* Dragon horns */}
          {evolution === 'dragon' && (
            <>
              <div style={{ position: 'absolute', top: '-24px', left: '15%', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '30px solid #500000', transform: 'rotate(-15deg)' }} />
              <div style={{ position: 'absolute', top: '-24px', right: '15%', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '30px solid #500000', transform: 'rotate(15deg)' }} />
            </>
          )}
          {/* Eyes */}
          {!isSleeping ? (
            <>
              <div style={{ position: 'absolute', top: '38%', left: '25%', width: '14px', height: isEating ? '4px' : '16px', background: '#222', borderRadius: '8px', transition: 'height 0.2s' }} />
              <div style={{ position: 'absolute', top: '38%', right: '25%', width: '14px', height: isEating ? '4px' : '16px', background: '#222', borderRadius: '8px', transition: 'height 0.2s' }} />
              {/* Mouth */}
              <div style={{ position: 'absolute', top: '60%', left: '50%', transform: 'translateX(-50%)', width: '16px', height: '8px', borderBottom: '3px solid #222', borderRadius: '0 0 8px 8px' }} />
              {health < 50 && <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 1 }} style={{ position: 'absolute', top: '-30px', right: '-15px', fontSize: '28px' }}>🤒</motion.div>}
            </>
          ) : (
            <>
              <div style={{ position: 'absolute', top: '42%', left: '25%', width: '16px', height: '4px', background: '#222', borderRadius: '8px' }} />
              <div style={{ position: 'absolute', top: '42%', right: '25%', width: '16px', height: '4px', background: '#222', borderRadius: '8px' }} />
              <motion.div animate={{ opacity: [0, 1, 0], y: [0, -40], x: [0, 15] }} transition={{ repeat: Infinity, duration: 3 }}
                style={{ position: 'absolute', top: '-35px', right: '-20px', fontSize: '32px', fontWeight: '900', color: '#FFF' }}>Z</motion.div>
            </>
          )}
          {/* Profession Hat */}
          {profession === 'Cientista' && <div style={{ position: 'absolute', top: '-35px', fontSize: '50px', zIndex: 40 }}>🥽</div>}
          {profession === 'Mago' && <div style={{ position: 'absolute', top: '-45px', fontSize: '55px', zIndex: 40 }}>🧙‍♂️</div>}
          {profession === 'Gamer' && <div style={{ position: 'absolute', top: '-10px', fontSize: '60px', zIndex: 40 }}>🎧</div>}
        </motion.div>
      </div>

      {/* Food Quick Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '4px 16px 8px', flexShrink: 0 }}>
        {[
          { type: 'apple', icon: '🍎' },
          { type: 'pizza', icon: '🍕' },
          { type: 'soap', icon: '🧼' },
          { type: 'potion', icon: '💉' },
        ].map(item => (
          <motion.button key={item.type} whileTap={{ scale: 0.85 }}
            onClick={() => { UISound.play("click"); feedPet(item.type)}}
            disabled={foodStock[item.type] <= 0 || isSleeping}
            style={{ ...btnBase, width: '56px', height: '56px', borderRadius: '50%', background: foodStock[item.type] > 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', opacity: foodStock[item.type] > 0 ? 1 : 0.3, padding: 0 }}>
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span style={{ fontSize: '10px', color: COLORS.textMuted }}>{foodStock[item.type]}</span>
          </motion.button>
        ))}
        {/* Chat Toggle */}
        <motion.button whileTap={{ scale: 0.85 }}
          onClick={() => { UISound.play("click"); setShowChat(!showChat)}}
          style={{ ...btnBase, width: '56px', height: '56px', borderRadius: '50%', background: showChat ? `${COLORS.primary}22` : 'rgba(255,255,255,0.08)', border: `1px solid ${showChat ? COLORS.primary + '44' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <span style={{ fontSize: '20px' }}>💬</span>
        </motion.button>
      </div>

      {/* Chat */}
      <AnimatePresence>
        {showChat && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ padding: '0 16px', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ ...glassCard, padding: '12px', marginBottom: '8px' }}>
              <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                {chatLog.length === 0 && <div style={{ fontSize: '12px', color: COLORS.textMuted, textAlign: 'center', padding: '8px' }}>Diga algo para o seu pet! 🐾</div>}
                {chatLog.map((log, i) => (
                  <div key={i} style={{
                    alignSelf: log.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: log.sender === 'user' ? COLORS.primary : 'rgba(255,255,255,0.08)',
                    color: log.sender === 'user' ? '#000' : '#FFF',
                    padding: '6px 12px', borderRadius: '12px', maxWidth: '85%', fontSize: '12px',
                  }}>{log.text}</div>
                ))}
                {isTyping && <div style={{ fontSize: '12px', color: COLORS.textMuted }}>Digitando...</div>}
                <div ref={chatEndRef} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && chatInput.trim()) { generateAIResponse(chatInput.trim()); setChatInput(''); } }}
                  placeholder="Fale algo..."
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#FFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                <button onClick={() => { UISound.play("click");  if (chatInput.trim()) { generateAIResponse(chatInput.trim()); setChatInput('');} }}
                  style={{ ...btnBase, padding: '10px 16px', background: COLORS.primary, color: '#000' }}>
                  Enviar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '0 16px 8px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ ...glassCard, flex: 1, overflow: 'auto', padding: '16px' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab + (activeGame || '')} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '8px 8px max(8px, env(safe-area-inset-bottom))',
        background: 'rgba(10, 10, 26, 0.95)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
      }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => { UISound.play("click");  setActiveTab(tab.id); setActiveGame(null);}}
              style={{
                ...btnBase, background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                color: isActive ? COLORS.primary : COLORS.textMuted, padding: '6px 10px', borderRadius: '12px',
                position: 'relative',
              }}>
              <span style={{ fontSize: '20px', transition: 'transform 0.2s', transform: isActive ? 'scale(1.15)' : 'scale(1)' }}>{tab.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: isActive ? '800' : '600' }}>{tab.label}</span>
              {isActive && <motion.div layoutId="tabIndicator" style={{ position: 'absolute', bottom: 0, width: '20px', height: '3px', borderRadius: '2px', background: COLORS.primary }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChaoGarden;
