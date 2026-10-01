import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const OrientationOverlay: React.FC = () => {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Verifica se é mobile (touch) e se está em portrait
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isPortrait = window.innerHeight > window.innerWidth;
      
      setIsPortraitMobile(isTouch && isPortrait);
    };

    // Check immediately
    checkOrientation();

    // Check on resize/orientation change
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortraitMobile) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontFamily: '"Press Start 2P", Orbitron, sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <motion.div
        animate={{ rotate: 90 }}
        transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
        style={{ fontSize: '60px', marginBottom: '30px' }}
      >
        📱
      </motion.div>
      <h2 style={{ fontSize: '20px', marginBottom: '15px', color: '#FFD700', textShadow: '2px 2px 0 #000' }}>
        VIRE A TELA
      </h2>
      <p style={{ fontSize: '12px', lineHeight: '1.5', opacity: 0.8 }}>
        Para jogar Sonic Adventure Web no seu celular ou tablet, por favor, vire o dispositivo deitado (modo paisagem).
      </p>
    </div>
  );
};

export default OrientationOverlay;
