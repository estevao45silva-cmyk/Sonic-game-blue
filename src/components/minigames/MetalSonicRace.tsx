import React, { useState, useEffect } from 'react';
import { UISound } from "../../utils/audio";
import { motion, AnimatePresence } from 'framer-motion';

const MetalSonicRace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [sonicPos, setSonicPos] = useState(0);
  const [metalPos, setMetalPos] = useState(0);
  const [obstacle, setObstacle] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');

  useEffect(() => {
    if (!started || gameOver) return;
    
    // Oponente extremamente lento e fácil (quase impossível perder)
    let metalSpeed = 0.2 + (level * 0.05); 

    const interval = setInterval(() => {
      setSonicPos(p => { let next = p + 0.5; if (next >= 100) { UISound.play('lose'); setGameOver(true); setWinner('VOCÊ'); } return next; });
      setMetalPos(p => { let next = p + metalSpeed; if (next >= 100 && !gameOver) { UISound.play('lose'); setGameOver(true); setWinner('OPONENTE'); } return next; });

      // Obstáculos quase não aparecem e duram muuuuuito tempo para apertar
      if (Math.random() < 0.02 && !obstacle) {
         setObstacle(true);
         setTimeout(() => { setObstacle(false); }, 3000); // 3 SEGUNDOS DE CHANCE!
      }
    }, 60);

    return () => clearInterval(interval);
  }, [started, gameOver, obstacle, level]);

  const handleJump = () => {
      if (obstacle) {
         setObstacle(false);
         setSonicPos(p => p + 15); // BOOST GIGANTESCO!
      }
  };

  const nextRace = () => { setLevel(l => l + 1); setSonicPos(0); setMetalPos(0); setGameOver(false); };

  if (!started) {
     return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #141e30, #243b55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: 'Inter, sans-serif' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', padding: '50px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
             <h1 style={{ color: '#00f2fe', fontSize: '40px', fontWeight: '900', margin: '0 0 10px 0' }}>Dash Boost</h1>
             <p style={{ color: '#CCC', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
                Uma corrida fluida. Quando ver o sinal "BOOST", clique no botão gigante para ganhar uma explosão de velocidade! É fácil e relaxante.
             </p>
             <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { UISound.play("click"); setStarted(true)}} 
                style={{ padding: '15px 40px', background: 'linear-gradient(90deg, #4FACFE, #00f2fe)', color: '#000', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>
                Começar Corrida
             </motion.button>
          </div>
        </motion.div>
     );
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: '#141e30', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: 'Inter, sans-serif', color: 'white' }}>
      
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '0 20px' }}>
         <div style={{ fontSize: '18px', color: '#4FACFE', fontWeight: 'bold' }}>Fase {level}</div>
      </div>

      <div style={{ width: '90%', maxWidth: '800px', background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
         
         {/* Pista Oponente */}
         <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', marginBottom: '40px', position: 'relative' }}>
            <motion.div layout style={{ position: 'absolute', top: '-15px', left: `calc(${metalPos}% - 20px)`, width: '40px', height: '40px', background: 'linear-gradient(135deg, #f5576c, #f093fb)', borderRadius: '50%', boxShadow: '0 0 20px #f5576c' }} />
         </div>

         {/* Pista Jogador */}
         <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', position: 'relative' }}>
            <motion.div layout style={{ position: 'absolute', top: '-15px', left: `calc(${sonicPos}% - 20px)`, width: '40px', height: '40px', background: 'linear-gradient(135deg, #4FACFE, #00f2fe)', borderRadius: '50%', boxShadow: '0 0 30px #4FACFE' }} />
         </div>

         <AnimatePresence>
         {obstacle && (
            <motion.div initial={{scale:0, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0, opacity:0}} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid #FFF', padding: '10px 30px', borderRadius: '30px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', zIndex: 20 }}>
               BOOST DISPONÍVEL!
            </motion.div>
         )}
         </AnimatePresence>

         <AnimatePresence>
         {gameOver && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(20, 30, 48, 0.9)', backdropFilter: 'blur(5px)', borderRadius: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 30 }}>
               <h2 style={{ color: '#00f2fe', fontSize: '30px', marginBottom: '20px' }}>{winner} VENCEU!</h2>
               {winner === 'VOCÊ' ? (
                  <button onClick={(e) => { UISound.play("click"); nextRace(e); }} style={{ padding: '15px 40px', background: '#00f2fe', color: '#000', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>Próxima Corrida</button>
               ) : (
                  <button onClick={() => { UISound.play("click");  setSonicPos(0); setMetalPos(0); setGameOver(false);}} style={{ padding: '15px 40px', background: '#f5576c', color: '#FFF', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>Tentar Novamente</button>
               )}
            </motion.div>
         )}
         </AnimatePresence>
      </div>

      <div style={{ marginTop: '50px', display: 'flex', gap: '20px', flexDirection: 'column', alignItems: 'center' }}>
         <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { UISound.play("click"); handleJump(e); }} 
            style={{ width: '150px', height: '150px', borderRadius: '50%', background: obstacle ? 'linear-gradient(135deg, #00f2fe, #4FACFE)' : 'rgba(255,255,255,0.1)', color: obstacle ? '#000' : '#FFF', border: obstacle ? 'none' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', boxShadow: obstacle ? '0 0 50px rgba(0, 242, 254, 0.5)' : 'none', transition: 'background 0.3s' }}>
            {obstacle ? "BOOST!" : "AGUARDE"}
         </motion.button>

         <button onClick={(e) => { UISound.play("click"); onClose(e); }} style={{ marginTop: '20px', padding: '10px 30px', background: 'transparent', color: '#AAA', border: '1px solid #555', borderRadius: '30px', cursor: 'pointer' }}>Sair</button>
      </div>
    </div>
  );
};
export default MetalSonicRace;
