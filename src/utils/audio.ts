// Web Audio API Procedural Synth for 8-bit Retro Sounds
class GameSoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = false;
  private backgroundMusicNode: OscillatorNode | null = null;
  private musicGainNode: GainNode | null = null;
  private musicInterval: any = null;

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.soundEnabled = true;
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  toggleSound(enabled: boolean) {
    this.soundEnabled = enabled;
    if (enabled) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } else {
      this.stopMusic();
    }
  }

  private playTone(freqStart: number, freqEnd: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.soundEnabled || !this.ctx) return;
    
    // Resume context if suspended (browser security)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playJump() {
    if (!this.soundEnabled || !this.ctx) return;
    
    // Resume context if suspended (browser security)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    
    // Cute procedural dog jump bark ("Ruff!")
    // First snap: rapid downward triangle sweep
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(450, now);
    osc1.frequency.exponentialRampToValueAtTime(155, now + 0.1);
    
    gain1.gain.setValueAtTime(0.11, now);
    gain1.gain.linearRampToValueAtTime(0.01, now + 0.1);
    
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    
    osc1.start();
    osc1.stop(now + 0.1);
    
    // Second trailing rasp: slightly delayed sawtooth bark component
    setTimeout(() => {
      if (!this.soundEnabled || !this.ctx) return;
      const now2 = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(310, now2);
      osc2.frequency.exponentialRampToValueAtTime(110, now2 + 0.09);
      
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, now2);
      
      gain2.gain.setValueAtTime(0.07, now2);
      gain2.gain.linearRampToValueAtTime(0.01, now2 + 0.09);
      
      osc2.connect(filter);
      filter.connect(gain2);
      gain2.connect(this.ctx.destination);
      
      osc2.start();
      osc2.stop(now2 + 0.09);
    }, 40);
  }

  playLand() {
    if (!this.soundEnabled || !this.ctx) return;
    
    // Resume context if suspended
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    const now = this.ctx.currentTime;
    
    // Cute landing mini yelp / quiet pant chirp
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    // Small quick frequency wave
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(390, now + 0.035);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
    
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.linearRampToValueAtTime(0.005, now + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.08);
  }

  playCollect() {
    // Sparkly collection chime: quick arpeggio
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    // First high note
    this.playTone(600, 1000, 0.08, 'square', 0.04);
    setTimeout(() => {
      this.playTone(800, 1200, 0.14, 'square', 0.04);
    }, 50);
  }

  playGoldenCollect() {
    if (!this.soundEnabled || !this.ctx) return;
    // Triumphant double ring
    this.playTone(800, 1600, 0.12, 'square', 0.05);
    setTimeout(() => {
      this.playTone(1000, 2000, 0.22, 'square', 0.05);
    }, 60);
  }

  playHurt() {
    // Depressing falling sweep
    this.playTone(220, 80, 0.25, 'sawtooth', 0.15);
  }

  playFanfare() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, freq * 1.05, 0.35, 'triangle', 0.12);
      }, index * 120);
    });
  }

  startMusic() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    // Stop existing if any
    this.stopMusic();

    let step = 0;
    // Standard cute little pentatonic bassline loop: C -> E -> G -> A
    const notes = [
      // Step A
      261.63, 329.63, 392.00, 329.63,
      261.63, 329.63, 392.00, 329.63,
      // Step B
      293.66, 349.23, 440.00, 349.23,
      293.66, 349.23, 440.00, 349.23,
      // Step C
      349.23, 440.00, 523.25, 440.00,
      392.00, 493.88, 587.33, 493.88,
    ];

    this.musicInterval = setInterval(() => {
      if (!this.soundEnabled || !this.ctx) return;
      
      const currentNoteFreq = notes[step % notes.length];
      // Play background synth note softly
      this.playTone(currentNoteFreq, currentNoteFreq, 0.18, 'sine', 0.025);
      
      step++;
    }, 240); // 125BPM beat
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new GameSoundManager();
export default audio;
