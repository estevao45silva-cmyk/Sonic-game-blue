import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TransitionScreenProps {
  level: number;
  character: 'sonic' | 'shadow';
  onComplete: () => void;
}

const levelNames = {
  1: 'GREEN HILL',
  2: 'MARBLE',
  3: 'STAR LIGHT',
};

const TransitionScreen: React.FC<TransitionScreenProps> = ({ level, character, onComplete }) => {
  const [phase, setPhase] = useState<'intro' | 'sprint'>('intro');

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(20px)", scale: 1.2 }}
      transition={{ duration: 0.5 }}
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <style>
        {`
          @keyframes speedLines {
            0% { transform: scale(1) rotate(0deg); }
            100% { transform: scale(2) rotate(360deg); }
          }
          @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
          }
        `}
      </style>

      {/* Wormhole / Speedlines Background */}
      <div style={{
        position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
        background: 'repeating-conic-gradient(from 0deg, #000 0deg 10deg, #001133 10deg 20deg)',
        animation: 'speedLines 10s linear infinite',
        opacity: 0.4,
        zIndex: 0
      }} />

      {/* Giant Sonic 3 Style Red Polygon Banner */}
      <motion.div
        initial={{ x: '100vw', skewX: -30 }}
        animate={{ x: '-10vw', skewX: -30 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '70vw',
          height: '120vh',
          background: 'linear-gradient(90deg, #8B0000 0%, #DC143C 100%)',
          borderLeft: '15px solid #FFD700',
          boxShadow: '-15px 0 30px rgba(0,0,0,0.8)',
          zIndex: 1
        }}
      />

      {/* Giant Blue Polygon Banner (Bottom) */}
      <motion.div
        initial={{ x: '-100vw', skewX: -30 }}
        animate={{ x: '-20vw', skewX: -30 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.2 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '80vw',
          height: '40vh',
          background: 'linear-gradient(90deg, #000080 0%, #0000CD 100%)',
          borderRight: '15px solid #FFD700',
          boxShadow: '15px 0 30px rgba(0,0,0,0.8)',
          zIndex: 2
        }}
      />

      {/* Grid Pattern overlay for true 90s aesthetic */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        zIndex: 3
      }} />

      <div style={{ zIndex: 10, position: 'absolute', top: '20%', right: '5%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '80vw' }}>
        
        {/* Animated staggered Level Name */}
        <div style={{ display: 'flex', gap: '20px' }}>
          {levelName.split(' ').map((word, i) => (
            <motion.h1
              key={i}
              initial={{ opacity: 0, y: -50, scale: 2 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.6 + i * 0.15 }}
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 'clamp(30px, 6vw, 75px)',
                color: '#FFF',
                WebkitTextStroke: '2px #000',
                textShadow: '8px 8px 0 #000, 0 0 20px #00C6FF',
                margin: 0,
                fontStyle: 'italic'
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
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(24px, 4vw, 45px)',
            color: '#FFD700',
            WebkitTextStroke: '2px #000',
            textShadow: '6px 6px 0 #000',
            margin: '10px 0',
            letterSpacing: '15px'
          }}
        >
          ZONE
        </motion.h2>
        
        {/* Act */}
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 10, delay: 1.4 }}
          style={{
             background: '#FFF',
             padding: '10px 30px',
             borderRadius: '50px',
             border: '5px solid #000',
             boxShadow: '10px 10px 0 #000',
             marginTop: '20px'
          }}
        >
          <h3
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 'clamp(35px, 6vw, 70px)',
              color: '#DC143C',
              margin: 0
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
        transition={phase === 'sprint' ? { duration: 0.5, ease: 'easeIn' } : { duration: 0.8, type: 'spring', stiffness: 50, delay: 1.2 }}
        src={`/imagens/${character === 'sonic' ? 'sonic%20correndo.gif' : 'shadow%20correndo.gif'}`}
        style={{
          position: 'absolute',
          bottom: '10%',
          width: 'clamp(200px, 20vw, 350px)',
          height: 'clamp(200px, 20vw, 350px)',
          objectFit: 'contain',
          zIndex: 20,
          filter: phase === 'sprint' ? 'drop-shadow(-30px 0 0 rgba(0,0,0,0.5)) blur(2px)' : 'drop-shadow(10px 20px 0px rgba(0,0,0,0.5))'
        }}
      />
    </motion.div>
  );
};

export default TransitionScreen;
