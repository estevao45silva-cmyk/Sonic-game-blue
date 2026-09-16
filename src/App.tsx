import { useState, useEffect } from 'react';
import TitleScreen from './components/TitleScreen';
import CharacterSelection from './components/CharacterSelection';
import SonicGame from './game/SonicGame';
import TransitionScreen from './components/TransitionScreen';
import { AnimatePresence } from 'framer-motion';

export type GameState = 'TITLE' | 'CHARACTER_SELECT' | 'TRANSITION' | 'GAME';
export type Character = 'sonic' | 'shadow' | null;

function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      setErrorInfo(e.message + '\n' + e.error?.stack);
    };
    const handleRejection = (e: PromiseRejectionEvent) => {
      const msg = e.reason?.message || '';
      if (msg.includes('AudioContext')) return; // Ignore Phaser HMR AudioContext error
      setErrorInfo(msg || 'Promise Rejection');
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (errorInfo) {
    return (
      <div style={{ backgroundColor: 'red', color: 'white', padding: '20px', whiteSpace: 'pre-wrap', zIndex: 9999, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <h2>GAME CRASHED:</h2>
        <p>{errorInfo}</p>
        <button onClick={() => window.location.reload()}>RELOAD</button>
      </div>
    );
  }

  const startGame = () => {
    setGameState('CHARACTER_SELECT');
  };

  const selectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setCurrentLevel(1);
    setGameState('TRANSITION');
  };

  const handleLevelComplete = () => {
    if (currentLevel < 3) {
      setCurrentLevel(prev => prev + 1);
    } else {
      // Zerou o jogo
      setGameState('TITLE');
    }
  };

  return (
    <div className="app-container">
      {/* Animated background is behind everything unless the game covers it */}
      {gameState !== 'GAME' && <div className="animated-bg"></div>}
      
      <AnimatePresence mode="wait">
        {gameState === 'TITLE' && (
          <TitleScreen key="title" onStart={startGame} />
        )}
        
        {gameState === 'CHARACTER_SELECT' && (
          <CharacterSelection key="select" onSelect={selectCharacter} onBack={() => setGameState('TITLE')} />
        )}

        {gameState === 'TRANSITION' && selectedCharacter && (
          <TransitionScreen 
             key="transition" 
             level={currentLevel} 
             character={selectedCharacter} 
             onComplete={() => setGameState('GAME')} 
          />
        )}

        {gameState === 'GAME' && selectedCharacter && (
          <SonicGame 
             key="game"
             character={selectedCharacter} 
             level={currentLevel}
             onLevelComplete={handleLevelComplete}
             onBackToMenu={() => setGameState('TITLE')} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
