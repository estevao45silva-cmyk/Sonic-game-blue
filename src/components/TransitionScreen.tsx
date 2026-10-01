import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TransitionScreenProps {
  level: number;
  character: 'sonic' | 'shadow' | 'tails';
  onComplete: () => void;
}

const levelNames = {
  1: 'GREEN HILL',
  2: 'MARBLE',
  3: 'STAR LIGHT',
  4: 'CASINO NIGHT',
  5: 'DEATH EGG',
};

const TransitionScreen: React.FC<TransitionScreenProps> = ({ level, character, onComplete }) => {
  const [phase, setPhase] = useState<'intro' | 'sprint'>('intro');
  const [variant, setVariant] = useState<number>(1);

  // Pick a random variant on mount (1 to 7)
  useEffect(() => {
    setVariant(Math.floor(Math.random() * 7) + 1);
  }, []);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('sprint');
    }, 2000); // 2 seconds holding

    const timer2 = setTimeout(() => {
      onComplete();
    }, 2800); // Total 2.8 seconds transition

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  const levelName = levelNames[level as keyof typeof levelNames] || 'UNKNOWN';

  // Variant 1: Classic Sonic 3
  const renderVariant1 = () => (
    <>
      <div style={{
        position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
        background: 'repeating-conic-gradient(from 0deg, #000 0deg 10deg, #001133 10deg 20deg)',
        animation: 'speedLines 10s linear infinite', opacity: 0.4, zIndex: 0
      }} />
      <motion.div
        initial={{ x: '100vw', skewX: -30 }} animate={{ x: '-10vw', skewX: -30 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        style={{ position: 'absolute', top: 0, right: 0, width: '70vw', height: '120vh', background: 'linear-gradient(90deg, #8B0000 0%, #DC143C 100%)', borderLeft: '15px solid #FFD700', boxShadow: '-15px 0 30px rgba(0,0,0,0.8)', zIndex: 1 }}
      />
      <motion.div
        initial={{ x: '-100vw', skewX: -30 }} animate={{ x: '-20vw', skewX: -30 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.2 }}
        style={{ position: 'absolute', bottom: 0, left: 0, width: '80vw', height: '40vh', background: 'linear-gradient(90deg, #000080 0%, #0000CD 100%)', borderRight: '15px solid #FFD700', boxShadow: '15px 0 30px rgba(0,0,0,0.8)', zIndex: 2 }}
      />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px', zIndex: 3
      }} />
    </>
  );

  // Variant 2: Fighting Game VS Screen (Street Fighter / Smash Bros style)
  const renderVariant2 = () => (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 0 }} />
      <motion.div
        initial={{ x: '-100vw', skewX: -45 }} animate={{ x: '-20vw', skewX: -45 }} transition={{ type: 'spring', stiffness: 120, damping: 12 }}
        style={{ position: 'absolute', top: '-10%', left: 0, width: '70vw', height: '120%', background: 'radial-gradient(circle at center, #FF4500, #8B0000)', boxShadow: '20px 0 50px rgba(255,69,0,0.8)', zIndex: 1 }}
      />
      <motion.div
        initial={{ x: '100vw', skewX: -45 }} animate={{ x: '50vw', skewX: -45 }} transition={{ type: 'spring', stiffness: 120, damping: 12 }}
        style={{ position: 'absolute', top: '-10%', left: 0, width: '70vw', height: '120%', background: 'radial-gradient(circle at center, #1E90FF, #00008B)', boxShadow: '-20px 0 50px rgba(30,144,255,0.8)', zIndex: 1 }}
      />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 2px, transparent 2px)', backgroundSize: '100px 100px', animation: 'zoom-in 2s linear infinite', opacity: 0.3, zIndex: 2 }} />
    </>
  );

  // Variant 3: Speed Hazard / Checkerboard (Racing Game style)
  const renderVariant3 = () => (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#FFD700', zIndex: 0 }} />
      <motion.div
        initial={{ y: '100vh' }} animate={{ y: 0 }} transition={{ type: 'tween', duration: 0.6, ease: "circOut" }}
        style={{ position: 'absolute', top: '50%', left: 0, width: '100vw', height: '50vh', background: 'repeating-linear-gradient(45deg, #000, #000 40px, #FFD700 40px, #FFD700 80px)', zIndex: 1, animation: 'hazard-scroll 2s linear infinite' }}
      />
      <motion.div
        initial={{ y: '-100vh' }} animate={{ y: 0 }} transition={{ type: 'tween', duration: 0.6, ease: "circOut", delay: 0.1 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '50vh', background: '#000', borderBottom: '10px solid #FFF', zIndex: 2 }}
      />
      <div style={{ position: 'absolute', top: '20%', left: 0, width: '100%', height: '5px', background: 'rgba(255,255,255,0.5)', zIndex: 3, animation: 'flash 0.1s infinite' }} />
    </>
  );

  // Variant 4: JRPG Encounter Screen (Final Fantasy / Persona style)
  const renderVariant4 = () => (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, #4A00E0, #8E2DE2)', zIndex: 0 }} />
      <motion.div
        initial={{ scale: 0, rotate: 180 }} animate={{ scale: 2, rotate: 0 }} transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{ position: 'absolute', top: '50%', left: '50%', width: '100vw', height: '100vw', marginLeft: '-50vw', marginTop: '-50vw', background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.2) 90deg, transparent 180deg, rgba(255,255,255,0.2) 270deg, transparent 360deg)', borderRadius: '50%', zIndex: 1 }}
      />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', zIndex: 2 }} />
    </>
  );

  // Variant 5: Golden Ring Portal (Classic Sonic)
  const renderVariant5 = () => (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 0 }} />
      <motion.div
        initial={{ scale: 0, rotate: 0 }} animate={{ scale: 3, rotate: 360 }} transition={{ duration: 10, ease: "linear", repeat: Infinity }}
        style={{
          position: 'absolute', top: '50%', left: '50%', width: '150vw', height: '150vw', marginLeft: '-75vw', marginTop: '-75vw',
          background: 'repeating-conic-gradient(from 0deg, #FFD700 0deg 15deg, #FFA500 15deg 30deg, #000 30deg 45deg)',
          borderRadius: '50%', zIndex: 1, filter: 'blur(4px)', opacity: 0.7
        }}
      />
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100vw', height: '100vw', marginLeft: '-50vw', marginTop: '-50vw', background: 'radial-gradient(circle, transparent 20%, #000 70%)', zIndex: 2 }} />
    </>
  );

  // Variant 6: Comic Book / Manga Action (Black & White Speedlines)
  const renderVariant6 = () => (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#FFF', zIndex: 0 }} />
      <div style={{
        position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
        background: 'repeating-conic-gradient(from 0deg, #000 0deg 2deg, #FFF 2deg 4deg, #000 4deg 5deg, #FFF 5deg 10deg)',
        animation: 'speedLines 4s linear infinite', opacity: 1, zIndex: 1
      }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, #FFF 10%, transparent 60%)', zIndex: 2 }} />
    </>
  );

  // Variant 7: Shonen Anime Aura (Dragon Ball / Naruto style)
  const renderVariant7 = () => (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#4A0000', zIndex: 0 }} />
      <div style={{
        position: 'absolute', bottom: 0, left: '-50%', width: '200%', height: '150%',
        background: 'radial-gradient(ellipse at bottom, rgba(255, 215, 0, 0.8) 0%, rgba(255, 69, 0, 0.6) 40%, transparent 70%)',
        animation: 'aura-pulse 0.5s infinite alternate', zIndex: 1
      }} />
      <div style={{
        position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
        backgroundImage: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.2) 0deg 10deg, transparent 10deg 20deg)',
        animation: 'aura-spin 3s linear infinite', opacity: 0.8, zIndex: 2
      }} />
    </>
  );

  // Determine text styles dynamically based on variant
  const getTextStyle = (v: number) => {
    switch (v) {
      case 2: return { color: '#FFF', stroke: '4px #000', shadow: '8px 8px 0 #FF4500, -8px -8px 0 #1E90FF' };
      case 4: return { color: '#FFF', stroke: '1px #FFF', shadow: '0 0 20px #00FFFF, 0 0 40px #8E2DE2' };
      case 6: return { color: '#000', stroke: '4px #FFF', shadow: '10px 10px 0 #000' };
      case 7: return { color: '#FFD700', stroke: '4px #000', shadow: '0 0 30px #FF4500, 5px 5px 0 #8B0000' };
      default: return { color: '#FFF', stroke: '2px #000', shadow: '8px 8px 0 #000, 0 0 20px rgba(255,255,255,0.5)' };
    }
  };

  const getSubTextStyle = (v: number) => {
    switch (v) {
      case 2: return { color: '#FFD700', stroke: '3px #000', shadow: '5px 5px 0 #000' };
      case 4: return { color: '#00FFFF', stroke: 'none', shadow: '0 0 15px #00FFFF' };
      case 6: return { color: '#FFF', stroke: '4px #000', shadow: 'none' };
      case 7: return { color: '#FFF', stroke: '2px #000', shadow: '0 0 15px #FFD700' };
      default: return { color: '#FFD700', stroke: '2px #000', shadow: '6px 6px 0 #000' };
    }
  };

  const tStyle = getTextStyle(variant);
  const sStyle = getSubTextStyle(variant);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(20px)", scale: 1.2 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', overflow: 'hidden' }}
    >
      <style>
        {`
          @keyframes speedLines { 0% { transform: scale(1) rotate(0deg); } 100% { transform: scale(2) rotate(360deg); } }
          @keyframes hazard-scroll { 0% { background-position: 0px 0px; } 100% { background-position: -113px 0px; } }
          @keyframes flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
          @keyframes zoom-in { 0% { background-size: 100px 100px; } 100% { background-size: 120px 120px; } }
          @keyframes aura-pulse { 0% { transform: scaleY(1); opacity: 0.8; } 100% { transform: scaleY(1.1); opacity: 1; } }
          @keyframes aura-spin { 0% { transform: scale(1.5) rotate(0deg); } 100% { transform: scale(1.5) rotate(360deg); } }
        `}
      </style>

      {variant === 1 && renderVariant1()}
      {variant === 2 && renderVariant2()}
      {variant === 3 && renderVariant3()}
      {variant === 4 && renderVariant4()}
      {variant === 5 && renderVariant5()}
      {variant === 6 && renderVariant6()}
      {variant === 7 && renderVariant7()}

      <div style={{ zIndex: 10, position: 'absolute', top: '20%', right: '5%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '90vw' }}>
        
        {/* Animated staggered Level Name */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {levelName.split(' ').map((word, i) => (
            <motion.h1
              key={i}
              initial={
                variant === 1 ? { opacity: 0, y: -50, scale: 2 }
                : variant === 2 ? { opacity: 0, scale: 5, rotate: 15 } // Fighting Game Slam
                : variant === 3 ? { opacity: 0, scale: 0, rotate: 180 }
                : variant === 4 ? { opacity: 0, filter: "blur(20px)" } // JRPG Elegant Fade
                : variant === 5 ? { opacity: 0, scale: 5, rotate: -90 }
                : variant === 6 ? { opacity: 0, x: -300, skewX: -45 }
                : { opacity: 0, scale: 0.1, y: 300 } // Shonen Aura Rise
              }
              animate={
                variant === 4 ? { opacity: 1, filter: "blur(0px)" } 
                : { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, filter: "blur(0px)", skewX: 0 }
              }
              transition={
                variant === 1 ? { type: 'spring', stiffness: 200, delay: 0.6 + i * 0.15 }
                : variant === 2 ? { type: 'spring', bounce: 0.7, delay: 0.5 + i * 0.2 }
                : variant === 3 ? { type: 'spring', bounce: 0.6, delay: 0.6 + i * 0.2 }
                : variant === 4 ? { duration: 0.8, ease: "easeOut", delay: 0.6 + i * 0.3 }
                : variant === 5 ? { type: 'spring', stiffness: 50, delay: 0.8 + i * 0.2 }
                : variant === 6 ? { type: 'spring', stiffness: 300, damping: 10, delay: 0.5 + i * 0.2 }
                : { type: 'spring', stiffness: 100, damping: 5, delay: 0.7 + i * 0.15 }
              }
              style={{
                fontFamily: variant === 4 ? '"Palatino Linotype", "Book Antiqua", Palatino, serif' : '"Press Start 2P", monospace',
                fontSize: variant === 4 ? 'clamp(40px, 8vw, 90px)' : 'clamp(30px, 6vw, 75px)',
                fontWeight: variant === 4 ? 'normal' : 'bold',
                color: tStyle.color,
                WebkitTextStroke: tStyle.stroke,
                textShadow: tStyle.shadow,
                margin: 0,
                fontStyle: variant === 2 || variant === 6 || variant === 7 ? 'italic' : 'normal',
                textTransform: 'uppercase'
              }}
            >
              {word}
            </motion.h1>
          ))}
        </div>
        
        {/* Zone */}
        <motion.h2
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 100, delay: 1.0 }}
          style={{
            fontFamily: variant === 4 ? '"Palatino Linotype", "Book Antiqua", Palatino, serif' : '"Press Start 2P", monospace',
            fontSize: 'clamp(24px, 4vw, 45px)',
            fontWeight: variant === 4 ? 'normal' : 'bold',
            color: sStyle.color,
            WebkitTextStroke: sStyle.stroke,
            textShadow: sStyle.shadow,
            margin: '10px 0',
            letterSpacing: variant === 4 ? '25px' : '15px'
          }}
        >
          ZONE
        </motion.h2>
        
        {/* Act */}
        <motion.div
          initial={
            variant === 1 ? { opacity: 0, scale: 0, rotate: -15 }
            : variant === 2 ? { opacity: 0, x: 300, skewX: 30 }
            : variant === 3 ? { opacity: 0, y: 100, skewX: 45 }
            : variant === 4 ? { opacity: 0, y: 20 }
            : variant === 5 ? { opacity: 0, scale: 0 }
            : variant === 6 ? { opacity: 0, skewY: 20 }
            : { opacity: 0, scale: 3 } // Anime blast
          }
          animate={{ opacity: 1, scale: 1, rotate: 0, y: 0, x: 0, skewX: 0, skewY: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 10, delay: 1.4 }}
          style={{
             background: variant === 2 ? '#FF4500' : variant === 4 ? 'transparent' : variant === 6 ? '#000' : '#FFF',
             padding: variant === 4 ? '10px 0' : '10px 30px',
             borderRadius: (variant === 2 || variant === 6 || variant === 4) ? '0px' : '50px',
             border: variant === 2 ? '4px solid #FFF' : variant === 4 ? 'none' : variant === 6 ? '8px solid #FFF' : variant === 7 ? '4px solid #FF4500' : '5px solid #000',
             boxShadow: variant === 2 ? '10px 10px 0 #1E90FF' : variant === 4 ? 'none' : variant === 6 ? '15px 15px 0 #000' : variant === 7 ? '0 0 20px #FFD700' : '10px 10px 0 #000',
             marginTop: '20px',
             borderTop: variant === 4 ? '2px solid rgba(255,255,255,0.5)' : undefined,
             borderBottom: variant === 4 ? '2px solid rgba(255,255,255,0.5)' : undefined,
          }}
        >
          <h3
            style={{
              fontFamily: variant === 4 ? '"Palatino Linotype", "Book Antiqua", Palatino, serif' : '"Press Start 2P", monospace',
              fontSize: variant === 4 ? 'clamp(25px, 5vw, 60px)' : 'clamp(35px, 6vw, 70px)',
              fontWeight: variant === 4 ? 'normal' : 'bold',
              color: variant === 2 ? '#FFF' : variant === 4 ? '#FFF' : variant === 6 ? '#FFF' : variant === 7 ? '#FF0000' : '#DC143C',
              textShadow: variant === 4 ? '0 0 10px #8E2DE2' : variant === 7 ? '2px 2px 0 #FFD700' : 'none',
              margin: 0,
              letterSpacing: variant === 4 ? '5px' : 'normal'
            }}
          >
            ACT {level}
          </h3>
        </motion.div>
      </div>

      {/* The Character Sprinting out of the screen at the very end! */}
      <motion.img
        initial={{ x: '-50vw' }}
        animate={phase === 'sprint' ? { x: '150vw' } : { x: '10vw' }}
        transition={phase === 'sprint' ? { duration: 0.35, ease: 'easeIn' } : { duration: 0.8, type: 'spring', stiffness: 50, delay: 1.2 }}
        src={`/imagens/${character === 'sonic' ? 'sonic%20correndo.gif' : character === 'tails' ? 'dg96skq-28d97178-f8c8-455d-aa3f-ff258fb295da.gif' : 'shadow%20correndo.gif'}`}
        style={{
          position: 'absolute',
          bottom: '10%',
          width: 'clamp(200px, 20vw, 350px)',
          height: 'clamp(200px, 20vw, 350px)',
          objectFit: 'contain',
          zIndex: 20,
          filter: variant === 6 
            ? (phase === 'sprint' ? 'grayscale(100%) contrast(200%) drop-shadow(-50px 0 0 rgba(0,0,0,1)) blur(4px)' : 'grayscale(100%) contrast(200%) drop-shadow(10px 20px 0px rgba(0,0,0,1))')
            : (phase === 'sprint' ? 'drop-shadow(-50px 0 0 rgba(0,0,0,0.5)) blur(4px)' : 'drop-shadow(10px 20px 0px rgba(0,0,0,0.5))')
        }}
      />
    </motion.div>
  );
};

export default TransitionScreen;
