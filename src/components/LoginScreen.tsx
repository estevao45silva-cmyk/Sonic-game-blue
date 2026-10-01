import React from 'react';
import { motion } from 'framer-motion';
import { loginWithGoogle } from '../services/firebase';

import { BGMManager } from '../utils/audio';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const handleLogin = async () => {
    BGMManager.init(); 
    BGMManager.unlockAudio(); // Garante o destravamento imediato do áudio diretamente no clique do React!
    const user = await loginWithGoogle();
    if (user) {
      onLoginSuccess();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url("/imagens/login_bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        color: '#fff',
        fontFamily: "'Inter', 'Roboto', sans-serif",
      }}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '40px',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '400px',
          width: '90%',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #ff0000, #ffaa00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
            padding: '4px',
            marginBottom: '20px',
          }}
        >
          <div style={{
            width: '100%',
            height: '100%',
            background: '#0b1c3c',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <img 
              src="/imagens/sonic_login.png" 
              alt="Sonic Login" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              // Se a imagem não for encontrada, mostra um fallback visual agradável
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </motion.div>

        <h1 style={{ 
          fontSize: '28px', 
          marginBottom: '10px', 
          fontWeight: 800,
          color: '#ffffff',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          textAlign: 'center'
        }}>
          Sonic Adventure Web
        </h1>
        
        <p style={{ 
          fontSize: '14px', 
          color: '#ffffff', 
          textAlign: 'center', 
          marginBottom: '30px',
          lineHeight: '1.5',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)'
        }}>
          Faça login para salvar seu progresso e competir no ranking global com outros jogadores!
        </p>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(66, 133, 244, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin}
          style={{
            background: '#4285F4',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            justifyContent: 'center',
            transition: 'background 0.3s',
          }}
        >
          <div style={{
            background: 'white',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              <path fill="none" d="M1 1h22v22H1z"/>
            </svg>
          </div>
          Entrar com o Google
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default LoginScreen;
