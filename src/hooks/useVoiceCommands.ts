import { useState, useEffect, useCallback } from 'react';

// Extender a interface Window para Typescript reconhecer as APIs de fala do navegador
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useVoiceCommands() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true; // Continue ouvindo após o primeiro comando
      recog.interimResults = false;
      recog.lang = 'pt-BR'; // Usaremos português por padrão

      recog.onstart = () => setIsListening(true);
      recog.onend = () => setIsListening(false);
      
      recog.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const text = event.results[lastResultIndex][0].transcript.trim().toLowerCase();
        setTranscript(text);

        // Disparar eventos customizados com base nas palavras
        if (text.includes('pula') || text.includes('pular') || text.includes('jump')) {
          window.dispatchEvent(new CustomEvent('voice-command-jump'));
        }
        if (text.includes('acelera') || text.includes('corre') || text.includes('dash')) {
          window.dispatchEvent(new CustomEvent('voice-command-dash'));
        }
      };

      setRecognition(recog);
    } else {
      console.warn('API de Reconhecimento de Voz não suportada neste navegador.');
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (e) {
        console.error("Erro ao iniciar reconhecimento de voz:", e);
      }
    }
  }, [recognition, isListening]);

  return { isListening, transcript, toggleListening, isSupported: !!recognition };
}
