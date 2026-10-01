import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, getDoc, where, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config do projeto sonic-game
const firebaseConfig = {
  apiKey: "AIzaSyCtZnhuo_PCnsvR7RjzDg9AxLXNXaG7NSQ",
  authDomain: "sonic-game-63f0a.firebaseapp.com",
  projectId: "sonic-game-63f0a",
  storageBucket: "sonic-game-63f0a.firebasestorage.app",
  messagingSenderId: "169248159453",
  appId: "1:169248159453:web:bab214330f0933eaf68d34",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

// ═══════════════════════════════════════════
//  AUTENTICAÇÃO
// ═══════════════════════════════════════════

export const loginWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Profile is updated later in App.tsx when loading or creating defaults
    return result.user;
  } catch (error) {
    console.error('Erro no login:', error);
    return null;
  }
};

// ═══════════════════════════════════════════
//  PERFIL DO USUÁRIO (RINGS E INVENTÁRIO)
// ═══════════════════════════════════════════

export const getUserProfile = async (uid: string) => {
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, data: any) => {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, { ...data, lastUpdate: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erro no logout:', error);
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ═══════════════════════════════════════════
//  RANKING / LEADERBOARD
// ═══════════════════════════════════════════

export interface ScoreEntry {
  id?: string;
  uid: string;
  displayName: string;
  photoURL: string | null;
  score: number;
  map: string;
  character: string;
  timestamp: any;
}

/**
 * Salva um score no ranking.
 * Mantém apenas o melhor score de cada jogador por mapa.
 */
export const saveScore = async (
  uid: string,
  displayName: string,
  photoURL: string | null,
  score: number,
  map: string,
  character: string
) => {
  try {
    // Verificar se já existe um score melhor para este jogador neste mapa
    const docRef = doc(db, 'rankings', `${uid}_${map}`);
    const existingQuery = await getDocs(
      query(collection(db, 'rankings'), where('uid', '==', uid), where('map', '==', map))
    );

    let shouldSave = true;
    existingQuery.forEach((docSnap) => {
      if (docSnap.data().score >= score) {
        shouldSave = false; // Já tem score melhor
      }
    });

    if (shouldSave) {
      await setDoc(docRef, {
        uid,
        displayName,
        photoURL,
        score,
        map,
        character,
        timestamp: serverTimestamp(),
      });
    }

    return shouldSave;
  } catch (error) {
    console.error('Erro ao salvar score:', error);
    return false;
  }
};

/**
 * Busca o Top 10 global (todos os mapas somados ou por mapa específico)
 * Filtra para que cada jogador (uid) apareça apenas uma vez com seu melhor score.
 */
export const getTopScores = async (mapFilter?: string): Promise<ScoreEntry[]> => {
  try {
    const q = query(collection(db, 'rankings')); // Fetch all, no composite indexes needed
    const snapshot = await getDocs(q);

    let allScores: ScoreEntry[] = [];
    snapshot.forEach((doc) => {
      allScores.push({ id: doc.id, ...(doc.data() as ScoreEntry) });
    });

    // 1. Filter by map locally
    if (mapFilter && mapFilter !== 'all') {
      allScores = allScores.filter(score => score.map === mapFilter);
    }

    // 2. Sort locally by score descending
    allScores.sort((a, b) => b.score - a.score);

    // 3. Filter unique UIDs
    const scores: ScoreEntry[] = [];
    const seenUids = new Set<string>();

    for (const data of allScores) {
      if (!seenUids.has(data.uid)) {
        seenUids.add(data.uid);
        scores.push(data);
        if (scores.length >= 10) break; // Limit to 10
      }
    }

    return scores;
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return [];
  }
};

/**
 * Busca o melhor score de um jogador específico
 */
export const getPlayerBestScore = async (uid: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'rankings'),
      where('uid', '==', uid),
      orderBy('score', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    let best = 0;
    snapshot.forEach((doc) => {
      best = doc.data().score;
    });
    return best;
  } catch (error) {
    console.error('Erro ao buscar score do jogador:', error);
    return 0;
  }
};
