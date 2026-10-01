import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UISound } from '../../utils/audio';
import ChaoGarden from './ChaoGarden';
import HalfPipe from './HalfPipe';
import FlappyTails from './FlappyTails';
import SonicJump from './SonicJump';
import SonicRunner from './SonicRunner';
import BladeRush from './BladeRush';
import RingCatcher from './RingCatcher';
import MemorySonic from './MemorySonic';
import WhackEggman from './WhackEggman';

const miniGamesList = [
  { id: 'chao', name: 'Oasis Pet', desc: 'Cuide do seu mascote de luz.', color: '#a1c4fd', icon: '🥚' },
  { id: 'halfpipe', name: 'Túnel de Luz', desc: 'Deslize e colete argolas no infinito.', color: '#000428', icon: '🌌' },
  { id: 'flappy', name: 'Flappy Tails', desc: 'Voe sem bater nas colunas.', color: '#87CEEB', icon: '🚁' },
  { id: 'jump', name: 'Sonic Jump', desc: 'Pule o mais alto possível.', color: '#004488', icon: '🦘' },
  { id: 'runner', name: 'Sonic Dash', desc: 'Sobreviva no deserto.', color: '#8B4513', icon: '🏃' },
  { id: 'blade', name: 'Corta-Robôs', desc: 'Fatie badniks, evite as bombas.', color: '#ff0000', icon: '⚔️' },
  { id: 'catcher', name: 'Ring Catcher', desc: 'Pegue anéis caindo do céu!', color: '#FFD700', icon: '💍' },
  { id: 'memory', name: 'Memory Sonic', desc: 'Encontre os pares de personagens.', color: '#7B1FA2', icon: '🃏' },
  { id: 'whack', name: 'Whack Eggman', desc: 'Acerte o Eggman nos buracos!', color: '#F44336', icon: '🔨' }
];

export const MiniGamesMenu: React.FC<{ onClose: () => void, addGlobalRings: (a: number) => void }> = ({ onClose, addGlobalRings }) => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  if (activeGame === 'chao') return <ChaoGarden onClose={() => setActiveGame(null)} />;
  if (activeGame === 'halfpipe') return <HalfPipe onClose={() => setActiveGame(null)} />;
  if (activeGame === 'flappy') return <FlappyTails onClose={() => setActiveGame(null)} />;
  if (activeGame === 'jump') return <SonicJump onClose={() => setActiveGame(null)} />;
  if (activeGame === 'runner') return <SonicRunner onClose={() => setActiveGame(null)} />;
  if (activeGame === 'blade') return <BladeRush onClose={() => setActiveGame(null)} />;
  if (activeGame === 'catcher') return <RingCatcher onClose={() => setActiveGame(null)} />;
  if (activeGame === 'memory') return <MemorySonic onClose={() => setActiveGame(null)} />;
  if (activeGame === 'whack') return <WhackEggman onClose={() => setActiveGame(null)} />;

  const particles = Array.from({ length: 40 });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundImage: 'url(/imagens/minigames_bg_3.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 900, 
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', 
        fontFamily: 'Inter, sans-serif', color: 'white', overflowY: 'auto', padding: '60px 40px',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 1 }}>
        {particles.map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              y: '110vh', 
              x: `${Math.random() * 100}vw`,
              opacity: Math.random() * 0.4 + 0.1,
              scale: Math.random() * 1.5 + 0.5
            }}
            animate={{ 
              y: '-10vh',
              x: `${Math.random() * 100 + (Math.random() * 20 - 10)}vw`
            }}
            transition={{ 
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * -20
            }}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: '#FFF',
              borderRadius: '50%',
              boxShadow: '0 0 8px #FFF'
            }}
          />
        ))}
      </div>

      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} style={{ marginBottom: '40px', textAlign: 'left', zIndex: 2, position: 'relative' }}>
         <h1 style={{ color: '#FFF', fontSize: '32px', fontWeight: '300', margin: '0 0 5px 0', letterSpacing: '1px' }}>
            GALERIA ARCADE
         </h1>
         <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '400', letterSpacing: '0.5px' }}>EXPERIÊNCIAS PREMIUM REDESENHADAS.</p>
      </motion.div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '15px', width: '100%', maxWidth: '600px', zIndex: 2, position: 'relative' }}>
        {miniGamesList.map((game, i) => (
           <motion.div 
             key={game.id}
             initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
             whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)', boxShadow: '0 -3px 15px rgba(0, 242, 254, 0.5)' }}
             onHoverStart={() => UISound.play('hover')}
             whileTap={{ scale: 0.98 }}
             onClick={() => { UISound.play('start'); setActiveGame(game.id); }}
             style={{ 
               width: '150px',
               height: '100px',
               background: 'rgba(255,255,255,0.05)',
               border: '1px solid rgba(255,255,255,0.1)',
               borderTop: '2px solid #00f2fe',
               boxShadow: '0 -2px 8px rgba(0, 242, 254, 0.2)',
               borderRadius: '8px',
               padding: '15px', cursor: 'pointer',
               display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', textAlign: 'left',
               backdropFilter: 'blur(8px)',
               transition: 'all 0.3s ease'
             }}
           >
              <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#FFF', letterSpacing: '0.5px' }}>{game.name}</h2>
              <p style={{ fontSize: '10px', lineHeight: '1.4', color: 'rgba(255,255,255,0.6)' }}>{game.desc}</p>
           </motion.div>
        ))}
      </div>

      <motion.button 
         whileHover={{ backgroundColor: 'rgba(255,255,255,0.15)' }} 
         onHoverStart={() => UISound.play('hover')}
         whileTap={{ scale: 0.95 }}
         onClick={() => { UISound.play('click'); onClose(); }}
         style={{ marginTop: '50px', padding: '10px 25px', background: 'transparent', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', backdropFilter: 'blur(5px)', zIndex: 2, position: 'relative', letterSpacing: '1px' }}
      >
         VOLTAR
      </motion.button>
    </motion.div>
  );
};
