import React from 'react';
import { motion } from 'framer-motion';
import { UISound } from '../utils/audio';
import { PROFILE_STYLE_ITEMS } from '../constants/storeItems';

interface StoreProps {
  rings: number;
  inventory: any;
  onBuy: (item: string, cost: number) => void;
  onClose: () => void;
}

export const StoreOverlay: React.FC<StoreProps> = ({ rings, inventory, onBuy, onClose }) => {
  const gameItems = [
    { id: 'life', name: 'Vida Extra', cost: 100, icon: '❤️', desc: 'Ganha +1 Vida. Ficar sem vidas causa Game Over.', current: inventory.lives },
    { id: 'shield', name: 'Escudo de Raio', cost: 50, icon: '🛡️', desc: 'Proteção contra 1 dano e atrai argolas.', current: inventory.shield ? 'Possui' : 'Não' },
    { id: 'speed', name: 'Tênis de Corrida', cost: 75, icon: '👟', desc: 'Aumenta sua velocidade drasticamente por 10s.', current: inventory.speed ? 'Possui' : 'Não' },
    { id: 'invincible', name: 'Estrela', cost: 150, icon: '⭐', desc: 'Te deixa invencível contra todos inimigos e espinhos por 10s.', current: inventory.invincible ? 'Possui' : 'Não' }
  ];
  const styleItems = PROFILE_STYLE_ITEMS;

  const renderItem = (item: any, isStyle: boolean = false) => {
    let alreadyOwns = false;
    if (isStyle) {
      alreadyOwns = inventory.unlockedStyles?.includes(item.id);
    } else {
      alreadyOwns = item.id !== 'life' && inventory[item.id] === true;
    }
    
    const canBuy = rings >= item.cost && !alreadyOwns;
    
    let buttonText = `COMPRAR (${item.cost}💍)`;
    if (alreadyOwns) buttonText = isStyle ? "DESBLOQUEADO" : "COMPRADO";
    else if (!canBuy) buttonText = `FALTAM ${item.cost - rings}💍`;

    return (
      <motion.div 
        key={item.id}
        onHoverStart={() => { if (canBuy) UISound.play('hover'); }}
        whileHover={canBuy ? { scale: 1.05, y: -5, boxShadow: '0 15px 30px rgba(0, 255, 150, 0.2)', borderColor: '#00FF9D' } : {}}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '25px', 
          borderRadius: '24px', 
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden',
          opacity: alreadyOwns ? 0.7 : 1,
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{
          position: 'absolute', top: 0, right: 0, 
          background: alreadyOwns ? 'linear-gradient(135deg, #4CAF50, #2E8B57)' : 'linear-gradient(135deg, #00BFFF, #1E90FF)',
          color: '#FFF', padding: '6px 14px', fontSize: '10px', fontWeight: 'bold', 
          borderBottomLeftRadius: '16px', fontFamily: '"Inter", sans-serif',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          boxShadow: '-2px 2px 10px rgba(0,0,0,0.2)'
        }}>
          {item.id === 'life' ? `TENS: ${item.current}` : (alreadyOwns ? (isStyle ? 'NO PERFIL' : 'EQUIPADO') : 'NOVO')}
        </div>

        <div style={{ 
          fontSize: isStyle ? '20px' : '65px', 
          marginBottom: '20px', 
          filter: !isStyle ? 'drop-shadow(0 5px 15px rgba(255,255,255,0.4))' : (item.type === 'filter' ? item.cssValue : 'none'),
          background: isStyle ? (item.type === 'bg' ? item.cssValue : 'rgba(255,255,255,0.08)') : 'transparent',
          padding: isStyle ? '18px' : '0',
          borderRadius: isStyle ? '50%' : '0',
          width: isStyle ? '70px' : 'auto',
          height: isStyle ? '70px' : 'auto',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          fontWeight: '900', letterSpacing: isStyle ? '1px' : '0',
          boxShadow: isStyle ? (item.type === 'neon' ? item.cssValue : 'inset 0 0 20px rgba(255,255,255,0.1)') : 'none',
          border: isStyle && item.type === 'border' ? item.cssValue : 'none',
          color: isStyle && item.type === 'name' ? item.cssValue : '#FFF',
          textShadow: isStyle && item.type === 'name' ? `0 0 10px ${item.cssValue}` : 'none'
        }}>
          {isStyle ? item.iconText : item.icon}
        </div>
        
        <h3 style={{ fontSize: '14px', textAlign: 'center', marginBottom: '12px', color: '#FFF', letterSpacing: '0.5px' }}>{item.name}</h3>
        
        <p style={{ fontSize: '12px', textAlign: 'center', marginBottom: '25px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, fontFamily: '"Inter", sans-serif', flex: 1 }}>
          {item.desc}
        </p>
        
        <motion.button 
          onHoverStart={() => { if (canBuy) UISound.play('hover'); }}
          whileTap={canBuy ? { scale: 0.92 } : {}}
          onClick={() => {
            if (canBuy) {
              UISound.play('buy');
              onBuy(item.id, item.cost);
            } else {
              UISound.play('error');
            }
          }}
          disabled={!canBuy || alreadyOwns}
          style={{
            padding: '14px', 
            background: alreadyOwns ? 'rgba(76, 175, 80, 0.2)' : (canBuy ? 'linear-gradient(135deg, #00FF9D 0%, #00B8FF 100%)' : 'rgba(255,255,255,0.05)'),
            color: canBuy ? '#000' : (alreadyOwns ? '#4CAF50' : 'rgba(255,255,255,0.3)'), 
            border: alreadyOwns ? '1px solid rgba(76, 175, 80, 0.5)' : (canBuy ? 'none' : '1px solid rgba(255,255,255,0.1)'), 
            borderRadius: '12px', cursor: canBuy ? 'pointer' : 'not-allowed',
            fontFamily: '"Press Start 2P", Orbitron, monospace', fontSize: '10px', width: '100%',
            fontWeight: 'bold',
            boxShadow: canBuy ? '0 5px 15px rgba(0, 184, 255, 0.3)' : 'none',
            transition: 'all 0.3s'
          }}
        >
          {buttonText}
        </motion.button>
      </motion.div>
    );
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(15px)',
      zIndex: 300,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '20px'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{
          width: '100%', maxWidth: '1200px', maxHeight: '90vh',
          background: 'linear-gradient(180deg, rgba(20, 30, 50, 0.9) 0%, rgba(10, 15, 25, 0.95) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '32px',
          display: 'flex', flexDirection: 'column', padding: '40px',
          color: 'white', fontFamily: '"Press Start 2P", Orbitron, monospace', 
          boxShadow: '0 30px 60px rgba(0,0,0,0.7), inset 0 2px 20px rgba(255,215,0,0.1)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            UISound.play('click');
            onClose();
          }}
          style={{
            position: 'absolute', top: '25px', right: '25px',
            width: '45px', height: '45px',
            borderRadius: '50%', background: 'rgba(255,0,0,0.1)',
            border: '1px solid rgba(255,0,0,0.3)',
            color: '#FF4444', fontSize: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center',
            cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(5px)'
          }}
        >
          ✖
        </motion.button>

        <div style={{ overflowY: 'auto', paddingRight: '15px', paddingBottom: '20px' }} className="store-scroll">
          <style>{`
            .store-scroll::-webkit-scrollbar { width: 8px; }
            .store-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
            .store-scroll::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.5); border-radius: 10px; }
            .store-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,215,0,0.8); }
          `}</style>
          
          <h1 style={{ color: '#FFD700', marginBottom: '15px', textAlign: 'center', fontSize: 'clamp(24px, 4vw, 45px)', textShadow: '0 0 30px rgba(255,215,0,0.5)', letterSpacing: '2px' }}>
            LOJA VIP
          </h1>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
            <div style={{ 
              background: 'rgba(0, 0, 0, 0.4)', padding: '15px 30px', borderRadius: '100px', 
              border: '1px solid rgba(0, 191, 255, 0.3)',
              boxShadow: 'inset 0 0 20px rgba(0, 191, 255, 0.1)'
            }}>
              <p style={{ color: '#00BFFF', fontSize: 'clamp(14px, 2vw, 18px)', margin: 0, textShadow: '0 0 10px rgba(0,191,255,0.5)' }}>
                Argolas: <span style={{ color: '#FFD700', fontSize: '1.4em', marginLeft: '10px' }}>{rings}</span> 💍
              </p>
            </div>
          </div>

          <h2 style={{ color: '#FFF', alignSelf: 'flex-start', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', width: '100%', fontSize: '18px', letterSpacing: '1px' }}>
            <span style={{ color: '#00FF9D', marginRight: '10px' }}>✦</span>Itens de Sobrevivência
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '25px', width: '100%', marginBottom: '50px' }}>
            {gameItems.map(item => renderItem(item, false))}
          </div>

          <h2 style={{ color: '#FFF', alignSelf: 'flex-start', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', width: '100%', fontSize: '18px', letterSpacing: '1px' }}>
            <span style={{ color: '#FF009D', marginRight: '10px' }}>✦</span>Estilos Premium
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '25px', width: '100%', paddingBottom: '20px' }}>
            {styleItems.map(item => renderItem(item, true))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

