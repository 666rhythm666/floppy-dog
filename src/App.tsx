import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, RotateCcw, Volume2, VolumeX, Sparkles,
  Play, Pause, ArrowRight, ShieldCheck, Heart, Info, RefreshCw, Dog, Gamepad2, Sparkle
} from 'lucide-react';
import { GameCanvas } from './components/GameCanvas';
import { GameDashboard } from './components/GameDashboard';
import { LEVELS } from './data/levels';
import { PlayerCustomization } from './types';
import { audio } from './utils/audio';

export default function App() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  
  // Persistence state
  const [unlockedLevelId, setUnlockedLevelId] = useState<number>(() => {
    try {
      const persisted = localStorage.getItem('floppy_unlocked_level');
      return persisted ? parseInt(persisted, 10) : 1;
    } catch {
      return 1;
    }
  });

  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const persisted = localStorage.getItem('floppy_highscore');
      return persisted ? parseInt(persisted, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const persisted = localStorage.getItem('floppy_sound_enabled');
      return persisted ? persisted === 'true' : false; // default muted to respect developer context initial block
    } catch {
      return false;
    }
  });

  const [customization, setCustomization] = useState<PlayerCustomization>(() => {
    try {
      const persisted = localStorage.getItem('floppy_customization');
      if (persisted) return JSON.parse(persisted);
    } catch {}
    
    return {
      hat: 'none',
      collar: 'none',
      earColor: 'black',  // Default cute black floppy ears as requested
      bodyColor: '#ffffff', // White dog as requested
      noseColor: '#000000', // Black nose as requested
      spotted: false,
    };
  });

  // Sync state modifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('floppy_unlocked_level', unlockedLevelId.toString());
    } catch {}
  }, [unlockedLevelId]);

  useEffect(() => {
    try {
      localStorage.setItem('floppy_highscore', highScore.toString());
    } catch {}
  }, [highScore]);

  useEffect(() => {
    try {
      localStorage.setItem('floppy_sound_enabled', soundEnabled.toString());
    } catch {}
    audio.toggleSound(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('floppy_customization', JSON.stringify(customization));
    } catch {}
  }, [customization]);

  // Handle Level Completed Event
  const handleLevelComplete = (levelId: number, finalScore: number) => {
    // Save high scores
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }

    // Unlock next level
    const nextLevelId = levelId + 1;
    if (nextLevelId <= LEVELS.length) {
      setUnlockedLevelId(prev => Math.max(prev, nextLevelId));
      setCurrentLevelId(nextLevelId);
      // Stay on same screen but advance layout
    } else {
      // Game fully completed! Back to dashboard with full honors
      setIsPlaying(false);
    }
  };

  const handleSelectLevel = (levelId: number) => {
    // Initialize audio on first click (browser unlock requirement)
    audio.init();
    setCurrentLevelId(levelId);
    setIsPlaying(true);
    
    if (soundEnabled) {
      audio.startMusic();
    }
  };

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    audio.toggleSound(nextVal);
    if (nextVal) {
      audio.startMusic();
    } else {
      audio.stopMusic();
    }
  };

  const handleReturnToDashboard = () => {
    audio.stopMusic();
    setIsPlaying(false);
  };

  return (
    <div id="app_frame" className="min-h-screen bg-[#e2f8ff] text-slate-905 flex flex-col justify-between font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Dynamic Comic-Style Header (Vibrant Palette) */}
      <header id="main_header" className="bg-white border-b-4 border-slate-900 py-3.5 px-6 shadow-[0_4px_0_rgba(15,23,42,1)] select-none z-10 max-w-7xl w-[calc(100%-2rem)] mx-auto mt-4 rounded-2xl">
        <div className="flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-400 border-2 border-slate-900 rounded-xl flex items-center justify-center text-slate-950 shadow-[2px_2px_0_rgba(15,23,42,1)]">
              <Dog className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-sky-600 block">Vibrant Canvas Adventure</span>
              <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">Floppy Dog World</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Direct Switch to Return to Lobby if currently in a game session */}
            {isPlaying && (
              <button
                id="header_btn_exit"
                onClick={handleReturnToDashboard}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-lg border-2 border-slate-800 shadow-[2px_2px_0_rgba(15,23,42,1)] transition-all active:translate-y-[2px] active:shadow-none cursor-pointer uppercase tracking-wider"
              >
                ← Exit to Lobby
              </button>
            )}

            <button
              id="header_btn_sound"
              onClick={toggleSound}
              className={`p-2 rounded-lg border-2 border-slate-800 transition-all shadow-[2px_2px_0_rgba(15,23,42,1)] active:translate-y-[2px] active:shadow-none cursor-pointer ${
                soundEnabled 
                  ? 'bg-emerald-400 text-slate-950' 
                  : 'bg-slate-200 text-slate-500'
              }`}
              title="Toggle Web Audio Synth"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-slate-950" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* Primary Frame Content Wrapper */}
      <main id="main_content" className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!isPlaying ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22 }}
              className="w-full"
            >
              <GameDashboard
                customization={customization}
                onCustomizationChange={setCustomization}
                unlockedLevelId={unlockedLevelId}
                onSelectLevel={handleSelectLevel}
                soundEnabled={soundEnabled}
                onToggleSound={toggleSound}
                highScore={highScore}
              />
            </motion.div>
          ) : (
            <motion.div
              key="gameplay"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="w-full"
            >
              <GameCanvas
                currentLevelId={currentLevelId}
                customization={customization}
                soundEnabled={soundEnabled}
                onToggleSound={setSoundEnabled}
                onLevelComplete={handleLevelComplete}
                onMenuReturn={handleReturnToDashboard}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Playful Footer layout */}
      <footer id="main_footer" className="bg-white border-t-4 border-slate-900 py-3.5 px-6 select-none max-w-7xl w-[calc(100%-2rem)] mx-auto mb-4 rounded-xl shadow-[0_-2px_0_rgba(15,23,42,1)]">
        <div className="flex flex-col md:flex-row justify-between items-center text-xs font-mono text-slate-500 gap-4">
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkle className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Interactive Vector Sandbox in Vibrant Play Style.</span>
          </div>
          <div>
            <span className="font-bold flex items-center gap-1"><kbd className="bg-amber-100 border border-amber-300 px-1 py-0.5 rounded text-amber-800 font-mono">SPACEBAR</kbd> to flap ears and JUMP!</span>
          </div>
        </div>
      </footer>


    </div>
  );
}
