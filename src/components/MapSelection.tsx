import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapSelectionProps {
  onSelect: (level: number) => void;
  onBack: () => void;
}

const MapSelection: React.FC<MapSelectionProps> = ({ onSelect, onBack }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const maps = [
    { 
      id: 1, 
      name: 'GREEN HILL', 
      desc: 'CLASSIC VIBES', 
      color: '#00FF87',
      shadow: '#00A855',
      bg: 'linear-gradient(135deg, #0BA360 0%, #3CB0FD 100%)',
      icon: (
        <svg viewBox="0 0 100 100" width="70" height="70" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))' }}>
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="12" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.6" />
        </svg>
      )
    },
    { 
      id: 2, 
      name: 'NEON DREAM', 
      desc: 'CYBER RUSH', 
      color: '#00FFFF', 
      shadow: '#008888',
      bg: 'linear-gradient(135deg, #FF0844 0%, #00FFFF 100%)',
      icon: (
        <svg viewBox="0 0 100 100" width="70" height="70" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))' }}>
          <path d="M45 5 L90 45 L55 50 L65 95 L20 45 L55 40 Z" fill="currentColor" />
        </svg>
      )
    },
    { 
      id: 3, 
      name: 'STAR LIGHT', 
      desc: 'STARRY NIGHT', 
      color: '#B066FE', 
      shadow: '#6619AB',
      bg: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
      icon: (
        <svg viewBox="0 0 100 100" width="70" height="70" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))' }}>
          <path d="M50 5 L60 35 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 35 Z" fill="currentColor" />
        </svg>
      )
    },
    { 
      id: 4, 
      name: 'CASINO NEON', 
      desc: 'BRIGHT LIGHTS', 
      color: '#FFD700', 
      shadow: '#B29600',
      bg: 'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)',
      icon: (
        <svg viewBox="0 0 100 100" width="70" height="70" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))' }}>
          <path d="M20 30 L80 30 L95 50 L50 95 L5 50 Z" fill="none" stroke="currentColor" strokeWidth="8" />
          <path d="M20 30 L50 50 L80 30 M50 50 L50 95" stroke="currentColor" strokeWidth="4" />
        </svg>
      )
    },
  ];

  const handleSelect = (level: number) => {
    setSelected(level);
    setTimeout(() => {
      onSelect(level);
    }, 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
      transition={{ duration: 0.5 }}
      style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#050505', overflow: 'hidden', position: 'relative' }}
    >
      <style>
        {`
          .map-card {
            transition: flex 0.6s cubic-bezier(0.22, 1, 0.36, 1), filter 0.6s;
            cursor: pointer;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-right: 1px solid rgba(255,255,255,0.1);
          }
          .map-card:last-child {
            border-right: none;
          }
          .map-card:hover {
            flex: 2.5;
            z-index: 10;
          }
          .dimmed {
            filter: brightness(0.2) grayscale(100%) blur(4px);
          }
          
          /* Animated Background Overlay */
          .bg-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 10px);
            background-size: 200% 200%;
            animation: panBg 10s linear infinite;
            opacity: 0.5;
            mix-blend-mode: overlay;
          }

          @keyframes panBg {
            0% { background-position: 0% 0%; }
            100% { background-position: 100% 100%; }
          }

          /* Scanlines for Retro Vibe */
          .scanlines {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
            background-size: 100% 4px;
            pointer-events: none;
            z-index: 20;
          }

          .title-glow {
            text-shadow: 0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.8), 0 0 40px #00FFFF, 0 0 80px #00FFFF;
            animation: pulse-title 2s ease-in-out infinite alternate;
          }

          @keyframes pulse-title {
            0% { text-shadow: 0 0 10px #FFF, 0 0 20px #FFF, 0 0 30px #00FFFF; transform: scale(1); }
            100% { text-shadow: 0 0 15px #FFF, 0 0 30px #FFF, 0 0 60px #00FFFF; transform: scale(1.05); }
          }
        `}
      </style>

      {/* Global Scanlines */}
      <div className="scanlines" />

      {/* Back Button */}
      <AnimatePresence>
        {!selected && (
          <motion.button 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ delay: 1, type: 'spring' }}
            whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(255,255,255,0.8)' }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            style={{ 
              position: 'absolute', top: '30px', left: '30px', zIndex: 100, 
              padding: '15px 30px', fontFamily: '"Press Start 2P", monospace', 
              fontSize: '18px', background: 'rgba(0,0,0,0.6)', color: '#FFF', 
              border: '2px solid #FFF', borderRadius: '8px', cursor: 'pointer', 
              backdropFilter: 'blur(10px)', textTransform: 'uppercase' 
            }}
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
            transition={{ delay: 0.8, type: 'spring', bounce: 0.5 }}
            style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, pointerEvents: 'none' }}
          >
            <h1 style={{ fontFamily: '"Press Start 2P", monospace', color: '#FFF', fontSize: 'clamp(24px, 4vw, 40px)', margin: 0, WebkitTextStroke: '2px black', letterSpacing: '2px' }} className="title-glow">
              SELECT ZONE
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        {maps.map((map, index) => {
          const isHovered = hovered === map.id;
          const isSelected = selected === map.id;
          const isDimmed = (selected && !isSelected) || (hovered && !isHovered);

          return (
            <motion.div
              key={map.id}
              initial={{ y: '100vh', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 60, damping: 15, delay: index * 0.1 }}
              onClick={() => !selected && handleSelect(map.id)}
              onMouseEnter={() => !selected && setHovered(map.id)}
              onMouseLeave={() => !selected && setHovered(null)}
              className={`map-card ${isDimmed ? 'dimmed' : ''}`}
              style={{
                flex: (isHovered || isSelected) ? 2.5 : 1,
                background: map.bg,
                boxShadow: isSelected ? `inset 0 0 150px ${map.color}` : 'none'
              }}
            >
              {/* Dynamic Animated Overlay inside card */}
              <div className="bg-overlay" style={{ animationDuration: isHovered ? '3s' : '10s' }} />

              {/* Huge Background Number */}
              <motion.div 
                animate={{ 
                  scale: isHovered ? 1.2 : 1,
                  opacity: isHovered ? 0.3 : 0.1,
                  y: isHovered ? -20 : 0
                }}
                style={{ 
                  position: 'absolute', 
                  fontSize: '30vw', 
                  fontWeight: 900, 
                  fontFamily: 'Impact, sans-serif',
                  color: '#FFF',
                  lineHeight: 1,
                  pointerEvents: 'none',
                  mixBlendMode: 'overlay'
                }}
              >
                {map.id}
              </motion.div>

              {/* Floating SVG Geometric Icon */}
              <motion.div
                animate={{ 
                  y: isHovered ? [0, -15, 0] : 0,
                  scale: isHovered ? 1.5 : 1,
                  rotate: isHovered ? [0, 5, -5, 0] : 0
                }}
                transition={{ 
                  y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                  rotate: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                }}
                style={{ 
                  marginBottom: '20px', 
                  zIndex: 2,
                  color: '#FFF',
                  filter: `drop-shadow(0 0 20px ${map.color})`
                }}
              >
                {map.icon}
              </motion.div>

              {/* Card Title */}
              <motion.h2 
                animate={{ 
                  scale: isHovered ? 1.2 : 1, 
                  y: isHovered ? -10 : 0 
                }}
                style={{ 
                  fontFamily: '"Press Start 2P", monospace', 
                  color: '#FFF', 
                  fontSize: 'clamp(12px, 2vw, 36px)', 
                  textShadow: `4px 4px 0 ${map.shadow}, 0 0 20px ${map.color}`, 
                  zIndex: 2, 
                  textAlign: 'center', 
                  padding: '0 20px',
                  lineHeight: 1.5
                }}
              >
                {map.name}
              </motion.h2>

              {/* Card Description */}
              <motion.p 
                animate={{ 
                  opacity: isHovered ? 1 : 0.5, 
                  y: isHovered ? -5 : 0,
                  scale: isHovered ? 1.1 : 1
                }}
                style={{ 
                  fontFamily: 'sans-serif', 
                  color: '#FFF', 
                  fontSize: 'clamp(10px, 1.5vw, 18px)', 
                  fontWeight: 800, 
                  letterSpacing: '4px', 
                  textShadow: '2px 2px 0 #000', 
                  zIndex: 2, 
                  textAlign: 'center',
                  marginTop: '10px'
                }}
              >
                {map.desc}
              </motion.p>

              {/* Start Confirmation Overlay (shows when selected) */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.6 }}
                    style={{
                      position: 'absolute',
                      zIndex: 30,
                      background: 'rgba(0,0,0,0.7)',
                      padding: '20px 40px',
                      borderRadius: '50px',
                      border: `4px solid ${map.color}`,
                      boxShadow: `0 0 40px ${map.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ 
                      fontFamily: '"Press Start 2P", monospace', 
                      color: '#FFF', 
                      fontSize: '24px',
                      animation: 'pulse-title 0.5s infinite alternate'
                    }}>
                      STARTING...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MapSelection;
