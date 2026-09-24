// Serviço simulado ou real para comunicação com o Gemini ou outras IAs

// Se tivéssemos a chave da API, importaríamos o SDK do Google Gen AI
// import { GoogleGenAI } from '@google/genai';

/**
 * Função para fazer o Tails falar algo na tela (Text to Speech)
 */
export function speakText(text: string) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1; // Fala um pouco mais rápido para ficar dinâmico
    
    // Tenta encontrar uma voz mais "desenhada" ou jovem (depende do SO do usuário)
    const voices = window.speechSynthesis.getVoices();
    const ptVoices = voices.filter(v => v.lang.includes('pt-BR'));
    if (ptVoices.length > 0) {
      // Pega a primeira voz BR
      utterance.voice = ptVoices[0]; 
    }

    window.speechSynthesis.speak(utterance);
  }
}

/**
 * Gera um conselho do Tails usando IA
 * Por enquanto retorna um mock, até integrarmos a Chave da API do Gemini
 */
export async function generateTailsAdvice(playerState: any): Promise<string> {
  // TODO: Integrar com a API do Gemini
  // const ai = new GoogleGenAI({ apiKey: 'SUA_CHAVE_AQUI' });
  
  // Simulando um pequeno delay de rede
  return new Promise((resolve) => {
    setTimeout(() => {
      if (playerState.rings === 0) {
        resolve("Cuidado Sonic! Você está sem argolas!");
      } else if (playerState.speed > 50) {
        resolve("Uau, você está muito rápido!");
      } else {
        resolve("Continue assim, nós vamos pegar o Eggman!");
      }
    }, 500);
  });
}
