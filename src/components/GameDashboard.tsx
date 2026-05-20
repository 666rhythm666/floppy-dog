import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Play, Heart, Star, Sparkles, BookOpen, Settings, Check, 
  Volume2, VolumeX, Eye, HelpCircle, Palette, Sun, Shield, Download, Laptop, Smartphone
} from 'lucide-react';
import { generateOfflineSingleFile } from '../utils/offlineExporter';
import { CosmeticHat, CosmeticCollar, PlayerCustomization, LevelDefinition } from '../types';
import { LEVELS } from '../data/levels';

interface GameDashboardProps {
  customization: PlayerCustomization;
  onCustomizationChange: (newCustom: PlayerCustomization) => void;
  unlockedLevelId: number;
  onSelectLevel: (levelId: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  highScore: number;
}

export const GameDashboard: React.FC<GameDashboardProps> = ({
  customization,
  onCustomizationChange,
  unlockedLevelId,
  onSelectLevel,
  soundEnabled,
  onToggleSound,
  highScore
}) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleDownloadOffline = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const htmlContent = generateOfflineSingleFile(customization, highScore);
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Floppy_Island_Run_Offline.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Failed to generate offline file:", err);
      } finally {
        setIsExporting(false);
      }
    }, 1100);
  };

  const earColors: Array<{ id: 'black' | 'brown' | 'white' | 'gray'; label: string; bg: string }> = [
    { id: 'black', label: 'Charcoal Black', bg: 'bg-slate-950 border-slate-700' },
    { id: 'brown', label: 'Chestnut Brown', bg: 'bg-amber-800 border-amber-700' },
    { id: 'gray', label: 'Husky Gray', bg: 'bg-gray-500 border-gray-400' },
    { id: 'white', label: 'Snow White', bg: 'bg-white border-gray-200 text-slate-800' }
  ];

  const hats: Array<{ id: CosmeticHat; label: string; icon: string }> = [
    { id: 'none', label: 'No Hat', icon: '❌' },
    { id: 'detective', label: 'Detective Cap', icon: '🕵️' },
    { id: 'party', label: 'Party Cone', icon: '🎉' },
    { id: 'tophat', label: 'Satin TopHat', icon: '🎩' },
    { id: 'crown', label: 'Royal Crown', icon: '👑' },
    { id: 'flower', label: 'Lilac Flower', icon: '🌸' }
  ];

  const collars: Array<{ id: CosmeticCollar; label: string; icon: string }> = [
    { id: 'none', label: 'No Collar', icon: '❌' },
    { id: 'red_collar', label: 'Red Tag Ribbon', icon: '🔴' },
    { id: 'gold_bell', label: 'Gold Bell Charm', icon: '🔔' },
    { id: 'scarf', label: 'Winter Scarf', icon: '🧣' }
  ];

  const updateEarColor = (color: 'black' | 'brown' | 'white' | 'gray') => {
    onCustomizationChange({ ...customization, earColor: color });
  };

  const updateHat = (hat: CosmeticHat) => {
    onCustomizationChange({ ...customization, hat });
  };

  const updateCollar = (collar: CosmeticCollar) => {
    onCustomizationChange({ ...customization, collar });
  };

  const toggleSpotted = () => {
    onCustomizationChange({ ...customization, spotted: !customization.spotted });
  };

  // Preview helper of our pup
  const earColLabel = earColors.find(c => c.id === customization.earColor)?.label || 'Black';
  const hatLabel = hats.find(h => h.id === customization.hat)?.label || 'None';
  const collarLabel = collars.find(c => c.id === customization.collar)?.label || 'None';

  return (
    <div id="game_dashboard" className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
      
      {/* 1. WELCOME HERO PANEL & HOW TO PLAY (Left 8 Columns) */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Playful Banner (Vibrant Palette Theme) */}
        <div id="hero_banner" className="bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-300 border-4 border-slate-900 p-8 rounded-3xl text-slate-950 shadow-[6px_6px_0_rgba(15,23,42,1)] relative overflow-hidden">
          
          {/* Subtle decoration */}
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/20 rounded-full blur-xl" />
          <div className="absolute left-1/3 top-2 w-32 h-32 bg-yellow-300/30 rounded-full blur-lg" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border-2 border-slate-900 text-slate-950 text-xs font-mono font-black uppercase tracking-wider animate-bounce">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Playful Vector Engine
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm font-sans text-slate-950">
                Floppy's Island Run
              </h1>
              <p className="text-slate-900 font-medium max-w-lg text-sm leading-relaxed">
                Meet our adorable white puppy dog with floppy ears, custom outfit accessories, and a shiny black nose! Jump across colorful ledges, bounce off trampoline cloud beds, and collect tasty dog treats.
              </p>
            </div>

            <div className="flex flex-col items-center bg-white border-4 border-slate-900 px-5 py-4 rounded-2xl text-center self-stretch md:self-auto min-w-[150px] shadow-[4px_4px_0_rgba(15,23,42,1)]">
              <Trophy className="w-6 h-6 text-amber-505 mb-1 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">HI-SCORE</span>
              <span className="font-mono text-2xl font-black text-slate-950">{highScore}</span>
            </div>
          </div>
        </div>

        {/* Level List Picker */}
        <div className="bg-white border-4 border-slate-900 p-6 rounded-3xl shadow-[6px_6px_0_rgba(15,23,42,1)] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b-2 border-slate-100">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500 fill-amber-300" /> Ready to Flap? Select Stage!
            </h2>
            <span className="text-xs font-mono font-extrabold bg-sky-100 border border-sky-300 text-sky-800 px-2 py-0.5 rounded-md">STAGES: {LEVELS.length}</span>
          </div>

          <div id="levels_grid" className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {LEVELS.map((lvl) => {
              const isLocked = lvl.id > unlockedLevelId;
              const isCompleted = lvl.id < unlockedLevelId;
              
              return (
                <div 
                  key={lvl.id} 
                  className={`p-4 rounded-2xl border-2 border-slate-900 transition-all relative overflow-hidden flex flex-col justify-between ${
                    isLocked 
                      ? 'bg-slate-105 opacity-60 shadow-none border-slate-300' 
                      : isCompleted
                      ? 'bg-emerald-50/70 shadow-[3px_3px_0_rgba(15,23,42,1)] hover:bg-emerald-50'
                      : 'bg-indigo-50/50 shadow-[4px_4px_0_rgba(15,23,42,1)] hover:shadow-[2px_2px_0_rgba(15,23,42,1)] hover:translate-y-[2px]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-black text-slate-400 uppercase tracking-widest">Stage 0{lvl.id}</span>
                      
                      {/* Playful status tags */}
                      {isLocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-slate-205 text-slate-400 text-[10px] uppercase font-black border border-slate-350">Locked</span>
                      ) : isCompleted ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] uppercase font-black border border-slate-905 flex items-center gap-0.5">
                          <Check className="w-3 h-3 stroke-[3]" /> Cleared
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-sky-400 text-slate-950 text-[10px] uppercase font-black border border-slate-905 animate-pulse">Ready</span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base">{lvl.name}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                      {lvl.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between">
                    <div className="flex gap-1">
                      {/* Difficulty bar */}
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-3.5 h-1.5 rounded-full border border-slate-950 ${
                            i < lvl.id 
                              ? lvl.id === 4 
                                ? 'bg-rose-500' 
                                : lvl.id === 3 
                                ? 'bg-amber-400' 
                                : 'bg-emerald-405 bg-emerald-400'
                              : 'bg-slate-200'
                          }`} 
                        />
                      ))}
                    </div>

                    <button
                      id={`play_btn_${lvl.id}`}
                      disabled={isLocked}
                      onClick={() => onSelectLevel(lvl.id)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                        isLocked 
                          ? 'bg-slate-100 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none' 
                          : 'bg-amber-450 bg-amber-400 hover:bg-amber-500 active:translate-y-[2px] active:shadow-none border-2 border-slate-900 text-slate-950 cursor-pointer shadow-[2px_2px_0_rgba(15,23,42,1)] uppercase tracking-wider'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-slate-950" /> {isCompleted ? 'Replay' : 'Play'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Rules / Helpful Tips */}
        <div className="bg-slate-950 text-white p-6 rounded-3xl space-y-4 border-4 border-slate-900 shadow-[6px_6px_0_rgba(15,23,42,1)]">
          <h2 className="text-sm font-mono uppercase tracking-widest text-[#22d3ee] flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-cyan-400" /> Mechanics & Elements Guide
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-slate-300">
            <div className="p-3 bg-slate-900 border-2 border-slate-800 rounded-xl space-y-2">
              <span className="text-yellow-400 font-black block">🎮 KEYBOARD</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Move with <strong className="text-white bg-slate-800 border border-slate-700 px-1 py-0.5 rounded">A / D</strong> or <strong className="text-white bg-slate-800 border border-slate-700 px-1 py-0.5 rounded">← / →</strong>.<br />
                Jump with <strong className="text-white bg-slate-800 border border-slate-700 px-1 py-0.5 rounded">SPACE</strong>, <strong className="text-white bg-slate-800 border border-slate-700 px-1 py-0.5 rounded">W</strong>, <strong className="text-white bg-slate-800 border border-slate-700 px-1 py-0.5 rounded">↑</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-900 border-2 border-slate-800 rounded-xl space-y-2">
              <span className="text-sky-300 font-black block">☁️ CLOUDS</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                White fluffy cloud platforms bounce our puppy extremely high! Perfect for grabbing peak scores.
              </p>
            </div>

            <div className="p-3 bg-slate-900 border-2 border-slate-800 rounded-xl space-y-2">
              <span className="text-rose-400 font-black block">🌵 SPIKES & CACTI</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Hurts our puppy and takes 1 heart. Recovery invincibility flickering triggers for a second after a hit.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 2. THE PUPPY SALON CUSTOMIZER (Right 4 Columns) */}
      <div className="lg:col-span-4 space-y-8">
        
        <div className="bg-white border-4 border-slate-900 p-6 rounded-3xl shadow-[6px_6px_0_rgba(15,23,42,1)] space-y-5">
          <div className="pb-3 border-b-2 border-slate-100 flex items-center gap-2">
            <div className="p-2 bg-indigo-500 rounded-xl border-2 border-slate-900 shadow-[1px_1px_0_rgba(15,23,42,1)] text-white animate-pulse">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-none">The Puppy Salon</h2>
              <p className="text-xs text-slate-500 mt-1">Decorate floppy ears, spots & hats</p>
            </div>
          </div>

          {/* Quick Stats overview of Custom status */}
          <div className="flex gap-4 p-4 rounded-2xl bg-indigo-50 border-2 border-slate-900 items-center justify-between shadow-[2px_2px_0_rgba(15,23,42,1)]">
            <div className="flex h-12 w-12 bg-indigo-400 border-2 border-slate-900 rounded-xl items-center justify-center text-slate-950 text-xl font-bold">
              🐶
            </div>
            <div className="flex-1 text-xs">
              <div className="font-extrabold text-indigo-900 text-sm">White Puppy Config</div>
              <div className="text-slate-600 font-medium mt-0.5">{earColLabel} Ears • {customization.spotted ? 'Spotted' : 'Pure White'}</div>
            </div>
          </div>

          {/* Floppy Ear Selection */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-black text-slate-550 text-slate-500 uppercase tracking-widest block">Floppy Ear Color</span>
            <div className="grid grid-cols-2 gap-2">
              {earColors.map((color) => (
                <button
                  key={color.id}
                  id={`ear_btn_${color.id}`}
                  onClick={() => updateEarColor(color.id)}
                  className={`p-2.5 rounded-xl border-2 border-slate-900 text-xs font-black text-left flex items-center justify-between transition-all cursor-pointer shadow-[2px_2px_0_rgba(15,23,42,1)] active:translate-y-[1px] active:shadow-none text-white ${color.bg} ${
                    customization.earColor === color.id 
                      ? 'ring-2 ring-amber-400 ring-offset-2 scale-98 shadow-sm font-black' 
                      : 'hover:opacity-95'
                  }`}
                >
                  <span className={color.id === 'white' ? 'text-slate-900' : 'text-white'}>{color.label}</span>
                  {customization.earColor === color.id && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3.5]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Spotted Back Accent Toggle */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-mono font-black text-slate-500 uppercase tracking-widest block">Coat Spot Pattern</span>
            <button
              id="spot_btn"
              onClick={toggleSpotted}
              className={`w-full p-3 rounded-xl border-2 border-slate-900 text-xs text-left font-extrabold transition-all cursor-pointer flex justify-between items-center shadow-[2px_2px_0_rgba(15,23,42,1)] active:translate-y-[1px] active:shadow-none ${
                customization.spotted 
                  ? 'bg-amber-105 bg-amber-50 text-amber-900' 
                  : 'bg-slate-50 text-slate-705 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>🍪</span>
                <span>{customization.spotted ? 'Cute Beagle Spotted' : 'Solid Milky White'}</span>
              </div>
              <div className={`w-8 h-4 rounded-full p-0.5 transitionborder border-slate-900 border ${customization.spotted ? 'bg-amber-500' : 'bg-slate-300'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-all transform ${customization.spotted ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>

          {/* Cute Hats list */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-mono font-black text-slate-500 uppercase tracking-widest block">Cosmetic Hats Salon</span>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {hats.map((hat) => (
                <button
                  key={hat.id}
                  id={`hat_btn_${hat.id}`}
                  onClick={() => updateHat(hat.id)}
                  className={`p-2 rounded-lg border-2 border-slate-900 flex flex-col items-center justify-center gap-1 transition cursor-pointer shadow-[2px_2px_0_rgba(15,23,42,1)] active:translate-y-[1px] active:shadow-none ${
                    customization.hat === hat.id 
                      ? 'bg-indigo-50 text-indigo-905 scale-95 font-black border-2 border-slate-900 ring-2 ring-amber-400' 
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">{hat.icon}</span>
                  <span className="text-[10px] font-extrabold leading-tight tracking-wider truncate w-full">{hat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Collars Selection */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-mono font-black text-slate-500 uppercase tracking-widest block">Collars and Scarves</span>
            <div className="grid grid-cols-2 gap-2 text-center">
              {collars.map((col) => (
                <button
                  key={col.id}
                  id={`collar_btn_${col.id}`}
                  onClick={() => updateCollar(col.id)}
                  className={`p-2 rounded-xl border-2 border-slate-900 flex items-center justify-start gap-2 transition cursor-pointer text-left shadow-[2px_2px_0_rgba(15,23,42,1)] active:translate-y-[1px] active:shadow-none ${
                    customization.collar === col.id 
                      ? 'bg-pink-50 text-pink-905 scale-95 font-black border-2 border-slate-900 ring-2 ring-amber-400' 
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">{col.icon}</span>
                  <span className="text-[10px] font-extrabold truncate leading-tight">{col.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ambient Synthesizer setup */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500 gap-2">
            <span className="font-bold">Audio Synthesizer:</span>
            <button
              id="salon_btn_music"
              onClick={onToggleSound}
              className={`px-3 py-1.5 rounded-lg border-2 border-slate-900 font-extrabold transition-all cursor-pointer shadow-[2px_2px_0_rgba(15,23,42,1)] active:translate-y-[1px] active:shadow-none flex items-center gap-1 ${
                soundEnabled 
                  ? 'bg-emerald-400 text-slate-950' 
                  : 'bg-slate-100 text-slate-500 border-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 stroke-[2.5]" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? 'ONLINE' : 'MUTED'}</span>
            </button>
          </div>

        </div>

        {/* 3. OFFLINE PLAYROOM INSTALLATION CENTER */}
        <div id="offline_center_card" className="bg-slate-900 text-white p-6 rounded-3xl border-4 border-slate-900 shadow-[6px_6px_0_rgba(15,23,42,1)] space-y-4">
          <div className="pb-2 border-b border-slate-800 flex items-center gap-2">
            <div className="p-1.5 bg-sky-500 rounded-lg text-slate-950 font-black">
              💾
            </div>
            <div>
              <h2 className="text-base font-black leading-none">Playroom Exporter</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Physical files & full offline caching</p>
            </div>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-350 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            <div className="flex gap-2 items-start">
              <span className="text-emerald-400 font-extrabold font-mono text-[11px] h-4 flex items-center">● Ready</span>
              <p className="text-[11px]">
                <strong>Service Worker (PWA):</strong> Fully enabled! Close your tab, turn off WiFi, and reload anytime — the game stays 100% playable in your browser!
              </p>
            </div>
          </div>

          {/* Download Interactive Offline file */}
          <button
            id="offline_export_btn"
            disabled={isExporting}
            onClick={handleDownloadOffline}
            className={`w-full py-3 px-4 rounded-xl border-2 border-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[3px_3px_0_rgba(15,23,42,1)] active:translate-y-[1.5px] active:shadow-none ${
              isExporting
                ? 'bg-amber-100 text-slate-500 border-slate-350 animate-pulse cursor-wait'
                : 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-900 hover:opacity-95'
            }`}
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>{isExporting ? 'Packing Game Assets...' : 'Download Standalone HTML Build'}</span>
          </button>

          {/* Pro Offline Install Tips */}
          <div className="space-y-2.5 pt-1.5">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">Installation Quicktips</span>
            
            <div className="flex gap-2.5 items-start text-[11px] text-slate-350">
              <Smartphone className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-100">iOS & Android:</strong> Tap the browser <span className="text-amber-350 font-bold">"Share"</span> or <span className="text-amber-300 font-bold">"Menu"</span> button, then select <span className="text-sky-300 font-semibold">"Add to Home Screen"</span> to play full-screen offline app!
              </div>
            </div>

            <div className="flex gap-2.5 items-start text-[11px] text-slate-350">
              <Laptop className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-100">Chrome / Edge:</strong> Click the small circular <span className="text-amber-300 font-bold">"Install Game"</span> symbol inside the URL Search bar to run Floppy in its own standalone window app natively!
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
