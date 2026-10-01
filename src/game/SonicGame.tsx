import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import type { Character } from '../App';
import { MainScene, UIScene, RetroAudio } from './PhaserGame';
import ThreeBackground from '../components/ThreeBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { VirtualJoystick } from '../components/VirtualJoystick';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { generateTailsAdvice, speakText } from '../services/aiService';
import { StoreOverlay } from '../components/StoreOverlay';
import { BGMManager } from '../utils/audio';

interface SonicGameProps {
  character: Character;
  level: number;
  inventory?: any;
  addGlobalRings?: (amount: number) => void;
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

const SonicGame: React.FC<SonicGameProps> = ({ character, level, inventory, addGlobalRings, onLevelComplete, onBackToMenu }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const { isListening, transcript, toggleListening, isSupported } = useVoiceCommands();
  const [tailsAdvice, setTailsAdvice] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [rings, setRings] = useState(0);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  
  // Mission System
  const [mission, setMission] = useState({ description: "Colete 20 Argolas", target: 20, reward: 50 });
  const [missionCompleted, setMissionCompleted] = useState(false);

  useEffect(() => {
    BGMManager.playRandom();
    const handleRings = (e: any) => setRings(e.detail);
    window.addEventListener('sonic-rings', handleRings);
    return () => {
      window.removeEventListener('sonic-rings', handleRings);
      BGMManager.stop();
    };
  }, []);

  const addRings = (amount: number) => {
    if (addGlobalRings) addGlobalRings(amount);
  };

  useEffect(() => {
    if (rings >= mission.target && !missionCompleted && rings > 0) {
      setMissionCompleted(true);
      
      const successMsg = `Missão Completa! +${mission.reward} Argolas na loja!`;
      setTailsAdvice(successMsg);
      // speakText(successMsg);
      
      addRings(mission.reward);
      
      setTimeout(() => {
         setMission({ 
           description: `Colete ${mission.target + 20} Argolas`, 
           target: mission.target + 20, 
           reward: mission.reward + 10 
         });
         setMissionCompleted(false);
       }, 5000);
    }
  }, [rings, mission, missionCompleted]);

  const handleBuyItem = (item: string, cost: number) => {
    if (rings >= cost && phaserGameRef.current) {
      const mainScene = phaserGameRef.current.scene.getScene('MainScene') as any;
      if (mainScene) {
        mainScene.ringCount -= cost;
        mainScene.events.emit("updateRings", mainScene.ringCount);
        window.dispatchEvent(new CustomEvent("sonic-rings", { detail: mainScene.ringCount }));
        
        if (item === 'life') {
          mainScene.lives++;
          mainScene.events.emit("updateLives", mainScene.lives);
        } else if (item === 'shield') {
          mainScene.currentShield = 'lightning'; 
        } else if (item === 'speed') {
          mainScene.speedShoesTimer = 10000;
        } else if (item === 'invincible') {
          mainScene.isInvincible = true;
          mainScene.time.delayedCall(10000, () => { mainScene.isInvincible = false; });
        }
      }
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setTailsAdvice("Pensando...");
    const playerState = { rings, speed: 0, context: `Responda a essa mensagem do jogador de forma curta, prestativa e amigável, no universo do Sonic: "${chatInput}"` };
    const advice = await generateTailsAdvice(playerState);
    setTailsAdvice(advice);
    // speakText(advice);
    setChatInput('');
    setTimeout(() => setTailsAdvice(null), 8000);
  };

  const getAdvice = async () => {
    const playerState = { rings: Math.floor(Math.random() * 50), speed: Math.random() * 100 };
    const advice = await generateTailsAdvice(playerState);
    setTailsAdvice(advice);
    // speakText(advice);
    setTimeout(() => setTailsAdvice(null), 4000);
  };

  const handleGameOver = () => {
    setIsGameOver(true);
  };
  
  const handleGameOverAdvice = async () => {
     const advice = await generateTailsAdvice({ rings: 0, speed: 0, context: "O jogador acabou de perder todas as vidas e deu Game Over! Fale algo dramático estilo fliperama!" } as any);
     setTailsAdvice(advice);
     // speakText(advice);
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
         // speakText(advice);
         setTimeout(() => setTailsAdvice(null), 4000);
      };

      const handleLevelEnd = () => {
        onLevelComplete();
      };

      const handleMenuReturn = () => {
        onBackToMenu();
      };

      phaserGameRef.current.scene.start('MainScene', { character, level, inventory, onLevelComplete: handleLevelEnd, onBackToMenu: handleMenuReturn, onAiTrigger, onGameOver: handleGameOver });
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
       // speakText(advice);
       setTimeout(() => setTailsAdvice(null), 4000);
    };

    const handleLevelEnd = () => {
      onLevelComplete();
    };

    const handleMenuReturn = () => {
      onBackToMenu();
    };

    game.scene.start('MainScene', { character, level, inventory, onLevelComplete: handleLevelEnd, onBackToMenu: handleMenuReturn, onAiTrigger, onGameOver: handleGameOver });

    const handleResize = () => {
      if (game) game.scale.resize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      RetroAudio.stopBGM();
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

      {/* Virtual Joystick removido a pedido do usuário */}

      {/* Mission UI Bubble */}
      {!isGameOver && (
        <div style={{
          position: 'absolute', top: 75, right: 20, zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.6)', padding: '10px', borderRadius: '10px',
          border: '2px solid #FFD700', color: 'white', fontFamily: '"Press Start 2P", Orbitron, sans-serif',
          textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '5px'
        }}>
          <div style={{ color: '#FFD700', fontSize: '9px' }}>MISSÃO ATUAL:</div>
          <div style={{ fontSize: '10px' }}>{mission.description}</div>
          <div style={{ fontSize: '9px', color: '#4CAF50' }}>Progresso: {rings}/{mission.target}</div>
          <div style={{ fontSize: '9px', color: '#ffa500' }}>Recompensa: {mission.reward} Argolas</div>
        </div>
      )}

      {/* Voice Controls & AI removed from here, moving to Title Screen */}
      {isSupported && !isGameOver && transcript && isListening && (
        <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 100, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '10px' }}>
          🗣️ "{transcript}"
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
