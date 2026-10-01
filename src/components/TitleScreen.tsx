import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateTailsAdvice, speakText } from '../services/aiService';
import { UISound, BGMManager } from '../utils/audio';
import { auth, getUserProfile } from '../services/firebase';
import { PROFILE_STYLE_ITEMS } from '../constants/storeItems';
import { UserBadge } from './RankingOverlay'; // Only import UserBadge statically

// Lazy load heavy overlays
const StoreOverlay = lazy(() => import('./StoreOverlay').then(m => ({ default: m.StoreOverlay })));
const MiniGamesMenu = lazy(() => import('./minigames/MiniGamesMenu').then(m => ({ default: m.MiniGamesMenu })));
const RankingOverlay = lazy(() => import('./RankingOverlay').then(m => ({ default: m.RankingOverlay })));
const ProfileOverlay = lazy(() => import('./ProfileOverlay').then(m => ({ default: m.ProfileOverlay })));

interface TitleScreenProps {
  onStart: () => void;
  globalRings: number;
  inventory: any;
  onBuy: (item: string, cost: number) => void;
  voiceState: any;
  addGlobalRings: (amount: number) => void;
  skipIntro?: boolean;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, globalRings, inventory, onBuy, voiceState, addGlobalRings, skipIntro }) => {
  const [introState, setIntroState] = useState<'black' | 'sega-logo' | 'ring-drop' | 'sonic-incoming' | 'sonic-dash' | 'impact' | 'done'>(skipIntro ? 'done' : 'black');
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isMiniGamesOpen, setIsMiniGamesOpen] = useState(false);
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  useEffect(() => {
    if (auth.currentUser && !isProfileOpen && !isStoreOpen) {
      getUserProfile(auth.currentUser.uid).then(p => setUserProfile(p));
    }
  }, [auth.currentUser, isProfileOpen, isStoreOpen]);
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setMusicVolume(v);
    BGMManager.setVolume(v);
  };

  const toggleMute = () => {
    if (musicVolume > 0) {
      setMusicVolume(0);
      BGMManager.setVolume(0);
    } else {
      setMusicVolume(0.5);
      BGMManager.setVolume(0.5);
    }
  };
  
  const [tailsAdvice, setTailsAdvice] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setTailsAdvice("Pensando...");
    const playerState = { rings: globalRings, speed: 0, context: `Responda a essa mensagem do jogador de forma curta, prestativa e amigável, no universo do Sonic: "${chatInput}"` };
    const advice = await generateTailsAdvice(playerState);
    setTailsAdvice(advice);
    speakText(advice);
    setChatInput('');
    setTimeout(() => setTailsAdvice(null), 8000);
  };
  
  const getAdvice = async () => {
    setTailsAdvice("Observando o sistema...");
    const playerState = { rings: globalRings, speed: 0, context: "Diga que você é o Tails, que está feliz em ver o jogador no Menu Principal e dê uma dica rápida." };
    const advice = await generateTailsAdvice(playerState);
    setTailsAdvice(advice);
    speakText(advice);
    setTimeout(() => setTailsAdvice(null), 5000);
  };

  useEffect(() => {
    if (skipIntro) {
      BGMManager.playRandom();
      return;
    }

    // Timings adjusted for maximum cinematic feel
    const t0 = setTimeout(() => {
      setIntroState('sega-logo');
      const segaAudio = new Audio('/imagens/sons/Sega Intro (Sonic 1) - TopperGame.mp3');
      segaAudio.play().catch(e => console.log('Autoplay prevented by browser:', e));
    }, 100);
    const t1 = setTimeout(() => {
      setIntroState('ring-drop');
      BGMManager.playRandom();
    }, 5600);
    const t2 = setTimeout(() => setIntroState('sonic-incoming'), 7600);
    const t3 = setTimeout(() => setIntroState('sonic-dash'), 8300); // More tension buildup
    const t4 = setTimeout(() => setIntroState('impact'), 8500);
    const t5 = setTimeout(() => setIntroState('done'), 8650);

    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [skipIntro]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
      <style>
        {`
          @keyframes panBackground { from { transform: translateX(0vw); } to { transform: translateX(-100vw); } }
          @keyframes spinRing { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
          @keyframes waterSparkle { 0% { opacity: 0.3; } 100% { opacity: 0.9; transform: scale(1.1); } }
          @keyframes checkerMove { from { background-position: 0 0; } to { background-position: -100px 100px; } }
          @keyframes logoHover { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
          @keyframes pulseBtn { 0% { transform: scale(1); box-shadow: 0 10px 0 #8B0000, 0 15px 25px rgba(0,0,0,0.5); } 50% { transform: scale(1.05); box-shadow: 0 10px 0 #8B0000, 0 15px 40px rgba(255,0,0,0.8); } 100% { transform: scale(1); box-shadow: 0 10px 0 #8B0000, 0 15px 25px rgba(0,0,0,0.5); } }
          
          /* ENTRY ANIMATIONS */
          @keyframes segaReveal {
             0% { opacity: 0; filter: blur(20px); transform: scale(0.8); }
             20% { opacity: 1; filter: blur(0px); transform: scale(1); }
             80% { opacity: 1; filter: blur(0px); transform: scale(1); }
             100% { opacity: 0; filter: blur(10px); transform: scale(1.2); }
          }
          @keyframes ringDrop { 
            0% { transform: translateY(-100vh) rotateY(0deg) scale(0.5); opacity: 0; filter: drop-shadow(0 0 50px #FFD700); } 
            20% { transform: translateY(0) rotateY(360deg) scale(1); opacity: 1; filter: drop-shadow(0 0 20px #FFD700); }
            45% { transform: translateY(-200px) rotateY(720deg) scale(1); }
            65% { transform: translateY(0) rotateY(1080deg) scale(1.2); }
            80% { transform: translateY(-60px) rotateY(1440deg) scale(1.2); }
            100% { transform: translateY(0) rotateY(1800deg) scale(1.5); filter: drop-shadow(0 0 40px #FFD700); }
          }
          @keyframes dustImpact { 0% { width: 0px; height: 0px; opacity: 1; } 100% { width: 300px; height: 40px; opacity: 0; } }
          @keyframes floorRipple { 0% { width: 0px; height: 0px; opacity: 1; border-width: 10px; } 100% { width: 500px; height: 150px; opacity: 0; border-width: 0px; } }
          @keyframes shockwave { 0% { transform: translate(-50%, -50%) scale(0); opacity: 1; border-width: 50px; } 100% { transform: translate(-50%, -50%) scale(20); opacity: 0; border-width: 0px; } }
          
          /* Tension */
          @keyframes cinematicZoom { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
          @keyframes speedLinesReveal { 0% { opacity: 0; transform: scale(2) rotate(0deg); } 100% { opacity: 1; transform: scale(1) rotate(180deg); } }
          @keyframes speedLinesSpinAccel { 0% { transform: rotate(0deg); } 100% { transform: rotate(1080deg); } }
          
          /* Dash & Impact */
          @keyframes sonicDashExtreme { 0% { left: -50vw; transform: skewX(-30deg) scaleY(0.5) scaleX(2); filter: blur(10px); } 100% { left: 150vw; transform: skewX(-30deg) scaleY(0.5) scaleX(2); filter: blur(10px); } }
          @keyframes screenShake { 0% { transform: translate(0, 0); } 20% { transform: translate(-30px, 30px); } 40% { transform: translate(30px, -30px); } 60% { transform: translate(-30px, -30px); } 80% { transform: translate(30px, 30px); } 100% { transform: translate(0, 0); } }
          @keyframes impactCross { 0% { transform: translate(-50%, -50%) scale(0) rotate(45deg); opacity: 1; } 50% { transform: translate(-50%, -50%) scale(30) rotate(45deg); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(0) rotate(45deg); opacity: 0; } }
          @keyframes particleExplode1 { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(-200px,-200px) scale(0); opacity: 0; } }
          @keyframes particleExplode2 { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(200px,-150px) scale(0); opacity: 0; } }
          @keyframes particleExplode3 { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(-150px,200px) scale(0); opacity: 0; } }
          @keyframes particleExplode4 { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(250px,100px) scale(0); opacity: 0; } }

          /* SNOWFLAKES */
          @keyframes snowfall {
            0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(100vh) translateX(20px) rotate(360deg); opacity: 0; }
          }
          .snowflake {
            position: absolute;
            top: -10vh;
            color: #FFF;
            user-select: none;
            pointer-events: none;
            z-index: 100;
            text-shadow: 0 0 10px rgba(255,255,255,0.8);
            animation: snowfall linear infinite forwards;
          }
        `}
      </style>

      {/* --- ENTRY EFFECT OVERLAY --- */}
      <AnimatePresence>
        {(introState !== 'done' && introState !== 'impact') && (
          <motion.div exit={{ opacity: 0 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            
            {/* Cinematic Camera Wrapper */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: (introState === 'sonic-incoming' || introState === 'sonic-dash') ? 'cinematicZoom 1s ease-in forwards' : 'none' }}>
              
              {introState === 'sega-logo' && (
                <div style={{ position: 'absolute', width: '100%', height: '100%', background: '#FFF', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, animation: 'segaReveal 5.5s ease-in-out forwards' }}>
                  <h1 style={{ 
                    fontFamily: 'Arial Black, sans-serif', 
                    fontSize: 'clamp(6rem, 15vw, 15rem)', 
                    color: '#0044CC',
                    margin: 0,
                    fontWeight: 900,
                    letterSpacing: '10px',
                    WebkitTextFillColor: 'transparent',
                    background: 'repeating-linear-gradient(to bottom, #0044CC, #0044CC 8px, #FFF 8px, #FFF 12px)',
                    WebkitBackgroundClip: 'text',
                    filter: 'drop-shadow(3px 3px 0px rgba(0,0,0,0.2))'
                  }}>
                    SEGA
                  </h1>
                </div>
              )}

              {(introState === 'ring-drop' || introState === 'sonic-incoming' || introState === 'sonic-dash') && (
                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '50%', border: '15px solid #FFD700', boxShadow: 'inset 0 0 20px #FFF, 0 0 30px #FFD700', animation: 'ringDrop 2s cubic-bezier(0.28, 0.84, 0.42, 1) forwards', zIndex: 10 }} />
                  
                  {/* Ripples & Dust */}
                  <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', borderRadius: '50%', border: '5px solid #FFD700', animation: 'floorRipple 1s ease-out 0.4s forwards' }} />
                  <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', borderRadius: '50%', border: '5px solid #FFF', animation: 'floorRipple 1s ease-out 1.3s forwards' }} />
                  
                  <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.4)', filter: 'blur(5px)', animation: 'dustImpact 0.8s ease-out 0.4s forwards', zIndex: 5 }} />
                  <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.3)', filter: 'blur(5px)', animation: 'dustImpact 0.8s ease-out 1.3s forwards', zIndex: 5 }} />
                </div>
              )}

              {introState === 'sonic-incoming' && (
                <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.15) 0deg 2deg, transparent 2deg 12deg)', animation: 'speedLinesReveal 0.5s ease-out forwards, speedLinesSpinAccel 1s cubic-bezier(0.5, 0, 1, 1) forwards', zIndex: 1 }} />
              )}

              {introState === 'sonic-dash' && (
                <>
                  <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'repeating-conic-gradient(from 0deg, rgba(0, 191, 255, 0.5) 0deg 2deg, transparent 2deg 10deg)', animation: 'spinRing 0.1s linear infinite', zIndex: 1 }} />
                  
                  {/* Trails / Afterimages for extreme speed */}
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '300px', height: '150px', background: 'url(/imagens/sonic%20correndo.gif) center/contain no-repeat', opacity: 0.2, filter: 'blur(15px) hue-rotate(40deg)', animation: 'sonicDashExtreme 0.15s linear 0.04s forwards', zIndex: 17 }} />
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '300px', height: '150px', background: 'url(/imagens/sonic%20correndo.gif) center/contain no-repeat', opacity: 0.5, filter: 'blur(8px) hue-rotate(20deg)', animation: 'sonicDashExtreme 0.15s linear 0.02s forwards', zIndex: 18 }} />
                  
                  {/* Main Sonic */}
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '300px', height: '150px', background: 'url(/imagens/sonic%20correndo.gif) center/contain no-repeat', filter: 'drop-shadow(80px 0 0 rgba(0, 0, 255, 1)) brightness(1.5)', animation: 'sonicDashExtreme 0.15s linear forwards', zIndex: 20 }} />
                  
                  {/* Energy Beam */}
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '800px', height: '30px', background: '#FFF', boxShadow: '0 0 150px 80px #00BFFF', filter: 'blur(10px)', animation: 'sonicDashExtreme 0.15s linear forwards', zIndex: 19 }} />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- IMPACT FRAME OVERLAY --- */}
      {introState === 'impact' && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#FFF', opacity: 0.8, filter: 'invert(100%)', zIndex: 1 }} />
          
          {/* Shockwave Ring */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100px', height: '100px', borderRadius: '50%', border: '20px solid #00BFFF', animation: 'shockwave 0.3s ease-out forwards', zIndex: 2 }} />
          
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '10px', height: '150vh', background: '#FFF', boxShadow: '0 0 50px #FFF', animation: 'impactCross 0.15s ease-out forwards', zIndex: 3 }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '150vw', height: '10px', background: '#FFF', boxShadow: '0 0 50px #FFF', animation: 'impactCross 0.15s ease-out forwards', zIndex: 3 }} />
          
          {/* Particle Explosion */}
          <div style={{ position: 'absolute', width: '20px', height: '20px', background: '#FFD700', borderRadius: '50%', boxShadow: '0 0 20px #FFF', animation: 'particleExplode1 0.3s ease-out forwards', zIndex: 3 }} />
          <div style={{ position: 'absolute', width: '20px', height: '20px', background: '#FFD700', borderRadius: '50%', boxShadow: '0 0 20px #FFF', animation: 'particleExplode2 0.3s ease-out forwards', zIndex: 3 }} />
          <div style={{ position: 'absolute', width: '20px', height: '20px', background: '#00BFFF', borderRadius: '50%', boxShadow: '0 0 20px #FFF', animation: 'particleExplode3 0.3s ease-out forwards', zIndex: 3 }} />
          <div style={{ position: 'absolute', width: '20px', height: '20px', background: '#00BFFF', borderRadius: '50%', boxShadow: '0 0 20px #FFF', animation: 'particleExplode4 0.3s ease-out forwards', zIndex: 3 }} />
        </div>
      )}

      {/* --- CLASSIC SONIC TITLE SCREEN --- */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: (introState === 'black' || introState === 'sega-logo') ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, animation: introState === 'impact' ? 'screenShake 0.15s ease-out' : 'none' }}
      >
        
        {/* Profile Button Top Left */}
        {auth.currentUser && (introState === 'done' || introState === 'impact') && (
          <>
            {(() => {
              const equippedStyles = userProfile?.equippedStyles || {};
              const equippedBorder = PROFILE_STYLE_ITEMS.find(i => i.id === equippedStyles.border);
              const equippedNeon = PROFILE_STYLE_ITEMS.find(i => i.id === equippedStyles.neon);
              const equippedName = PROFILE_STYLE_ITEMS.find(i => i.id === equippedStyles.name);
              
              const borderCss = equippedBorder?.cssValue || '2px solid #FFD700';
              const filterCss = PROFILE_STYLE_ITEMS.find(i => i.id === equippedStyles.filter)?.cssValue || 'none';
              const nameColorCss = equippedName?.cssValue || '#FFF';
              const nameShadowCss = equippedName ? `0 0 10px ${equippedName.cssValue}` : 'none';

              return (
                <motion.button
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => { UISound.play('click'); setIsProfileOpen(true); }}
                  style={{
                    position: 'absolute', top: '20px', left: '20px', zIndex: 100,
                    background: 'rgba(0,0,0,0.5)', border: '2px solid #FFD700', borderRadius: '50px',
                    padding: '5px 15px 5px 5px', display: 'flex', alignItems: 'center', gap: '10px',
                    cursor: 'pointer', backdropFilter: 'blur(5px)', color: '#FFF'
                  }}
                >
                  <img src={auth.currentUser.photoURL || ''} alt="avatar" style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    border: borderCss, 
                    filter: filterCss,
                    boxShadow: equippedNeon ? equippedNeon.cssValue : 'none'
                  }} referrerPolicy="no-referrer" />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                     <span style={{ fontSize: '10px', fontFamily: '"Press Start 2P", monospace', color: '#FFD700' }}>PERFIL</span>
                     <span style={{ fontSize: '12px', fontFamily: 'sans-serif', fontWeight: 'bold', color: nameColorCss, textShadow: nameShadowCss }}>{userProfile?.displayName || auth.currentUser.displayName}</span>
                  </div>
                </motion.button>
              );
            })()}

            {/* Sound Control Wrapper */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                position: 'absolute', top: '80px', left: '20px', zIndex: 100,
                background: 'rgba(0,0,0,0.5)', border: '2px solid #FFD700', borderRadius: '50px',
                padding: '5px 15px', display: 'flex', alignItems: 'center', gap: '8px',
                backdropFilter: 'blur(5px)', color: '#FFF'
              }}
            >
              <button 
                onClick={() => { toggleMute(); UISound.play('click'); }}
                style={{ 
                  background: 'none', border: 'none', color: '#FFF', fontSize: '16px', 
                  cursor: 'pointer', padding: 0, margin: 0, outline: 'none'
                }}
              >
                {musicVolume === 0 ? '🔇' : (musicVolume < 0.5 ? '🔉' : '🔊')}
              </button>
              <input 
                type="range" 
                min="0" max="1" step="0.05" 
                value={musicVolume} 
                onChange={handleVolumeChange}
                style={{ width: '60px', cursor: 'pointer', accentColor: '#FFD700' }}
              />
            </motion.div>
          </>
        )}
        
        {/* === SKY BACKGROUND === */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url(/imagens/sky_bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(76,161,175,0.7), rgba(168,224,255,0.7), rgba(224,247,250,0.7))', zIndex: 0 }} />
        
        {/* Glowing Sun */}
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '20vh', height: '20vh', zIndex: 0 }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#FFFDF0', boxShadow: '0 0 50px #FFF, 0 0 120px #FFD700', opacity: 0.95 }} />
        </div>

        {/* === SNOWFLAKES === */}
        {Array.from({ length: 40 }).map((_, i) => {
          const left = Math.random() * 100;
          const animDuration = 4 + Math.random() * 8;
          const animDelay = Math.random() * 5;
          const fontSize = 0.5 + Math.random() * 1.5;
          const opacity = 0.3 + Math.random() * 0.7;
          return (
            <div key={i} className="snowflake" style={{
              left: `${left}vw`,
              animationDuration: `${animDuration}s`,
              animationDelay: `${animDelay}s`,
              fontSize: `${fontSize}rem`,
              opacity: opacity
            }}>
              ❄
            </div>
          );
        })}

        {/* Far Layer (Majestic Fuji & Distant Peaks) - VERY BRIGHT */}
        <div style={{ position: 'absolute', bottom: '25vh', left: 0, width: '200%', height: '50vh', display: 'flex', animation: 'panBackground 150s linear infinite', zIndex: 1, alignItems: 'flex-end' }}>
           {[1, 2].map(k => (
              <div key={k} style={{ position: 'relative', width: '100%', height: '100%' }}>
                 <svg viewBox="0 0 1200 400" preserveAspectRatio="none" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 -5px 15px rgba(255,255,255,0.4))' }}>
                    <defs>
                       <linearGradient id={`fujiGrad${k}`} x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#A9CCE3" />
                         <stop offset="100%" stopColor="#7FB3D5" />
                       </linearGradient>
                       <linearGradient id={`snowGrad${k}`} x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#FFFFFF" />
                         <stop offset="100%" stopColor="#EBF5FB" />
                       </linearGradient>
                    </defs>
                    
                    {/* Distant Left Peak */}
                    <path d="M 0,400 L 50,320 L 150,220 L 280,350 L 400,400 Z" fill="#85C1E9" />
                    <path d="M 150,220 L 280,350 L 150,400 Z" fill="#5DADE2" />
                    <path d="M 150,220 L 170,240 L 130,250 Z" fill="#FFF" opacity="0.8" />

                    {/* Majestic Center Anime Mountain */}
                    <path d="M 200,400 C 450,380 550,120 600,60 C 650,120 750,380 1000,400 Z" fill={`url(#fujiGrad${k})`} />
                    <path d="M 600,60 C 650,120 750,380 1000,400 L 600,400 Z" fill="rgba(41, 128, 185, 0.15)" />
                    
                    {/* Snow Cap with Anime Drips */}
                    <path d="M 500,200 C 530,130 580,70 600,60 C 620,70 670,130 700,200 C 670,220 660,170 630,210 C 600,160 590,220 560,190 C 530,220 520,170 500,200 Z" fill={`url(#snowGrad${k})`} filter="drop-shadow(0 5px 3px rgba(255,255,255,0.5))" />

                    {/* Distant Right Peak */}
                    <path d="M 850,400 L 950,280 L 1080,180 L 1150,320 L 1200,400 Z" fill="#85C1E9" />
                    <path d="M 1080,180 L 1150,320 L 1080,400 Z" fill="#5DADE2" />
                    <path d="M 1080,180 L 1100,210 L 1060,200 Z" fill="#FFF" opacity="0.8" />
                 </svg>
              </div>
           ))}
        </div>

        {/* Mid Layer (Jagged Mountains) - MID BRIGHT */}
        <div style={{ position: 'absolute', bottom: '25vh', left: 0, width: '200%', height: '35vh', display: 'flex', animation: 'panBackground 90s linear infinite', zIndex: 2, alignItems: 'flex-end' }}>
           {[1, 2].map(k => (
              <div key={k} style={{ position: 'relative', width: '100%', height: '100%' }}>
                 <svg viewBox="0 0 1200 400" preserveAspectRatio="none" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 -5px 10px rgba(133, 193, 233, 0.3))' }}>
                    <defs>
                       <linearGradient id={`midGrad${k}`} x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#5DADE2" />
                         <stop offset="100%" stopColor="#3498DB" />
                       </linearGradient>
                    </defs>
                    <path d="M 0,400 L 0,350 L 120,200 L 250,320 L 380,180 L 500,300 L 700,150 L 850,250 L 980,120 L 1100,280 L 1200,180 L 1200,400 Z" fill={`url(#midGrad${k})`} />
                    {/* Shadow Sides */}
                    <path d="M 120,200 L 250,320 L 120,400 Z" fill="rgba(33, 97, 140, 0.3)" />
                    <path d="M 380,180 L 500,300 L 380,400 Z" fill="rgba(33, 97, 140, 0.3)" />
                    <path d="M 700,150 L 850,250 L 700,400 Z" fill="rgba(33, 97, 140, 0.3)" />
                    <path d="M 980,120 L 1100,280 L 980,400 Z" fill="rgba(33, 97, 140, 0.3)" />
                    
                    {/* Anime Highlight Lines */}
                    <path d="M 120,200 L 120,400 M 380,180 L 380,400 M 700,150 L 700,400 M 980,120 L 980,400" stroke="#AED6F1" strokeWidth="2" strokeDasharray="15, 8" opacity="0.6" />
                 </svg>
              </div>
           ))}
        </div>

        {/* Foreground Layer (Rolling Hills) - BRIGHT VIVID */}
        <div style={{ position: 'absolute', bottom: '25vh', left: 0, width: '200%', height: '20vh', display: 'flex', animation: 'panBackground 45s linear infinite', zIndex: 3, alignItems: 'flex-end' }}>
           {[1, 2].map(k => (
              <div key={k} style={{ position: 'relative', width: '100%', height: '100%' }}>
                 <svg viewBox="0 0 1200 200" preserveAspectRatio="none" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 -5px 10px rgba(41, 128, 185, 0.4))' }}>
                    <defs>
                       <linearGradient id={`frontGrad${k}`} x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#3498DB" />
                         <stop offset="100%" stopColor="#21618C" />
                       </linearGradient>
                       <linearGradient id={`frontHighlight${k}`} x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#85C1E9" />
                         <stop offset="100%" stopColor="transparent" />
                       </linearGradient>
                    </defs>
                    {/* Base Rolling Hills */}
                    <path d="M 0,200 L 0,150 Q 150,100 300,150 T 600,120 T 900,160 T 1200,140 L 1200,200 Z" fill={`url(#frontGrad${k})`} />
                    
                    {/* Highlight Overlay */}
                    <path d="M 0,200 L 0,150 Q 150,100 300,150 T 600,120 T 900,160 T 1200,140 L 1200,200 Z" fill={`url(#frontHighlight${k})`} opacity="0.3"/>
                    
                    {/* Gentle Snow Patches on Hills (No Trees) */}
                    <path d="M 150,125 Q 180,115 200,128 Q 170,140 150,125 Z" fill="#FFF" opacity="0.6" />
                    <path d="M 450,135 Q 480,125 500,138 Q 470,150 450,135 Z" fill="#FFF" opacity="0.6" />
                    <path d="M 750,140 Q 780,130 800,143 Q 770,155 750,140 Z" fill="#FFF" opacity="0.6" />
                    <path d="M 1050,150 Q 1080,140 1100,153 Q 1070,165 1050,150 Z" fill="#FFF" opacity="0.6" />
                 </svg>
              </div>
           ))}
        </div>

        {/* === ULTIMATE GREEN HILL ROLLERCOASTER GROUND === */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35vh', zIndex: 4, overflow: 'hidden' }}>
          
          {/* Parallax Layer 1: Background Hills */}
          <div style={{ position: 'absolute', bottom: '0', left: 0, width: '200%', height: '100%', display: 'flex', animation: 'panBackground 8s linear infinite', opacity: 0.9 }}>
             {[1, 2].map(k => (
                <div key={k} style={{ width: '100%', height: '100%', position: 'relative' }}>
                   <svg viewBox="0 0 1200 300" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                      <path d="M 0,180 Q 150,80 300,180 T 600,180 T 900,180 T 1200,180 L 1200,300 L 0,300 Z" fill="#229954" />
                      <path d="M 0,180 Q 150,80 300,180 T 600,180 T 900,180 T 1200,180" fill="none" stroke="#2ECC71" strokeWidth="8" />
                   </svg>
                </div>
             ))}
          </div>

          {/* Parallax Layer 2: Main Running Ground (Sonic syncs to this) */}
          <div style={{ position: 'absolute', bottom: '0', left: 0, width: '200%', height: '80%', display: 'flex', animation: 'panBackground 3s linear infinite', filter: 'drop-shadow(0 -10px 15px rgba(0,0,0,0.4))' }}>
             {[1, 2].map(k => (
                <div key={k} style={{ width: '100%', height: '100%', position: 'relative' }}>
                   <svg viewBox="0 0 1200 250" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                      <defs>
                         <linearGradient id={`dirtGrad${k}`} x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="#D35400" />
                           <stop offset="100%" stopColor="#6E2C00" />
                         </linearGradient>
                         <pattern id={`checkers${k}`} width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
                           <rect width="40" height="80" fill="rgba(255,255,255,0.2)" />
                           <rect x="40" width="40" height="80" fill="rgba(0,0,0,0.15)" />
                           <rect y="40" width="80" height="40" fill="rgba(0,0,0,0.1)" />
                         </pattern>
                         <linearGradient id={`grassGrad${k}`} x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="#58D68D" />
                           <stop offset="100%" stopColor="#1D8348" />
                         </linearGradient>
                      </defs>
                      
                      {/* Deep dirt */}
                      <path d="M 0,100 Q 150,20 300,100 T 600,100 T 900,100 T 1200,100 L 1200,250 L 0,250 Z" fill={`url(#dirtGrad${k})`} />
                      
                      {/* Iconic Checkers */}
                      <path d="M 0,100 Q 150,20 300,100 T 600,100 T 900,100 T 1200,100 L 1200,250 L 0,250 Z" fill={`url(#checkers${k})`} />

                      {/* Lush Grass Top */}
                      <path d="M 0,140 Q 150,60 300,140 T 600,140 T 900,140 T 1200,140 L 1200,100 Q 1050,20 900,100 T 600,100 T 300,100 T 0,100 Z" fill={`url(#grassGrad${k})`} />
                      
                      {/* Bright Edge Highlight */}
                      <path d="M 0,100 Q 150,20 300,100 T 600,100 T 900,100 T 1200,100" fill="none" stroke="#D5F5E3" strokeWidth="8" strokeLinecap="round" />
                      
                      {/* Detailed Grass Tufts along the edge */}
                      <path d="M 150,20 L 140,0 L 155,15 L 160,-5 L 165,15 Z" fill="#D5F5E3" />
                      <path d="M 450,180 L 440,160 L 455,175 L 460,155 L 465,175 Z" fill="#D5F5E3" />
                      <path d="M 750,20 L 740,0 L 755,15 L 760,-5 L 765,15 Z" fill="#D5F5E3" />
                      <path d="M 1050,180 L 1040,160 L 1055,175 L 1060,155 L 1065,175 Z" fill="#D5F5E3" />
                      
                      {/* Magical Emeralds embedded in dirt (New!) */}
                      <polygon points="150,150 160,135 170,150 160,165" fill="#00F3FF" filter="drop-shadow(0 0 10px #00F3FF)" opacity="0.9" />
                      <polygon points="600,200 615,180 630,200 615,220" fill="#FF00FF" filter="drop-shadow(0 0 10px #FF00FF)" opacity="0.9" />
                      <polygon points="1050,160 1060,145 1070,160 1060,175" fill="#FFD700" filter="drop-shadow(0 0 10px #FFD700)" opacity="0.9" />
                   </svg>
                </div>
             ))}
          </div>
          
          {/* Foreground Anime River (Fastest) */}
          <div style={{ position: 'absolute', bottom: '0', left: 0, width: '200%', height: '20%', display: 'flex', animation: 'panBackground 1.2s linear infinite', zIndex: 5, opacity: 0.95 }}>
             {[1, 2].map(k => (
                <div key={k} style={{ width: '100%', height: '100%', position: 'relative' }}>
                   <svg viewBox="0 0 1200 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 -5px 15px rgba(0,255,255,0.6))' }}>
                      <defs>
                         <linearGradient id={`riverGrad${k}`} x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="#00FFFF" />
                           <stop offset="50%" stopColor="#0077FF" />
                           <stop offset="100%" stopColor="#000088" />
                         </linearGradient>
                         <linearGradient id={`riverFoam${k}`} x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                           <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                         </linearGradient>
                      </defs>
                      
                      {/* Deep Water Base */}
                      <path d="M 0,30 Q 200,50 400,20 T 800,40 T 1200,30 L 1200,100 L 0,100 Z" fill={`url(#riverGrad${k})`} />
                      
                      {/* Anime Foam Edge */}
                      <path d="M 0,30 Q 200,50 400,20 T 800,40 T 1200,30" fill="none" stroke={`url(#riverFoam${k})`} strokeWidth="20" strokeLinecap="round" opacity="0.8" />
                      <path d="M 0,30 Q 200,50 400,20 T 800,40 T 1200,30" fill="none" stroke="#FFFFFF" strokeWidth="4" />
                      
                      {/* Fast moving water lines/reflections */}
                      <path d="M 150,50 L 300,45 M 500,60 L 650,55 M 850,40 L 1000,35" stroke="rgba(255,255,255,0.7)" strokeWidth="4" strokeLinecap="round" />
                      <path d="M 50,70 L 150,65 M 350,75 L 500,70 M 700,65 L 850,60 M 1050,75 L 1150,70" stroke="rgba(0,255,255,0.8)" strokeWidth="5" strokeLinecap="round" />
                      
                      {/* Glowing sparkles in the water */}
                      <circle cx="200" cy="40" r="3" fill="#FFF" filter="blur(1px)" />
                      <circle cx="600" cy="70" r="5" fill="#00FFFF" filter="drop-shadow(0 0 5px #00FFFF)" />
                      <circle cx="1000" cy="50" r="3" fill="#FFF" />
                   </svg>
                </div>
             ))}
          </div>
        </div>

        {/* === FOREGROUND FLEX CONTAINER === */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Logo Group (Drops down dramatically) */}
          {/* Logo Group (Drops down dramatically) */}
          <motion.div 
            initial={{ y: -300, scale: 0.5, opacity: 0 }}
            animate={introState === 'done' || introState === 'impact' ? { y: 0, scale: 1, opacity: 1 } : { y: -300, scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.1 }}
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '-10vh' }}
          >
            <div style={{ animation: 'logoHover 4s ease-in-out infinite', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              
              {/* Classic Spinning Gold Ring (Absolute Center Background) */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
                  <div style={{ width: 'clamp(220px, 65vw, 600px)', aspectRatio: '1/1', borderRadius: '50%', border: 'clamp(10px, 2vw, 20px) solid #FFD700', boxShadow: 'inset 0 0 20px #B8860B, 0 0 20px #B8860B, inset 0 0 5px white, 0 0 10px white', animation: 'spinRing 4s linear infinite' }} />
              </div>
              
              {/* Sleek, Sharp Red Ribbon (Spanning across the ring, behind the text) */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', width: 'clamp(300px, 85vw, 800px)', height: 'clamp(50px, 12vw, 100px)', filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.6))' }}>
                 <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'linear-gradient(to bottom, #FF3333 0%, #CC0000 40%, #660000 100%)', clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)', borderTop: '4px solid white', borderBottom: '4px solid white' }}>
                    <div style={{ width: '100%', height: '100%', backgroundImage: 'radial-gradient(rgba(0,0,0,0.2) 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
                 </div>
                 <div style={{ position: 'absolute', width: '96%', height: '75%', border: '4px solid #FFD700', clipPath: 'polygon(4% 0%, 96% 0%, 100% 50%, 96% 100%, 4% 100%, 0% 50%)', boxShadow: 'inset 0 0 10px #B8860B' }} />
              </div>
              
              <div style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                
                {/* Stunning Modern Dual-Layered Logo Text */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'skew(-8deg)', zIndex: 4, position: 'relative' }}>
                  <h1 style={{ 
                    fontFamily: 'Impact, "Arial Black", sans-serif', 
                    fontSize: 'clamp(4rem, 13vw, 9rem)', 
                    fontWeight: 900,
                    fontStyle: 'italic',
                    background: 'linear-gradient(to bottom, #33AAFF 0%, #0022AA 70%, #000055 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    WebkitTextStroke: 'clamp(2px, 0.5vw, 5px) #FFFFFF', 
                    filter: 'drop-shadow(6px 6px 0px rgba(0,0,0,0.8)) drop-shadow(0 10px 15px rgba(0,0,0,0.5))',
                    margin: 0, 
                    textAlign: 'center', 
                    lineHeight: '0.9', 
                    letterSpacing: '-2px',
                  }}>
                    SONIC
                  </h1>
                  <h1 style={{ 
                    fontFamily: 'Impact, "Arial Black", sans-serif', 
                    fontSize: 'clamp(2.5rem, 8vw, 5rem)', 
                    fontWeight: 900,
                    fontStyle: 'italic',
                    background: 'linear-gradient(to bottom, #FFEE00 0%, #FF8800 70%, #AA2200 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    WebkitTextStroke: 'clamp(1px, 0.4vw, 3px) #FFFFFF', 
                    filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.9))',
                    margin: 0, 
                    textAlign: 'center', 
                    lineHeight: '0.9', 
                    letterSpacing: '1px',
                    marginTop: 'clamp(-10px, -2vw, -20px)', // Pulled up to overlap slightly
                    zIndex: 5
                  }}>
                    WEB
                  </h1>
                </div>
                
                {/* Smooth 3D Yellow Tag */}
                <div style={{ background: '#FFD700', padding: 'clamp(5px, 1vw, 10px) clamp(20px, 4vw, 40px)', borderRadius: '50px', border: '4px solid white', marginTop: 'clamp(15px, 3vw, 25px)', boxShadow: '0 8px 0 #B8860B, 0 10px 20px rgba(0,0,0,0.5)', transform: 'skew(-5deg)' }}>
                    <h2 style={{ fontFamily: 'sans-serif', fontSize: 'clamp(1rem, 2.5vw, 1.8rem)', color: '#000', letterSpacing: 'clamp(2px, 0.5vw, 5px)', margin: 0, fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase' }}>
                      The Classic Era
                    </h2>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Glossy 3D Colored Pill Buttons (No Emojis) */}
          <motion.div 
            initial={{ scale: 0, y: 100 }}
            animate={introState === 'done' || introState === 'impact' ? { scale: 1, y: 0 } : { scale: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
            style={{ marginTop: 'clamp(30px, 8vh, 80px)', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <motion.button 
              onHoverStart={() => UISound.play('hover')}
              whileHover={{ scale: 1.1, filter: 'brightness(1.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { UISound.play('start'); onStart(); }}
              style={{ 
                background: 'linear-gradient(to bottom, #FF4B4B, #D60000)', 
                border: '4px solid #FFF', color: '#FFF', 
                padding: 'clamp(12px, 2vw, 20px) clamp(30px, 5vw, 60px)', 
                fontSize: 'clamp(16px, 2.5vw, 26px)', 
                fontFamily: '"Press Start 2P", monospace', 
                cursor: 'pointer', borderRadius: '50px', 
                boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.6), inset 0 -6px 15px rgba(0,0,0,0.4), 0 10px 20px rgba(0,0,0,0.6)',
                textShadow: '2px 2px 0 #000, 0 0 10px rgba(255,255,255,0.5)',
                animation: 'pulseBtn 2s infinite',
                display: 'block', marginInline: 'auto'
              }}
            >
              PRESS START
            </motion.button>
            
            <motion.button 
              onHoverStart={() => UISound.play('hover')}
              whileHover={{ scale: 1.1, filter: 'brightness(1.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { UISound.play('click'); setIsStoreOpen(true); }}
              style={{ 
                background: 'linear-gradient(to bottom, #FFE066, #FFA500)', 
                border: '4px solid #FFF', color: '#000', 
                padding: 'clamp(10px, 1.5vw, 15px) clamp(20px, 4vw, 40px)', 
                fontSize: 'clamp(12px, 2vw, 18px)', 
                fontFamily: '"Press Start 2P", monospace', 
                cursor: 'pointer', borderRadius: '50px', 
                boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.6), inset 0 -6px 15px rgba(0,0,0,0.4), 0 10px 20px rgba(0,0,0,0.6)',
                display: 'block', marginInline: 'auto'
              }}
            >
              LOJA
            </motion.button>
            
            <motion.button 
              onHoverStart={() => UISound.play('hover')}
              whileHover={{ scale: 1.1, filter: 'brightness(1.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { UISound.play('click'); setIsMiniGamesOpen(true); }}
              style={{ 
                background: 'linear-gradient(to bottom, #66FF66, #00B300)', 
                border: '4px solid #FFF', color: '#FFF', 
                padding: 'clamp(10px, 1.5vw, 15px) clamp(20px, 4vw, 40px)', 
                fontSize: 'clamp(12px, 2vw, 18px)', 
                fontFamily: '"Press Start 2P", monospace', 
                cursor: 'pointer', borderRadius: '50px', 
                boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.6), inset 0 -6px 15px rgba(0,0,0,0.4), 0 10px 20px rgba(0,0,0,0.6)',
                textShadow: '2px 2px 0 #000',
                display: 'block', marginInline: 'auto'
              }}
            >
              MINI JOGOS
            </motion.button>
            
            <motion.button 
              onHoverStart={() => UISound.play('hover')}
              whileHover={{ scale: 1.1, filter: 'brightness(1.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { UISound.play('click'); setIsRankingOpen(true); }}
              style={{ 
                background: 'linear-gradient(to bottom, #D966FF, #8A00E6)', 
                border: '4px solid #FFF', color: '#FFF', 
                padding: 'clamp(10px, 1.5vw, 15px) clamp(20px, 4vw, 40px)', 
                fontSize: 'clamp(12px, 2vw, 18px)', 
                fontFamily: '"Press Start 2P", monospace', 
                cursor: 'pointer', borderRadius: '50px', 
                boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.6), inset 0 -6px 15px rgba(0,0,0,0.4), 0 10px 20px rgba(0,0,0,0.6)',
                textShadow: '2px 2px 0 #000',
                display: 'block', marginInline: 'auto'
              }}
            >
              RANKING
            </motion.button>
            
            <motion.button 
              onHoverStart={() => UISound.play('hover')}
              whileHover={{ scale: 1.1, filter: 'brightness(1.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { 
                UISound.play('click'); 
                if (auth.currentUser) setIsProfileOpen(true); 
                else setIsRankingOpen(true); // Redireciona pro ranking pra logar
              }}
              style={{ 
                background: 'linear-gradient(to bottom, #66CCFF, #0088CC)', 
                border: '4px solid #FFF', color: '#FFF', 
                padding: 'clamp(10px, 1.5vw, 15px) clamp(20px, 4vw, 40px)', 
                fontSize: 'clamp(12px, 2vw, 18px)', 
                fontFamily: '"Press Start 2P", monospace', 
                cursor: 'pointer', borderRadius: '50px', 
                boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.6), inset 0 -6px 15px rgba(0,0,0,0.4), 0 10px 20px rgba(0,0,0,0.6)',
                textShadow: '2px 2px 0 #000',
                display: 'block', marginInline: 'auto'
              }}
            >
              MEU PERFIL
            </motion.button>
          </motion.div>

        </div>

        {/* AI & Utilities Hub (Bottom Right - Responsive) */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={(introState === 'done' || introState === 'impact') ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ delay: 0.8 }}
          style={{ 
            position: 'absolute', bottom: 'clamp(10px, 2vh, 20px)', right: 'clamp(10px, 2vw, 20px)', zIndex: 100, display: 'flex', flexDirection: 'column', 
            background: 'linear-gradient(135deg, rgba(10,30,80,0.8) 0%, rgba(0,0,20,0.95) 100%)', 
            padding: '15px', borderRadius: '15px', border: '2px solid #00BFFF', 
            boxShadow: '0 10px 30px rgba(0,191,255,0.4), inset 0 0 20px rgba(0,191,255,0.2)',
            backdropFilter: 'blur(10px)', width: 'clamp(260px, 80vw, 320px)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', borderBottom: '1px solid rgba(0,191,255,0.5)', paddingBottom: '10px' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #ffa500', backgroundColor: '#87CEEB', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                <img src="/imagens/tails_pixel_art.jpg" alt="Tails" style={{ width: '130%', height: '130%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
             </div>
             <div>
               <div style={{ color: '#00BFFF', fontSize: '14px', fontFamily: '"Press Start 2P", monospace', textShadow: '0 0 5px #00BFFF' }}>
                 MILES ELECTRIC
               </div>
               <div style={{ color: '#ffa500', fontSize: '10px', fontFamily: 'Orbitron, sans-serif', marginTop: '3px' }}>
                 Tails I.A. Integrada Online
               </div>
             </div>
          </div>

          <button 
            onClick={getAdvice}
            style={{ 
              padding: '10px 12px', borderRadius: '10px', border: '2px solid #ffa500', 
              background: 'linear-gradient(to right, rgba(255,165,0,0.2), rgba(255,165,0,0.05))', 
              color: '#ffa500', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Orbitron, sans-serif',
              textAlign: 'center', transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '1px',
              boxShadow: '0 0 10px rgba(255,165,0,0.3)', fontSize: '12px'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,165,0,0.4)'}
            onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(to right, rgba(255,165,0,0.2), rgba(255,165,0,0.05))'}
          >
            🦊 Chamar Dica do Tails
          </button>
          
          <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
             <input 
               type="text" 
               value={chatInput}
               onChange={e => setChatInput(e.target.value)}
               placeholder="Pergunte algo ao Tails..."
               style={{ 
                 padding: '12px', borderRadius: '10px', border: '1px solid #00BFFF', 
                 outline: 'none', flex: 1, fontFamily: 'sans-serif',
                 backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFF',
                 boxShadow: 'inset 0 0 10px rgba(0,191,255,0.2)'
               }}
             />
             <button type="submit" style={{ 
                 padding: '0 15px', borderRadius: '10px', border: '2px solid #00BFFF', 
                 backgroundColor: '#002E99', color: '#FFF', cursor: 'pointer', fontWeight: 'bold',
                 fontFamily: 'Orbitron, sans-serif', transition: 'all 0.2s', boxShadow: '0 0 10px rgba(0,191,255,0.4)',
                 fontSize: '12px'
               }}
               onMouseEnter={e => e.currentTarget.style.backgroundColor = '#00BFFF'}
               onMouseLeave={e => e.currentTarget.style.backgroundColor = '#002E99'}
               >
               ENVIAR
             </button>
          </form>
        </motion.div>

        {/* AI Advice Bubble */}
        <AnimatePresence>
          {tailsAdvice && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: 'absolute', bottom: 'clamp(200px, 25vh, 220px)', right: 'clamp(10px, 2vw, 20px)', zIndex: 100,
                background: 'linear-gradient(to right, #FFF, #F0F0F0)', padding: '15px', borderRadius: '20px 20px 0 20px',
                border: '4px solid #ffa500', color: '#000', width: 'clamp(200px, 60vw, 300px)',
                fontFamily: 'sans-serif', fontWeight: 'bold', boxShadow: '0 15px 30px rgba(0,0,0,0.6), 0 0 20px rgba(255,165,0,0.4)',
                display: 'flex', gap: '10px', alignItems: 'center'
              }}
            >
              <div style={{ minWidth: '50px', height: '50px', borderRadius: '10px', border: '2px solid #ffa500', backgroundColor: '#87CEEB', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                 <img src="/imagens/tails_pixel_art.jpg" alt="Tails Talking" style={{ width: '150%', height: '150%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
              </div>
              <div style={{ fontSize: '13px', lineHeight: '1.4', wordWrap: 'break-word', overflow: 'hidden' }}>{tailsAdvice}</div>
              <div style={{
                position: 'absolute', bottom: '-20px', right: '30px',
                borderWidth: '20px 20px 0 0', borderStyle: 'solid',
                borderColor: '#ffa500 transparent transparent transparent'
              }}/>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlays */}
        <AnimatePresence>
          <Suspense fallback={null}>
            {isStoreOpen && (
              <StoreOverlay rings={globalRings} inventory={inventory} onBuy={onBuy} onClose={() => setIsStoreOpen(false)} />
            )}
            {isMiniGamesOpen && (
              <MiniGamesMenu onClose={() => setIsMiniGamesOpen(false)} addGlobalRings={addGlobalRings} />
            )}
            {isRankingOpen && (
              <RankingOverlay onClose={() => setIsRankingOpen(false)} />
            )}
          </Suspense>
        </AnimatePresence>

        {/* === CHARACTER (Runs dynamically on the undulating hills) === */}
        <motion.div 
          initial={{ x: '-100vw', y: 0 }}
          animate={
            introState === 'done' || introState === 'impact' 
              ? { x: 0, y: [0, -50, 0, 50, 0] } 
              : { x: '-100vw', y: 0 }
          }
          transition={{ 
            x: { type: "spring", stiffness: 80, delay: 0.4 },
            y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } 
          }}
          style={{ position: 'absolute', bottom: '15vh', left: '2%', width: 'clamp(120px, 25vw, 350px)', height: 'clamp(120px, 25vw, 350px)', zIndex: 20, pointerEvents: 'none' }}
        >
          <img src="/imagens/sonic%20correndo.gif" alt="Sonic Racing Trail" style={{ position: 'absolute', left: '-15%', top: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: 0.4, filter: 'blur(3px) brightness(1.5)' }} />
          <img src="/imagens/sonic%20correndo.gif" alt="Sonic Racing" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(20px 20px 0px rgba(0,0,0,0.5))' }} />
        </motion.div>

      </motion.div>

      <AnimatePresence>
        <Suspense fallback={null}>
          {isProfileOpen && auth.currentUser && (
            <ProfileOverlay uid={auth.currentUser.uid} onClose={() => setIsProfileOpen(false)} />
          )}
        </Suspense>
      </AnimatePresence>

    </div>
  );
};

export default TitleScreen;
