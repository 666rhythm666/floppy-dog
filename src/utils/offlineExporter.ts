import { PlayerCustomization } from '../types';
import { LEVELS } from '../data/levels';

/**
 * Generates a fully playable, self-contained standalone HTML build of Floppy's Island Run.
 * It packages the physics, render loops, level designs, and procedural audio so it can
 * save and play completely offline on any browser with zero installation!
 */
export function generateOfflineSingleFile(customization: PlayerCustomization, highScore: number): string {
  const levelsString = JSON.stringify(LEVELS);
  const initialCustomization = JSON.stringify(customization);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Floppy's Island Run - Portable Edition</title>
  <!-- Load Tailwind CSS via CDN for offline-cached styling or normal loading -->
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@700;800&display=swap');
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background-color: #0c0a09;
      color: #fafaf9;
      user-select: none;
      -webkit-user-select: none;
    }
    .retro-shadow {
      box-shadow: 4px 4px 0px #0f172a;
    }
    .retro-shadow-large {
      box-shadow: 6px 6px 0px #0f172a;
    }
    .retro-border {
      border: 3.5px solid #0f172a;
    }
    /* Simple retro CRT effect */
    .crt::after {
      content: " ";
      display: block;
      position: absolute;
      top: 0; left: 0; bottom: 0; right: 0;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.05));
      aspect-ratio: none;
      background-size: 100% 3px, 3px 100%;
      pointer-events: none;
      z-index: 50;
    }
  </style>
</head>
<body class="min-h-screen py-8 px-4 flex flex-col justify-center items-center">

  <div class="w-full max-w-4xl space-y-6">
    <!-- Main Retro Banner -->
    <div class="bg-gradient-to-r from-cyan-400 via-indigo-400 to-amber-300 retro-border p-6 rounded-3xl text-slate-950 retro-shadow">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span class="inline-block px-2.5 py-0.5 rounded-full bg-white text-xs font-mono font-black uppercase tracking-wider mb-2 retro-border">
            💾 Portable Offline Edition
          </span>
          <h1 class="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none">Floppy's Island Run</h1>
          <p class="text-xs font-medium text-slate-900 mt-1.5 md:max-w-xl">
            You are playing the **fully self-contained standalone HTML build**. This file contains all level equations, vector dog mechanics, custom cosmetics, and synthetics barks! Share this file with friends to play anywhere.
          </p>
        </div>
        <div class="flex gap-4">
          <div class="bg-white retro-border px-4 py-2 rounded-xl text-center min-w-[100px]">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Local Record</span>
            <span id="saved_highscore" class="font-mono text-xl font-black text-slate-950">${highScore}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Game Stage Window -->
    <div id="game_container" class="relative hidden">
      <!-- Game Canvas Window Frame -->
      <div class="relative retro-border rounded-3xl overflow-hidden bg-slate-900 shadow-xl">
        <canvas id="canvas" class="block w-full bg-slate-800" width="1000" height="560"></canvas>
        <div class="crt"></div>
      </div>

      <!-- Live Floating Controls -->
      <div class="absolute bottom-5 left-5 right-5 flex justify-between items-center pointer-events-none">
        <!-- Interactive mobile jump overlay if playing on tablets/phones -->
        <button id="mobile_btn_jump" class="pointer-events-auto h-16 w-16 md:hidden rounded-2xl bg-amber-400 retro-border flex items-center justify-center text-2xl retro-shadow active:translate-y-1 active:shadow-none">🦘</button>
        <div class="flex gap-2">
          <button id="mobile_btn_left" class="pointer-events-auto h-16 w-16 md:hidden rounded-2xl bg-white retro-border flex items-center justify-center text-xl retro-shadow active:translate-y-1 active:shadow-none">👈</button>
          <button id="mobile_btn_right" class="pointer-events-auto h-16 w-16 md:hidden rounded-2xl bg-white retro-border flex items-center justify-center text-xl retro-shadow active:translate-y-1 active:shadow-none">👉</button>
        </div>
      </div>
    </div>

    <!-- Retro Play Room Menu (Shows up first) -->
    <div id="dashboard_container" class="grid grid-cols-1 md:grid-cols-12 gap-6">
      
      <!-- Stage Pick List -->
      <div class="md:col-span-8 bg-white text-slate-900 retro-border p-6 rounded-3xl retro-shadow space-y-4">
        <div class="flex justify-between items-center border-b-2 border-slate-100 pb-2">
          <h2 class="text-xl font-black text-slate-950 flex items-center gap-2">
            🐶 Pick a Floating Island
          </h2>
          <span class="text-xs font-mono font-extrabold bg-sky-100 border border-sky-300 text-sky-800 px-2 py-0.5 rounded-md">Offline Enabled</span>
        </div>

        <div id="stages_list" class="space-y-3">
          <!-- Populated by JS -->
        </div>
      </div>

      <!-- Customize Puppy Side Cabin -->
      <div class="md:col-span-4 bg-white text-slate-910 retro-border p-6 rounded-3xl retro-shadow space-y-4 text-slate-950">
        <div>
          <h2 class="text-lg font-black tracking-tight leading-none">The Puppy Cabin</h2>
          <p class="text-[11px] text-slate-500 mt-0.5 font-medium">Equip and modify floppy ears offline</p>
        </div>

        <!-- Ear Pick selectors -->
        <div class="space-y-1.5">
          <span class="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block">Ear Coat Color</span>
          <div class="grid grid-cols-2 gap-1.5">
            <button onclick="setEar('black')" id="p_ear_black" class="p-1 px-2 text-xs rounded-lg retro-border bg-slate-950 text-white font-bold">Black</button>
            <button onclick="setEar('brown')" id="p_ear_brown" class="p-1 px-2 text-xs rounded-lg retro-border bg-amber-805 bg-amber-700 text-white font-bold">Brown</button>
            <button onclick="setEar('gray')" id="p_ear_gray" class="p-1 px-2 text-xs rounded-lg retro-border bg-gray-500 text-white font-bold">Gray</button>
            <button onclick="setEar('white')" id="p_ear_white" class="p-1 px-2 text-xs rounded-lg retro-border bg-white text-slate-900 font-bold border-gray-300">White</button>
          </div>
        </div>

        <!-- Spotted design picker -->
        <div class="space-y-1.5">
          <button onclick="toggleSpotted()" id="p_spot_btn" class="w-full text-left p-1.5 px-3 rounded-lg retro-border text-xs font-extrabold bg-slate-50 relative flex justify-between items-center">
            <span>🍪 Cute Spotted Body</span>
            <span id="p_spot_val" class="text-emerald-500 font-black">ON</span>
          </button>
        </div>

        <!-- Hats -->
        <div class="space-y-1.5">
          <span class="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block">Hat Wardrobe</span>
          <div class="grid grid-cols-3 gap-1">
            <button onclick="setHat('none')" id="p_hat_none" class="p-1 text-xs rounded-lg retro-border bg-white hover:bg-slate-50 text-[10px] font-bold">❌ None</button>
            <button onclick="setHat('detective')" id="p_hat_detective" class="p-1 text-xs rounded-lg retro-border bg-white hover:bg-slate-50 text-[10px] font-bold">🕵️ Cap</button>
            <button onclick="setHat('party')" id="p_hat_party" class="p-1 text-xs rounded-lg retro-border bg-white hover:bg-slate-50 text-[10px] font-bold">🎉 Party</button>
            <button onclick="setHat('tophat')" id="p_hat_tophat" class="p-1 text-xs rounded-lg retro-border bg-white hover:bg-slate-50 text-[10px] font-bold">🎩 Top</button>
            <button onclick="setHat('crown')" id="p_hat_crown" class="p-1 text-xs rounded-lg retro-border bg-white hover:bg-slate-50 text-[10px] font-bold">👑 Crown</button>
            <button onclick="setHat('flower')" id="p_hat_flower" class="p-1 text-xs rounded-lg retro-border bg-white hover:bg-slate-50 text-[10px] font-bold">🌸 Flower</button>
          </div>
        </div>

        <!-- Collars -->
        <div class="space-y-1.5">
          <span class="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block">Collars and Tags</span>
          <div class="grid grid-cols-2 gap-1">
            <button onclick="setCollar('none')" id="p_collar_none" class="p-1 text-xs rounded-lg retro-border bg-white hover:bg-slate-50 text-[10px] font-bold">❌ None</button>
            <button onclick="setCollar('red_collar')" id="p_collar_red_collar" class="p-1 text-xs rounded-lg retro-border bg-white hover:bg-slate-50 text-[10px] font-bold">🔴 Collar</button>
            <button onclick="setCollar('gold_bell')" id="p_collar_gold_bell" class="p-1 text-xs rounded-lg retro-border bg-white hover:bg-slate-50 text-[10px] font-bold">🔔 Bell</button>
            <button onclick="setCollar('scarf')" id="p_collar_scarf" class="p-1 text-xs rounded-lg retro-border bg-white hover:bg-slate-50 text-[10px] font-bold">🧣 Scarf</button>
          </div>
        </div>

        <!-- Procedural Audio -->
        <div class="pt-3 border-t-2 border-slate-150 flex justify-between items-center text-xs">
          <span class="font-mono font-bold text-slate-500">Synth Sound:</span>
          <button onclick="toggleAudio()" id="p_sound_btn" class="px-3 py-1 rounded bg-emerald-400 retro-border text-[10px] font-black uppercase text-slate-950">Active</button>
        </div>
      </div>

    </div>

    <!-- Game Over overlay (Embedded for seamless interactions) -->
    <div id="game_over_screen" class="hidden fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
      <div class="bg-white text-slate-950 retro-border p-8 rounded-3xl retro-shadow text-center max-w-sm w-full space-y-4">
        <span class="text-4xl block">💫</span>
        <h2 id="ga_title" class="text-2xl font-black text-slate-950">STAGES COMPLETED!</h2>
        <p id="ga_descr" class="text-xs text-slate-600">Great job navigating the cloud heights!</p>
        <div class="bg-indigo-50 retro-border p-3 rounded-2xl">
          <div class="text-[10px] font-mono font-bold text-indigo-700">TOTAL SCORE</div>
          <div id="ga_score" class="font-mono text-3xl font-black text-slate-950">0</div>
        </div>
        <button onclick="returnToDashboard()" class="w-full py-2.5 bg-amber-400 font-black retro-border rounded-xl shadow active:translate-y-1">返回 Dashboard / Back to Cabin</button>
      </div>
    </div>
  </div>

  <script>
    // --- GLOBAL STATE ---
    const LEVELS = ${levelsString};
    let customization = ${initialCustomization};
    let soundEnabled = true;
    let currentLevel = null;
    let score = 0;
    let lives = 5;
    let bonesCollected = 0;
    let bonesInLevel = 0;
    
    let isGameOver = false;
    let animationFrameId = null;
    let highScore = ${highScore};
    
    // --- PLAYER CORE PHYSICS STATE ---
    let player = {
      x: 100, y: 150,
      vx: 0, vy: 0,
      width: 48, height: 36,
      onGround: false,
      facing: 'right',
      invincibleTimer: 0,
      powerup: null,
      powerupTimer: 0,
      ridingPlatformId: null,
      ridingPlatLastX: 0,
      ridingPlatLastY: 0
    };

    const keysPressed = {};
    let animationTick = 0;

    // --- PROCEDURAL AUDIO SYNTH ---
    class AudioSynthesizer {
      constructor() {
        this.ctx = null;
      }
      init() {
        if (!this.ctx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) this.ctx = new AudioContextClass();
        }
      }
      playJump() {
        if (!soundEnabled || !this.ctx) return;
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(155, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.11);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.11);
      }
      playCollect() {
        if (!soundEnabled || !this.ctx) return;
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.005, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.18);
      }
      playGoldenCollect() {
        if (!soundEnabled || !this.ctx) return;
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(783.99, now); // G5
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.005, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.2);
      }
      playFailure() {
        if (!soundEnabled || !this.ctx) return;
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.35);
      }
      playFanfare() {
        if (!soundEnabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.07);
          gain.gain.setValueAtTime(0.04, now + i * 0.07);
          gain.gain.linearRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.25);
        });
      }
    }
    const audio = new AudioSynthesizer();

    // --- RENDERING ROUTINES ---
    // Accurate math translation of drawDog inside RetroDogRenderer!
    function drawDog(ctx, cx, cy, onGround, facing, animationTick, custom, powerup) {
      ctx.save();
      ctx.translate(cx, cy);

      if (powerup === 'balloon') {
        ctx.scale(1.28, 1.28);
      }
      if (facing === 'left') {
        ctx.scale(-1, 1);
      }

      // 1. Shadow underneath
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
      ctx.beginPath();
      ctx.ellipse(0, 1, 16, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tail wag physics
      const wagAngle = Math.sin(animationTick * 0.25) * 0.35;
      ctx.save();
      ctx.translate(-14, -13);
      ctx.rotate(wagAngle - 0.2);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(-7, -3, 9, 5, 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.restore();

      // Rear spot
      let spotColor = '#f8fafc';
      if (custom.earColor === 'brown') spotColor = '#78350f';
      else if (custom.earColor === 'black') spotColor = '#0f172a';

      // 2. Legs walking animations
      let legOffset1 = Math.sin(animationTick * 0.2) * 5;
      let legOffset2 = Math.cos(animationTick * 0.2) * 5;
      if (!onGround) {
        legOffset1 = 4;
        legOffset2 = -4;
      }

      // Back legs
      ctx.fillStyle = '#f1f5f9';
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#0f172a';
      // Leg 1
      ctx.beginPath();
      ctx.roundRect(-8 + legOffset1 * 0.3, -4, 4.5, 6, 2.5);
      ctx.fill(); ctx.stroke();
      // Leg 2
      ctx.beginPath();
      ctx.roundRect(4 + legOffset2 * 0.3, -4, 4.5, 6, 2.5);
      ctx.fill(); ctx.stroke();

      // 3. Torso / Body (Fluffy round container)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(-15, -16, 26, 14, 7);
      ctx.fill();
      ctx.stroke();

      // Spots decoration if active
      if (custom.spotted) {
        ctx.fillStyle = spotColor;
        ctx.beginPath();
        ctx.arc(-8, -11, 4.5, 0, Math.PI * 2);
        ctx.arc(0, -13, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Front auxiliary legs on top
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(-6 + legOffset2 * 0.3, -4, 4.5, 6, 2.5);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(6 + legOffset1 * 0.3, -4, 4.5, 6, 2.5);
      ctx.fill(); ctx.stroke();

      // 4. Neck collar / Scarf
      if (custom.collar === 'red_collar') {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(5, -16, 5, 12, 1);
        ctx.fill();
      } else if (custom.collar === 'gold_bell') {
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.roundRect(5, -16, 5, 12, 1);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(9, -8, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (custom.collar === 'scarf') {
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.roundRect(3, -17, 7, 13, 2);
        ctx.fill();
      }

      // 5. Head container
      ctx.save();
      ctx.translate(9, -15);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(-7, -12, 16, 13, 6);
      ctx.fill();
      ctx.stroke();

      // Spot on face
      if (custom.spotted) {
        ctx.fillStyle = spotColor;
        ctx.beginPath();
        ctx.arc(-3, -7, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Eyes (glowing black dots)
      ctx.fillStyle = '#0f172a';
      const blink = Math.sin(animationTick * 0.05) > 0.96 ? 0.3 : 2.5;
      ctx.beginPath();
      ctx.ellipse(3, -5, 1.2, blink, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nose (cute black triangular button)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(7.5, -4.5);
      ctx.lineTo(10.5, -4.5);
      ctx.lineTo(9, -2.5);
      ctx.closePath();
      ctx.fill();

      // Retro Flappy Ears
      ctx.save();
      ctx.translate(-2, -9);
      const flopAngle = Math.sin(animationTick * 0.12) * 0.14 + (onGround ? 0 : 0.4);
      ctx.rotate(flopAngle + 0.1);
      
      let earFill = '#0f172a';
      if (custom.earColor === 'brown') earFill = '#78350f';
      else if (custom.earColor === 'gray') earFill = '#6b7280';
      else if (custom.earColor === 'white') earFill = '#cbd5e1';
      ctx.fillStyle = earFill;
      
      ctx.beginPath();
      ctx.roundRect(-4.5, -1, 6.5, 12, 3);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.restore();

      // Cosmetic Hat
      if (custom.hat !== 'none') {
        ctx.fillStyle = '#ca8a04';
        if (custom.hat === 'detective') {
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.roundRect(-4, -14, 11, 4, 1.5);
          ctx.fill();
          ctx.beginPath();
          ctx.roundRect(-1, -12, 11, 2, 1);
          ctx.fill();
        } else if (custom.hat === 'party') {
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.moveTo(-2, -11);
          ctx.lineTo(8, -11);
          ctx.lineTo(3, -24);
          ctx.closePath();
          ctx.fill();
        } else if (custom.hat === 'tophat') {
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(-5, -13, 14, 2.5, 1);
          ctx.fill();
          ctx.beginPath();
          ctx.roundRect(-2, -22, 8, 9, 1);
          ctx.fill();
        } else if (custom.hat === 'crown') {
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.moveTo(-3, -11);
          ctx.lineTo(-3, -17);
          ctx.lineTo(0, -14);
          ctx.lineTo(3, -19);
          ctx.lineTo(6, -14);
          ctx.lineTo(9, -17);
          ctx.lineTo(9, -11);
          ctx.closePath();
          ctx.fill();
        } else if (custom.hat === 'flower') {
          ctx.fillStyle = '#d946ef';
          ctx.beginPath();
          ctx.arc(3, -13, 3, 0, Math.PI * 2);
          ctx.arc(0, -11, 3, 0, Math.PI * 2);
          ctx.arc(6, -11, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(3, -11, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore(); // restore head

      // Spicy elements
      if (powerup === 'chili') {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(-8, 1, 3.5 + Math.sin(animationTick * 0.3) * 1.5, 0, Math.PI * 2);
        ctx.arc(4, 1, 3.5 + Math.cos(animationTick * 0.3) * 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (powerup === 'star') {
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(0, -25, 11, 3.2, -0.05, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore(); // restore body
    }

    // --- GAME ENGINE LOGIC ---
    function selectStage(id) {
      const found = LEVELS.find(l => l.id === id);
      if (!found) return;
      currentLevel = JSON.parse(JSON.stringify(found));
      
      // Setup stage properties
      player.x = currentLevel.startPos.x;
      player.y = currentLevel.startPos.y;
      player.vx = 0; player.vy = 0;
      player.powerup = null;
      player.powerupTimer = 0;
      player.width = 48; player.height = 36;
      
      bonesCollected = 0;
      bonesInLevel = currentLevel.collectibles.filter(c => ['bone', 'golden_bone', 'gift', 'chili', 'balloon', 'star'].includes(c.type)).length;
      lives = 5;
      score = 0;
      isGameOver = false;

      // Hide dashboard, show canvas
      document.getElementById("dashboard_container").classList.add("hidden");
      document.getElementById("game_container").classList.remove("hidden");
      
      audio.init();
      tick();
    }

    function returnToDashboard() {
      isGameOver = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      
      document.getElementById("game_over_screen").classList.add("hidden");
      document.getElementById("game_container").classList.add("hidden");
      document.getElementById("dashboard_container").classList.remove("hidden");
      
      renderDashboard();
    }

    function triggerGameOver(outcome) {
      isGameOver = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      const title = document.getElementById("ga_title");
      const descr = document.getElementById("ga_descr");
      const savedScore = document.getElementById("ga_score");
      
      if (outcome === 'victory') {
        title.innerText = "STAGE CLEARED! 🎉";
        descr.innerText = "Superb! Floppy reached the safety of the Doghouse Hub!";
        audio.playFanfare();
      } else {
        title.innerText = "OUT OF LIFE ENERGY! 💔";
        descr.innerText = "Spikes or deep water were too much this time. Try again!";
        audio.playFailure();
      }

      if (score > highScore) {
        highScore = score;
        document.getElementById("saved_highscore").innerText = highScore;
      }
      
      savedScore.innerText = score;
      document.getElementById("game_over_screen").classList.remove("hidden");
    }

    // --- KEY LISTENERS ---
    window.addEventListener("keydown", (e) => {
      keysPressed[e.key.toLowerCase()] = true;
      if (['space', 'w', 'arrowup'].includes(e.key.toLowerCase()) || e.keyCode === 32) {
        e.preventDefault();
        triggerJump();
      }
    });
    window.addEventListener("keyup", (e) => {
      keysPressed[e.key.toLowerCase()] = false;
    });

    document.getElementById("mobile_btn_jump").addEventListener("touchstart", (e) => {
      e.preventDefault();
      triggerJump();
    });

    function triggerJump() {
      if (isGameOver || !currentLevel) return;
      if (player.onGround) {
        const vel = player.powerup === 'chili' ? -12.5 : -10.5;
        player.vy = vel;
        player.onGround = false;
        player.ridingPlatformId = null;
        audio.playJump();
      } else if (player.powerup === 'balloon') {
        player.vy = -4.5;
      }
    }

    // --- PHYSICS TICK ---
    function tick() {
      if (isGameOver || !currentLevel) return;
      
      animationTick++;
      const wasOnGround = player.onGround;

      // Decrement timers
      if (player.invincibleTimer > 0) player.invincibleTimer--;
      if (player.powerupTimer > 0) {
        player.powerupTimer--;
        if (player.powerupTimer === 0) {
          player.powerup = null;
          player.width = 48; player.height = 36;
        }
      }

      const isLeft = keysPressed['a'] || keysPressed['arrowleft'];
      const isRight = keysPressed['d'] || keysPressed['arrowright'] || document.getElementById("mobile_btn_right").className.includes("active");

      // Core acceleration physics
      let runSpeed = 4.4;
      if (player.powerup === 'chili') runSpeed = 7.8;
      else if (player.powerup === 'star') runSpeed = 5.8;

      if (isLeft) {
        player.vx = -runSpeed;
        player.facing = 'left';
      } else if (isRight) {
        player.vx = runSpeed;
        player.facing = 'right';
      } else {
        player.vx = 0;
      }

      // Vertical Gravity
      if (!player.onGround) {
        let grav = 0.44;
        let limit = 12;
        if (player.powerup === 'balloon') {
          grav = 0.13; limit = 3.2;
        }
        player.vy += grav;
        if (player.vy > limit) player.vy = limit;
      }

      player.x += player.vx;
      player.y += player.vy;

      // Screen boundary constraints
      if (player.x < 0) player.x = 0;
      if (player.x + player.width > 1000) player.x = 1000 - player.width;

      // Platform Collisions
      let stoodOnSomething = false;
      player.onGround = false;

      currentLevel.platforms.forEach(plat => {
        // Simple AABB Checks
        if (player.x + player.width - 4 > plat.x &&
            player.x + 4 < plat.x + plat.width &&
            player.y + player.height >= plat.y &&
            player.y + player.height - player.vy <= plat.y + 12) {
          
          if (plat.type === 'cloud') {
            // High spring launch
            player.vy = -13.5;
            player.onGround = false;
            stoodOnSomething = true;
            audio.playJump();
          } else {
            player.y = plat.y - player.height;
            player.vy = 0;
            player.onGround = true;
            stoodOnSomething = true;
          }
        }
      });

      if (!stoodOnSomething) {
        player.onGround = false;
      }

      // Check collectibles
      currentLevel.collectibles.forEach(item => {
        if (!item.collected &&
            player.x + player.width > item.x &&
            player.x < item.x + item.width &&
            player.y + player.height > item.y &&
            player.y < item.y + item.height) {
          
          item.collected = true;
          if (['bone', 'golden_bone', 'gift', 'chili', 'balloon', 'star'].includes(item.type)) {
            bonesCollected++;
          }

          if (item.type === 'chili') {
            player.powerup = 'chili';
            player.powerupTimer = 455;
            score += item.points;
            audio.playGoldenCollect();
          } else if (item.type === 'balloon') {
            player.powerup = 'balloon';
            player.powerupTimer = 450;
            player.width = 64; player.height = 48;
            score += item.points;
            audio.playFanfare();
          } else if (item.type === 'star') {
            player.powerup = 'star';
            player.powerupTimer = 500;
            player.invincibleTimer = 500;
            score += item.points;
            audio.playFanfare();
          } else if (item.type === 'heart') {
            lives = Math.min(5, lives + 1);
            audio.playCollect();
          } else {
            score += item.points || 10;
            audio.playCollect();
          }
        }
      });

      // Check spikes or water
      currentLevel.hazards.forEach(hz => {
        if (player.x + player.width > hz.x &&
            player.x < hz.x + hz.width &&
            player.y + player.height > hz.y &&
            player.y < hz.y + hz.height) {
          
          if (player.invincibleTimer === 0 && player.powerup !== 'star') {
            lives--;
            player.invincibleTimer = 85; // Invincible brief period
            audio.playFailure();
            if (lives <= 0) {
              triggerGameOver('defeat');
              return;
            }
          }
        }
      });

      // Goal intersection
      const house = currentLevel.doghouse;
      if (player.x + player.width > house.x &&
          player.x < house.x + house.width &&
          player.y + player.height > house.y &&
          player.y < house.y + house.height) {
        
        triggerGameOver('victory');
        return;
      }

      // Deep void drop
      if (player.y > 580) {
        lives--;
        player.x = currentLevel.startPos.x;
        player.y = currentLevel.startPos.y;
        player.vy = 0;
        audio.playFailure();
        if (lives <= 0) {
          triggerGameOver('defeat');
          return;
        }
      }

      draw();
      animationFrameId = requestAnimationFrame(tick);
    }

    // --- CANVAS RENDERING CORE ---
    function draw() {
      const c = document.getElementById("canvas");
      const ctx = c.getContext("2d");
      
      // Clear with background color gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 560);
      grad.addColorStop(0, currentLevel.bgColorStart || '#1e1b4b');
      grad.addColorStop(1, currentLevel.bgColorEnd || '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1000, 560);

      // Render platforms
      currentLevel.platforms.forEach(plat => {
        ctx.fillStyle = plat.color || currentLevel.groundColor || '#475569';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Give platforms slightly cute rounded caps
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 4);
        ctx.fill();
        ctx.stroke();

        // Platform patterns
        if (plat.type === 'cloud') {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(plat.x + plat.width/2, plat.y + 1, 10, 0, Math.PI*2);
          ctx.arc(plat.x + plat.width/4, plat.y + 1, 7, 0, Math.PI*2);
          ctx.arc(plat.x + (plat.width*3)/4, plat.y + 1, 7, 0, Math.PI*2);
          ctx.fill();
        }
      });

      // Render items
      currentLevel.collectibles.forEach(item => {
        if (item.collected) return;
        const bounce = Math.sin(animationTick * 0.12) * 3;
        const cy = item.y + bounce;
        
        ctx.save();
        if (item.type === 'bone') {
          ctx.fillStyle = '#f8fafc';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(item.x + 3, cy + 4, 12, 6, 2);
          ctx.fill();
          ctx.stroke();
          // bone endpoints knob circles
          ctx.beginPath();
          ctx.arc(item.x + 3, cy + 4, 3, 0, Math.PI*2);
          ctx.arc(item.x + 3, cy + 10, 3, 0, Math.PI*2);
          ctx.arc(item.x + 15, cy + 4, 3, 0, Math.PI*2);
          ctx.arc(item.x + 15, cy + 10, 3, 0, Math.PI*2);
          ctx.fill(); ctx.stroke();
        } else if (item.type === 'heart') {
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(item.x + 5, cy + 5, 5, 0, Math.PI*2);
          ctx.arc(item.x + 13, cy + 5, 5, 0, Math.PI*2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(item.x, cy + 5);
          ctx.lineTo(item.x + 9, cy + 16);
          ctx.lineTo(item.x + 18, cy + 5);
          ctx.closePath();
          ctx.fill();
        } else {
          // generic shiny star represent powerups
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(item.x + 9, cy + 9, 8, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Render hazards
      currentLevel.hazards.forEach(plat => {
        ctx.fillStyle = plat.type === 'mud' ? '#78350f' : '#dc2626';
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 2);
        ctx.fill();
      });

      // Render doghouse
      const dh = currentLevel.doghouse;
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(dh.x, dh.y, dh.width, dh.height, 9);
      ctx.fill(); ctx.stroke();
      // roof
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(dh.x - 8, dh.y + 4);
      ctx.lineTo(dh.x + dh.width / 2, dh.y - 18);
      ctx.lineTo(dh.x + dh.width + 8, dh.y + 4);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Dog drawing!
      drawDog(ctx, player.x + player.width/2, player.y + player.height, player.onGround, player.facing, animationTick, customization, player.powerup);

      // Top Hub overlay directly inside Canvas context
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.beginPath();
      ctx.roundRect(15, 15, 970, 38, 12);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px monospace, monospace';
      ctx.fillText("SCORE: " + score + " | COLLECTED: " + bonesCollected + "/" + bonesInLevel + " | LIVES: " + Array(lives).fill("❤️").join(""), 35, 39);
      
      // Draw active powerup countdowns
      if (player.powerupTimer > 0) {
        ctx.fillStyle = player.powerup === 'chili' ? '#f97316' : player.powerup === 'balloon' ? '#22d3ee' : '#a855f7';
        ctx.fillText("POWER: " + player.powerup.toUpperCase() + " (" + Math.ceil(player.powerupTimer/60) + "s)", 680, 39);
      }
    }

    // --- DASHBOARD AND DOM SYNC ---
    function renderDashboard() {
      const container = document.getElementById("stages_list");
      container.innerHTML = "";
      
      LEVELS.forEach(lvl => {
        const item = document.createElement("div");
        item.className = "p-4 rounded-2xl border-2 border-slate-900 flex justify-between items-center transition " +
          (lvl.id === 5 || lvl.id === 6 ? "bg-amber-50" : "bg-white hover:bg-slate-50");
        
        item.innerHTML = \`
          <div class="space-y-1">
            <span class="font-mono text-[10px] font-black text-slate-400">STAGE 0\${lvl.id}</span>
            <h3 class="font-black text-slate-900 text-sm">\${lvl.name}</h3>
            <p class="text-[11px] text-slate-600 max-w-md">\${lvl.description}</p>
          </div>
          <button onclick="selectStage(\${lvl.id})" class="px-3.5 py-1.5 rounded-xl bg-amber-400 font-black retro-border text-xs retro-shadow select-none active:translate-y-0.5 active:shadow-none">
            PLAY STAGE
          </button>
        \`;
        container.appendChild(item);
      });
      syncCustom();
    }

    function setEar(color) {
      customization.earColor = color;
      syncCustom();
    }
    function toggleSpotted() {
      customization.spotted = !customization.spotted;
      syncCustom();
    }
    function setHat(hat) {
      customization.hat = hat;
      syncCustom();
    }
    function setCollar(col) {
      customization.collar = col;
      syncCustom();
    }
    function toggleAudio() {
      soundEnabled = !soundEnabled;
      document.getElementById("p_sound_btn").innerText = soundEnabled ? "ACTIVE" : "MUTED";
    }

    function syncCustom() {
      // Style ear selections as active
      ['black', 'gray', 'white', 'brown'].forEach(c => {
        const el = document.getElementById("p_ear_" + c);
        if (el) {
          if (customization.earColor === c) {
            el.style.boxShadow = "inset 0 0 0 2.5px #ca8a04";
          } else {
            el.style.boxShadow = "none";
          }
        }
      });
      document.getElementById("p_spot_val").innerText = customization.spotted ? "ON" : "OFF";
      
      ['none', 'detective', 'party', 'tophat', 'crown', 'flower'].forEach(h => {
        const el = document.getElementById("p_hat_" + h);
        if (el) {
          el.className = el.className.split(" ").filter(c => c !== "bg-indigo-100").join(" ");
          if (customization.hat === h) el.className += " bg-indigo-100";
        }
      });
      ['none', 'red_collar', 'gold_bell', 'scarf'].forEach(col => {
        const el = document.getElementById("p_collar_" + col);
        if (el) {
          el.className = el.className.split(" ").filter(c => c !== "bg-pink-100").join(" ");
          if (customization.collar === col) el.className += " bg-pink-100";
        }
      });
    }

    window.onload = () => {
      renderDashboard();
    };
  </script>
</body>
</html>`;
}
