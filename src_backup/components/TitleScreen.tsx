import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TitleScreenProps {
  onStart: () => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  const [introState, setIntroState] = useState<'black' | 'ring-drop' | 'sonic-incoming' | 'sonic-dash' | 'impact' | 'done'>('black');

  useEffect(() => {
    // Timings adjusted for maximum cinematic feel
    const t1 = setTimeout(() => setIntroState('ring-drop'), 500);
    const t2 = setTimeout(() => setIntroState('sonic-incoming'), 2500);
    const t3 = setTimeout(() => setIntroState('sonic-dash'), 3200); // More tension buildup
    const t4 = setTimeout(() => setIntroState('impact'), 3400);
    const t5 = setTimeout(() => setIntroState('done'), 3550);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []);

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
        `}
      </style>

      {/* --- ENTRY EFFECT OVERLAY --- */}
      <AnimatePresence>
        {(introState !== 'done' && introState !== 'impact') && (
          <motion.div exit={{ opacity: 0 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            
            {/* Cinematic Camera Wrapper */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: (introState === 'sonic-incoming' || introState === 'sonic-dash') ? 'cinematicZoom 1s ease-in forwards' : 'none' }}>
              
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
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '300px', height: '150px', background: 'url(/imagens/sonic%20correndo.gif) center/contain no-repeat', filter: 'drop-shadow(80px 0 0 rgba(0, 0, 255, 1)) hue-rotate(-20deg) brightness(2)', animation: 'sonicDashExtreme 0.15s linear forwards', zIndex: 20 }} />
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
          
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '10px', height: '150vh', background: '#FFF', boxShadow: '0 0 50px #FFF', animation: 'impactCross 0.15s ease-out forwards', zIndex: 2 }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '150vw', height: '10px', background: '#FFF', boxShadow: '0 0 50px #FFF', animation: 'impactCross 0.15s ease-out forwards', zIndex: 2 }} />
          
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
        animate={{ opacity: (introState === 'impact' || introState === 'done') ? 1 : 0 }}
        transition={{ duration: 0.1 }}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, animation: introState === 'impact' ? 'screenShake 0.15s ease-out' : 'none' }}
      >
        
        {/* === BACKGROUND LAYERS === */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '25vh', background: 'radial-gradient(circle at top, #4FC3F7 0%, #0277BD 100%)', zIndex: 0 }} />
        
        <div style={{ position: 'absolute', top: '5%', left: '-20%', animation: 'panBackground 45s linear infinite', zIndex: 1 }}>
          <svg width="200" height="80" viewBox="0 0 200 80" fill="white" style={{ opacity: 0.9, filter: 'drop-shadow(5px 5px 0 rgba(0,0,0,0.15))' }}>
            <circle cx="40" cy="50" r="25"/><circle cx="80" cy="40" r="35"/><circle cx="125" cy="35" r="25"/><circle cx="160" cy="50" r="20"/><rect x="40" y="40" width="120" height="35" rx="15"/>
          </svg>
        </div>
        <div style={{ position: 'absolute', top: '15%', left: '40%', animation: 'panBackground 60s linear infinite', zIndex: 1, transform: 'scale(1.5)' }}>
          <svg width="200" height="80" viewBox="0 0 200 80" fill="white" style={{ opacity: 0.7, filter: 'drop-shadow(5px 5px 0 rgba(0,0,0,0.1))' }}>
            <circle cx="40" cy="50" r="25"/><circle cx="80" cy="40" r="35"/><circle cx="125" cy="35" r="25"/><circle cx="160" cy="50" r="20"/><rect x="40" y="40" width="120" height="35" rx="15"/>
          </svg>
        </div>

        <div style={{ position: 'absolute', bottom: '25vh', left: 0, width: '200%', height: '25vh', display: 'flex', animation: 'panBackground 50s linear infinite', zIndex: 2, alignItems: 'flex-end' }}>
           {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} style={{ position: 'relative', flex: '1 1 0', height: '100%', minWidth: '15vw' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '80%', background: '#0D47A1', clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: '15%', width: '70%', height: '100%', background: '#1565C0', clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: '-15%', width: '60%', height: '60%', background: '#1E88E5', clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)' }} />
              </div>
           ))}
        </div>

        <div style={{ position: 'absolute', bottom: '20vh', left: 0, right: 0, height: '5vh', background: 'linear-gradient(to bottom, #00BCD4, #0277BD)', zIndex: 3, borderTop: '3px solid #E0F7FA' }}>
           <div style={{ width: '100%', height: '100%', backgroundImage: 'radial-gradient(circle, #FFF 1.5px, transparent 2px)', backgroundSize: '40px 15px', animation: 'waterSparkle 1.5s infinite alternate' }} />
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '20vh', zIndex: 4, overflow: 'hidden' }}>
          <div style={{ 
            width: '200%', height: '200%', position: 'absolute', left: '-50%', top: 0,
            backgroundColor: '#8B4513', 
            backgroundImage: 'repeating-linear-gradient(45deg, #8B4513 25%, transparent 25%, transparent 75%, #8B4513 75%, #8B4513), repeating-linear-gradient(45deg, #8B4513 25%, #A0522D 25%, #A0522D 75%, #8B4513 75%, #8B4513)', 
            backgroundSize: '80px 80px', 
            animation: 'checkerMove 0.8s linear infinite', 
            borderTop: '15px solid #32CD32', 
            boxShadow: 'inset 0 20px 30px rgba(0,0,0,0.6)',
            transform: 'perspective(500px) rotateX(45deg)',
            transformOrigin: 'top center'
          }} />
        </div>

        {/* === FOREGROUND FLEX CONTAINER === */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Logo Group (Drops down dramatically) */}
          <motion.div 
            initial={{ y: -300, scale: 0.5, opacity: 0 }}
            animate={introState === 'done' || introState === 'impact' ? { y: 0, scale: 1, opacity: 1 } : { y: -300, scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.1 }}
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '-10vh' }}
          >
            <div style={{ animation: 'logoHover 4s ease-in-out infinite', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', width: 'clamp(250px, 45vw, 500px)', aspectRatio: '1/1', borderRadius: '50%', border: 'clamp(15px, 2.5vw, 25px) solid #FFD700', boxShadow: 'inset 0 0 30px #B8860B, 0 0 30px #B8860B, inset 0 0 5px white, 0 0 10px white', animation: 'spinRing 4s linear infinite', zIndex: 1 }} />
              <div style={{ position: 'absolute', width: 'clamp(300px, 80vw, 800px)', height: 'clamp(100px, 15vw, 160px)', background: 'linear-gradient(to bottom, #FF0000, #8B0000)', clipPath: 'polygon(5% 0, 95% 0, 100% 50%, 95% 100%, 5% 100%, 0% 50%)', zIndex: 2, border: '4px solid white', borderRadius: '15px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
                 <div style={{ position: 'absolute', top: '4px', left: '4px', right: '4px', bottom: '4px', border: '2px solid #FF6347', borderRadius: '10px' }} />
              </div>
              <div style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 'clamp(2.5rem, 8vw, 7rem)', color: '#002E99', WebkitTextStroke: 'clamp(2px, 0.4vw, 4px) white', textShadow: 'clamp(3px, 0.5vw, 6px) clamp(3px, 0.5vw, 6px) 0 #FFF, 0 15px 25px rgba(0,0,0,0.8)', margin: 0, textAlign: 'center', lineHeight: '1.1' }}>
                  SONIC<br/>WEB
                </h1>
                <div style={{ background: '#FFD700', padding: 'clamp(5px, 1vw, 10px) clamp(20px, 4vw, 40px)', borderRadius: '50px', border: '4px solid white', marginTop: 'clamp(10px, 2vw, 20px)', boxShadow: '0 8px 0 #B8860B, 0 10px 20px rgba(0,0,0,0.5)' }}>
                    <h2 style={{ fontFamily: 'sans-serif', fontSize: 'clamp(1rem, 2.5vw, 2rem)', color: '#000', letterSpacing: 'clamp(3px, 0.5vw, 8px)', margin: 0, fontWeight: 900, fontStyle: 'italic' }}>
                      THE CLASSIC ERA
                    </h2>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Button Group (Pops up from bottom) */}
          <motion.div 
            initial={{ scale: 0, y: 100 }}
            animate={introState === 'done' || introState === 'impact' ? { scale: 1, y: 0 } : { scale: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
            style={{ marginTop: 'clamp(40px, 10vh, 100px)', zIndex: 10 }}
          >
            <motion.button 
              whileHover={{ scale: 1.15, filter: 'brightness(1.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart} 
              style={{ 
                background: '#FF0000', border: '5px solid #FFF', color: '#FFF', 
                padding: 'clamp(12px, 2vw, 20px) clamp(30px, 5vw, 60px)', 
                fontSize: 'clamp(16px, 2.5vw, 26px)', 
                fontFamily: '"Press Start 2P", monospace', 
                cursor: 'pointer', borderRadius: '15px', 
                animation: 'pulseBtn 2s infinite',
                textShadow: '2px 2px 0 #000'
              }}
            >
              PRESS START
            </motion.button>
          </motion.div>

        </div>

        {/* === CHARACTER (Slides in from the side) === */}
        <motion.div 
          initial={{ x: '-100vw' }}
          animate={introState === 'done' || introState === 'impact' ? { x: 0 } : { x: '-100vw' }}
          transition={{ type: "spring", stiffness: 80, delay: 0.4 }}
          style={{ position: 'absolute', bottom: 0, left: '2%', width: 'clamp(120px, 25vw, 350px)', height: 'clamp(120px, 25vw, 350px)', zIndex: 20, pointerEvents: 'none' }}
        >
          <img src="/imagens/sonic%20correndo.gif" alt="Sonic Racing Trail" style={{ position: 'absolute', left: '-15%', top: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: 0.4, filter: 'blur(3px) brightness(1.5)' }} />
          <img src="/imagens/sonic%20correndo.gif" alt="Sonic Racing" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(20px 20px 0px rgba(0,0,0,0.5))' }} />
        </motion.div>

      </motion.div>
    </div>
  );
};

export default TitleScreen;
