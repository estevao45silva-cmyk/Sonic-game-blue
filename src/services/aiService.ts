// Serviço real para comunicação com IA gratuita (Pollinations.ai)

/**
 * Função para fazer o Tails falar algo na tela (Text to Speech)
 */
export function speakText(text: string) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.2; // Fala um pouco mais rápido para ficar dinâmico
    
    const voices = window.speechSynthesis.getVoices();
    const ptVoices = voices.filter(v => v.lang.includes('pt-BR'));
    if (ptVoices.length > 0) {
      utterance.voice = ptVoices[0]; 
    }

    window.speechSynthesis.speak(utterance);
  }
}

/**
 * Gera um conselho ou resposta do Tails usando IA gratuita
 */
export async function generateTailsAdvice(playerState: any): Promise<string> {
  const persona = "Aja como o Tails de Sonic. Fale em Português do Brasil. Responda em 1 ou 2 frases curtas.";
  
  let contextMsg = "";
  if (playerState.context) {
    contextMsg = `${persona} O jogador perguntou: "${playerState.context}".`;
  } else {
    const topics = [
      "dê uma dica rápida para derrotar o Eggman.",
      "fale sobre a Green Hill Zone.",
      "comente sobre o avião Tornado.",
      "lembre o jogador de pegar anéis.",
      "faça um elogio nerd e motivacional."
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    contextMsg = `${persona} O jogador tem ${playerState.rings || 0} anéis. Puxe assunto: ${randomTopic}`;
  }

  // Adicionamos um número aleatório no texto para forçar o servidor a não usar cache, 
  // em vez de colocar na URL que estava quebrando o servidor.
  const seed = Math.floor(Math.random() * 999999);
  const finalPrompt = `${contextMsg} [Ignorar: ${seed}]`;

  try {
    const response = await fetch(`https://text.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}`);
    if (response.ok) {
      let text = await response.text();
      text = text.replace(/^"|"$/g, '').trim();
      
      // As vezes a API falha e devolve HTML do erro.
      if (!text.startsWith("<!DOCTYPE") && text.length > 5) {
         return text;
      }
    }
  } catch (error) {
    console.error("AI Error:", error);
  }

  // Fallbacks aleatórios para caso a IA fique fora do ar, em vez de sempre a mesma frase
  const fallbacks = [
    "Meus radares indicam perigo! Fique atento!",
    "Continue assim! Se precisar do Tornado, é só chamar!",
    "Uau, sua velocidade está incrível!",
    "Lembre-se de manter os anéis, eles te protegem!",
    "Eu acredito em você! Vamos derrotar o Eggman juntos!"
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

