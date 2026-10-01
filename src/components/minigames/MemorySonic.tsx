import React, { useState, useEffect, useCallback } from 'react';
import { UISound } from "../../utils/audio";
import { motion, AnimatePresence } from 'framer-motion';

const CHARACTERS = [
  { name: 'Sonic', color: '#1565C0', emoji: '🔵' },
  { name: 'Tails', color: '#FF8F00', emoji: '🦊' },
  { name: 'Knuckles', color: '#C62828', emoji: '🔴' },
  { name: 'Amy', color: '#EC407A', emoji: '🌸' },
  { name: 'Shadow', color: '#212121', emoji: '⚫' },
  { name: 'Ring', color: '#FFD700', emoji: '💍' },
  { name: 'Emerald', color: '#2E7D32', emoji: '💎' },
  { name: 'Eggman', color: '#BF360C', emoji: '🥚' },
  { name: 'Metal', color: '#37474F', emoji: '🤖' },
  { name: 'Silver', color: '#78909C', emoji: '🔘' },
  { name: 'Blaze', color: '#7B1FA2', emoji: '🔥' },
  { name: 'Cream', color: '#FFE0B2', emoji: '🐰' },
  { name: 'Rouge', color: '#880E4F', emoji: '🦇' },
  { name: 'Omega', color: '#E65100', emoji: '⚙️' },
  { name: 'Chao', color: '#03A9F4', emoji: '💙' },
];

// ═══════════════════════════════════════════
//  LEVELS — Progressive difficulty
// ═══════════════════════════════════════════
const LEVELS = [
  { name: 'Green Hill', cols: 3, rows: 2, pairs: 3, time: 40, bg: ['#1B5E20', '#2E7D32', '#43A047'], starThresholds: [8, 5, 3] },
  { name: 'Chemical Plant', cols: 4, rows: 3, pairs: 6, time: 60, bg: ['#0D47A1', '#1565C0', '#1976D2'], starThresholds: [14, 10, 7] },
  { name: 'Casino Night', cols: 4, rows: 4, pairs: 8, time: 75, bg: ['#4A148C', '#6A1B9A', '#7B1FA2'], starThresholds: [18, 14, 10] },
  { name: 'Ice Cap', cols: 5, rows: 4, pairs: 10, time: 90, bg: ['#006064', '#00838F', '#0097A7'], starThresholds: [24, 18, 13] },
  { name: 'Scrap Brain', cols: 6, rows: 4, pairs: 12, time: 120, bg: ['#B71C1C', '#C62828', '#D32F2F'], starThresholds: [30, 22, 16] },
  { name: 'Death Egg', cols: 6, rows: 5, pairs: 15, time: 150, bg: ['#212121', '#424242', '#616161'], starThresholds: [40, 30, 22] },
];

interface Card {
  id: number;
  charIndex: number;
  flipped: boolean;
  matched: boolean;
  special?: 'chaos_emerald' | 'eggman_trap';
}

export default function MemorySonic({ onClose }: { onClose: () => void }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'WON' | 'LOST'>('MENU');
  const [levelIndex, setLevelIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [totalStars, setTotalStars] = useState(() => {
    try { return JSON.parse(localStorage.getItem('memory_stars') || '{}'); } catch { return {}; }
  });
  const [matchEffect, setMatchEffect] = useState<{ emoji: string; x: number; y: number } | null>(null);
  const [revealAll, setRevealAll] = useState(false);
  const [shakeCards, setShakeCards] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [comboText, setComboText] = useState('');

  const level = LEVELS[levelIndex];

  const initGame = useCallback((lvlIdx: number) => {
    const lvl = LEVELS[lvlIdx];
    const totalCards = lvl.pairs * 2;
    const chars = CHARACTERS.slice(0, lvl.pairs);
    const allCards: Card[] = [];

    chars.forEach((_, idx) => {
      allCards.push({ id: allCards.length, charIndex: idx, flipped: false, matched: false });
      allCards.push({ id: allCards.length, charIndex: idx, flipped: false, matched: false });
    });

    // Shuffle
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }
    allCards.forEach((c, i) => c.id = i);

    // Add special cards (rare)
    if (lvlIdx >= 2 && Math.random() > 0.5) {
      const randomIdx = Math.floor(Math.random() * allCards.length);
      allCards[randomIdx].special = 'chaos_emerald';
    }
    if (lvlIdx >= 3 && Math.random() > 0.6) {
      const randomIdx = Math.floor(Math.random() * allCards.length);
      if (!allCards[randomIdx].special) allCards[randomIdx].special = 'eggman_trap';
    }

    setCards(allCards);
    setFlippedIds([]);
    setMoves(0);
    setMatches(0);
    setTimer(lvl.time);
    setComboCount(0);
    setComboText('');
    setRevealAll(false);
    setShakeCards(false);
    setLevelIndex(lvlIdx);
    setGameState('PLAYING');
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          setGameState('LOST');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  const getStars = (mvs: number) => {
    if (mvs <= level.starThresholds[2]) return 3;
    if (mvs <= level.starThresholds[1]) return 2;
    if (mvs <= level.starThresholds[0]) return 1;
    return 1;
  };

  const handleCardClick = useCallback((cardId: number) => {
    if (gameState !== 'PLAYING' || revealAll || shakeCards) return;
    if (flippedIds.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    // Handle special cards
    if (card.special === 'chaos_emerald') {
      // Reveal all cards for 2 seconds!
      setRevealAll(true);
      setTimeout(() => setRevealAll(false), 2000);
    }
    if (card.special === 'eggman_trap') {
      // Shuffle non-matched cards!
      setShakeCards(true);
      setTimeout(() => {
        setCards(prev => {
          const matched = prev.filter(c => c.matched);
          const unmatched = prev.filter(c => !c.matched).map(c => ({ ...c, flipped: false }));
          for (let i = unmatched.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmpChar = unmatched[i].charIndex;
            const tmpSpecial = unmatched[i].special;
            unmatched[i].charIndex = unmatched[j].charIndex;
            unmatched[i].special = unmatched[j].special;
            unmatched[j].charIndex = tmpChar;
            unmatched[j].special = tmpSpecial;
          }
          return [...matched, ...unmatched].sort((a, b) => a.id - b.id);
        });
        setFlippedIds([]);
        setShakeCards(false);
      }, 600);
      return;
    }

    const newCards = cards.map(c => c.id === cardId ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flippedIds, cardId];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const card1 = newCards.find(c => c.id === newFlipped[0])!;
      const card2 = newCards.find(c => c.id === newFlipped[1])!;

      if (card1.charIndex === card2.charIndex) {
        // Match!
        setComboCount(c => {
          const newCombo = c + 1;
          if (newCombo >= 5) setComboText('🔥 GODLIKE!');
          else if (newCombo >= 4) setComboText('⚡ INCRÍVEL!');
          else if (newCombo >= 3) setComboText('✨ AMAZING!');
          else if (newCombo >= 2) setComboText('👏 GREAT!');
          else setComboText('');
          setTimeout(() => setComboText(''), 1200);
          return newCombo;
        });

        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === newFlipped[0] || c.id === newFlipped[1]) ? { ...c, matched: true } : c
          ));
          setFlippedIds([]);
          setMatches(m => {
            const newM = m + 1;
            if (newM >= LEVELS[levelIndex].pairs) {
              setGameState('WON');
              // Save stars
              const stars = getStars(moves + 1);
              setTotalStars((prev: any) => {
                const updated = { ...prev, [levelIndex]: Math.max(prev[levelIndex] || 0, stars) };
                localStorage.setItem('memory_stars', JSON.stringify(updated));
                return updated;
              });
            }
            return newM;
          });
        }, 400);
      } else {
        setComboCount(0);
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === newFlipped[0] || c.id === newFlipped[1]) ? { ...c, flipped: false } : c
          ));
          setFlippedIds([]);
        }, 700);
      }
    }
  }, [gameState, cards, flippedIds, levelIndex, moves, revealAll, shakeCards]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // ═══════════════════════════════════════════
  //  LEVEL SELECT MENU
  // ═══════════════════════════════════════════
  if (gameState === 'MENU') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'linear-gradient(135deg, #050520 0%, #0a1040 50%, #1a3080 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, fontFamily: 'Arial, sans-serif', color: '#FFF', overflow: 'hidden'
        }}>
        <button onClick={(e) => { UISound.play("click"); onClose(e); }} style={{
          position: 'absolute', top: 15, left: 15, padding: '8px 18px',
          background: 'rgba(0,0,0,0.6)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '8px', cursor: 'pointer', fontSize: '14px', zIndex: 10
        }}>Voltar</button>

        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div style={{ fontSize: '50px', textAlign: 'center', marginBottom: '10px' }}>🃏</div>
          <h2 style={{ fontSize: '28px', fontFamily: 'Arial Black', textShadow: '0 0 20px #2196F3', margin: '0 0 5px', textAlign: 'center' }}>MEMORY SONIC</h2>
          <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginBottom: '25px' }}>Selecione a fase</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '500px', width: '90%', padding: '0 15px' }}>
          {LEVELS.map((lvl, i) => {
            const stars = totalStars[i] || 0;
            const unlocked = i === 0 || (totalStars[i - 1] && totalStars[i - 1] >= 1);
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                whileHover={unlocked ? { scale: 1.05 } : {}} whileTap={unlocked ? { scale: 0.95 } : {}}
                onClick={() => { UISound.play("click"); unlocked && initGame(i)}}
                style={{
                  padding: '16px 10px', borderRadius: '14px', cursor: unlocked ? 'pointer' : 'not-allowed',
                  background: unlocked ? `linear-gradient(135deg, ${lvl.bg[0]}, ${lvl.bg[2]})` : 'rgba(50,50,50,0.5)',
                  border: unlocked ? `2px solid ${lvl.bg[2]}` : '2px solid #333',
                  color: unlocked ? '#FFF' : '#666', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '6px', opacity: unlocked ? 1 : 0.4, position: 'relative', overflow: 'hidden'
                }}>
                {!unlocked && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '24px' }}>🔒</div>}
                <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>{lvl.name.toUpperCase()}</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>{lvl.cols}x{lvl.rows}</span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[1, 2, 3].map(s => (
                    <span key={s} style={{ fontSize: '14px', filter: s <= stars ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════
  //  GAME SCREEN
  // ═══════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: `linear-gradient(135deg, ${level.bg[0]}CC, ${level.bg[1]}CC, ${level.bg[2]}CC)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, fontFamily: 'Arial, sans-serif', color: '#FFF', overflow: 'hidden'
      }}
    >
      {/* Animated particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div key={i}
          animate={{ y: ['-10vh', '110vh'], x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`] }}
          transition={{ duration: 10 + Math.random() * 8, repeat: Infinity, delay: -Math.random() * 18, ease: 'linear' }}
          style={{ position: 'absolute', width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }}
        />
      ))}

      <button onClick={() => { UISound.play("click"); setGameState('MENU')}} style={{
        position: 'absolute', top: 15, left: 15, padding: '8px 18px',
        background: 'rgba(0,0,0,0.6)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '8px', cursor: 'pointer', fontSize: '14px', backdropFilter: 'blur(5px)', zIndex: 10
      }}>Voltar</button>

      {/* Level name */}
      <div style={{ marginBottom: '8px', fontSize: '11px', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
        FASE {levelIndex + 1} — {level.name.toUpperCase()}
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: '20px', marginBottom: '15px', fontSize: '14px',
        background: 'rgba(0,0,0,0.3)', padding: '10px 25px', borderRadius: '30px',
        backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <span>🎯 <strong style={{ color: '#FFD700' }}>{moves}</strong></span>
        <span>💎 <strong style={{ color: '#4CAF50' }}>{matches}/{level.pairs}</strong></span>
        <span style={{ color: timer <= 10 ? '#FF5252' : '#2196F3' }}>
          ⏱ <strong>{formatTime(timer)}</strong>
        </span>
      </div>

      {/* Combo text */}
      <AnimatePresence>
        {comboText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1.2, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            style={{
              position: 'absolute', top: '10%', fontSize: '28px', fontWeight: '900',
              fontFamily: 'Arial Black', color: '#FFD700', textShadow: '0 0 30px #FFD700, 0 0 60px #FF6600',
              zIndex: 20, letterSpacing: '2px'
            }}>
            {comboText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${level.cols}, 1fr)`, gap: '8px',
        width: '100%', maxWidth: `${level.cols * 80}px`, padding: '0 15px', boxSizing: 'border-box'
      }}>
        {cards.map((card) => {
          const char = CHARACTERS[card.charIndex];
          const isRevealed = card.flipped || card.matched || revealAll;

          return (
            <motion.div
              key={card.id}
              whileTap={{ scale: 0.92 }}
              animate={shakeCards && !card.matched ? { x: [0, -5, 5, -5, 5, 0], transition: { duration: 0.4 } } : {}}
              onClick={() => { UISound.play("click"); handleCardClick(card.id)}}
              style={{
                width: '100%', aspectRatio: '0.8', borderRadius: '10px', cursor: 'pointer',
                perspective: '600px', position: 'relative'
              }}
            >
              <motion.div
                animate={{ rotateY: isRevealed ? 180 : 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                style={{
                  width: '100%', height: '100%', position: 'relative',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Back */}
                <div style={{
                  position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                  background: `linear-gradient(135deg, ${level.bg[1]}, ${level.bg[0]})`,
                  borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.05)',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.08, background: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.15) 6px, rgba(255,255,255,0.15) 12px)' }} />
                  <div style={{ fontSize: '22px', opacity: 0.4 }}>
                    {card.special === 'chaos_emerald' ? '✨' : card.special === 'eggman_trap' ? '⚠️' : '?'}
                  </div>
                </div>

                {/* Front */}
                <div style={{
                  position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: card.matched
                    ? `linear-gradient(135deg, ${char.color}44, ${char.color}66)`
                    : `linear-gradient(135deg, ${char.color}BB, ${char.color})`,
                  borderRadius: '10px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  border: card.matched ? '2px solid #4CAF50' : `2px solid ${char.color}`,
                  boxShadow: card.matched ? '0 0 15px rgba(76,175,80,0.5)' : `0 4px 15px ${char.color}44`,
                  opacity: card.matched ? 0.5 : 1
                }}>
                  {card.special === 'chaos_emerald' && !card.matched && (
                    <div style={{ position: 'absolute', top: 4, right: 4, fontSize: '10px' }}>💎</div>
                  )}
                  {card.special === 'eggman_trap' && !card.matched && (
                    <div style={{ position: 'absolute', top: 4, right: 4, fontSize: '10px' }}>💀</div>
                  )}
                  <div style={{ fontSize: '26px', marginBottom: '2px' }}>{char.emoji}</div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', letterSpacing: '0.5px', opacity: 0.8 }}>{char.name}</div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Win screen */}
      <AnimatePresence>
        {gameState === 'WON' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 15
            }}>
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
              <div style={{ fontSize: '55px' }}>🏆</div>
            </motion.div>
            <h2 style={{ fontSize: '30px', fontFamily: 'Arial Black', color: '#FFD700', margin: '10px 0', textShadow: '0 0 20px #FFD700' }}>FASE COMPLETA!</h2>
            
            {/* Stars */}
            <div style={{ display: 'flex', gap: '8px', margin: '10px 0' }}>
              {[1, 2, 3].map(s => (
                <motion.span key={s}
                  initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: s * 0.3, type: 'spring' }}
                  style={{ fontSize: '36px', filter: s <= getStars(moves) ? 'drop-shadow(0 0 10px #FFD700)' : 'grayscale(1) opacity(0.2)' }}>
                  ⭐
                </motion.span>
              ))}
            </div>

            <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '15px', padding: '18px 40px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: '16px', margin: '5px 0' }}>Jogadas: <strong style={{ color: '#FFD700' }}>{moves}</strong></p>
              <p style={{ fontSize: '16px', margin: '5px 0' }}>Tempo restante: <strong style={{ color: '#2196F3' }}>{formatTime(timer)}</strong></p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { UISound.play("click"); initGame(levelIndex)}}
                style={{ padding: '12px 30px', fontSize: '14px', fontWeight: 'bold', background: 'linear-gradient(135deg, #1565C0, #42A5F5)', color: '#FFF', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                🔄 Repetir
              </motion.button>
              {levelIndex < LEVELS.length - 1 && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { UISound.play("click"); initGame(levelIndex + 1)}}
                  style={{ padding: '12px 30px', fontSize: '14px', fontWeight: 'bold', background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', color: '#FFF', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                  ▶ Próxima Fase
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lose screen */}
      <AnimatePresence>
        {gameState === 'LOST' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 15
            }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>⏰</div>
            <h2 style={{ fontSize: '28px', fontFamily: 'Arial Black', color: '#FF5252', margin: '10px 0' }}>TEMPO ESGOTADO!</h2>
            <p style={{ color: '#AAA', fontSize: '14px', marginBottom: '20px' }}>Você encontrou {matches}/{level.pairs} pares</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { UISound.play("click"); initGame(levelIndex)}}
                style={{ padding: '12px 30px', fontSize: '14px', fontWeight: 'bold', background: 'linear-gradient(135deg, #FF5252, #D32F2F)', color: '#FFF', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                🔄 Tentar Novamente
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { UISound.play("click"); setGameState('MENU')}}
                style={{ padding: '12px 30px', fontSize: '14px', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', cursor: 'pointer' }}>
                Fases
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
