import Phaser from "phaser";

import type { Character } from "../App";

const PlayerState = {
  IDLE: 0,

  RUNNING: 1,

  JUMPING: 2,

  ROLLING: 3,

  SPINDASHING: 4,

  LOOPING: 5,

  DEAD: 6,
} as const;

type PlayerState = (typeof PlayerState)[keyof typeof PlayerState];

export class RetroAudio {
  static ctx: AudioContext | null = null;

  static init() {
    if (!this.ctx) {
      try {
        this.ctx = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
      } catch (e) {}
    }
  }

  static play(type: "jump" | "ring" | "spindash" | "damage" | "bgm") {
    if (!this.ctx) this.init();

    if (!this.ctx) return;

    if (this.ctx.state === "suspended") this.ctx.resume();

    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();

    const gain = this.ctx.createGain();

    osc.connect(gain);

    gain.connect(this.ctx.destination);

    if (type === "jump") {
      osc.type = "square";

      osc.frequency.setValueAtTime(150, t);

      osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);

      gain.gain.setValueAtTime(0.1, t);

      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

      osc.start(t);
      osc.stop(t + 0.3);
    } else if (type === "ring") {
      osc.type = "sine";

      osc.frequency.setValueAtTime(1200, t);

      osc.frequency.setValueAtTime(1600, t + 0.05);

      gain.gain.setValueAtTime(0.1, t);

      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

      osc.start(t);
      osc.stop(t + 0.5);
    } else if (type === "spindash") {
      osc.type = "sawtooth";

      osc.frequency.setValueAtTime(100, t);

      osc.frequency.linearRampToValueAtTime(400, t + 0.5);

      gain.gain.setValueAtTime(0.1, t);

      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

      osc.start(t);
      osc.stop(t + 0.5);
    } else if (type === "damage") {
      osc.type = "sawtooth";

      osc.frequency.setValueAtTime(100, t);

      osc.frequency.exponentialRampToValueAtTime(10, t + 0.2);

      gain.gain.setValueAtTime(0.2, t);

      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.start(t);
      osc.stop(t + 0.2);
    } else if (type === "bgm") {
      // Green Hill Arpeggio Loop

      osc.type = "square";

      const notes = [261.63, 329.63, 392.0, 440.0, 392.0, 329.63];

      let timeOff = t;

      for (let loop = 0; loop < 200; loop++) {
        for (let i = 0; i < notes.length; i++) {
          osc.frequency.setValueAtTime(notes[i], timeOff);

          timeOff += 0.2;
        }
      }

      gain.gain.setValueAtTime(0.02, t);

      osc.start(t);

      osc.stop(timeOff);
    }
  }
}

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  private playerGif!: Phaser.GameObjects.DOMElement;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private wasd!: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
  };

  private gamepad: Phaser.Input.Gamepad.Gamepad | null = null;

  // Áudio

  private sfxRing!: Phaser.Sound.BaseSound;

  private sfxJump!: Phaser.Sound.BaseSound;

  private sfxSpindash!: Phaser.Sound.BaseSound;

  private sfxDamage!: Phaser.Sound.BaseSound;

  private platforms!: Phaser.Physics.Arcade.StaticGroup;

  private rings!: Phaser.Physics.Arcade.StaticGroup;

  private scatteredRings!: Phaser.Physics.Arcade.Group;

  private springs!: Phaser.Physics.Arcade.StaticGroup;

  private spikes!: Phaser.Physics.Arcade.StaticGroup;

  private loopTriggers!: Phaser.Physics.Arcade.StaticGroup;

  private enemies!: Phaser.Physics.Arcade.Group;

  private flyingEnemies!: Phaser.Physics.Arcade.Group;

  private eggmanMiniBosses!: Phaser.Physics.Arcade.Group;

  private enemyProjectiles!: Phaser.Physics.Arcade.Group;

  private monitors!: Phaser.Physics.Arcade.Group;

  private movingPlatforms!: Phaser.Physics.Arcade.Group;

  private breakablePlatforms!: Phaser.Physics.Arcade.StaticGroup;

  private waterPools!: Phaser.Physics.Arcade.StaticGroup;

  private boss!: Phaser.Physics.Arcade.Sprite;

  private bossGif?: Phaser.GameObjects.DOMElement;

  private bgSky!: Phaser.GameObjects.Graphics;

  private bgWater!: Phaser.GameObjects.TileSprite;

  private bgClouds!: Phaser.GameObjects.TileSprite;

  private bgMountainsFar!: Phaser.GameObjects.TileSprite;

  private bgMountainsNear!: Phaser.GameObjects.TileSprite;

  private characterChoice: Character = "sonic";

  private currentLevel: number = 1;

  private ringCount: number = 0;

  private gameTime: number = 0;

  private score: number = 0;

  private lastCheckpoint: { x: number; y: number } | null = null;

  private isLevelComplete: boolean = false;

  private currentState: PlayerState = PlayerState.IDLE;

  private spinDashCharge: number = 0;

  private hasPerformedAirAction: boolean = false;

  private hasDoubleJumped: boolean = false;

  private isDropDashing: boolean = false;

  private isUnderwater: boolean = false;

  private isInvincible: boolean = false;

  private speedShoesTimer: number = 0;

  private currentShield: "none" | "fire" | "water" | "lightning" = "none";

  private shieldGraphic!: Phaser.GameObjects.Arc;

  // V6 Physics

  private readonly ACCELERATION = 1200;

  private readonly MAX_SPEED = 800;

  private readonly DRAG = 800;

  private readonly ROLL_DRAG = 200;

  private readonly SKID_DRAG = 2500;

  private readonly JUMP_FORCE = -900; // Floatier jump

  private readonly GRAVITY = 1800; // Better gravity

  private readonly PLAYER_SCALE = 0.5;

  private currentFlipX: boolean = false;

  private currentGif: string = "";

  // LOOPING VARS

  private loopCenter = { x: 0, y: 0 };

  private loopAngle: number = 0;

  private loopDirection: number = 1;

  private isLooping: boolean = false;

  private loopSpeed: number = 0;

  private readonly LOOP_RADIUS = 200;

  private lives: number = 3;

  constructor() {
    super("MainScene");
  }

  init(data: {
    character: Character;
    level: number;
    onLevelComplete?: () => void;
    onBackToMenu?: () => void;
    checkpoint?: { x: number; y: number };
    lives?: number;
  }) {
    this.characterChoice = data.character;

    this.currentLevel = data.level;

    this.ringCount = 0;

    this.gameTime = 0;

    this.score = 0;

    this.isLevelComplete = false;

    this.lastCheckpoint = data.checkpoint || null;

    this.lives = data.lives !== undefined ? data.lives : 3;

    this.currentState = PlayerState.IDLE;

    this.isLooping = false;

    this.physics.world.gravity.y = this.GRAVITY;
  }

  preload() {
    this.load.image("sonic_sprite", "/imagens/sonic%20correndo.gif");

    this.load.image("shadow_sprite", "/imagens/shadow%20correndo.gif");

    // User Sprites

    this.load.image("checker_greenhill", "/imagens/tile_greenhill.png.png");

    this.load.image("checker_marble", "/imagens/tile_marble.png.png");

    this.load.image("checker_starlight", "/imagens/tile_starlight.png.png");

    this.load.image("water_ph", "/imagens/lava_water.png.png");

    this.load.image("enemy_ph", "/imagens/motobug.png.png");

    this.load.image("flyer_ph", "/imagens/buzz_bomber.png.png");

    this.load.image("projectile_ph", "/imagens/projectile.png.png");

    // Placeholder Áudios (Desativados por enquanto para evitar erro de decodificação)

    // Se você tiver os arquivos, coloque na pasta public/audio/ e descomente aqui

    // this.load.audio('ring', '/audio/ring.mp3');

    // this.load.audio('jump', '/audio/jump.mp3');

    // this.load.audio('spindash', '/audio/spindash.mp3');

    // this.load.audio('damage', '/audio/damage.mp3');

    this.generateProceduralGraphics();
  }

  private generateProceduralGraphics() {
    const keys = [
      "goal_ph",
      "monitor_ph",
      "ring_ph",
      "spike_ph",
      "loop_trigger_ph",
      "dust_ph",
      "explosion_ph",
      "checkpoint_ph",
      "breakable_ph",
      "boss_ph",
      "spring_ph",
    ];

    keys.forEach((k) => {
      if (this.textures.exists(k)) this.textures.remove(k);
    });

    const graphics = this.add.graphics();

    // 3. Goal Post (Neon Sign)

    const goalCanvas = document.createElement("canvas");

    goalCanvas.width = 100;

    goalCanvas.height = 300;

    const gCtx = goalCanvas.getContext("2d");

    if (gCtx) {
      gCtx.fillStyle = "#111";

      gCtx.fillRect(40, 0, 20, 300); // Pole

      gCtx.fillStyle = "#00E5FF";

      gCtx.fillRect(0, 0, 100, 60); // Sign board

      gCtx.fillStyle = "#000";

      gCtx.font = "bold 20px Orbitron, sans-serif";

      gCtx.fillText("GOAL", 18, 38);
    }

    this.textures.addCanvas("goal_ph", goalCanvas);

    // Monitor

    graphics.fillStyle(0x888888, 1);

    graphics.fillRect(0, 0, 40, 40);

    graphics.fillStyle(0x444444, 1);

    graphics.fillRect(5, 5, 30, 20);

    graphics.generateTexture("monitor_ph", 40, 40);

    graphics.clear();

    // Ring

    graphics.lineStyle(4, 0xffd700, 1);

    graphics.strokeCircle(16, 16, 12);

    graphics.generateTexture("ring_ph", 32, 32);

    graphics.clear();

    // Spike

    graphics.fillStyle(0xcc0000, 1);

    graphics.fillTriangle(25, 0, 50, 50, 0, 50);

    graphics.generateTexture("spike_ph", 50, 50);

    graphics.clear();

    // Loop Trigger

    graphics.fillStyle(0x00ff00, 0.5);

    graphics.fillRect(0, 0, 64, 64);

    graphics.generateTexture("loop_trigger_ph", 64, 64);

    graphics.clear();

    // Dust Particle

    graphics.fillStyle(0xdddddd, 0.8);

    graphics.fillCircle(5, 5, 5);

    graphics.generateTexture("dust_ph", 10, 10);

    graphics.clear();

    // Explosion Particle (Retro Pop)

    graphics.fillStyle(0xff8800, 1);

    graphics.fillCircle(8, 8, 8);

    graphics.fillStyle(0xffff00, 1);

    graphics.fillCircle(8, 8, 4);

    graphics.generateTexture("explosion_ph", 16, 16);

    graphics.clear();

    // Checkpoint

    graphics.fillStyle(0x0000ff, 1);

    graphics.fillRect(0, 0, 10, 50);

    graphics.fillStyle(0xff0000, 1);

    graphics.fillCircle(5, 5, 10);

    graphics.generateTexture("checkpoint_ph", 15, 50);

    graphics.clear();

    // Breakable

    graphics.fillStyle(0xaa5500, 1);

    graphics.fillRect(0, 0, 64, 64);

    graphics.lineStyle(2, 0x000000);

    graphics.strokeRect(0, 0, 64, 64);

    graphics.generateTexture("breakable_ph", 64, 64);

    graphics.clear();

    // Boss (Placeholder hit box)

    graphics.fillStyle(0x555555, 1);

    graphics.fillCircle(40, 40, 40);

    graphics.generateTexture("boss_ph", 80, 80);

    graphics.clear();

    // Spring

    graphics.fillStyle(0xff0000, 1);

    graphics.fillRect(0, 32, 64, 32);

    graphics.fillStyle(0xaaaaaa, 1);

    graphics.fillRect(16, 16, 32, 16);

    graphics.generateTexture("spring_ph", 64, 64);

    graphics.clear();

    // Cloud

    graphics.fillStyle(0xffffff, 0.8);

    graphics.fillCircle(30, 20, 20);

    graphics.fillCircle(50, 20, 25);

    graphics.fillCircle(70, 20, 20);

    graphics.fillCircle(50, 35, 20);

    graphics.generateTexture("cloud_ph", 100, 50);

    graphics.clear();

    // Background Mountains (More realistic curved)

    const mtnCanvas = document.createElement("canvas");

    mtnCanvas.width = 400;
    mtnCanvas.height = 200;

    const mCtx = mtnCanvas.getContext("2d");

    if (mCtx) {
      mCtx.fillStyle = "#8B4513";

      mCtx.beginPath();

      mCtx.moveTo(0, 200);

      mCtx.quadraticCurveTo(200, 0, 400, 200);

      mCtx.fill();

      mCtx.fillStyle = "#6B3E11";

      mCtx.beginPath();

      mCtx.moveTo(0, 200);

      mCtx.quadraticCurveTo(200, 100, 400, 200);

      mCtx.fill();
    }

    this.textures.addCanvas("bg_mountains_ph", mtnCanvas);

    // Procedural Clouds Layer

    const cloudCanvas = document.createElement("canvas");

    cloudCanvas.width = 500;
    cloudCanvas.height = 150;

    const cCtx = cloudCanvas.getContext("2d");

    if (cCtx) {
      cCtx.fillStyle = "rgba(255,255,255,0.7)";

      cCtx.beginPath();
      cCtx.arc(100, 100, 40, 0, Math.PI * 2);
      cCtx.arc(150, 80, 60, 0, Math.PI * 2);
      cCtx.arc(200, 100, 40, 0, Math.PI * 2);
      cCtx.fill();

      cCtx.beginPath();
      cCtx.arc(350, 50, 30, 0, Math.PI * 2);
      cCtx.arc(400, 30, 40, 0, Math.PI * 2);
      cCtx.arc(450, 50, 30, 0, Math.PI * 2);
      cCtx.fill();
    }

    this.textures.addCanvas("bg_clouds_ph", cloudCanvas);

    // Pixel Perfect Green Hill Checkerboard

    const tileCanvas = document.createElement("canvas");

    tileCanvas.width = 64;
    tileCanvas.height = 64;

    const tCtx = tileCanvas.getContext("2d");

    if (tCtx) {
      // Dirt base

      tCtx.fillStyle = "#6E3A07";

      tCtx.fillRect(0, 0, 64, 64);

      // Checker pattern (Orange)

      tCtx.fillStyle = "#D97726";

      tCtx.fillRect(0, 16, 32, 24);

      tCtx.fillRect(32, 40, 32, 24);

      // Grass top (Green)

      tCtx.fillStyle = "#10B981";

      tCtx.fillRect(0, 0, 64, 16);

      // Grass dark shadow

      tCtx.fillStyle = "#064E3B";

      tCtx.fillRect(0, 12, 64, 4);
    }

    this.textures.addCanvas("checker_perfect_1", tileCanvas);

    // Pixel Perfect Palm Tree

    const palmCanvas = document.createElement("canvas");

    palmCanvas.width = 120;
    palmCanvas.height = 200;

    const pCtx = palmCanvas.getContext("2d");

    if (pCtx) {
      // Trunk (Segmented)

      pCtx.fillStyle = "#8B4513";

      for (let i = 0; i < 8; i++) {
        pCtx.fillRect(50, 40 + i * 20, 20, 18);

        pCtx.fillStyle = "#5C2E0B"; // Shadow

        pCtx.fillRect(65, 40 + i * 20, 5, 18);

        pCtx.fillStyle = "#8B4513";
      }

      // Leaves

      pCtx.fillStyle = "#00FF00";

      pCtx.beginPath();
      pCtx.moveTo(60, 40);
      pCtx.lineTo(20, 80);
      pCtx.lineTo(40, 90);
      pCtx.fill();

      pCtx.beginPath();
      pCtx.moveTo(60, 40);
      pCtx.lineTo(0, 40);
      pCtx.lineTo(20, 50);
      pCtx.fill();

      pCtx.beginPath();
      pCtx.moveTo(60, 40);
      pCtx.lineTo(40, 0);
      pCtx.lineTo(55, 15);
      pCtx.fill();

      pCtx.beginPath();
      pCtx.moveTo(60, 40);
      pCtx.lineTo(80, 0);
      pCtx.lineTo(65, 15);
      pCtx.fill();

      pCtx.beginPath();
      pCtx.moveTo(60, 40);
      pCtx.lineTo(120, 40);
      pCtx.lineTo(100, 50);
      pCtx.fill();

      pCtx.beginPath();
      pCtx.moveTo(60, 40);
      pCtx.lineTo(100, 80);
      pCtx.lineTo(80, 90);
      pCtx.fill();
    }

    this.textures.addCanvas("palm_tree_ph", palmCanvas);

    // Pixel Perfect Sunflower

    const sunCanvas = document.createElement("canvas");

    sunCanvas.width = 60;
    sunCanvas.height = 80;

    const sCtx = sunCanvas.getContext("2d");

    if (sCtx) {
      // Stem

      sCtx.fillStyle = "#228B22";

      sCtx.fillRect(26, 30, 8, 50);

      // Leaves

      sCtx.fillRect(10, 50, 16, 6);

      sCtx.fillRect(34, 60, 16, 6);

      // Petals

      sCtx.fillStyle = "#FFD700";

      sCtx.beginPath();
      sCtx.arc(30, 30, 24, 0, Math.PI * 2);
      sCtx.fill();

      sCtx.fillStyle = "#FFA500"; // Petal shadow

      sCtx.beginPath();
      sCtx.arc(30, 30, 18, 0, Math.PI * 2);
      sCtx.fill();

      // Center

      sCtx.fillStyle = "#FF69B4"; // Pink center

      sCtx.beginPath();
      sCtx.arc(30, 30, 12, 0, Math.PI * 2);
      sCtx.fill();
    }

    this.textures.addCanvas("sunflower_ph", sunCanvas);

    // Waterfall

    graphics.fillStyle(0x0055ff, 0.9);

    graphics.fillRect(0, 0, 60, 300);

    graphics.fillStyle(0x88ccff, 0.9);

    graphics.fillRect(10, 0, 10, 300);

    graphics.fillRect(40, 0, 10, 300);

    graphics.generateTexture("waterfall_ph", 60, 300);

    graphics.clear();

    // Water Surface (Classic Green Hill Water)

    const waterCanvas = document.createElement("canvas");

    waterCanvas.width = 128;
    waterCanvas.height = 128;

    const wCtx = waterCanvas.getContext("2d");

    if (wCtx) {
      wCtx.fillStyle = "#0000FF"; // Deep blue

      wCtx.fillRect(0, 0, 128, 128);

      wCtx.fillStyle = "#55AAFF"; // Bright wavy lines

      wCtx.fillRect(0, 10, 128, 4);

      wCtx.fillRect(0, 30, 128, 2);

      wCtx.fillRect(0, 50, 128, 6);

      wCtx.fillRect(0, 80, 128, 3);

      wCtx.fillRect(0, 110, 128, 5);
    }

    this.textures.addCanvas("bg_water_ph", waterCanvas);

    // Flora (Sunflower/Palm)

    graphics.fillStyle(0x228b22, 1);

    graphics.fillRect(20, 40, 10, 60); // Stem

    graphics.fillStyle(0xffd700, 1);

    graphics.fillCircle(25, 25, 20); // Petals

    graphics.fillStyle(0x8b4513, 1);

    graphics.fillCircle(25, 25, 10); // Center

    graphics.generateTexture("flora_ph", 50, 100);

    graphics.clear();
  }

  create() {
    const height = this.cameras.main.height;

    // Dinamic Sky based on Level

    this.bgSky = this.add.graphics();

    if (this.currentLevel === 1) {
      // Classic Sonic Deep Blue Sky

      this.bgSky.fillGradientStyle(0x0000c0, 0x0000c0, 0x0055ff, 0x0055ff, 1);
    } else if (this.currentLevel === 2) {
      this.bgSky.fillGradientStyle(0x1a052b, 0x1a052b, 0x48195a, 0x48195a, 1);
    } else {
      this.bgSky.fillGradientStyle(0x020111, 0x020111, 0x20124d, 0x20124d, 1);
    }

    this.bgSky.fillRect(0, 0, 8000, 1200);

    this.bgSky.setScrollFactor(0);

    // ALL PARALLAX MUST USE THE SAME Y-SCROLL (0.05) TO STAY SYNCHRONIZED

    // AND A FIXED BASE Y COORDINATE (e.g. 1000)

    const horizonY = 1000;

    // Parallax Clouds (Infinite)

    this.bgClouds = this.add.tileSprite(
      0,
      horizonY - 400,
      28000,
      150,
      "bg_clouds_ph",
    );

    this.bgClouds.setOrigin(0, 0);

    this.bgClouds.setScrollFactor(0.1, 0.05);

    // Parallax Far Mountains (Infinite)

    this.bgMountainsFar = this.add.tileSprite(
      0,
      horizonY - 100,
      28000,
      200,
      "bg_mountains_ph",
    );

    this.bgMountainsFar.setOrigin(0, 1);

    this.bgMountainsFar.setScrollFactor(0.2, 0.05);

    this.bgMountainsFar.setTint(0x4b3a2a); // Darker tint for distance

    // Parallax Near Mountains (Infinite)

    this.bgMountainsNear = this.add.tileSprite(
      0,
      horizonY + 20,
      28000,
      200,
      "bg_mountains_ph",
    );

    this.bgMountainsNear.setOrigin(0, 1);

    this.bgMountainsNear.setScrollFactor(0.4, 0.05);

    if (this.currentLevel === 2) this.bgMountainsNear.setTint(0x8b0000);
    else if (this.currentLevel === 3) this.bgMountainsNear.setTint(0x4b0082);

    // Parallax Waterfalls (Level 1 only) - scattered

    if (this.currentLevel === 1) {
      for (let i = 0; i < 30; i++) {
        const wf = this.add.image(
          i * 900 + Math.random() * 500,
          horizonY + 20,
          "waterfall_ph",
        );

        wf.setOrigin(0.5, 1);

        wf.setScrollFactor(0.4, 0.05);

        wf.setScale(1.5, 1.5);

        wf.setAlpha(0.7);
      }
    }

    // Classic Water Layer (Must match mountain horizon)

    this.bgWater = this.add.tileSprite(
      0,
      horizonY - 40,
      8000,
      300,
      "bg_water_ph",
    );

    if (this.currentLevel === 2)
      this.bgWater.setTint(0xff0000); // Lava
    else if (this.currentLevel === 3) this.bgWater.setTint(0x8800ff); // Neon sludge

    this.bgWater.setOrigin(0, 0);

    this.bgWater.setScrollFactor(0, 0.05); // Only scroll Y to match mountains

    // Foreground Flora (MUST BE PLACED ON THE ACTUAL PHYSICAL GROUND: Y = 1136)

    for (let i = 0; i < 50; i++) {
      if (this.currentLevel === 1) {
        const key = Math.random() > 0.5 ? "flora_ph" : "palm_tree_ph";

        // 1136 is the top of the ground blocks (startY 432 + 11*64)

        const flora = this.add.image(i * 400 + Math.random() * 200, 1136, key);

        flora.setOrigin(0.5, 1); // Anchor at bottom center

        flora.setScrollFactor(1); // STICK TO THE GROUND (No parallax!)

        flora.setDepth(-1); // Behind Sonic

        flora.setScale(key === "palm_tree_ph" ? 2 : 1.5); // Make them bigger and majestic
      }
    }

    // Configurar Áudio (com fallback seguro se os arquivos não existirem)

    const safeAddSound = (key: string) => {
      if (this.cache.audio.exists(key)) {
        return this.sound.add(key, { volume: 0.5 });
      }

      return { play: () => {} } as any; // Mock sound
    };

    this.sfxRing = safeAddSound("ring");

    this.sfxJump = safeAddSound("jump");

    this.sfxSpindash = safeAddSound("spindash");

    this.sfxDamage = safeAddSound("damage");

    this.platforms = this.physics.add.staticGroup();

    this.rings = this.physics.add.staticGroup();

    this.scatteredRings = this.physics.add.group();

    this.springs = this.physics.add.staticGroup();

    this.spikes = this.physics.add.staticGroup();

    this.loopTriggers = this.physics.add.staticGroup();

    this.enemies = this.physics.add.group();

    this.flyingEnemies = this.physics.add.group();

    this.eggmanMiniBosses = this.physics.add.group();

    this.enemyProjectiles = this.physics.add.group();

    this.monitors = this.physics.add.group();

    this.movingPlatforms = this.physics.add.group();

    this.breakablePlatforms = this.physics.add.staticGroup();

    this.waterPools = this.physics.add.staticGroup();

    const startX = this.lastCheckpoint ? this.lastCheckpoint.x : 200;

    const startY = this.lastCheckpoint ? this.lastCheckpoint.y : 800;

    const textureKey =
      this.characterChoice === "sonic" ? "sonic_sprite" : "shadow_sprite";

    this.player = this.physics.add.sprite(
      startX,
      startY,
      textureKey,
    ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    this.player.setAlpha(0); // Hide WebGL sprite, use DOM

    this.player.setScale(this.PLAYER_SCALE);

    const hitBoxWidth = 80 / this.PLAYER_SCALE;

    const hitBoxHeight = 120 / this.PLAYER_SCALE;

    this.player.body.setSize(hitBoxWidth, hitBoxHeight);

    const offsetX = (this.player.width - hitBoxWidth) / 2;

    const offsetY = (this.player.height - hitBoxHeight) / 2;

    this.player.body.setOffset(offsetX, offsetY + hitBoxHeight * 0.1);

    this.player.body.setBounce(0);

    this.player.body.setMaxVelocity(this.MAX_SPEED, 2500);

    this.player.body.setDrag(this.DRAG, 0);

    // THE GIF DOM ELEMENT

    const gifFile =
      this.characterChoice === "sonic"
        ? "sonic%20correndo.gif"
        : "shadow%20correndo.gif";

    this.currentGif = gifFile;

    this.playerGif = this.add.dom(
      startX,
      startY,
      "img",
      "width: 150px; height: 150px; object-fit: contain; pointer-events: none;",
    );

    (this.playerGif.node as HTMLImageElement).src = `/imagens/${gifFile}`;

    this.playerGif.setOrigin(0.5, 0.5);

    this.shieldGraphic = this.add.circle(0, 0, 2, 0xffffff, 0); // Oculto, usado só como emissor lógico se precisar

    this.shieldGraphic.setVisible(false);

    // Collisions

    this.physics.add.collider(
      this.player,
      this.platforms,
      undefined,
      this.canCollide,
      this,
    );

    this.physics.add.collider(this.scatteredRings, this.platforms);

    this.physics.add.collider(
      this.player,
      this.movingPlatforms,
      this.rideMovingPlatform,
      this.canCollide,
      this,
    );

    this.physics.add.collider(
      this.player,
      this.breakablePlatforms,
      this.hitBreakable,
      this.canCollide,
      this,
    );

    this.physics.add.collider(
      this.player,
      this.monitors,
      this.hitMonitor,
      undefined,
      this,
    );

    this.physics.add.collider(this.monitors, this.platforms);

    this.physics.add.overlap(
      this.player,
      this.rings,
      this.collectRing,
      undefined,
      this,
    );

    this.physics.add.overlap(
      this.player,
      this.scatteredRings,
      this.collectRing,
      undefined,
      this,
    );

    this.physics.add.collider(
      this.player,
      this.springs,
      this.hitSpring,
      undefined,
      this,
    );

    this.physics.add.collider(
      this.player,
      this.spikes,
      this.hitSpike,
      undefined,
      this,
    );

    this.physics.add.overlap(
      this.player,
      this.loopTriggers,
      this.enterLoop,
      undefined,
      this,
    );

    this.physics.add.overlap(
      this.player,
      this.waterPools,
      this.enterWater,
      undefined,
      this,
    );

    this.physics.add.collider(this.enemies, this.platforms);

    this.physics.add.collider(
      this.player,
      this.enemies,
      this.hitEnemy,
      undefined,
      this,
    );

    this.physics.add.collider(
      this.player,
      this.flyingEnemies,
      this.hitEnemy,
      undefined,
      this,
    );

    this.physics.add.overlap(
      this.player,
      this.eggmanMiniBosses,
      this.hitEggmanMiniBoss,
      undefined,
      this,
    );

    this.physics.add.overlap(
      this.player,
      this.enemyProjectiles,
      this.hitEnemy,
      undefined,
      this,
    );

    // Projectiles explode on platforms with effects

    this.physics.add.collider(
      this.enemyProjectiles,
      this.platforms,
      (proj: any) => {
        const explosion = this.add.circle(proj.x, proj.y, 30, 0xff4400);

        this.tweens.add({
          targets: explosion,
          alpha: 0,
          scale: 2,
          duration: 200,
          onComplete: () => explosion.destroy(),
        });

        proj.destroy();
      },
    );

    this.createMassiveLevel();

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.cameras.main.setDeadzone(100, 100);

    // Huge map bounds (acompanha o mapCols de 400 * 64 = 25600)

    this.cameras.main.setBounds(0, 0, 28000, 1200);

    this.physics.world.setBounds(0, 0, 28000, 1200);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();

      this.wasd = {
        w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),

        a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),

        s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),

        d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // Gamepad

    if (this.input.gamepad) {
      this.input.gamepad.once(
        "connected",
        (pad: Phaser.Input.Gamepad.Gamepad) => {
          this.gamepad = pad;

          console.log("Gamepad conectado!");
        },
      );
    }

    if (this.currentLevel === 1) {
      RetroAudio.play("bgm");
    }

    this.events.emit("updateRings", this.ringCount);
  }

  private createMassiveLevel() {
    const blockSize = 64;

    const mapCols = 400;

    const mapRows = 12;

    const startY = 1200 - mapRows * blockSize;

    let lastLoopX = -100;

    for (let x = 0; x < mapCols; x++) {
      const worldX = x * blockSize;

      const groundY = startY + 11 * blockSize;

      let tileKey = "checker_perfect_1";

      if (this.currentLevel === 2) tileKey = "checker_marble";

      if (this.currentLevel === 3) tileKey = "checker_starlight";

      let isInsideLoop = x >= lastLoopX - 1 && x <= lastLoopX + 8;

      let hasObject = isInsideLoop;

      // Safe zones (Inicio)

      if (x < 20 || (x > 350 && x < 370)) {
        const plat = this.add.tileSprite(
          worldX + 32,
          groundY + 32,
          blockSize,
          blockSize,
          tileKey,
        );

        this.physics.add.existing(plat, true);

        this.platforms.add(plat as unknown as Phaser.Physics.Arcade.Image);

        continue;
      }

      // BOSS FIGHT ARENA (Fim)

      if (x === 370) {
        this.boss = this.physics.add.sprite(
          worldX + 300,
          groundY - 300,
          "boss_ph",
        );

        this.boss.setDisplaySize(192, 192); // Hitbox maior acompanhando o novo tamanho

        this.boss.body.setSize(120, 120);

        if (this.boss.body)
          (this.boss.body as Phaser.Physics.Arcade.Body).allowGravity = false;

        (this.boss as any).hp = 16; // Buff massivo de Vida!

        (this.boss as any).state = "idle";

        (this.boss as any).startX = worldX + 300;

        (this.boss as any).startY = groundY - 300;

        (this.boss as any).timer = 0;

        this.boss.setAlpha(0); // Esconde a hitbox

        // Aumentando o tamanho visual de 128px para 192px

        this.bossGif = this.add.dom(
          worldX + 300,
          groundY - 300,
          "img",
          "width: 192px; pointer-events: none;",
        );

        (this.bossGif.node as HTMLImageElement).src =
          "/imagens/eggman_boss.gif.gif";

        this.physics.add.overlap(
          this.player,
          this.boss,
          this.hitBoss,
          undefined,
          this,
        );
      }

      if (x === 395) {
        const goal = this.physics.add.sprite(
          worldX + 32,
          groundY - 100,
          "goal_ph",
        );

        goal.body.allowGravity = false;

        goal.body.setImmovable(true);

        goal.setAlpha(0.5);

        (goal as any).isActive = false;

        this.physics.add.overlap(this.player, goal, () => {
          if (!this.isLevelComplete && (goal as any).isActive) {
            this.isLevelComplete = true;

            let timeBonus = 50000 - Math.floor(this.gameTime) * 100;

            if (timeBonus < 0) timeBonus = 0;

            let ringBonus = this.ringCount * 100;

            this.score += timeBonus + ringBonus;

            this.events.emit("updateScore", this.score);

            this.events.emit("levelComplete", { timeBonus, ringBonus });

            this.player.body.setAccelerationX(0);

            this.player.body.setDrag(this.DRAG * 2, 0);
          }
        });

        this.events.on("bossDefeated", () => {
          if (goal.scene) {
            goal.setAlpha(1);

            (goal as any).isActive = true;

            this.tweens.add({
              targets: goal,
              y: goal.y - 50,
              yoyo: true,
              duration: 500,
            });
          }
        });
      }

      if (x === 398) {
        const endWall = this.add.rectangle(
          worldX + 32,
          groundY - 1000,
          64,
          4000,
          0x000000,
          0,
        );

        this.physics.add.existing(endWall, true);

        this.platforms.add(endWall as unknown as Phaser.Physics.Arcade.Image);
      }

      if (x >= 370) {
        const plat = this.add.tileSprite(
          worldX + 32,
          groundY + 32,
          blockSize,
          blockSize,
          tileKey,
        );

        this.physics.add.existing(plat, true);

        this.platforms.add(plat as unknown as Phaser.Physics.Arcade.Image);

        continue;
      }

      // LEVEL 1: GREEN HILL

      if (this.currentLevel === 1) {
        if (x % 80 > 75) continue; // Gap imenso reduzido para ocorrer a cada 80 blocos

        const plat = this.add.tileSprite(
          worldX + 32,
          groundY + 32,
          blockSize,
          blockSize,
          tileKey,
        );

        this.physics.add.existing(plat, true);

        this.platforms.add(plat as unknown as Phaser.Physics.Arcade.Image);

        // Rota Superior (Upper Layer)

        const hasUpperLayer = x % 80 >= 20 && x % 80 <= 60;

        if (hasUpperLayer) {
          const upperY = groundY - 500;

          const upperPlat = this.add.tileSprite(
            worldX + 32,
            upperY + 32,
            blockSize,
            blockSize,
            tileKey,
          );

          this.physics.add.existing(upperPlat, true);

          this.platforms.add(
            upperPlat as unknown as Phaser.Physics.Arcade.Image,
          );

          // Rings na Rota Superior

          if (x % 4 === 0) {
            this.rings.create(worldX + 32, upperY - 64, "ring_ph");
          }

          // Mola para alcançar a rota superior

          if (x % 80 === 20 && !hasObject) {
            this.springs.create(worldX + 32, groundY - 32, "spring_ph");

            hasObject = true;
          }
        }

        if (x > 0 && x % 40 === 15) {
          this.createLoopVisual(worldX, groundY);

          lastLoopX = x;

          hasObject = true;
        }

        if (x % 15 === 0 && !hasObject) {
          const enemy = this.enemies.create(
            worldX + 32,
            groundY - 64,
            "enemy_ph",
          );

          enemy.setScale(0.128);

          enemy.body.allowGravity = true;

          (enemy as any).startX = worldX + 32;

          hasObject = true;
        }

        if (x % 20 === 0 && !hasObject && !hasUpperLayer) {
          this.springs.create(worldX + 32, groundY - 32, "spring_ph");

          hasObject = true;
        }

        if (x % 50 === 0 && !hasObject && !hasUpperLayer) {
          this.spikes.create(worldX + 32, groundY - 32, "spike_ph");

          hasObject = true;
        }
      }

      // LEVEL 2: MARBLE
      else if (this.currentLevel === 2) {
        const isLava = x % 60 > 45; // Menos lava, blocos mais contínuos

        if (isLava) {
          // Chão sólido embaixo da lava para não cair no infinito

          const plat = this.add.tileSprite(
            worldX + 32,
            groundY + 96,
            blockSize,
            blockSize,
            tileKey,
          );

          this.physics.add.existing(plat, true);

          this.platforms.add(plat as unknown as Phaser.Physics.Arcade.Image);

          // Bloco visual de Lava (Lava machuca usando spikes invisíveis)

          const lava = this.waterPools.create(
            worldX + 32,
            groundY + 32,
            "water_ph",
          );

          (lava as any).setTint(0xff0000); // Vermelho fogo

          (lava as any).setAlpha(0.9);

          const spike = this.spikes.create(
            worldX + 32,
            groundY + 32,
            "spike_ph",
          );

          spike.setAlpha(0); // Totalmente invisível

          // Moving Platforms over Lava

          if (x % 8 === 0) {
            const mPlat = this.movingPlatforms.create(
              worldX + 32,
              groundY - 120,
              tileKey,
            );

            mPlat.body.allowGravity = false;

            mPlat.setImmovable(true);

            mPlat.setVelocityX(150);

            (mPlat as any).startX = worldX + 32;
          }
        } else {
          const plat = this.add.tileSprite(
            worldX + 32,
            groundY + 32,
            blockSize,
            blockSize,
            tileKey,
          );

          this.physics.add.existing(plat, true);

          this.platforms.add(plat as unknown as Phaser.Physics.Arcade.Image);

          if (x % 12 === 0 && !hasObject) {
            const enemy = this.enemies.create(
              worldX + 32,
              groundY - 64,
              "enemy_ph",
            );

            enemy.setScale(0.128);

            enemy.body.allowGravity = true;

            (enemy as any).startX = worldX + 32;

            hasObject = true;
          }
        }
      }

      // LEVEL 3: STAR LIGHT
      else {
        if (x % 100 > 95) continue; // Gap menor e mais raro

        const plat = this.add.tileSprite(
          worldX + 32,
          groundY + 32,
          blockSize,
          blockSize,
          tileKey,
        );

        this.physics.add.existing(plat, true);

        this.platforms.add(plat as unknown as Phaser.Physics.Arcade.Image);

        // Rota Superior

        const hasUpperLayer = x % 100 >= 30 && x % 100 <= 80;

        if (hasUpperLayer) {
          const upperY = groundY - 500;

          const upperPlat = this.add.tileSprite(
            worldX + 32,
            upperY + 32,
            blockSize,
            blockSize,
            tileKey,
          );

          this.physics.add.existing(upperPlat, true);

          this.platforms.add(
            upperPlat as unknown as Phaser.Physics.Arcade.Image,
          );

          if (x % 5 === 0) {
            this.rings.create(worldX + 32, upperY - 64, "ring_ph");
          }

          if (x % 100 === 30 && !hasObject) {
            this.springs.create(worldX + 32, groundY - 32, "spring_ph");

            hasObject = true;
          }
        }

        if (x > 0 && x % 60 === 25) {
          this.createLoopVisual(worldX, groundY);
          lastLoopX = x;
          hasObject = true;
        }

        // Swarm of flyers
        if (x % 15 === 0 && !hasObject) {
          const flyer = this.flyingEnemies.create(
            worldX + 32,
            groundY - 150,
            "flyer_ph",
          );
          flyer.setScale(0.128);
          flyer.body.allowGravity = false;
          (flyer as any).startX = worldX + 32;
          (flyer as any).startY = groundY - 150;
          (flyer as any).timer = 0;
          // --- MINI BOSSES REMOVIDOS PARA DAR EXCLUSIVIDADE AO FINAL BOSS ---
        } // Close flyer if
        // Checkpoints
        if (x % 200 === 0 && x > 0 && !hasObject) {
          const cp = this.add.sprite(
            worldX + 32,
            groundY - 25,
            "checkpoint_ph",
          );
          this.physics.add.existing(cp, true);
          this.physics.add.overlap(this.player, cp, () => {
            if (!this.lastCheckpoint || this.lastCheckpoint.x < worldX) {
              this.lastCheckpoint = { x: worldX, y: groundY - 100 };
              const flash = this.add.circle(cp.x, cp.y, 40, 0x00ff00);
              this.tweens.add({
                targets: flash,
                alpha: 0,
                duration: 500,
                onComplete: () => flash.destroy(),
              });
            }
          });
        }
      } // Close level 3 else
    } // Close first for loop

    // Fix user uploaded sprite scaling and physics
    this.enemies.getChildren().forEach((e: any) => {
      e.setScale(48 / e.width);
      e.body.setSize(e.width * 0.8, e.height * 0.8);
      e.body.setOffset(e.width * 0.1, e.height * 0.2);
      e.body.updateFromGameObject();
      e.setCollideWorldBounds(false);
    });
    this.flyingEnemies.getChildren().forEach((e: any) => {
      e.setScale(48 / e.width);
      e.body.setSize(e.width * 0.8, e.height * 0.6);
      e.body.setOffset(e.width * 0.1, e.height * 0.2);
      e.body.updateFromGameObject();
      e.setCollideWorldBounds(false);
    });
    this.monitors.getChildren().forEach((e: any) => {
      e.setDisplaySize(48, 48);
      e.body.setSize(e.width * 0.9, e.height * 0.9);
      e.body.setOffset(e.width * 0.05, e.height * 0.05);
    });
    this.rings.getChildren().forEach((e: any) => {
      e.setDisplaySize(32, 32);
      e.body.setSize(e.width * 0.6, e.height * 0.6);
      e.body.setOffset(e.width * 0.2, e.height * 0.2);
    });
    this.spikes.getChildren().forEach((e: any) => {
      e.setDisplaySize(64, 64);
      e.body.setSize(e.width * 0.9, e.height * 0.9);
      e.body.setOffset(e.width * 0.05, e.height * 0.1);
    });
    this.springs.getChildren().forEach((e: any) => {
      e.setDisplaySize(64, 64);
      e.body.setSize(e.width, e.height);
    });
    this.waterPools.getChildren().forEach((e: any) => {
      e.setDisplaySize(64, 64);
      e.body.setSize(e.width, e.height);
    });

    // Safely launch UIScene AFTER all textures have been generated
    this.scene.launch("UIScene", this.sys.settings.data);
  }

  createLoopVisual(x: number, y: number) {
    // Draw the loop background
    const loopGraph = this.add.graphics();
    loopGraph.lineStyle(64, 0xc27c21, 1);
    loopGraph.strokeCircle(
      x + this.LOOP_RADIUS,
      y - this.LOOP_RADIUS,
      this.LOOP_RADIUS,
    );

    // Add inner checker logic (rough representation)
    loopGraph.lineStyle(32, 0x6e3a07, 1);
    loopGraph.strokeCircle(
      x + this.LOOP_RADIUS,
      y - this.LOOP_RADIUS,
      this.LOOP_RADIUS,
    );

    // The invisible trigger that sucks the player in
    const trigger = this.add.sprite(x + 32, y - 32, "loop_trigger_ph");
    trigger.setVisible(false);
    this.physics.add.existing(trigger, true);
    this.loopTriggers.add(trigger as unknown as Phaser.Physics.Arcade.Image);

    // Pass properties to trigger for the math
    (trigger as any).loopCenterX = x + this.LOOP_RADIUS;
    (trigger as any).loopCenterY = y - this.LOOP_RADIUS;
  }

  private canCollide() {
    return !this.isLooping; // Ignore platforms entirely while looping so player doesn't clip and die
  }

  // --- NEW MECHANICS ---
  private hitMonitor(player: any, monitor: any) {
    if (
      player.body.velocity.y > 0 ||
      this.currentState === PlayerState.ROLLING ||
      this.currentState === PlayerState.SPINDASHING ||
      this.isDropDashing
    ) {
      monitor.disableBody(true, true);
      player.setVelocityY(-400); // Bounce
      RetroAudio.play("ring");
      this.cameras.main.shake(100, 0.005); // Impact feel

      // Apply effect
      const type = monitor.itemType;
      if (type === 0) {
        this.ringCount += 10;
        this.events.emit("updateRings", this.ringCount);
      } else if (type === 1) {
        const shields = ["fire", "water", "lightning"];
        this.currentShield = shields[Math.floor(Math.random() * 3)] as any;
      } else if (type === 2) {
        this.isInvincible = true;
        player.setTint(0xffff00);
        this.time.delayedCall(10000, () => {
          this.isInvincible = false;
          player.clearTint();
        });
      } else if (type === 3) {
        this.speedShoesTimer = 10000; // 10 seconds of speed
      }

      const explosion = this.add.circle(monitor.x, monitor.y, 30, 0x888888);
      this.tweens.add({
        targets: explosion,
        alpha: 0,
        scale: 1.5,
        duration: 300,
        onComplete: () => explosion.destroy(),
      });
    } else {
      // Just collide solidly
    }
  }

  private rideMovingPlatform(player: any, platform: any) {
    if (platform.body.touching.up && player.body.touching.down) {
      // Player moves with platform inherently by friction, but we can enforce it if needed.
    }
  }

  private hitBreakable(player: any, platform: any) {
    if (
      platform.body.touching.up &&
      player.body.touching.down &&
      !platform.isBreaking
    ) {
      platform.isBreaking = true;
      this.tweens.add({
        targets: platform,
        x: platform.x + 2,
        yoyo: true,
        repeat: 5,
        duration: 50,
        onComplete: () => {
          platform.destroy();
        },
      });
    }
  }

  private enterWater(player: any, pool: any) {
    if (!this.isUnderwater) {
      this.isUnderwater = true;
      this.spawnDust(player.x, player.y); // Splash effect
    }
  }

  // ---------------------

  private hitEggmanMiniBoss(player: any, eggman: any) {
    if (
      eggman.hp <= 0 ||
      player.alpha < 1 ||
      this.currentState === PlayerState.DEAD
    )
      return;

    const isAttacking =
      this.currentState === PlayerState.JUMPING ||
      this.currentState === PlayerState.ROLLING ||
      this.currentState === PlayerState.SPINDASHING ||
      this.isDropDashing ||
      (player.body.velocity.y > 0 && player.y < eggman.y);

    if (isAttacking) {
      eggman.hp -= 1;

      player.setVelocityY(-600); // Bounce off

      player.setVelocityX(player.x < eggman.x ? -400 : 400);

      RetroAudio.play("ring");

      // Flash effect

      if (eggman.gif && eggman.gif.node) {
        (eggman.gif.node as HTMLElement).style.filter =
          "hue-rotate(90deg) invert(1)";

        this.time.delayedCall(150, () => {
          if (eggman.gif && eggman.gif.node)
            (eggman.gif.node as HTMLElement).style.filter = "";
        });
      }

      if (eggman.hp <= 0) {
        eggman.disableBody(true, true);

        if (eggman.gif) eggman.gif.destroy();

        this.score += 500;

        this.events.emit("updateScore", this.score);

        for (let i = 0; i < 5; i++) {
          const explosion = this.add.sprite(
            eggman.x + (Math.random() * 60 - 30),
            eggman.y + (Math.random() * 60 - 30),
            "explosion_ph",
          );

          explosion.setScale(1 + Math.random());

          this.tweens.add({
            targets: explosion,
            alpha: 0,
            scale: 3,
            duration: 300,
            onComplete: () => explosion.destroy(),
          });
        }
      }
    } else {
      this.takeDamage(player);
    }
  }

  private hitBoss(player: any, boss: any) {
    if (
      boss.hp <= 0 ||
      (player as any).isRecovering ||
      this.currentState === PlayerState.DEAD ||
      boss.state === "dead" ||
      boss.state === "dying"
    )
      return;

    if (
      this.currentState === PlayerState.JUMPING ||
      this.currentState === PlayerState.ROLLING ||
      this.currentState === PlayerState.SPINDASHING ||
      this.isDropDashing
    ) {
      // Hit boss

      boss.hp -= 1;

      player.setVelocityY(-600); // Bounce off boss

      player.setVelocityX(player.x < boss.x ? -400 : 400); // Repel away

      RetroAudio.play("damage"); // Temp hit sound

      // Flash boss red (CSS Filter on the GIF)

      if ((boss as any).gif && (boss as any).gif.node) {
        ((boss as any).gif.node as HTMLElement).style.filter =
          "brightness(0) saturate(100%) invert(20%) sepia(100%) saturate(5000%) hue-rotate(345deg)";

        this.time.delayedCall(150, () => {
          if ((boss as any).gif && (boss as any).gif.node)
            ((boss as any).gif.node as HTMLElement).style.filter = "none";
        });
      }

      // Se for o Final Boss, aplica no bossGif principal

      if (boss === this.boss && this.bossGif && this.bossGif.node) {
        (this.bossGif.node as HTMLElement).style.filter =
          "brightness(0) saturate(100%) invert(20%) sepia(100%) saturate(5000%) hue-rotate(345deg)";

        this.time.delayedCall(150, () => {
          if (this.bossGif && this.bossGif.node)
            (this.bossGif.node as HTMLElement).style.filter = "none";
        });
      }

      if (boss.hp <= 0) {
        boss.state = "dead";

        boss.body.allowGravity = true;

        boss.setVelocityY(-500);

        // Chain explosions

        for (let i = 0; i < 10; i++) {
          this.time.delayedCall(i * 150, () => {
            if (boss && boss.scene) {
              const explosion = this.add.circle(
                boss.x + (Math.random() * 80 - 40),
                boss.y + (Math.random() * 80 - 40),
                40,
                0xff8800,
              );

              this.tweens.add({
                targets: explosion,
                alpha: 0,
                scale: 2,
                duration: 300,
                onComplete: () => explosion.destroy(),
              });
            }
          });
        }

        this.time.delayedCall(2000, () => {
          this.events.emit("bossDefeated");

          boss.destroy();

          this.score += 10000;

          this.events.emit("updateScore", this.score);
        });
      }
    } else {
      // Player takes damage

      this.takeDamage(player);
    }
  }

  private enterLoop(_player: any, trigger: any) {
    if (this.isLooping || Math.abs(this.player.body.velocity.x) < 800) return;

    const isGoingRight = this.player.body.velocity.x > 0;

    this.currentState = PlayerState.LOOPING;

    this.isLooping = true;

    this.loopCenter.x = trigger.loopCenterX;

    this.loopCenter.y = trigger.loopCenterY;

    this.loopDirection = isGoingRight ? 1 : -1;

    this.loopAngle = isGoingRight ? 90 : 90; // Start at bottom of the circle (90 degrees in math, but in Phaser Y is down)

    this.loopSpeed = Math.abs(this.player.body.velocity.x) / this.LOOP_RADIUS; // Angular velocity

    // Zoom Out Camera for Cinematic effect

    this.cameras.main.zoomTo(0.6, 500, "Sine.easeInOut");

    // Disable Arcade Physics gravity temporarily

    this.player.body.allowGravity = false;

    this.player.setVelocity(0, 0);
  }

  private collectRing(_player: any, ring: any) {
    if (ring.canBeCollected === false) return; // Ignore if it's a recently spilled ring

    ring.disableBody(true, true);

    this.ringCount++;

    this.events.emit("updateRings", this.ringCount);

    RetroAudio.play("ring");

    const flash = this.add.circle(ring.x, ring.y, 25, 0xffffff);

    this.tweens.add({
      targets: flash,

      alpha: 0,

      scale: 2,

      duration: 300,

      onComplete: () => flash.destroy(),
    });
  }

  private hitSpring(player: any, spring: any) {
    if (spring.body.touching.up && player.body.touching.down) {
      player.setVelocityY(-2000);

      this.currentState = PlayerState.JUMPING;

      spring.setScale(1, 0.5);

      this.tweens.add({
        targets: spring,
        scaleY: 1,
        duration: 200,
        ease: "Bounce.easeOut",
      });
    }
  }

  private hitSpike(player: any, _spike: any) {
    if (
      this.currentState === PlayerState.DEAD ||
      this.isLooping ||
      player.body.velocity.y < -300 ||
      (player as any).isRecovering
    )
      return;

    this.takeDamage(player);
  }

  private hitEnemy(player: any, enemy: any) {
    if (
      this.currentState === PlayerState.DEAD ||
      this.isLooping ||
      (player as any).isRecovering
    )
      return;

    // Verifica se o jogador está atacando ou caindo em cima do inimigo

    let isAttacking = false;

    if (enemy.texture?.key === "enemy_ph") {
      // Exigência do usuário: Motobug só morre pulando EM CIMA, de frente toma dano.

      // A maneira correta de checar "cair em cima" no Phaser em um Collider

      // é verificar onde os corpos estão se tocando.

      isAttacking = player.body.touching.down && enemy.body.touching.up;

      // Failsafe matemático: compara a BASE do pé do jogador com o TOPO da cabeça do inimigo

      if (!isAttacking && player.body.bottom <= enemy.body.top + 15) {
        isAttacking = true;
      }
    } else {
      // Outros inimigos morrem no padrão Sonic

      isAttacking =
        this.currentState === PlayerState.JUMPING ||
        this.currentState === PlayerState.ROLLING ||
        this.currentState === PlayerState.SPINDASHING ||
        this.isDropDashing ||
        (player.body.velocity.y > 0 && player.y < enemy.y);
    }

    if (isAttacking) {
      // Destrói o inimigo (faz ele sumir)

      enemy.disableBody(true, true);

      this.score += 100;

      this.events.emit("updateScore", this.score);

      // Quica o jogador

      player.setVelocityY(-800);

      // Efeito de explosão mais legal

      for (let i = 0; i < 4; i++) {
        const explosion = this.add.sprite(
          enemy.x + (Math.random() * 30 - 15),
          enemy.y + (Math.random() * 30 - 15),
          "explosion_ph",
        );

        explosion.setScale(0.5 + Math.random() * 0.5);

        this.tweens.add({
          targets: explosion,

          alpha: 0,

          scale: 2 + Math.random() * 1.5,

          duration: 250 + Math.random() * 150,

          onComplete: () => explosion.destroy(),
        });
      }
    } else {
      // Se não estava atacando, o jogador toma dano

      this.takeDamage(player);
    }
  }

  private takeDamage(player: any) {
    if (this.isInvincible || (player as any).isRecovering) return;

    if (this.currentShield !== "none") {
      RetroAudio.play("damage");

      this.currentShield = "none";

      this.shieldGraphic.setVisible(false);

      // Knockback on losing shield

      player.setVelocityY(-500);

      player.setVelocityX(player.body.velocity.x > 0 ? -400 : 400);

      // Invulnerability frames (DOM fix)

      (player as any).isRecovering = true;

      if (this.playerGif && this.playerGif.node)
        (this.playerGif.node as HTMLElement).style.opacity = "0.5";

      this.time.delayedCall(2000, () => {
        if (player && player.scene) {
          (player as any).isRecovering = false;

          if (this.playerGif && this.playerGif.node)
            (this.playerGif.node as HTMLElement).style.opacity = "1";
        }
      });

      return;
    }

    RetroAudio.play("damage");

    if (this.ringCount > 0) {
      this.spillRings();

      this.ringCount = 0;

      this.events.emit("updateRings", this.ringCount);

      player.setVelocityY(-700);

      player.setVelocityX(player.body.velocity.x > 0 ? -600 : 600);

      // Invulnerability frames (DOM fix)

      (player as any).isRecovering = true;

      if (this.playerGif && this.playerGif.node)
        (this.playerGif.node as HTMLElement).style.opacity = "0.5";

      this.time.delayedCall(2000, () => {
        if (player && player.scene) {
          (player as any).isRecovering = false;

          if (this.playerGif && this.playerGif.node)
            (this.playerGif.node as HTMLElement).style.opacity = "1";
        }
      });
    } else {
      this.currentState = PlayerState.DEAD;

      player.body.checkCollision.none = true;

      if (this.playerGif && this.playerGif.node) {
        (this.playerGif.node as HTMLElement).style.filter =
          "grayscale(100%) brightness(50%)";
      }

      player.setVelocityY(-1000);

      this.time.delayedCall(2000, () => {
        this.lives--;

        this.events.emit("updateLives", this.lives);

        if (this.lives > 0) {
          this.scene.restart({
            character: this.characterChoice,

            level: this.currentLevel,

            checkpoint: this.lastCheckpoint,

            lives: this.lives,

            onLevelComplete: this.sys.settings.data.onLevelComplete,

            onBackToMenu: this.sys.settings.data.onBackToMenu,
          });
        } else {
          this.events.emit("gameOver");
        }
      });
    }
  }

  private spillRings() {
    const ringsToSpill = Math.min(this.ringCount, 32);

    for (let i = 0; i < ringsToSpill; i++) {
      const ring = this.scatteredRings.create(
        this.player.x,
        this.player.y,
        "ring_ph",
      );

      ring.body.setCircle(20);

      ring.body.setBounce(0.8);

      // Impede coleta instantânea

      (ring as any).canBeCollected = false;

      this.time.delayedCall(500, () => {
        if (ring && ring.scene) {
          (ring as any).canBeCollected = true;
        }
      });

      const angle = (i / ringsToSpill) * Math.PI * 2;

      const speed = 400 + Math.random() * 600;

      ring.setVelocity(
        Math.cos(angle) * speed,
        -Math.abs(Math.sin(angle) * speed) - 500,
      );

      this.time.delayedCall(3000, () => {
        if (ring && ring.scene) {
          this.tweens.add({
            targets: ring,

            alpha: 0,

            duration: 1000,

            onComplete: () => ring.destroy(),
          });
        }
      });
    }
  }

  update(time: number, delta: number) {
    if (this.isLevelComplete) {
      if (this.player.body.velocity.x > 0) {
        this.player.body.setAccelerationX(0);

        this.player.body.setDrag(this.DRAG, 0);
      }

      return;
    }

    if (this.currentState === PlayerState.DEAD || !this.player) return;

    const dt = delta / 1000;

    this.gameTime += dt;

    this.events.emit("updateTime", this.gameTime);

    // Update GIF state

    let targetGif =
      this.characterChoice === "sonic"
        ? "sonic%20correndo.gif"
        : "shadow%20correndo.gif";

    if (this.currentState === PlayerState.LOOPING) {
      targetGif =
        this.characterChoice === "sonic"
          ? "sonic-rodando.gif"
          : "shadow%20correndo.gif";
    }

    if (
      this.currentGif !== targetGif &&
      this.playerGif &&
      this.playerGif.node
    ) {
      this.currentGif = targetGif;

      (this.playerGif.node as HTMLImageElement).src = `/imagens/${targetGif}`;
    }

    // --- LOOP DE LOOP MATH ---

    if (this.isLooping) {
      // Phaser angles: 0 is Right, 90 is Down, 180 is Left, 270/-90 is Up.

      // We entered at bottom (90 degrees).

      // Going right: Angle decreases 90 -> 0 -> -90 -> -180 -> -270

      // Going left: Angle increases 90 -> 180 -> 270 -> 360 -> 450

      if (this.loopDirection === 1) {
        this.loopAngle -= this.loopSpeed * dt * (180 / Math.PI); // Convert rad/s to deg/s
      } else {
        this.loopAngle += this.loopSpeed * dt * (180 / Math.PI);
      }

      const rad = Phaser.Math.DegToRad(this.loopAngle);

      this.player.x =
        this.loopCenter.x +
        Math.cos(rad) * (this.LOOP_RADIUS - this.player.body.halfHeight);

      this.player.y =
        this.loopCenter.y +
        Math.sin(rad) * (this.LOOP_RADIUS - this.player.body.halfHeight);

      // Rotate GIF to match loop tangent

      if (this.playerGif) {
        const rotationDeg = this.loopAngle - 90;

        this.playerGif.setAngle(rotationDeg);

        this.playerGif.setScale(this.currentFlipX ? -1 : 1, 1);

        this.playerGif.setPosition(this.player.x, this.player.y);
      }

      // Exit Loop Condition

      if (
        (this.loopDirection === 1 && this.loopAngle <= -270) ||
        (this.loopDirection === -1 && this.loopAngle >= 450)
      ) {
        this.isLooping = false;

        // Zoom Camera back in

        this.cameras.main.zoomTo(1, 500, "Sine.easeInOut");

        this.currentState = PlayerState.RUNNING;

        this.player.body.allowGravity = true;

        // Eject slightly above ground to prevent sinking into the tile bounds

        this.player.y -= 10;

        this.player.setVelocityX(
          (this.loopSpeed * this.LOOP_RADIUS + 500) * this.loopDirection,
        ); // Shoot out faster!

        this.player.setVelocityY(-100); // Pop up out of the floor

        if (this.playerGif) {
          this.playerGif.setAngle(0);

          this.playerGif.setScale(this.currentFlipX ? -1 : 1, 1);
        }
      }

      return; // Skip normal physics while looping
    }

    // --- NORMAL PHYSICS ---

    // Update Enemies Patrol (Motobug)

    this.enemies.getChildren().forEach((enemy: any) => {
      if (!enemy.active) return;

      // Initialize state if not present

      if (!enemy.state) {
        enemy.state = "patrol";

        enemy.direction = Math.random() > 0.5 ? 1 : -1;

        enemy.startX = enemy.x;
      }

      if (enemy.state === "patrol") {
        enemy.setVelocityX(50 * enemy.direction);

        enemy.flipX = enemy.direction === 1;

        if (Math.abs(enemy.x - enemy.startX) > 150) {
          enemy.direction *= -1;

          enemy.startX = enemy.x; // avoid getting stuck
        }
      }

      const distToPlayer = Phaser.Math.Distance.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y,
      );

      const isPlayerNear =
        distToPlayer < 300 && Math.abs(enemy.y - this.player.y) < 100;

      if (isPlayerNear && this.currentState !== PlayerState.DEAD) {
        enemy.state = "charge";
      } else if (distToPlayer > 400) {
        enemy.state = "patrol";
      }

      if (enemy.state === "charge") {
        const direction = this.player.x > enemy.x ? 1 : -1;

        enemy.setVelocityX(direction * 250);

        enemy.flipX = direction === 1;
      }
    });

    // Update Eggman Mini Bosses

    this.eggmanMiniBosses.getChildren().forEach((egg: any) => {
      if (!egg.active || egg.hp <= 0) return;

      egg.timer += dt;

      if (egg.gif) {
        egg.gif.setPosition(egg.x, egg.y);

        if (egg.body.velocity.x > 0) egg.gif.setScale(-1, 1);
        else if (egg.body.velocity.x < 0) egg.gif.setScale(1, 1);
      }

      if (
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          egg.x,
          egg.y,
        ) < 1000
      ) {
        if (egg.state === "idle") {
          egg.y = egg.startY + Math.sin(egg.timer * 3) * 30;

          if (egg.x > this.player.x + 50) egg.setVelocityX(-150);
          else if (egg.x < this.player.x - 50) egg.setVelocityX(150);
          else egg.setVelocityX(0);

          if (egg.timer > 3) {
            if (Math.random() > 0.5) {
              egg.state = "shoot";

              egg.shotFired = false;
            } else {
              egg.state = "swoop";
            }

            egg.timer = 0;
          }
        } else if (egg.state === "shoot") {
          egg.setVelocityX(0);

          if (!egg.shotFired) {
            const proj = this.enemyProjectiles.create(
              egg.x,
              egg.y + 30,
              "projectile_ph",
            );

            proj.setScale(0.04);

            proj.body.allowGravity = true;

            proj.setVelocityY(200);

            const xVel = this.player.x > egg.x ? 250 : -250;

            proj.setVelocityX(xVel);

            egg.shotFired = true;
          }

          if (egg.timer > 1) {
            egg.state = "idle";

            egg.timer = 0;
          }
        } else if (egg.state === "swoop") {
          this.physics.moveToObject(egg, this.player, 600);

          if (egg.y > this.player.y || egg.timer > 1.5) {
            egg.state = "retreat";

            egg.setVelocityY(-400);
          }
        } else if (egg.state === "retreat") {
          if (egg.y <= egg.startY) {
            egg.state = "idle";

            egg.timer = 0;

            egg.setVelocityY(0);
          }
        }
      }
    });

    // Update Flying Enemies

    this.flyingEnemies.getChildren().forEach((flyer: any) => {
      if (!flyer.active) return;

      if (flyer.timer === undefined) flyer.timer = Math.random() * 2000;

      flyer.timer += dt * 1000;

      // Sine wave hovering

      flyer.setVelocityY(Math.sin(flyer.timer / 200) * 50);

      // Turn to face player

      if (this.player && this.player.x < flyer.x) {
        flyer.flipX = false;
      } else {
        flyer.flipX = true;
      }

      // Fire Projectile

      if (flyer.timer > 3000) {
        flyer.timer = 0;

        // Shoot at player

        if (Math.abs(this.player.x - flyer.x) < 800) {
          const proj = this.enemyProjectiles.create(
            flyer.x,
            flyer.y,
            "projectile_ph",
          );

          proj.setScale(24 / proj.width);

          proj.body.allowGravity = false;

          this.physics.moveToObject(proj, this.player, 300);
        }
      }
    });

    // Update Moving Platforms

    this.movingPlatforms.getChildren().forEach((plat: any) => {
      if (!plat.active) return;

      const startX = plat.startX || plat.x;

      if (plat.x < startX - 150) plat.setVelocityX(100);
      else if (plat.x > startX + 150) plat.setVelocityX(-100);
    });

    // Update Projectiles (cleanup & homing)

    this.enemyProjectiles.getChildren().forEach((proj: any) => {
      if (proj.y > 1500 || !proj.active) {
        proj.destroy();
      } else if (proj.isHoming) {
        this.physics.moveToObject(proj, this.player, 250);

        // Rotacionar o projétil visualmente na direção do jogador

        proj.rotation = Phaser.Math.Angle.Between(
          proj.x,
          proj.y,
          this.player.x,
          this.player.y,
        );

        // Efeito visual (Smoke Trail)

        if (Math.random() > 0.3) {
          const smoke = this.add.circle(proj.x, proj.y, 6, 0x888888);

          this.tweens.add({
            targets: smoke,
            alpha: 0,
            scale: 2,
            duration: 300,
            onComplete: () => smoke.destroy(),
          });
        }
      }
    });

    // Check Water Status

    let touchingWater = false;

    this.physics.overlap(this.player, this.waterPools, () => {
      touchingWater = true;
    });

    if (this.isUnderwater && !touchingWater) {
      this.isUnderwater = false; // Exited water

      if (this.player.body.velocity.y < 0)
        this.player.setVelocityY(this.player.body.velocity.y * 1.5); // Pop out
    }

    // Speed Shoes Logic

    if (this.speedShoesTimer > 0) {
      this.speedShoesTimer -= delta;
    }

    const currentMaxSpeed =
      this.speedShoesTimer > 0
        ? this.MAX_SPEED * 1.5
        : this.isUnderwater
          ? this.MAX_SPEED * 0.5
          : this.MAX_SPEED;

    const currentAccel = this.isUnderwater
      ? this.ACCELERATION * 0.5
      : this.ACCELERATION;

    const currentDrag = this.isUnderwater ? this.DRAG * 2 : this.DRAG;

    const currentJump = this.isUnderwater
      ? this.JUMP_FORCE * 0.6
      : this.JUMP_FORCE;

    this.player.body.setMaxVelocity(currentMaxSpeed, 2500);

    // Update Boss

    if (this.boss && this.boss.active && (this.boss as any).hp > 0) {
      const b = this.boss as any;

      if (this.bossGif) {
        this.bossGif.setPosition(b.x, b.y);

        if (b.body.velocity.x > 0) this.bossGif.setScale(-1, 1);
        else if (b.body.velocity.x < 0) this.bossGif.setScale(1, 1);
      }

      // Partículas dos propulsores da nave do Eggman

      if (Math.random() > 0.3) {
        const engineY = b.y + 70;

        const flame = this.add.circle(
          b.x,
          engineY,
          10,
          Math.random() > 0.5 ? 0xff8800 : 0xff2200,
        );

        this.tweens.add({
          targets: flame,
          alpha: 0,
          y: engineY + 40,
          scale: 0.5,
          duration: 300,
          onComplete: () => flame.destroy(),
        });
      }

      if (
        Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y) <
        1500
      ) {
        b.timer += dt;

        if (b.state === "idle") {
          // Movimento pendular suave (Hovercraft)

          b.y = b.startY + Math.sin(b.timer * 3) * 50;

          const speed = 250;

          if (b.x > this.player.x + 100) b.setVelocityX(-speed);
          else if (b.x < this.player.x - 100) b.setVelocityX(speed);
          else b.setVelocityX(0);

          if (b.timer > 3) {
            if (Math.random() > 0.5) {
              b.state = "shoot_homing";

              b.shotFired = false;
            } else {
              b.state = "swoop_prep";
            }

            b.timer = 0;

            b.setVelocityX(0);

            b.setVelocityY(0);
          }
        } else if (b.state === "shoot_homing") {
          // Dispara um míssil teleguiado (agora maior e vermelho)

          if (!b.shotFired) {
            const proj = this.enemyProjectiles.create(
              b.x,
              b.y + 30,
              "projectile_ph",
            );

            proj.setScale(0.08); // Tamanho aumentado

            proj.setTint(0xff3333); // Fica ameaçador

            proj.body.allowGravity = false; // Míssil não sofre gravidade

            proj.isHoming = true;

            b.shotFired = true;
          }

          if (b.timer > 0.5) {
            b.state = "idle";

            b.timer = 0;
          }
        } else if (b.state === "swoop_prep") {
          // Para e mira no jogador

          if (b.timer > 0.5) {
            b.state = "swoop";

            b.timer = 0;

            this.physics.moveTo(b, this.player.x, this.player.y + 50, 800);
          }
        } else if (b.state === "swoop") {
          // Mergulha em direção ao chão

          if (
            b.y >= this.player.y ||
            b.body.blocked.down ||
            b.body.touching.down
          ) {
            b.state = "recover";

            b.setVelocityX(b.body.velocity.x * 0.5); // Desacelera no X

            b.setVelocityY(-400); // Sobe rápido

            b.timer = 0;
          }
        } else if (b.state === "recover") {
          // Retorna ao hover

          if (b.y <= b.startY) {
            b.state = "idle";

            b.timer = 0;

            b.setVelocityY(0);
          }
        }
      }
    } else if (this.bossGif) {
      this.bossGif.destroy();

      this.bossGif = undefined;
    }

    // V6 DOM Sync

    if (this.playerGif) {
      this.playerGif.setPosition(this.player.x, this.player.y);

      if (this.player.flipX !== this.currentFlipX) {
        this.currentFlipX = this.player.flipX;

        this.playerGif.setScale(this.currentFlipX ? -1 : 1, 1);
      }
    }

    this.bgWater.tilePositionX = this.cameras.main.scrollX * 0.3 + time * 0.1;

    if (this.player.y > 1500) {
      this.currentState = PlayerState.DEAD;

      this.lives--;

      this.events.emit("updateLives", this.lives);

      if (this.lives > 0) {
        this.scene.restart({
          character: this.characterChoice,

          level: this.currentLevel,

          checkpoint: this.lastCheckpoint,

          lives: this.lives,

          onLevelComplete: this.sys.settings.data.onLevelComplete,

          onBackToMenu: this.sys.settings.data.onBackToMenu,
        });
      } else {
        this.events.emit("gameOver");
      }

      return;
    }

    const isGrounded =
      this.player.body.touching.down || this.player.body.blocked.down;

    const leftDown =
      this.cursors?.left.isDown ||
      this.wasd?.a.isDown ||
      (this.gamepad && this.gamepad.left);

    const rightDown =
      this.cursors?.right.isDown ||
      this.wasd?.d.isDown ||
      (this.gamepad && this.gamepad.right);

    const downDown =
      this.cursors?.down.isDown ||
      this.wasd?.s.isDown ||
      (this.gamepad && this.gamepad.down);

    const jumpDown =
      this.cursors?.up.isDown ||
      this.cursors?.space.isDown ||
      this.wasd?.w.isDown ||
      (this.gamepad &&
        (this.gamepad.A || this.gamepad.B || this.gamepad.X || this.gamepad.Y));

    let jumpJustDown =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.w);

    if (this.gamepad) {
      if (this.gamepad.A && !this.gamepad.buttons[0].pressed)
        jumpJustDown = true; // Basic check, better handled via events but fine for frame check

      // Simplified gamepad just down:

      if (this.gamepad.A) jumpJustDown = true; // Temporary simplification
    }

    const velX = this.player.body.velocity.x;

    // Speed Trails & Boost Aura

    if (Math.abs(velX) > 1500) {
      if (Math.random() > 0.5) {
        const ghostColor =
          this.characterChoice === "sonic" ? 0x0055ff : 0x222222;

        const ghost = this.add.rectangle(
          this.player.x,
          this.player.y,
          60,
          60,
          ghostColor,
          0.4,
        );

        this.tweens.add({
          targets: ghost,
          alpha: 0,
          scale: 0.2,
          duration: 300,
          onComplete: () => ghost.destroy(),
        });
      }
    }

    // Dynamic Tilt for DOM Sprite

    if (this.playerGif) {
      if (isGrounded) {
        // Fake slope physics based on velocity

        const tilt = (velX / 1800) * 15; // Max 15 degrees tilt

        (this.playerGif.node as HTMLElement).style.transform =
          `translate(-50%, -50%) rotate(${tilt}deg)`;
      } else {
        (this.playerGif.node as HTMLElement).style.transform =
          `translate(-50%, -50%) rotate(0deg)`;
      }
    }

    // Shield Particles

    if (this.currentShield !== "none") {
      if (Math.random() > 0.6) {
        let color = 0xffffff;

        if (this.currentShield === "fire") color = 0xff4400;

        if (this.currentShield === "water") color = 0x0088ff;

        if (this.currentShield === "lightning") color = 0xffff00;

        const spark = this.add.circle(
          this.player.x + (Math.random() * 40 - 20),
          this.player.y + (Math.random() * 40 - 20),
          4,
          color,
        );

        this.tweens.add({
          targets: spark,
          y: spark.y - 30,
          alpha: 0,
          scale: 0,
          duration: 500,
          onComplete: () => spark.destroy(),
        });
      }

      // Lightning Ring Magnet

      if (this.currentShield === "lightning") {
        this.rings.getChildren().forEach((ring: any) => {
          if (!ring.active) return;

          const dist = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            ring.x,
            ring.y,
          );

          if (dist < 300) {
            this.physics.moveToObject(ring, this.player, 800);
          }
        });

        this.scatteredRings.getChildren().forEach((ring: any) => {
          if (!ring.active) return;

          const dist = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            ring.x,
            ring.y,
          );

          if (dist < 300) {
            this.physics.moveToObject(ring, this.player, 800);
          }
        });
      }
    }

    if (Math.abs(velX) > 600) {
      this.cameras.main.setFollowOffset(velX > 0 ? -300 : 300, 0);
    } else {
      this.cameras.main.setFollowOffset(0, 0);
    }

    // STATE MACHINE TRANSITIONS

    if (this.isLevelComplete) {
      if (isGrounded) {
        this.currentState = PlayerState.IDLE;

        this.player.setVelocityX(0);
      }

      return; // Bloqueia controles do jogador
    }

    if (isGrounded) {
      // Camera Shake on heavy landing

      if (this.player.body.velocity.y > 1000) {
        this.cameras.main.shake(150, 0.005);
      }

      this.hasPerformedAirAction = false;

      this.hasDoubleJumped = false;

      if (this.isDropDashing && this.characterChoice === "sonic") {
        // Execute Drop Dash on landing

        this.currentState = PlayerState.ROLLING;

        const direction = this.player.flipX ? -1 : 1;

        RetroAudio.play("spindash");

        this.player.setVelocityX(1200 * direction);

        this.spawnDust(this.player.x, this.player.y);

        this.isDropDashing = false;
      } else if (downDown && Math.abs(velX) < 50) {
        this.currentState = PlayerState.SPINDASHING;
      } else if (downDown && Math.abs(velX) > 300) {
        this.currentState = PlayerState.ROLLING;
      } else if (jumpJustDown) {
        this.currentState = PlayerState.JUMPING;

        RetroAudio.play("jump");

        this.player.setVelocityY(currentJump);
      } else if (Math.abs(velX) > 50) {
        this.currentState = PlayerState.RUNNING;
      } else {
        this.currentState = PlayerState.IDLE;
      }
    } else {
      // In Air

      if (jumpJustDown && this.currentState === PlayerState.JUMPING) {
        if (!this.hasDoubleJumped) {
          // DOUBLE JUMP

          this.hasDoubleJumped = true;

          this.player.setVelocityY(currentJump); // Second impulse

          RetroAudio.play("jump");

          // Double Jump VFX (Starburst)

          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const spark = this.add.circle(
              this.player.x,
              this.player.y,
              6,
              0x00f3ff,
            );
            this.tweens.add({
              targets: spark,
              x: spark.x + Math.cos(angle) * 80,
              y: spark.y + Math.sin(angle) * 80,

              alpha: 0,

              scale: 0.2,

              duration: 400,

              onComplete: () => spark.destroy(),
            });
          }
        } else if (!this.hasPerformedAirAction) {
          // SPECIAL AERIAL ATTACK (After Double Jump)

          this.hasPerformedAirAction = true;

          if (this.characterChoice === "sonic") {
            // Drop Dash Charge

            this.isDropDashing = true;

            RetroAudio.play("spindash");
          } else if (this.characterChoice === "shadow") {
            // Homing Attack

            let closestEnemy: any = null;

            let closestDist = 800; // Radius

            this.enemies.getChildren().forEach((enemy: any) => {
              if (!enemy.active) return;

              const dist = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                enemy.x,
                enemy.y,
              );

              if (dist < closestDist) {
                closestDist = dist;

                closestEnemy = enemy;
              }
            });

            if (closestEnemy) {
              this.physics.moveToObject(this.player, closestEnemy, 1500);

              this.player.body.allowGravity = false;

              this.time.delayedCall(500, () => {
                if (this.player && this.player.body)
                  this.player.body.allowGravity = true;
              });
            } else {
              // Air Dash if no enemies

              const direction = this.player.flipX ? -1 : 1;

              this.player.setVelocityX(1200 * direction);

              this.player.setVelocityY(0);
            }
          }

          // Shield Actions override Drop Dash/Homing if they exist

          if (this.currentShield !== "none") {
            this.isDropDashing = false; // Cancel drop dash charge

            RetroAudio.play("jump"); // Play action sound

            if (this.currentShield === "fire") {
              const direction = this.player.flipX ? -1 : 1;

              this.player.setVelocityX(1500 * direction);

              this.player.setVelocityY(0);
            } else if (this.currentShield === "water") {
              this.player.setVelocityY(1500); // Bounce down

              this.player.setVelocityX(0);
            } else if (this.currentShield === "lightning") {
              this.player.setVelocityY(currentJump * 0.8); // Third jump effectively
            }
          }
        }
      }
    }

    // STATE MACHINE EXECUTION

    switch (this.currentState) {
      case PlayerState.SPINDASHING:
        if (Math.random() > 0.5) {
          this.spawnDust(
            this.player.x + (this.player.flipX ? 20 : -20),
            this.player.y + 30,
          );
        }

        if (!downDown) {
          this.currentState = PlayerState.ROLLING;

          const direction = this.player.flipX ? -1 : 1;

          this.player.setVelocityX((1000 + this.spinDashCharge) * direction);

          this.spinDashCharge = 0;
        } else {
          if (jumpJustDown) {
            this.spinDashCharge = Math.min(this.spinDashCharge + 400, 1500);
          }
        }

        break;

      case PlayerState.ROLLING:

      case PlayerState.JUMPING:

      case PlayerState.RUNNING:

      case PlayerState.IDLE:
        if (leftDown) {
          this.player.flipX = true;

          if (velX > 100 && isGrounded) {
            this.player.body.setDrag(this.SKID_DRAG, 0);

            this.player.body.setAccelerationX(0);

            if (Math.random() > 0.5)
              this.spawnDust(this.player.x + 20, this.player.y + 30);
          } else {
            this.player.body.setDrag(
              this.currentState === PlayerState.ROLLING
                ? this.ROLL_DRAG
                : currentDrag,
              0,
            );

            this.player.body.setAccelerationX(-currentAccel);
          }
        } else if (rightDown) {
          this.player.flipX = false;

          if (velX < -100 && isGrounded) {
            this.player.body.setDrag(this.SKID_DRAG, 0);

            this.player.body.setAccelerationX(0);

            if (Math.random() > 0.5)
              this.spawnDust(this.player.x - 20, this.player.y + 30);
          } else {
            this.player.body.setDrag(
              this.currentState === PlayerState.ROLLING
                ? this.ROLL_DRAG
                : currentDrag,
              0,
            );

            this.player.body.setAccelerationX(currentAccel);
          }
        } else {
          this.player.body.setAccelerationX(0);

          this.player.body.setDrag(
            this.currentState === PlayerState.ROLLING
              ? this.ROLL_DRAG
              : currentDrag,
            0,
          );
        }

        if (
          !jumpDown &&
          this.currentState === PlayerState.JUMPING &&
          this.player.body.velocity.y < 0
        ) {
          this.player.setVelocityY(this.player.body.velocity.y * 0.4);
        }

        // Trilha de Vento (Wind Trail)

        if (Math.abs(velX) > 1200 && isGrounded && Math.random() > 0.7) {
          this.spawnDust(
            this.player.x + (this.player.flipX ? 30 : -30),
            this.player.y + 20,
          );
        }

        break;
    }

    if (this.playerGif) {
      if (this.currentState === PlayerState.SPINDASHING || this.isDropDashing) {
        (this.playerGif.node as HTMLElement).style.height = "100px";
      } else {
        (this.playerGif.node as HTMLElement).style.height = "150px";
      }
    }
  }

  private spawnDust(x: number, y: number) {
    const dust = this.add.image(x, y, "dust_ph");

    this.tweens.add({
      targets: dust,

      y: y - 20 - Math.random() * 20,

      x: x + (Math.random() * 20 - 10),

      alpha: 0,

      scale: 2,

      duration: 300 + Math.random() * 200,

      onComplete: () => dust.destroy(),
    });
  }
}

export class Boss extends Phaser.Physics.Arcade.Sprite {
  public hp = 3;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "boss_ph");

    scene.add.existing(this);

    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
  }

  takeDamage() {
    this.hp--;

    this.setTint(0xff0000);

    this.scene.time.delayedCall(200, () => this.clearTint());
  }
}

export class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;

  private ringsText!: Phaser.GameObjects.Text;

  private timeText!: Phaser.GameObjects.Text;

  private livesText!: Phaser.GameObjects.Text;

  constructor() {
    super("UIScene");
  }

  create(data: {
    onBackToMenu: () => void;
    onLevelComplete: () => void;
    level: number;
    lives?: number;
    character?: string;
  }) {
    const textStyle = {
      fontFamily: '"Press Start 2P", Orbitron, sans-serif',

      fontSize: "20px",

      color: "#FACC15", // Yellow font for SCORE/TIME/RINGS

      stroke: "#000000",

      strokeThickness: 4,

      shadow: { offsetX: 2, offsetY: 2, color: "#000000", fill: true },
    };

    const valStyle = {
      fontFamily: '"Press Start 2P", Orbitron, sans-serif',

      fontSize: "20px",

      color: "#FFFFFF",

      stroke: "#000000",

      strokeThickness: 4,
    };

    this.add.text(40, 40, "SCORE", textStyle);

    this.scoreText = this.add.text(140, 40, "0", valStyle);

    this.add.text(40, 75, "TIME", textStyle);

    this.timeText = this.add.text(140, 75, "0:00", valStyle);

    this.add.text(40, 110, "RINGS", textStyle);

    this.ringsText = this.add.text(140, 110, "0", valStyle);

    // Flashing Red Text automatically if starting with 0

    this.ringsText.setColor("#FF0000");

    // Classic Lives Box HUD (Small blue square with text)

    this.add.rectangle(
      70,
      this.cameras.main.height - 40,
      80,
      40,
      0x000000,
      0.5,
    );

    const charName = data.character === "sonic" ? "SONIC" : "SHADOW";

    this.add.text(40, this.cameras.main.height - 50, charName, {
      fontFamily: '"Press Start 2P"',
      fontSize: "10px",
      color: "#FFFFFF",
    });

    this.livesText = this.add.text(
      70,
      this.cameras.main.height - 40,
      `x ${data.lives ?? 3}`,
      { fontFamily: '"Press Start 2P"', fontSize: "14px", color: "#FFFFFF" },
    );

    const backBtn = this.add.text(
      this.cameras.main.width - 150,
      40,
      " PAUSE ",
      {
        fontFamily: '"Press Start 2P"',

        fontSize: "16px",

        fontStyle: "bold",

        backgroundColor: "#E53E3E",

        color: "#FFFFFF",

        padding: { x: 10, y: 5 },
      },
    );

    backBtn.setInteractive({ useHandCursor: true });

    const mainScene = this.scene.get("MainScene") as any;

    // PAUSE MENU

    const w = this.cameras.main.width;

    const h = this.cameras.main.height;

    const pauseGroup = this.add.group();

    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7);

    const pauseTitle = this.add
      .text(w / 2, h / 2 - 100, "PAUSED", {
        fontFamily: '"Press Start 2P"',
        fontSize: "40px",
        color: "#FFF",
      })
      .setOrigin(0.5);

    const resumeBtn = this.add
      .text(w / 2, h / 2 + 20, "RESUME", {
        fontFamily: '"Press Start 2P"',
        fontSize: "24px",
        color: "#FFD700",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    resumeBtn.on("pointerdown", () => {
      mainScene.scene.resume();

      pauseGroup.setVisible(false);
    });

    const quitBtn = this.add
      .text(w / 2, h / 2 + 80, "QUIT GAME", {
        fontFamily: '"Press Start 2P"',
        fontSize: "24px",
        color: "#FF0000",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    quitBtn.on("pointerdown", () => {
      data.onBackToMenu();
    });

    pauseGroup.addMultiple([overlay, pauseTitle, resumeBtn, quitBtn]);

    pauseGroup.setVisible(false);

    backBtn.on("pointerdown", () => {
      if (mainScene.scene.isPaused()) {
        mainScene.scene.resume();

        pauseGroup.setVisible(false);
      } else {
        mainScene.scene.pause();

        pauseGroup.setVisible(true);
      }
    });

    let flashTween: Phaser.Tweens.Tween | null = null;

    // Initial flash for 0 rings

    flashTween = this.tweens.add({
      targets: this.ringsText,

      alpha: 0,

      duration: 300,

      yoyo: true,

      repeat: -1,
    });

    mainScene.events.on("updateRings", (count: number) => {
      this.ringsText.setText(`${count}`);

      if (count === 0) {
        this.ringsText.setColor("#FF0000");

        if (!flashTween) {
          flashTween = this.tweens.add({
            targets: this.ringsText,

            alpha: 0,

            duration: 300,

            yoyo: true,

            repeat: -1,
          });
        }
      } else {
        this.ringsText.setColor("#FFD700");

        this.ringsText.setAlpha(1);

        if (flashTween) {
          flashTween.stop();

          flashTween = null;
        }
      }
    });

    mainScene.events.on("updateTime", (timeSec: number) => {
      const mins = Math.floor(timeSec / 60);

      const secs = Math.floor(timeSec % 60);

      this.timeText.setText(`${mins}:${secs.toString().padStart(2, "0")}`);
    });

    mainScene.events.on("updateScore", (score: number) => {
      this.scoreText.setText(`${score}`);
    });

    mainScene.events.on("updateLives", (lives: number) => {
      this.livesText.setText(`x ${lives}`);
    });

    // Game Over Screen

    mainScene.events.on("gameOver", () => {
      const overOverlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0);

      this.tweens.add({ targets: overOverlay, fillAlpha: 0.9, duration: 1000 });

      const gameOverText = this.add
        .text(w / 2, -100, "GAME OVER", {
          fontFamily: '"Press Start 2P"',
          fontSize: "50px",
          color: "#FF0000",

          stroke: "#FFF",
          strokeThickness: 4,
        })
        .setOrigin(0.5);

      this.tweens.add({
        targets: gameOverText,
        y: h / 2 - 100,
        ease: "Bounce",
        duration: 1500,
      });

      this.time.delayedCall(1500, () => {
        const retryBtn = this.add
          .text(w / 2, h / 2 + 50, "TRY AGAIN", {
            fontFamily: '"Press Start 2P"',
            fontSize: "24px",
            color: "#FFD700",
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

        retryBtn.on("pointerdown", () => {
          mainScene.scene.restart({
            character: mainScene.characterChoice,

            level: mainScene.currentLevel,

            checkpoint: null,

            lives: 3,

            onLevelComplete: data.onLevelComplete,

            onBackToMenu: data.onBackToMenu,
          });

          this.scene.restart({ ...data, lives: 3 });
        });

        const menuBtn = this.add
          .text(w / 2, h / 2 + 120, "MAIN MENU", {
            fontFamily: '"Press Start 2P"',
            fontSize: "24px",
            color: "#FFF",
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

        menuBtn.on("pointerdown", () => {
          data.onBackToMenu();
        });
      });
    });

    // Victory Screen

    mainScene.events.on(
      "levelComplete",
      (bonus: { timeBonus: number; ringBonus: number }) => {
        const w = this.cameras.main.width;

        const h = this.cameras.main.height;

        const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0);

        this.tweens.add({ targets: overlay, fillAlpha: 0.6, duration: 1000 });

        const titleText =
          data.level === 3
            ? "CONGRATULATIONS!\nGAME CLEAR!"
            : `SONIC GOT\nTHROUGH ACT ${data.level}`;

        const actClear = this.add
          .text(w / 2, -100, titleText, {
            fontFamily: '"Press Start 2P"',

            fontSize: data.level === 3 ? "30px" : "40px",

            color: "#FFFFFF",

            align: "center",

            stroke: "#000000",

            strokeThickness: 10,

            shadow: {
              offsetX: 6,
              offsetY: 6,
              color: "#000000",
              blur: 0,
              stroke: true,
              fill: true,
            },
          })
          .setOrigin(0.5);

        this.tweens.add({
          targets: actClear,
          y: h / 2 - 120,
          ease: "Elastic.easeOut",
          duration: 2000,
        });

        this.time.delayedCall(2000, () => {
          this.add.text(
            w / 2 - 250,
            h / 2 + 30,
            `TIME BONUS: ${bonus.timeBonus}`,
            textStyle,
          );

          this.add.text(
            w / 2 - 250,
            h / 2 + 90,
            `RING BONUS: ${bonus.ringBonus}`,
            textStyle,
          );
        });

        this.time.delayedCall(6000, () => {
          if (data.onLevelComplete) data.onLevelComplete();
        });
      },
    );
  }
}
