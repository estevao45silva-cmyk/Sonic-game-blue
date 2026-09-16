import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CharacterSelectionProps {
  onSelect: (character: 'sonic' | 'shadow') => void;
  onBack: () => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ onSelect, onBack }) => {
  const [hovered, setHovered] = useState<'sonic' | 'shadow' | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.5 }}
      style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', position: 'relative', background: '#000' }}
    >
      <style>
        {`
          .split-panel {
            transition: flex 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), filter 0.4s;
            cursor: pointer;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .split-panel:hover {
            flex: 1.5;
            filter: brightness(1.2);
            z-index: 10;
          }
          .dimmed {
            filter: brightness(0.4) grayscale(50%);
          }
          .title-glow {
            text-shadow: 0 0 10px #FFF, 0 0 20px #FFF, 0 0 30px #FFF;
          }
        `}
      </style>

      {/* Back Button */}
      <motion.button 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onBack}
        style={{ position: 'absolute', top: '30px', left: '30px', zIndex: 100, padding: '15px 30px', fontFamily: '"Press Start 2P", monospace', fontSize: '18px', background: 'transparent', color: '#FFF', border: '3px solid #FFF', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 0 10px rgba(255,255,255,0.5)' }}
      >
        BACK
      </motion.button>

      {/* Title */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
        style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, pointerEvents: 'none' }}
      >
        <h1 style={{ fontFamily: '"Press Start 2P", monospace', color: '#FFF', fontSize: 'clamp(20px, 4vw, 40px)', margin: 0, WebkitTextStroke: '1px black' }} className="title-glow">
          SELECT YOUR HERO
        </h1>
      </motion.div>

      {/* Sonic Panel (Left) */}
      <motion.div 
        initial={{ x: '-100vw' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
        onClick={() => onSelect('sonic')}
        onMouseEnter={() => setHovered('sonic')}
        onMouseLeave={() => setHovered(null)}
        className={`split-panel ${hovered === 'shadow' ? 'dimmed' : ''}`}
        style={{ flex: hovered === 'sonic' ? 1.5 : 1, background: 'linear-gradient(135deg, #00C6FF, #0072FF)', borderRight: '5px solid #FFF' }}
      >
        {/* Background Accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 20%, transparent 20%)', backgroundSize: '50px 50px', opacity: 0.3 }} />
        
        <motion.img 
          animate={{ scale: hovered === 'sonic' ? 1.2 : 1, y: hovered === 'sonic' ? -20 : 0 }}
          transition={{ type: 'spring' }}
          src="/imagens/escolha-sonic.gif" 
          alt="Sonic" 
          style={{ width: 'clamp(200px, 25vw, 400px)', height: 'clamp(200px, 25vw, 400px)', objectFit: 'contain', filter: 'drop-shadow(10px 20px 10px rgba(0,0,0,0.5))', zIndex: 2 }} 
        />
        
        <motion.h2 
          animate={{ scale: hovered === 'sonic' ? 1.2 : 1 }}
          style={{ fontFamily: '"Press Start 2P", monospace', color: '#FFD700', fontSize: 'clamp(24px, 4vw, 50px)', textShadow: '4px 4px 0 #000', marginTop: '20px', zIndex: 2 }}
        >
          SONIC
        </motion.h2>
        <p style={{ fontFamily: 'sans-serif', color: '#FFF', fontSize: '18px', fontWeight: 'bold', letterSpacing: '4px', textShadow: '2px 2px 0 #000', zIndex: 2 }}>
          SPEED & CLASSIC
        </p>
      </motion.div>

      {/* Shadow Panel (Right) */}
      <motion.div 
        initial={{ x: '100vw' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.2 }}
        onClick={() => onSelect('shadow')}
        onMouseEnter={() => setHovered('shadow')}
        onMouseLeave={() => setHovered(null)}
        className={`split-panel ${hovered === 'sonic' ? 'dimmed' : ''}`}
        style={{ flex: hovered === 'shadow' ? 1.5 : 1, background: 'linear-gradient(135deg, #FF0000, #8B0000)' }}
      >
        {/* Background Accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.2) 20px, rgba(0,0,0,0.2) 40px)', opacity: 0.4 }} />

        <motion.img 
          animate={{ scale: hovered === 'shadow' ? 1.2 : 1, y: hovered === 'shadow' ? -20 : 0 }}
          transition={{ type: 'spring' }}
          src="/imagens/escolha-shadow.gif" 
          alt="Shadow" 
          style={{ width: 'clamp(200px, 25vw, 400px)', height: 'clamp(200px, 25vw, 400px)', objectFit: 'contain', filter: 'drop-shadow(-10px 20px 10px rgba(0,0,0,0.5))', zIndex: 2 }} 
        />

        <motion.h2 
          animate={{ scale: hovered === 'shadow' ? 1.2 : 1 }}
          style={{ fontFamily: '"Press Start 2P", monospace', color: '#FFF', fontSize: 'clamp(24px, 4vw, 50px)', textShadow: '4px 4px 0 #000', marginTop: '20px', zIndex: 2 }}
        >
          SHADOW
        </motion.h2>
        <p style={{ fontFamily: 'sans-serif', color: '#FFD700', fontSize: '18px', fontWeight: 'bold', letterSpacing: '4px', textShadow: '2px 2px 0 #000', zIndex: 2 }}>
          POWER & CHAOS
        </p>
      </motion.div>

    </motion.div>
  );
};

export default CharacterSelection;
