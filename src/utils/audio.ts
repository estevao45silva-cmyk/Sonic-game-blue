export class UISound {
  static ctx: AudioContext | null = null;
  static init() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch(e) {}
    }
  }
  static play(type: "hover" | "click" | "buy" | "error" | "start") {
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
      osc.start(t);
      osc.stop(t + 0.1);
    } else if (type === "click") {
      osc.type = "square";
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.15);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.15);
    } else if (type === "buy") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.setValueAtTime(1200, t + 0.1);
      osc.frequency.setValueAtTime(1600, t + 0.2);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.4);
      osc.start(t);
      osc.stop(t + 0.4);
    } else if (type === "error") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
    } else if (type === "start") {
      osc.type = "square";
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.5);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.5);
    }
  }
}

export class BGMManager {
  static currentAudio: HTMLAudioElement | null = null;
  static currentVolume: number = 0.5;
  static tracks = [
    '/imagens/sons/Sonic The Hedgehog 2 OST - Casino Night - Hanternos.mp3',
    '/imagens/sons/Sonic 3 And Knuckles OST - Hydrocity Act 1 - Hanternos.mp3',
    '/imagens/sons/Sonic The Hedgehog OST - Green Hill Zone - Hanternos.mp3',
    '/imagens/sons/Sonic The Hedgehog OST - Labyrinth Zone - Hanternos.mp3',
    '/imagens/sons/Sonic The Hedgehog OST - Marble Zone - Hanternos.mp3',
    '/imagens/sons/Sonic The Hedgehog OST - Special Stage - Hanternos.mp3'
  ];

  static init() {
    if (!this.currentAudio) {
      this.currentAudio = new Audio();
      this.currentAudio.loop = true;
    }
  }

  static playRandom() {
    this.init();
    if (!this.currentAudio) return;
    this.currentAudio.pause();
    const track = this.tracks[Math.floor(Math.random() * this.tracks.length)];
    this.currentAudio.src = track;
    this.currentAudio.volume = this.currentVolume;
    this.currentAudio.play().catch(e => console.log('BGM autoplay prevented', e));
  }

  static setVolume(v: number) {
    this.currentVolume = v;
    if (this.currentAudio) {
      this.currentAudio.volume = v;
    }
  }

  static stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }
}
