import { useState, useEffect, Suspense, lazy } from 'react';
import type { User } from 'firebase/auth';
import LoginScreen from './components/LoginScreen';
import TitleScreen from './components/TitleScreen';
const CharacterSelection = lazy(() => import('./components/CharacterSelection'));
const SonicGame = lazy(() => import('./game/SonicGame'));
const TransitionScreen = lazy(() => import('./components/TransitionScreen'));
const MapSelection = lazy(() => import('./components/MapSelection'));
import { AnimatePresence, motion } from 'framer-motion';
import { useVoiceCommands } from './hooks/useVoiceCommands';
import { saveScore, auth, onAuthChange, getUserProfile, updateUserProfile } from './services/firebase';
import { checkAchievements } from './constants/achievements';
import OrientationOverlay from './components/OrientationOverlay';
import { PROFILE_STYLE_ITEMS } from './constants/storeItems';

export type GameState = 'TITLE' | 'CHARACTER_SELECT' | 'MAP_SELECT' | 'TRANSITION' | 'GAME';
export type Character = 'sonic' | 'shadow' | 'tails' | null;

export interface Inventory {
  lives: number;
  shield: boolean;
  speed: boolean;
  invincible: boolean;
  unlockedStyles?: string[];
}

function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  const [globalRings, setGlobalRings] = useState<number>(() => {
    return parseInt(localStorage.getItem('sonic_global_rings') || '0');
  });

  const [inventory, setInventory] = useState<Inventory>(() => {
    const saved = localStorage.getItem('sonic_inventory');
    if (saved) return { unlockedStyles: [], ...JSON.parse(saved) };
    return { lives: 3, shield: false, speed: false, invincible: false, unlockedStyles: [] };
  });

  const voiceState = useVoiceCommands();

  // Removed the rapid saveScore on globalRings change
  useEffect(() => {
    localStorage.setItem('sonic_global_rings', globalRings.toString());
  }, [globalRings]);

  useEffect(() => {
    localStorage.setItem('sonic_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        const profile = await getUserProfile(u.uid);
        let currentRings = profile?.globalRings !== undefined ? profile.globalRings : globalRings;
        let currentInventory = profile?.inventory !== undefined ? profile.inventory : inventory;

        if (u.email === 'steven35silva@gmail.com') {
          // Give infinite rings but let them buy the items!
          currentRings = 9999999;
          
          updateUserProfile(u.uid, {
             ...profile,
             displayName: u.displayName,
             email: u.email,
             photoURL: u.photoURL,
             globalRings: currentRings,
             inventory: currentInventory
          });
        } else if (!profile) {
          // Initialize new profile
          updateUserProfile(u.uid, {
             displayName: u.displayName,
             email: u.email,
             photoURL: u.photoURL,
             globalRings: currentRings,
             inventory: currentInventory
          });
        }

        setGlobalRings(currentRings);
        setInventory(currentInventory);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync profile to firebase periodically if in game or when important events happen
  const syncProfile = async () => {
    if (auth.currentUser) {
      const profile = await getUserProfile(auth.currentUser.uid);
      if (profile) {
        const pState = { ...profile, globalRings, inventory };
        const newAchievs = checkAchievements(pState);
        if (newAchievs) pState.achievements = newAchievs;
        updateUserProfile(auth.currentUser.uid, pState);
      }
    }
  };

  useEffect(() => {
    const handleEasterEgg = async (e: any) => {
      const eggId = e.detail; // 'sanic', 'konami', or 'afk'
      if (auth.currentUser) {
         const profile = await getUserProfile(auth.currentUser.uid);
         if (profile) {
            const easterEggs = profile.easterEggs || {};
            if (!easterEggs[eggId]) {
               easterEggs[eggId] = true;
               const pState = { ...profile, easterEggs, globalRings, inventory };
               const newAchievs = checkAchievements(pState);
               if (newAchievs) pState.achievements = newAchievs;
               updateUserProfile(auth.currentUser.uid, pState);
            }
         }
      }
    };
    window.addEventListener('sonic-easter-egg', handleEasterEgg);

    // Easter Egg Keylogger
    let keys: string[] = [];
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    const sanic = ['s', 'a', 'n', 'i', 'c'];

    const handleKeyDown = (e: KeyboardEvent) => {
      keys.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
      if (keys.length > 20) keys.shift();

      // Check Konami
      const last10 = keys.slice(-10);
      if (last10.join(',') === konami.join(',')) {
        window.dispatchEvent(new CustomEvent('sonic-easter-egg', { detail: 'konami' }));
        keys = [];
      }

      // Check Sanic
      const last5 = keys.slice(-5);
      if (last5.join('') === sanic.join('')) {
        window.dispatchEvent(new CustomEvent('sonic-easter-egg', { detail: 'sanic' }));
        keys = [];
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('sonic-easter-egg', handleEasterEgg);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [globalRings, inventory]);

  // Listen to game rings to update global rings when collected (1 by 1)
  useEffect(() => {
    const handleRingCollected = (e: any) => {
      setGlobalRings(prev => prev + 1);
    };
    window.addEventListener('sonic-ring-collected', handleRingCollected);
    return () => window.removeEventListener('sonic-ring-collected', handleRingCollected);
  }, []);

  const addGlobalRings = (amount: number) => {
    setGlobalRings(prev => prev + amount);
  };

  const buyItem = (item: string, cost: number) => {
    if (globalRings >= cost) {
      const newRings = globalRings - cost;
      setGlobalRings(newRings);
      setInventory(prev => {
        const next = { ...prev };
        if (item === 'life') next.lives += 1;
        else if (item === 'shield') next.shield = true;
        else if (item === 'speed') next.speed = true;
        else if (item === 'invincible') next.invincible = true;
        else if (item.startsWith('style_')) {
          if (!next.unlockedStyles) next.unlockedStyles = [];
          if (!next.unlockedStyles.includes(item)) {
            next.unlockedStyles.push(item);
          }
        }
        
        if (auth.currentUser) {
           getUserProfile(auth.currentUser.uid).then(profile => {
             if (profile) {
               const pState = { ...profile, globalRings: newRings, inventory: next };
               const newAchievs = checkAchievements(pState);
               if (newAchievs) pState.achievements = newAchievs;
               updateUserProfile(auth.currentUser.uid, pState);
             }
           });
        }
        return next;
      });
    }
  };

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      setErrorInfo(e.message + '\n' + e.error?.stack);
    };
    const handleRejection = (e: PromiseRejectionEvent) => {
      console.warn("Unhandled Promise Rejection:", e.reason);
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

  if (user === undefined) {
    return (
      <div style={{ background: '#0b1c3c', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: 40, height: 40, border: '4px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
      </div>
    );
  }



  if (user === null) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  const LoadingFallback = () => (
    <div style={{ background: '#0b1c3c', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: 40, height: 40, border: '4px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
    </div>
  );

  const startGame = () => {
    setHasSeenIntro(true);
    setGameState('CHARACTER_SELECT');
  };

  const selectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setGameState('MAP_SELECT');
  };

  const selectMap = (level: number) => {
    setCurrentLevel(level);
    setGameState('TRANSITION');
  };

  const handleLevelComplete = async () => {
    // Salvar o score no ranking se o jogador estiver logado
    if (auth.currentUser && selectedCharacter) {
      await saveScore(
        auth.currentUser.uid,
        auth.currentUser.displayName || 'Jogador Anônimo',
        auth.currentUser.photoURL,
        globalRings, // Usando globalRings como pontuação
        currentLevel.toString(),
        selectedCharacter
      );
      syncProfile();
    }

    setInventory(prev => ({ ...prev, shield: false, speed: false, invincible: false }));

    if (currentLevel < 5) {
      setCurrentLevel(prev => prev + 1);
      setGameState('TRANSITION');
    } else {
      setGameState('TITLE');
    }
  };

  const handleBackToMenu = () => {
    setInventory(prev => ({ ...prev, shield: false, speed: false, invincible: false }));
    syncProfile();
    setHasSeenIntro(true);
    setGameState('TITLE');
  };

  return (
    <div className="app-container">
      <OrientationOverlay />
      {gameState !== 'GAME' && <div className="animated-bg"></div>}
      
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingFallback />}>
          {gameState === 'TITLE' && (
            <TitleScreen key="title" onStart={startGame} globalRings={globalRings} inventory={inventory} onBuy={buyItem} voiceState={voiceState} addGlobalRings={addGlobalRings} skipIntro={hasSeenIntro} />
          )}
          
          {gameState === 'CHARACTER_SELECT' && (
            <CharacterSelection key="select" onSelect={selectCharacter} onBack={() => setGameState('TITLE')} />
          )}

          {gameState === 'MAP_SELECT' && (
            <MapSelection key="map_select" onSelect={selectMap} onBack={() => setGameState('CHARACTER_SELECT')} />
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
               inventory={inventory}
               addGlobalRings={addGlobalRings}
               onLevelComplete={handleLevelComplete}
               onBackToMenu={handleBackToMenu} 
            />
          )}
        </Suspense>
      </AnimatePresence>
    </div>
  );
}

export default App;
