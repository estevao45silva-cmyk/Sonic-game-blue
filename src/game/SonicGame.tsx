import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import type { Character } from '../App';
import { MainScene, UIScene } from './PhaserGame';
import ThreeBackground from '../components/ThreeBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { generateTailsAdvice, speakText } from '../services/aiService';

interface SonicGameProps {
  character: Character;
  level: number;
  onLevelComplete: () => void;
  onBackToMenu: () => void;
}

const SonicGame: React.FC<SonicGameProps> = ({ character, level, onLevelComplete, onBackToMenu }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const { isListening, transcript, toggleListening, isSupported } = useVoiceCommands();
  const [tailsAdvice, setTailsAdvice] = useState<string | null>(null);

  // Exemplo de como chamar o conselho do Tails
  const getAdvice = async () => {
    // Simulando estado do jogador
    const playerState = { rings: Math.floor(Math.random() * 50), speed: Math.random() * 100 };
    const advice = await generateTailsAdvice(playerState);
    setTailsAdvice(advice);
    speakText(advice);
    
    // Some o conselho após 4 segundos
    setTimeout(() => {
      setTailsAdvice(null);
    }, 4000);
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
        arcade: {
          gravity: { x: 0, y: 2000 },
          debug: true
        }
      },
      render: {
        pixelArt: true,
      },
      dom: {
        createContainer: true
      },
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

    game.scene.start('MainScene', { character, level, onLevelComplete, onBackToMenu, onAiTrigger });

    const handleResize = () => {
      if (game) {
        game.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (game) {
        game.destroy(true);
      }
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
      
      {/* Voice Controls UI */}
      {isSupported && (
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
