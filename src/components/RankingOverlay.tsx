import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginWithGoogle, logout, onAuthChange, getTopScores, getUserProfile, type ScoreEntry } from '../services/firebase';
import type { User } from 'firebase/auth';
import { PROFILE_STYLE_ITEMS } from '../constants/storeItems';
import { ProfileOverlay } from './ProfileOverlay';

interface RankingOverlayProps {
  onClose: () => void;
}

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

export const RankingOverlay: React.FC<RankingOverlayProps> = ({ onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [scores, setScores] = useState<(ScoreEntry & { profile?: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapFilter, setMapFilter] = useState('all');
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchScores();
  }, [mapFilter]);

  const fetchScores = async () => {
    setLoading(true);
    const data = await getTopScores(mapFilter);
    // Fetch profiles for the top 10 to display their cosmetics!
    const enrichedData = await Promise.all(data.map(async (entry) => {
      const profile = await getUserProfile(entry.uid);
      return { ...entry, profile };
    }));
    setScores(enrichedData);
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoggingIn(true);
    await loginWithGoogle();
    setLoggingIn(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const maps = [
    { id: 'all', name: '🌍 Geral' },
    { id: '1', name: '🌴 Fase 1' },
    { id: '2', name: '🏜️ Fase 2' },
    { id: '3', name: '🌊 Fase 3' },
    { id: '4', name: '🌋 Fase 4' },
    { id: '5', name: '⭐ Fase 5' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 950,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Press Start 2P", "Inter", monospace',
        padding: '20px', boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '600px', maxHeight: '90vh',
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0f1535 100%)',
          borderRadius: '24px',
          border: '3px solid #FFD700',
          boxShadow: '0 0 60px rgba(255, 215, 0, 0.3), inset 0 0 40px rgba(255, 215, 0, 0.05)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          padding: 'clamp(16px, 3vw, 24px)',
          textAlign: 'center',
          position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: '12px', right: '16px',
            background: 'rgba(0,0,0,0.3)', border: 'none', color: '#FFF',
            width: '36px', height: '36px', borderRadius: '50%',
            cursor: 'pointer', fontSize: '16px', fontWeight: 'bold',
          }}>✕</button>
          <h1 style={{
            fontSize: 'clamp(18px, 4vw, 28px)', color: '#000',
            margin: 0, letterSpacing: '2px', textShadow: '0 2px 0 rgba(255,255,255,0.3)',
          }}>
            🏆 RANKING TOP 10
          </h1>
          <p style={{ fontSize: '10px', color: '#333', margin: '6px 0 0', fontFamily: 'sans-serif', fontWeight: '600' }}>
            Os melhores jogadores do SONIC WEB
          </p>
        </div>

        {/* User Section */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 215, 0, 0.15)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '10px',
        }}>
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={user.photoURL || ''} alt="avatar" referrerPolicy="no-referrer"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #FFD700' }} />
                <div>
                  <div style={{ color: '#FFF', fontSize: '12px', fontFamily: 'sans-serif', fontWeight: '700' }}>
                    {user.displayName}
                  </div>
                  <div style={{ color: '#888', fontSize: '10px', fontFamily: 'sans-serif' }}>
                    Logado ✅
                  </div>
                </div>
              </div>
              <button onClick={handleLogout} style={{
                padding: '8px 16px', background: 'rgba(255,65,108,0.2)',
                border: '1px solid rgba(255,65,108,0.4)', borderRadius: '10px',
                color: '#ff416c', cursor: 'pointer', fontSize: '10px',
                fontFamily: 'sans-serif', fontWeight: '700',
              }}>
                Sair
              </button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogin}
              disabled={loggingIn}
              style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, #4285F4, #34A853)',
                border: 'none', borderRadius: '12px',
                color: '#FFF', cursor: 'pointer',
                fontSize: '13px', fontFamily: 'sans-serif', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 4px 15px rgba(66, 133, 244, 0.4)',
                opacity: loggingIn ? 0.6 : 1,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {loggingIn ? 'Entrando...' : 'Entrar com Google'}
            </motion.button>
          )}
        </div>

        {/* Map Filter */}
        <div style={{
          padding: '12px 16px',
          display: 'flex', gap: '6px', overflowX: 'auto',
          borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
        }}>
          {maps.map(m => (
            <button key={m.id} onClick={() => setMapFilter(m.id)}
              style={{
                padding: '6px 12px', borderRadius: '20px',
                background: mapFilter === m.id ? '#FFD700' : 'rgba(255,255,255,0.05)',
                color: mapFilter === m.id ? '#000' : '#AAA',
                border: mapFilter === m.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer', fontSize: '10px', fontFamily: 'sans-serif',
                fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* Scores List */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '12px 16px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#FFD700', padding: '40px', fontSize: '12px' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{ display: 'inline-block', fontSize: '30px', marginBottom: '12px' }}>
                💫
              </motion.div>
              <div>Carregando ranking...</div>
            </div>
          ) : scores.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px', fontSize: '12px', fontFamily: 'sans-serif' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎮</div>
              <p style={{ fontWeight: '700' }}>Nenhum score registrado ainda!</p>
              <p style={{ color: '#555', fontSize: '11px', marginTop: '8px' }}>
                Jogue o Sonic e seu score aparecerá aqui.
              </p>
            </div>
          ) : (
            scores.map((entry, index) => {
              const isTop3 = index < 3;
              const isCurrentUser = user && entry.uid === user.uid;

              return (
                <motion.div
                  key={entry.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setActiveProfileId(entry.uid)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    background: isCurrentUser
                      ? 'linear-gradient(135deg, rgba(79,172,254,0.15), rgba(0,242,254,0.05))'
                      : isTop3
                        ? `linear-gradient(135deg, ${MEDAL_COLORS[index]}11, transparent)`
                        : 'rgba(255,255,255,0.03)',
                    borderRadius: '14px',
                    border: isCurrentUser
                      ? '1px solid rgba(79,172,254,0.3)'
                      : isTop3
                        ? `1px solid ${MEDAL_COLORS[index]}33`
                        : '1px solid rgba(255,255,255,0.05)',
                  }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  {/* Rank */}
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: '50%',
                    background: isTop3 ? `linear-gradient(135deg, ${MEDAL_COLORS[index]}, ${MEDAL_COLORS[index]}88)` : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isTop3 ? '18px' : '14px',
                    fontWeight: '900', color: isTop3 ? '#000' : '#666',
                    flexShrink: 0,
                  }}>
                    {isTop3 ? MEDAL_EMOJIS[index] : index + 1}
                  </div>

                  {/* Avatar */}
                  {(() => {
                    const equippedStyles = entry.profile?.equippedStyles || {};
                    const equippedBorder = PROFILE_STYLE_ITEMS.find(i => i.id === equippedStyles.border);
                    const equippedNeon = PROFILE_STYLE_ITEMS.find(i => i.id === equippedStyles.neon);
                    const equippedName = PROFILE_STYLE_ITEMS.find(i => i.id === equippedStyles.name);
                    const equippedFilter = PROFILE_STYLE_ITEMS.find(i => i.id === equippedStyles.filter);
                    
                    const borderCss = equippedBorder?.cssValue || (isTop3 ? `2px solid ${MEDAL_COLORS[index]}` : '2px solid rgba(255,255,255,0.1)');
                    const filterCss = equippedFilter?.cssValue || 'none';
                    const nameColorCss = equippedName?.cssValue || (isCurrentUser ? '#4FACFE' : '#FFF');
                    const nameShadowCss = equippedName ? `0 0 10px ${equippedName.cssValue}` : 'none';

                    return (
                      <>
                        {entry.photoURL ? (
                          <img src={entry.photoURL} alt="" referrerPolicy="no-referrer" style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            border: borderCss,
                            filter: filterCss,
                            boxShadow: equippedNeon ? equippedNeon.cssValue : 'none',
                            flexShrink: 0, objectFit: 'cover'
                          }} />
                        ) : (
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                            border: borderCss,
                            boxShadow: equippedNeon ? equippedNeon.cssValue : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', flexShrink: 0,
                          }}>🦔</div>
                        )}

                        {/* Name & Map */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            color: nameColorCss,
                            textShadow: nameShadowCss,
                            fontSize: '12px', fontFamily: 'sans-serif', fontWeight: '700',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {entry.profile?.displayName || entry.displayName} {isCurrentUser && '(Você)'}
                          </div>
                          <div style={{ fontSize: '10px', color: '#888', fontFamily: 'sans-serif', marginTop: '4px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <span>{entry.character === 'sonic' ? '🔵 Sonic' : '⚫ Shadow'}</span>
                            <span>•</span>
                            <span style={{ color: '#DDD' }}>Fase {entry.map}</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {/* Score */}
                  <div style={{
                    color: isTop3 ? MEDAL_COLORS[index] : '#FFD700',
                    fontSize: '14px', fontWeight: '900',
                    fontFamily: '"Press Start 2P", monospace',
                    textShadow: isTop3 ? `0 0 10px ${MEDAL_COLORS[index]}44` : 'none',
                    flexShrink: 0,
                  }}>
                    {entry.score.toLocaleString()}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255, 215, 0, 0.1)',
          textAlign: 'center',
        }}>
          <button onClick={fetchScores} style={{
            padding: '8px 20px', background: 'rgba(255,215,0,0.1)',
            border: '1px solid rgba(255,215,0,0.2)', borderRadius: '10px',
            color: '#FFD700', cursor: 'pointer', fontSize: '11px',
            fontFamily: 'sans-serif', fontWeight: '700',
          }}>
            🔄 Atualizar
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {activeProfileId && (
          <ProfileOverlay uid={activeProfileId} onClose={() => setActiveProfileId(null)} />
        )}
      </AnimatePresence>

    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════
   MINI COMPONENTE: Botão de Login no canto da tela
   ═══════════════════════════════════════════════════ */
export const UserBadge: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px', background: 'rgba(0,0,0,0.6)',
          border: '2px solid #FFD700', borderRadius: '50px',
          color: '#FFD700', cursor: 'pointer', fontSize: '11px',
          fontFamily: '"Press Start 2P", monospace',
          backdropFilter: 'blur(10px)',
        }}
      >
        🏆 RANKING
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '6px 14px', background: 'rgba(0,0,0,0.6)',
        border: '2px solid #FFD700', borderRadius: '50px',
        cursor: 'pointer', backdropFilter: 'blur(10px)',
      }}
    >
      <img src={user.photoURL || ''} alt="" referrerPolicy="no-referrer" style={{
        width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #FFD700',
      }} />
      <span style={{ color: '#FFD700', fontSize: '10px', fontFamily: '"Press Start 2P", monospace' }}>
        🏆 RANKING
      </span>
    </motion.button>
  );
};

export default RankingOverlay;
