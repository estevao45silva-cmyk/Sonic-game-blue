import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import type { Character } from '../App';
import { MainScene, UIScene } from './PhaserGame';
import ThreeBackground from '../components/ThreeBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { VirtualJoystick } from '../components/VirtualJoystick';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { generateTailsAdvice, speakText } from '../services/aiService';

interface SonicGameProps {
  character: Character;
  level: number;
  onLevelComplete: () => void;
  onBackToMenu: () => void;
}

const GameOverOverlay = ({ onRestart, onMenu, triggerAdvice }: { onRestart: () => void, onMenu: () => void, triggerAdvice: () => void }) => {
  const [countdown, setCountdown] = useState(10);
  
  useEffect(() => {
    triggerAdvice();
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      onMenu();
      return;
    }
    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, onMenu]);

  return (
    <motion.div 
      initial={{ opacity: 0, backgroundColor: "rgba(0,0,0,0)" }}
      animate={{ opacity: 1, backgroundColor: "rgba(100,0,0,0.8)" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Press Start 2P", Orbitron, sans-serif'
      }}
    >
      <motion.h1 
        initial={{ y: -100, scale: 0.5 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        style={{ color: '#FFD700', fontSize: '64px', textShadow: '4px 4px 0 #FF0000', marginBottom: '20px' }}
      >
        CONTINUE?
      </motion.h1>
      
      <motion.div 
        key={countdown}
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ fontSize: '100px', color: '#FFF', textShadow: '0 0 20px #FF0000', marginBottom: '40px' }}
      >
        {countdown}
      </motion.div>
      
      <div style={{ display: 'flex', gap: '30px' }}>
        <motion.button 
          whileHover={{ scale: 1.1, backgroundColor: '#FFD700' }}
          whileTap={{ scale: 0.9 }}
          onClick={onRestart}
          style={{ padding: '20px 40px', fontSize: '32px', backgroundColor: '#FF8C00', color: '#000', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: '"Press Start 2P"' }}
        >
          YES
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1, backgroundColor: '#888' }}
          whileTap={{ scale: 0.9 }}
          onClick={onMenu}
          style={{ padding: '20px 40px', fontSize: '32px', backgroundColor: '#444', color: '#FFF', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: '"Press Start 2P"' }}
        >
          NO
        </motion.button>
      </div>
    </motion.div>
  );
};

const SonicGame: React.FC<SonicGameProps> = ({ character, level, onLevelComplete, onBackToMenu }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const { isListening, transcript, toggleListening, isSupported } = useVoiceCommands();
  const [tailsAdvice, setTailsAdvice] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const getAdvice = async () => {
    const playerState = { rings: Math.floor(Math.random() * 50), speed: Math.random() * 100 };
    const advice = await generateTailsAdvice(playerState);
    setTailsAdvice(advice);
    speakText(advice);
    setTimeout(() => setTailsAdvice(null), 4000);
  };

  const handleGameOver = () => {
    setIsGameOver(true);
  };
  
  const handleGameOverAdvice = async () => {
     const advice = await generateTailsAdvice({ rings: 0, speed: 0, context: "O jogador acabou de perder todas as vidas e deu Game Over! Fale algo dramático estilo fliperama!" } as any);
     setTailsAdvice(advice);
     speakText(advice);
     setTimeout(() => setTailsAdvice(null), 6000);
  };

  const restartGame = () => {
    setIsGameOver(false);
    if (phaserGameRef.current) {
      phaserGameRef.current.scene.stop('MainScene');
      phaserGameRef.current.scene.stop('UIScene');
      
      const onAiTrigger = async (data: { context: string }) => {
         const advice = await generateTailsAdvice({ rings: 0, speed: 0, context: data.context } as any);
         setTailsAdvice(advice);
         speakText(advice);
         setTimeout(() => setTailsAdvice(null), 4000);
      };

      phaserGameRef.current.scene.start('MainScene', { character, level, onLevelComplete, onBackToMenu, onAiTrigger, onGameOver: handleGameOver });
    }
  };

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: gameRef.current,
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 2000 }, debug: false }
      },
      render: { pixelArt: true },
      dom: { createContainer: true },
      scene: [MainScene, UIScene],
      transparent: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    const game = new Phaser.Game(config);
    phaserGameRef.current = game;

    const onAiTrigger = async (data: { context: string }) => {
       const advice = await generateTailsAdvice({ rings: 0, speed: 0, context: data.context } as any);
       setTailsAdvice(advice);
       speakText(advice);
       setTimeout(() => setTailsAdvice(null), 4000);
    };

    game.scene.start('MainScene', { character, level, onLevelComplete, onBackToMenu, onAiTrigger, onGameOver: handleGameOver });

    const handleResize = () => {
      if (game) game.scale.resize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (game) game.destroy(true);
    };
  }, [character, level]);

  return (
    <motion.div 
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ duration: 1 }}
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      <ThreeBackground level={level} />
      <div id="game-container" ref={gameRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 10 }} />
      
      <AnimatePresence>
        {isGameOver && (
          <GameOverOverlay onRestart={restartGame} onMenu={onBackToMenu} triggerAdvice={handleGameOverAdvice} />
        )}
      </AnimatePresence>

      {!isGameOver && <VirtualJoystick character={character} />}

      {/* Voice Controls UI */}
      {isSupported && !isGameOver && (
        <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 100, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={toggleListening}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '50px', 
              border: 'none', 
              backgroundColor: isListening ? '#ff4444' : '#ffffff', 
              color: isListening ? '#ffffff' : '#000000',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'Orbitron, sans-serif'
            }}
          >
            🎤 {isListening ? 'Ouvindo... (fale "Pula" ou "Acelera")' : 'Ativar Controle por Voz'}
          </button>
          
          <button 
            onClick={getAdvice}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '50px', 
              border: 'none', 
              backgroundColor: '#ffa500', 
              color: '#000000',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
              fontFamily: 'Orbitron, sans-serif'
            }}
          >
            🦊 Chamar Tails (I.A.)
          </button>
          
          {transcript && isListening && (
            <div style={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '10px' }}>
              🗣️ "{transcript}"
            </div>
          )}
        </div>
      )}

      {/* AI Advice Bubble */}
      <AnimatePresence>
        {tailsAdvice && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 50 }}
            style={{
              position: 'absolute',
              bottom: 120,
              right: 40,
              backgroundColor: 'white',
              color: 'black',
              padding: '20px',
              borderRadius: '20px 20px 0px 20px',
              maxWidth: '300px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              fontFamily: 'sans-serif',
              fontSize: '18px',
              fontWeight: 'bold',
              border: '4px solid #ffa500',
              zIndex: 200
            }}
          >
            <div style={{ position: 'absolute', top: -30, right: -10, fontSize: '30px' }}>🦊</div>
            "{tailsAdvice}"
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SonicGame;
