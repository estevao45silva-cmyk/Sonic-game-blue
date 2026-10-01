export class UISound {
  static ctx: AudioContext | null = null;
  static init() {
    if (!this.ctx) {
      try { 
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); 
        const unlock = () => { if (this.ctx?.state === "suspended") this.ctx.resume(); };
        window.addEventListener('click', unlock, { passive: true });
        window.addEventListener('keydown', unlock, { passive: true });
        window.addEventListener('touchstart', unlock, { passive: true });
      } catch(e) {}
    }
  }
  static play(type: "hover" | "click" | "buy" | "error" | "start" | "jump" | "coin" | "damage" | "win" | "lose" | "dash" | "hit" | "shoot") {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    if (type === "hover") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.start(t); osc.stop(t + 0.1);
    } else if (type === "click") {
      osc.type = "square";
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.15);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.start(t); osc.stop(t + 0.15);
    } else if (type === "buy") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.setValueAtTime(1200, t + 0.1);
      osc.frequency.setValueAtTime(1600, t + 0.2);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.4);
      osc.start(t); osc.stop(t + 0.4);
    } else if (type === "error" || type === "damage" || type === "hit") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.3);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.3);
      osc.start(t); osc.stop(t + 0.3);
    } else if (type === "start" || type === "win") {
      osc.type = "square";
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.5);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.5);
      osc.start(t); osc.stop(t + 0.5);
      
      if (type === "win") {
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.connect(gain2); gain2.connect(this.ctx.destination);
        osc2.type = "square";
        osc2.frequency.setValueAtTime(660, t + 0.2);
        osc2.frequency.exponentialRampToValueAtTime(1320, t + 0.7);
        gain2.gain.setValueAtTime(0.1, t + 0.2);
        gain2.gain.linearRampToValueAtTime(0, t + 0.7);
        osc2.start(t + 0.2); osc2.stop(t + 0.7);
      }
    } else if (type === "jump") {
      osc.type = "square";
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      osc.start(t); osc.stop(t + 0.3);
    } else if (type === "coin") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.setValueAtTime(1600, t + 0.05);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
      osc.start(t); osc.stop(t + 0.5);
    } else if (type === "lose") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.8);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.8);
      osc.start(t); osc.stop(t + 0.8);
    } else if (type === "dash") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.linearRampToValueAtTime(400, t + 0.5);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
      osc.start(t); osc.stop(t + 0.5);
    } else if (type === "shoot") {
      osc.type = "square";
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      osc.start(t); osc.stop(t + 0.2);
    }
  }
}

export class BGMManager {
  static currentAudio: HTMLAudioElement | null = null;
  static segaAudio: HTMLAudioElement | null = null;
  static currentVolume: number = 0.5;
  static isIntendedToPlay: boolean = false;
  static hasAttachedListener: boolean = false;
  static tracks = [
    '/imagens/sons/Sonic The Hedgehog 2 OST - Casino Night - Hanternos.mp3',
    '/imagens/sons/Sonic 3 And Knuckles OST - Hydrocity Act 1 - Hanternos.mp3',
    '/imagens/sons/Sonic The Hedgehog OST - Green Hill Zone - Hanternos.mp3',
    '/imagens/sons/Sonic The Hedgehog OST - Labyrinth Zone - Hanternos.mp3',
    '/imagens/sons/Sonic The Hedgehog OST - Marble Zone - Hanternos.mp3',
    '/imagens/sons/Sonic The Hedgehog OST - Special Stage - Hanternos.mp3'
  ];

  static isUnlocked = false;

  static unlockAudio() {
    if (this.isUnlocked) {
      if (this.isIntendedToPlay && this.currentAudio && this.currentAudio.paused) {
        this.currentAudio.play().catch(() => {});
      }
      return;
    }
    this.isUnlocked = true;

    if (this.currentAudio && this.currentAudio.paused) {
      if (this.isIntendedToPlay) {
        this.currentAudio.play().catch(() => {});
      } else {
        this.currentAudio.play().then(() => {
          if (!this.isIntendedToPlay) this.currentAudio?.pause();
        }).catch(() => {});
      }
    }

    if (this.segaAudio && this.segaAudio.paused) {
      this.segaAudio.play().then(() => {
        if (this.segaAudio && this.segaAudio.currentTime < 0.1) {
          this.segaAudio.pause();
          this.segaAudio.currentTime = 0;
        }
      }).catch(() => {});
    }

    UISound.init();
    if (UISound.ctx && UISound.ctx.state === "suspended") UISound.ctx.resume();
  }

  static init() {
    if (!this.currentAudio) {
      this.currentAudio = new Audio();
      this.currentAudio.loop = true;
    }
    if (!this.segaAudio) {
      this.segaAudio = new Audio(encodeURI('/imagens/sons/Sega Intro (Sonic 1) - TopperGame.mp3'));
    }
    if (!this.hasAttachedListener) {
      this.hasAttachedListener = true;
      const unlock = () => this.unlockAudio();
      // Listen to all interaction events globally
      window.addEventListener('click', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
    }
  }

  static playSega() {
    this.init();
    if (!this.segaAudio) return;
    this.segaAudio.currentTime = 0;
    this.segaAudio.play().catch(e => console.log('Autoplay sega bloqueado', e));
  }

  static playRandom() {
    this.init();
    if (!this.currentAudio) return;
    this.isIntendedToPlay = true;
    this.currentAudio.pause();
    const track = this.tracks[Math.floor(Math.random() * this.tracks.length)];
    this.currentAudio.src = encodeURI(track);
    this.currentAudio.volume = this.currentVolume;
    
    // Tenta tocar imediatamente, mas se o navegador bloquear (política de autoplay), 
    // ele vai começar a tocar assim que o usuário clicar em qualquer lugar da tela
    this.currentAudio.play().catch(e => {
      console.log('Autoplay da música de fundo bloqueado. Tocará no primeiro clique.', e);
    });
  }

  static setVolume(v: number) {
    this.currentVolume = v;
    if (this.currentAudio) this.currentAudio.volume = v;
    if (this.segaAudio) this.segaAudio.volume = v;
  }

  static stop() {
    this.isIntendedToPlay = false;
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }
}
