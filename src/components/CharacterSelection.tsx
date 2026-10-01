import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UISound, BGMManager } from '../utils/audio';

interface CharacterSelectionProps {
  onSelect: (character: 'sonic' | 'shadow' | 'tails') => void;
  onBack: () => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ onSelect, onBack }) => {
  const [hovered, setHovered] = useState<'sonic' | 'shadow' | 'tails' | null>(null);
  const [selected, setSelected] = useState<'sonic' | 'shadow' | 'tails' | null>(null);

  useEffect(() => {
    BGMManager.playRandom();
  }, []);

  const handleSelect = (character: 'sonic' | 'shadow' | 'tails') => {
    UISound.play('click');
    setSelected(character);
    // Add a small delay for the selection animation before calling onSelect
    setTimeout(() => {
      onSelect(character);
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)", scale: 1.1 }}
      transition={{ duration: 0.5 }}
      className="responsive-flex"
      style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#000' }}
    >
      <style>
        {`
          .split-panel {
            transition: flex 0.5s cubic-bezier(0.25, 1, 0.5, 1), filter 0.5s;
            cursor: pointer;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .split-panel:hover {
            flex: 1.8;
            filter: brightness(1.2);
            z-index: 10;
          }
          .dimmed {
            filter: brightness(0.3) grayscale(80%);
          }
          .title-glow {
            text-shadow: 0 0 10px #FFF, 0 0 20px #FFF, 0 0 30px #FFF, 0 0 40px #00FFFF;
            animation: pulse-title 2s infinite;
          }
          @keyframes pulse-title {
            0%, 100% { text-shadow: 0 0 10px #FFF, 0 0 20px #FFF, 0 0 30px #00FFFF; transform: scale(1); }
            50% { text-shadow: 0 0 15px #FFF, 0 0 30px #FFF, 0 0 45px #00FFFF; transform: scale(1.02); }
          }
          @keyframes scroll-bg {
            0% { background-position: 0px 0px; }
            100% { background-position: 100px 100px; }
          }
          @keyframes scroll-bg-reverse {
            0% { background-position: 0px 0px; }
            100% { background-position: -100px 100px; }
          }
          .particles-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: radial-gradient(circle, rgba(255,255,255,0.8) 2px, transparent 2.5px);
            background-size: 60px 60px;
            opacity: 0;
            transition: opacity 0.3s;
          }
          .split-panel:hover .particles-overlay {
            opacity: 0.15;
            animation: scroll-bg 3s linear infinite;
          }
          @media (max-width: 768px) {
            .sonic-panel { border-right: none !important; border-bottom: 5px solid #FFF; }
          }
        `}
      </style>

      {/* Back Button */}
      <AnimatePresence>
        {!selected && (
          <motion.button 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(255,255,255,0.8)' }}
            onHoverStart={() => UISound.play('hover')}
            whileTap={{ scale: 0.9 }}
            onClick={() => { UISound.play('click'); onBack(); }}
            style={{ position: 'absolute', top: '30px', left: '30px', zIndex: 100, padding: '15px 30px', fontFamily: '"Press Start 2P", monospace', fontSize: '18px', background: 'rgba(0,0,0,0.5)', color: '#FFF', border: '3px solid #FFF', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 0 10px rgba(255,255,255,0.5)', backdropFilter: 'blur(5px)' }}
          >
            BACK
          </motion.button>
        )}
      </AnimatePresence>

      {/* Title */}
      <AnimatePresence>
        {!selected && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ delay: 0.8, type: 'spring' }}
            style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, pointerEvents: 'none' }}
          >
            <h1 style={{ fontFamily: '"Press Start 2P", monospace', color: '#FFF', fontSize: 'clamp(20px, 4vw, 40px)', margin: 0, WebkitTextStroke: '2px black' }} className="title-glow">
              SELECT YOUR HERO
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sonic Panel (Left) */}
      <motion.div 
        initial={{ x: '-100vw' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
        onClick={() => !selected && handleSelect('sonic')}
        onMouseEnter={() => { if (!selected && hovered !== 'sonic') { setHovered('sonic'); UISound.play('hover'); } }}
        onMouseLeave={() => !selected && setHovered(null)}
        className={`split-panel sonic-panel ${(hovered && hovered !== 'sonic') || (selected && selected !== 'sonic') ? 'dimmed' : ''}`}
        style={{ 
          flex: (hovered === 'sonic' || selected === 'sonic') ? 1.8 : 1, 
          background: 'linear-gradient(135deg, #00C6FF, #0072FF)', 
          borderRight: '5px solid #FFF',
          boxShadow: selected === 'sonic' ? 'inset 0 0 100px rgba(255,255,255,0.8)' : 'none'
        }}
      >
        {/* Animated Background Accents */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 20%, transparent 20%)', backgroundSize: '50px 50px', opacity: 0.3, animation: 'scroll-bg 5s linear infinite' }} />
        <div className="particles-overlay" />
        
        <motion.img 
          animate={
            selected === 'sonic' ? { scale: 1.5, y: -50, filter: 'drop-shadow(0 0 40px #FFF)' }
            : hovered === 'sonic' ? { scale: 1.25, y: -30, filter: 'drop-shadow(0 0 25px rgba(255,255,255,0.8))' }
            : { scale: 1, y: [0, -15, 0], filter: 'drop-shadow(10px 20px 10px rgba(0,0,0,0.5))' }
          }
          transition={
            selected === 'sonic' ? { type: 'spring', bounce: 0.5 }
            : hovered === 'sonic' ? { type: 'spring' }
            : { repeat: Infinity, duration: 3, ease: 'easeInOut' }
          }
          src="/imagens/9a42fea8e65a7f428be264b4d507e74a.gif" 
          alt="Sonic" 
          style={{ width: 'clamp(200px, 25vw, 400px)', height: 'clamp(200px, 25vw, 400px)', objectFit: 'contain', zIndex: 2 }} 
        />
        
        <motion.h2 
          animate={{ scale: hovered === 'sonic' ? 1.3 : 1, y: hovered === 'sonic' ? -10 : 0 }}
          style={{ fontFamily: '"Press Start 2P", monospace', color: '#FFD700', fontSize: 'clamp(24px, 4vw, 50px)', textShadow: '4px 4px 0 #000', marginTop: '20px', zIndex: 2 }}
        >
          SONIC
        </motion.h2>
        <motion.p 
          animate={{ opacity: hovered === 'sonic' ? 1 : 0.7, y: hovered === 'sonic' ? -5 : 0 }}
          style={{ fontFamily: 'sans-serif', color: '#FFF', fontSize: '18px', fontWeight: 'bold', letterSpacing: '4px', textShadow: '2px 2px 0 #000', zIndex: 2 }}
        >
          SPEED & CLASSIC
        </motion.p>
      </motion.div>

      {/* Shadow Panel (Right) */}
      <motion.div 
        initial={{ x: '100vw' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.2 }}
        onClick={() => !selected && handleSelect('shadow')}
        onMouseEnter={() => { if (!selected && hovered !== 'shadow') { setHovered('shadow'); UISound.play('hover'); } }}
        onMouseLeave={() => !selected && setHovered(null)}
        className={`split-panel ${(hovered && hovered !== 'shadow') || (selected && selected !== 'shadow') ? 'dimmed' : ''}`}
        style={{ 
          flex: (hovered === 'shadow' || selected === 'shadow') ? 1.8 : 1, 
          background: 'linear-gradient(135deg, #FF0000, #8B0000)',
          boxShadow: selected === 'shadow' ? 'inset 0 0 100px rgba(255,255,255,0.8)' : 'none'
        }}
      >
        {/* Animated Background Accents */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.2) 20px, rgba(0,0,0,0.2) 40px)', opacity: 0.4, animation: 'scroll-bg-reverse 4s linear infinite' }} />
        <div className="particles-overlay" style={{ animationDirection: 'reverse' }} />

        <motion.img 
          animate={
            selected === 'shadow' ? { scale: 1.5, y: -50, filter: 'drop-shadow(0 0 40px #FFF)' }
            : hovered === 'shadow' ? { scale: 1.25, y: -30, filter: 'drop-shadow(0 0 25px rgba(255,0,0,0.8))' }
            : { scale: 1, y: [0, -15, 0], filter: 'drop-shadow(-10px 20px 10px rgba(0,0,0,0.5))' }
          }
          transition={
            selected === 'shadow' ? { type: 'spring', bounce: 0.5 }
            : hovered === 'shadow' ? { type: 'spring' }
            : { repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.5 } // offset float
          }
          src="/imagens/escolha-shadow.gif" 
          alt="Shadow" 
          style={{ width: 'clamp(200px, 25vw, 400px)', height: 'clamp(200px, 25vw, 400px)', objectFit: 'contain', zIndex: 2 }} 
        />

        <motion.h2 
          animate={{ scale: hovered === 'shadow' ? 1.3 : 1, y: hovered === 'shadow' ? -10 : 0 }}
          style={{ fontFamily: '"Press Start 2P", monospace', color: '#FFF', fontSize: 'clamp(24px, 4vw, 50px)', textShadow: '4px 4px 0 #000', marginTop: '20px', zIndex: 2 }}
        >
          SHADOW
        </motion.h2>
        <motion.p 
          animate={{ opacity: hovered === 'shadow' ? 1 : 0.7, y: hovered === 'shadow' ? -5 : 0 }}
          style={{ fontFamily: 'sans-serif', color: '#FFD700', fontSize: '18px', fontWeight: 'bold', letterSpacing: '4px', textShadow: '2px 2px 0 #000', zIndex: 2 }}
        >
          POWER & CHAOS
        </motion.p>
      </motion.div>

      {/* Tails Panel (Right) */}
      <motion.div 
        initial={{ x: '100vw' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.4 }}
        onClick={() => !selected && handleSelect('tails')}
        onMouseEnter={() => { if (!selected && hovered !== 'tails') { setHovered('tails'); UISound.play('hover'); } }}
        onMouseLeave={() => !selected && setHovered(null)}
        className={`split-panel ${(hovered && hovered !== 'tails') || (selected && selected !== 'tails') ? 'dimmed' : ''}`}
        style={{ 
          flex: (hovered === 'tails' || selected === 'tails') ? 1.8 : 1, 
          background: 'linear-gradient(135deg, #FFB300, #F57F17)',
          borderLeft: '5px solid #FFF',
          boxShadow: selected === 'tails' ? 'inset 0 0 100px rgba(255,255,255,0.8)' : 'none'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 20%, transparent 20%)', backgroundSize: '50px 50px', opacity: 0.3, animation: 'scroll-bg 5s linear infinite' }} />
        <div className="particles-overlay" />

        <motion.img 
          animate={
            selected === 'tails' ? { scale: 1.5, y: -50, filter: 'drop-shadow(0 0 40px #FFF)' }
            : hovered === 'tails' ? { scale: 1.25, y: -30, filter: 'drop-shadow(0 0 25px rgba(255,255,255,0.8))' }
            : { scale: 1, y: [0, -15, 0], filter: 'drop-shadow(10px 20px 10px rgba(0,0,0,0.5))' }
          }
          transition={
            selected === 'tails' ? { type: 'spring', bounce: 0.5 }
            : hovered === 'tails' ? { type: 'spring' }
            : { repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 1 }
          }
          src="/imagens/8jqj1311bdeb1.gif" 
          alt="Tails" 
          style={{ width: 'clamp(200px, 25vw, 400px)', height: 'clamp(200px, 25vw, 400px)', objectFit: 'contain', zIndex: 2 }} 
        />

        <motion.h2 
          animate={{ scale: hovered === 'tails' ? 1.3 : 1, y: hovered === 'tails' ? -10 : 0 }}
          style={{ fontFamily: '"Press Start 2P", monospace', color: '#FFF', fontSize: 'clamp(24px, 4vw, 50px)', textShadow: '4px 4px 0 #000', marginTop: '20px', zIndex: 2 }}
        >
          TAILS
        </motion.h2>
        <motion.p 
          animate={{ opacity: hovered === 'tails' ? 1 : 0.7, y: hovered === 'tails' ? -5 : 0 }}
          style={{ fontFamily: 'sans-serif', color: '#FFF', fontSize: '18px', fontWeight: 'bold', letterSpacing: '4px', textShadow: '2px 2px 0 #000', zIndex: 2 }}
        >
          FLIGHT & TECH
        </motion.p>
      </motion.div>

    </motion.div>
  );
};

export default CharacterSelection;
