import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface TitleScreenProps {
  onStart: () => void;
}

// Parallax Cloud
const Cloud = ({ top, delay, duration, scale }: { top: string, delay: string, duration: string, scale: number }) => (
  <div style={{ position: 'absolute', top, left: '-20%', animation: `panClouds ${duration} linear infinite`, animationDelay: delay, transform: `scale(${scale})`, zIndex: 1, opacity: 0.9 }}>
    <svg width="200" height="80" viewBox="0 0 200 80" fill="white" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.15))' }}>
      <circle cx="40" cy="50" r="25" />
      <circle cx="80" cy="40" r="35" />
      <circle cx="125" cy="35" r="25" />
      <circle cx="160" cy="50" r="20" />
      <rect x="40" y="40" width="120" height="35" rx="15" />
    </svg>
  </div>
);

// Parallax Mountain Layer
const MountainLayer = ({ speed, zIndex, color, height, offset }: { speed: number, zIndex: number, color: string, height: string, offset: string }) => {
  return (
    <div style={{ position: 'absolute', bottom: offset, left: 0, width: '200%', height, zIndex, display: 'flex', animation: `panBackground ${speed}s linear infinite` }}>
       {/* Create a repeating mountain pattern */}
       {[1,2,3,4].map(i => (
          <div key={i} style={{ width: '50%', height: '100%', background: color, clipPath: 'polygon(0% 100%, 25% 0%, 50% 100%, 75% 20%, 100% 100%)' }} />
       ))}
    </div>
  )
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 1 }}
      style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', backgroundColor: '#2196F3' }}
    >
      <style>
        {`
          @keyframes panClouds {
            from { left: -30%; }
            to { left: 130%; }
          }
          @keyframes panBackground {
            from { transform: translateX(0%); }
            to { transform: translateX(-50%); }
          }
          @keyframes spinRing {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
          }
          @keyframes waterSparkle {
            0% { opacity: 0.5; }
            50% { opacity: 0.9; }
            100% { opacity: 0.5; }
          }
          @keyframes pulseText {
            0% { opacity: 1; text-shadow: 0 0 10px #FFD700; }
            50% { opacity: 0.5; text-shadow: 0 0 20px #FFD700; }
            100% { opacity: 1; text-shadow: 0 0 10px #FFD700; }
          @keyframes checkerMove {
            from { background-position: 0 0; }
            to { background-position: -100px 0; }
          }
          @keyframes flyLeft {
            from { left: 120vw; transform: translateY(0px) scale(-0.5, 0.5); }
            to { left: -20vw; transform: translateY(20px) scale(-0.5, 0.5); }
          }
          @keyframes sparkFly {
            0% { transform: translate(0, 0) scale(1.5); opacity: 1; }
            100% { transform: translate(-150px, -80px) scale(0); opacity: 0; }
          }
          @keyframes spinCoin {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(360deg); }
          }
          @keyframes flyRing {
            0% { left: 120vw; transform: rotateY(0deg); }
            100% { left: -20vw; transform: rotateY(720deg); }
          }
          @keyframes whizBy {
            0% { left: 150vw; transform: scale(1.5); opacity: 1; }
            100% { left: -50vw; transform: scale(1.5); opacity: 0; }
          }
          @keyframes logoHover {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }
          .scanlines {
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
            background-size: 100% 4px, 3px 100%;
            z-index: 20; pointer-events: none;
          }
        `}
      </style>

      {/* Sky Gradient */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '30vh', zIndex: 0, background: 'linear-gradient(to bottom, #1976D2 0%, #4FC3F7 100%)' }} />

      {/* Clouds */}
      <Cloud top="5%" delay="0s" duration="45s" scale={1.2} />
      <Cloud top="12%" delay="10s" duration="60s" scale={1.6} />
      <Cloud top="25%" delay="20s" duration="35s" scale={0.9} />
      <Cloud top="18%" delay="5s" duration="70s" scale={1} />

      {/* Flying Buzz Bomber Enemy */}
      <div style={{ position: 'absolute', top: '15%', left: '120vw', zIndex: 3, animation: 'flyLeft 15s linear infinite', filter: 'drop-shadow(5px 10px 0 rgba(0,0,0,0.3))' }}>
         <img src="/imagens/buzz_bomber.png.png" alt="Buzz Bomber" style={{ height: '80px', objectFit: 'contain' }} />
      </div>

      {/* High-Speed Flying Golden Rings */}
      {[10, 30, 75, 85].map((delay, i) => (
         <div key={i} style={{ position: 'absolute', top: `${30 + (i%3)*15}%`, left: '120vw', zIndex: 5, width: '50px', height: '50px', border: '10px solid #FFD700', borderRadius: '50%', boxShadow: 'inset 0 0 10px #B8860B, 0 0 15px #FFD700', animation: `flyRing 2.5s linear infinite ${i*0.4}s` }}>
            <div style={{ position: 'absolute', top: '-5px', left: '20px', width: '8px', height: '8px', background: 'white', borderRadius: '50%', boxShadow: '0 0 8px white' }} />
         </div>
      ))}

      {/* Distant Mountains */}
      <MountainLayer speed={60} zIndex={1} color="#0D47A1" height="25vh" offset="30vh" />
      <MountainLayer speed={45} zIndex={2} color="#1565C0" height="15vh" offset="30vh" />
      
      {/* Sparkling Water Horizon */}
      <div style={{ position: 'absolute', bottom: '25vh', left: 0, right: 0, height: '5vh', zIndex: 3, background: 'linear-gradient(to bottom, #00BCD4, #0277BD)' }}>
         <div style={{ width: '100%', height: '100%', backgroundImage: 'radial-gradient(circle, #FFF 1px, transparent 2px)', backgroundSize: '30px 10px', animation: 'waterSparkle 2s infinite alternate' }} />
      </div>

      {/* Epic Center Logo */}
      <motion.div 
        initial={{ scale: 0, y: -50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
        style={{ zIndex: 10, marginTop: '-15vh', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', animation: 'logoHover 4s ease-in-out infinite' }}
      >
        {/* Giant Spinning Golden Ring */}
        <div style={{ position: 'absolute', top: '40%', left: '50%', marginTop: '-12vw', marginLeft: '-12vw', width: '24vw', height: '24vw', maxWidth: '300px', maxHeight: '300px', minWidth: '150px', minHeight: '150px', borderRadius: '50%', border: 'clamp(10px, 2vw, 25px) solid #FFD700', boxShadow: 'inset 0 0 20px #B8860B, 0 0 20px #B8860B, inset 0 0 5px white', animation: 'spinRing 4s linear infinite', zIndex: 1 }} />
        
        {/* Ribbon Background */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '70vw', maxWidth: '700px', height: '140px', background: 'linear-gradient(to bottom, #FF0000, #8B0000)', clipPath: 'polygon(5% 0, 95% 0, 100% 50%, 95% 100%, 5% 100%, 0% 50%)', zIndex: 2, border: '4px solid white', borderRadius: '10px', boxShadow: '0 15px 30px rgba(0,0,0,0.5)' }}>
           <div style={{ width: '100%', height: '100%', border: '2px solid #FF6347', borderRadius: '5px' }} />
        </div>

        {/* Text */}
        <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 'clamp(2.5rem, 6vw, 6rem)', color: '#002E99', WebkitTextStroke: '3px white', textShadow: '5px 5px 0 #FFF, 0 10px 15px rgba(0,0,0,0.6)', margin: 0, textAlign: 'center', lineHeight: '1.1', zIndex: 3, position: 'relative' }}>
          SONIC<br/>WEB
        </h1>
        
        {/* Small Ribbon text */}
        <div style={{ background: '#FFD700', padding: '8px 35px', borderRadius: '40px', border: '4px solid white', marginTop: '15px', boxShadow: '0 8px 0 #B8860B, 0 15px 20px rgba(0,0,0,0.4)', zIndex: 4, position: 'relative' }}>
            <h2 style={{ fontFamily: 'sans-serif', fontSize: 'clamp(1rem, 2vw, 1.8rem)', color: '#000', letterSpacing: '6px', margin: 0, fontWeight: 900, fontStyle: 'italic' }}>
            THE CLASSIC ERA
            </h2>
        </div>
      </motion.div>

      {/* Action Button */}
      <motion.button 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10, delay: 1 }}
        whileHover={{ scale: 1.1, boxShadow: '0 10px 0 #000080, 0 20px 30px rgba(0,0,0,0.6)' }}
        whileTap={{ scale: 0.95, y: 5, boxShadow: '0 5px 0 #000080' }}
        onClick={onStart} 
        style={{ zIndex: 10, marginTop: '10vh', padding: 'clamp(15px, 2vw, 20px) clamp(40px, 5vw, 60px)', fontSize: 'clamp(18px, 2vw, 24px)', fontFamily: '"Press Start 2P", monospace', color: '#FFF', background: '#FF0000', border: '5px solid #FFF', boxShadow: '0 10px 0 #8B0000, 0 15px 25px rgba(0,0,0,0.5)', cursor: 'pointer', borderRadius: '15px', animation: 'pulseText 2s infinite' }}
      >
        PRESS START
      </motion.button>

      {/* Sonic with Speed Trails and Sparks */}
      <div style={{ position: 'absolute', bottom: '18vh', left: '15vw', zIndex: 6 }}>
         {/* Ghost Trails for Super Speed effect */}
         <img src="/imagens/sonic%20correndo.gif" alt="Trail 1" style={{ position: 'absolute', left: '-80px', top: 0, opacity: 0.2, filter: 'blur(3px) sepia(100%) hue-rotate(320deg) saturate(500%)', width: 'clamp(150px, 20vw, 300px)', height: 'clamp(150px, 20vw, 300px)', objectFit: 'contain' }} />
         <img src="/imagens/sonic%20correndo.gif" alt="Trail 2" style={{ position: 'absolute', left: '-40px', top: 0, opacity: 0.4, filter: 'blur(1px) sepia(50%) hue-rotate(180deg)', width: 'clamp(150px, 20vw, 300px)', height: 'clamp(150px, 20vw, 300px)', objectFit: 'contain' }} />
         
         {/* Main Sonic */}
         <img src="/imagens/sonic%20correndo.gif" alt="Sonic Racing" style={{ position: 'relative', width: 'clamp(150px, 20vw, 300px)', height: 'clamp(150px, 20vw, 300px)', objectFit: 'contain', filter: 'drop-shadow(15px 15px 0px rgba(0,0,0,0.4))' }} />

         {/* Friction Sparks from Feet */}
         {[...Array(6)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', bottom: '20px', left: '40%', width: '15px', height: '6px', background: '#FFF', borderRadius: '50%', boxShadow: '0 0 15px #FF4500, 0 0 5px #FFD700', animation: `sparkFly 0.5s linear infinite ${i * 0.08}s` }} />
         ))}
      </div>

      {/* Classic 2D Scrolling Checkerboard Floor */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '25vh', zIndex: 4, overflow: 'hidden' }}>
         <div style={{ width: '200%', height: '100%', position: 'absolute', left: 0, top: 0,
            backgroundColor: '#8B4513',
            backgroundImage: 'repeating-linear-gradient(45deg, #8B4513 25%, transparent 25%, transparent 75%, #8B4513 75%, #8B4513), repeating-linear-gradient(45deg, #8B4513 25%, #A0522D 25%, #A0522D 75%, #8B4513 75%, #8B4513)',
            backgroundSize: '100px 100px',
            animation: 'checkerMove 0.8s linear infinite',
            borderTop: '20px solid #32CD32',
            boxShadow: 'inset 0 15px 25px rgba(0,0,0,0.4)'
         }} />
      </div>

      {/* Extreme Speed Foreground Blur Elements */}
      <div style={{ position: 'absolute', bottom: '15vh', left: '120vw', zIndex: 20, animation: 'whizBy 1.2s linear infinite 0.5s', filter: 'blur(10px) brightness(0.4)' }}>
         <svg width="10vw" height="15vw" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ minWidth: '200px', minHeight: '300px' }}>
             <path d="M45 150C45 150 40 80 50 40C60 80 55 150 55 150H45Z" fill="#8B4513" />
             <path d="M50 45C50 45 20 20 0 40C20 10 50 45 50 45Z" fill="#228B22" />
             <path d="M50 45C50 45 30 0 10 0C40 -10 50 45 50 45Z" fill="#006400" />
         </svg>
      </div>

      {/* Retro CRT Scanline Overlay */}
      <div className="scanlines" />
    </motion.div>
  );
};

export default TitleScreen;
