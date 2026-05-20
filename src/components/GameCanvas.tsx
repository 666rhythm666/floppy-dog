import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, RotateCcw, Volume2, VolumeX, Sparkles, 
  Play, Pause, ArrowRight, ShieldCheck, Heart, Info, RefreshCw
} from 'lucide-react';
import { Platform, Collectible, Hazard, LevelDefinition, PlayerCustomization } from '../types';
import { LEVELS } from '../data/levels';
import { drawDog } from './RetroDogRenderer';
import { audio } from '../utils/audio';

interface GameCanvasProps {
  currentLevelId: number;
  customization: PlayerCustomization;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  onLevelComplete: (levelId: number, finalScore: number) => void;
  onMenuReturn: () => void;
}

// Particle class for stylish retro visual effects
interface GameParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'sparkle' | 'dust' | 'splash' | 'heart';
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentLevelId,
  customization,
  soundEnabled,
  onToggleSound,
  onLevelComplete,
  onMenuReturn,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Level setup
  const [level, setLevel] = useState<LevelDefinition>(() => {
    const found = LEVELS.find(l => l.id === currentLevelId) || LEVELS[0];
    // Deep clone to reset "collected" state
    return JSON.parse(JSON.stringify(found));
  });

  // Game state
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isLevelCleared, setIsLevelCleared] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [bonesInLevel, setBonesInLevel] = useState<number>(0);
  const [bonesCollected, setBonesCollected] = useState<number>(0);
  const [isControlsExpanded, setIsControlsExpanded] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(180); // 3 minutes standard target

  // Refs for instantaneous physics tracking inside the requestAnimationFrame loop
  const playerRef = useRef({
    x: level.startPos.x,
    y: level.startPos.y,
    vx: 0,
    vy: 0,
    width: 48,
    height: 36,
    facing: 'right' as 'left' | 'right',
    onGround: false,
    invincibleTimer: 0, // frame counter
    ridingPlatformId: null as string | null,
    ridingPlatLastX: 0,
    ridingPlatLastY: 0,
    powerup: null as 'chili' | 'balloon' | 'star' | null,
    powerupTimer: 0,
  });

  const keysPressed = useRef<Record<string, boolean>>({});
  const animationTickRef = useRef<number>(0);
  const particlesRef = useRef<GameParticle[]>([]);
  const lastTimeRef = useRef<number>(0);
  const countdownTimerInterval = useRef<any>(null);

  // Initialize level metrics on change
  useEffect(() => {
    const found = LEVELS.find(l => l.id === currentLevelId) || LEVELS[0];
    const cloned = JSON.parse(JSON.stringify(found));
    setLevel(cloned);
    
    // Count total treats
    const totalBones = cloned.collectibles.filter((c: any) => 
      c.type === 'bone' || c.type === 'golden_bone' || c.type === 'gift' || 
      c.type === 'chili' || c.type === 'balloon' || c.type === 'star'
    ).length;
    setBonesInLevel(totalBones);
    setBonesCollected(0);
    setIsGameOver(false);
    setIsLevelCleared(false);
    setTimeRemaining(180);

    // Reset player position
    playerRef.current = {
      x: cloned.startPos.x,
      y: cloned.startPos.y,
      vx: 0,
      vy: 0,
      width: 48,
      height: 36,
      facing: 'right',
      onGround: false,
      invincibleTimer: 0,
      ridingPlatformId: null,
      ridingPlatLastX: 0,
      ridingPlatLastY: 0,
      powerup: null,
      powerupTimer: 0,
    };
    particlesRef.current = [];
  }, [currentLevelId]);

  // Handle keys pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      keysPressed.current[e.code.toLowerCase()] = true; // backups

      // Trigger jump instantly on key down (to prevent lazy latency checks)
      const isJumpKey = (e.key === ' ' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'w');
      if (isJumpKey && !isPaused && !isGameOver && !isLevelCleared) {
        // Prevent browser viewport scrolling downwards on Spacebar
        e.preventDefault();
        triggerJump();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
      keysPressed.current[e.code.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused, isGameOver, isLevelCleared, level]);

  // Handle level timer Countdown
  useEffect(() => {
    if (isPaused || isGameOver || isLevelCleared) {
      if (countdownTimerInterval.current) clearInterval(countdownTimerInterval.current);
      return;
    }

    countdownTimerInterval.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          audio.playHurt();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerInterval.current) clearInterval(countdownTimerInterval.current);
    };
  }, [isPaused, isGameOver, isLevelCleared]);

  // Canvas scaling layout calculation
  const getCanvasScale = () => {
    if (!canvasRef.current || !containerRef.current) return { x: 1, y: 1 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: rect.width / 1000,
      y: rect.height / 550
    };
  };

  // Sound enablement sync
  const toggleSoundState = () => {
    const nextState = !soundEnabled;
    onToggleSound(nextState);
    audio.toggleSound(nextState);
    if (nextState) {
      audio.startMusic();
    } else {
      audio.stopMusic();
    }
  };

  // Core physics triggering jump
  const triggerJump = () => {
    const player = playerRef.current;
    if (player.onGround) {
      const jumpVel = player.powerup === 'chili' ? -12.5 : -10.5;
      player.vy = jumpVel; // Upward velocity (negative is up on canvas)
      player.onGround = false;
      player.ridingPlatformId = null;
      audio.playJump();

      // Emit fluffy jump dust particles at bottom-center of dog
      createEmitterParticles(player.x + player.width / 2, player.y + player.height, 'dust', '#f3f4f6', 12);
    } else if (player.powerup === 'balloon') {
      // Balloon mid-air flappy hover jump!
      player.vy = -4.5;
      audio.playLand(); // Plays landing chirpy sound as a quick little mid-air flap!
      createEmitterParticles(player.x + player.width / 2, player.y + player.height / 2, 'sparkle', '#a5f3fc', 8);
    }
  };

  const createEmitterParticles = (x: number, y: number, type: 'sparkle' | 'dust' | 'splash' | 'heart', color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (type === 'sparkle' ? 4 : 2) + 0.8;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'dust' ? 1 : 1.5), // slight drift upwards
        size: Math.random() * (type === 'sparkle' ? 5 : 8) + 2,
        color,
        alpha: 1.0,
        life: 0,
        maxLife: Math.random() * 25 + 15,
        type
      });
    }
  };

  const handleManualJump = () => {
    if (!isPaused && !isGameOver && !isLevelCleared) {
      triggerJump();
    }
  };

  const handleRespawn = () => {
    const player = playerRef.current;
    player.x = level.startPos.x;
    player.y = level.startPos.y;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    player.ridingPlatformId = null;
    player.invincibleTimer = 80; // short invincibility blink filter
  };

  // Primary requestAnimationFrame central game engine
  useEffect(() => {
    let animId: number;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      updatePhysics();
      renderGame();

      animId = requestAnimationFrame(gameLoop);
    };

    // Update physical coordinate movements
    const updatePhysics = () => {
      if (isPaused || isGameOver || isLevelCleared) return;

      animationTickRef.current += 1;
      const player = playerRef.current;
      const wasOnGround = player.onGround;

      // Invincibility ticks down
      if (player.invincibleTimer > 0) {
        player.invincibleTimer--;
      }

      // Powerup ticks down
      if (player.powerupTimer > 0) {
        player.powerupTimer--;
        if (player.powerupTimer === 0) {
          player.powerup = null;
          // Switch player size back to default when balloon ends
          player.width = 48;
          player.height = 36;
        }
      }

      // Power-up visual trail emission
      if (player.powerup === 'chili') {
        if (animationTickRef.current % 2 === 0) {
          const fx = player.facing === 'right' ? player.x : player.x + player.width;
          const fy = player.y + player.height / 2 + (Math.random() * 10 - 5);
          particlesRef.current.push({
            x: fx,
            y: fy,
            vx: (player.facing === 'right' ? -2.5 : 2.5) - player.vx * 0.2,
            vy: Math.sin(animationTickRef.current * 0.1) * 0.4 - 0.5,
            size: Math.random() * 6 + 3,
            color: Math.random() > 0.45 ? '#f97316' : '#ef4444', // Orange or red flame glow
            alpha: 1.0,
            life: 0,
            maxLife: Math.random() * 15 + 10,
            type: 'sparkle'
          });
        }
      } else if (player.powerup === 'balloon') {
        if (animationTickRef.current % 5 === 0) {
          const bx = player.x + Math.random() * player.width;
          const by = player.y + player.height;
          particlesRef.current.push({
            x: bx,
            y: by,
            vx: Math.random() * 0.6 - 0.3,
            vy: Math.random() * 0.4 + 0.4,
            size: Math.random() * 4 + 2,
            color: '#a5f3fc', // Cyan light breeze
            alpha: 0.8,
            life: 0,
            maxLife: Math.random() * 20 + 15,
            type: 'dust'
          });
        }
      } else if (player.powerup === 'star') {
        if (animationTickRef.current % 3 === 0) {
          const colors = ['#f43f5e', '#fbbf24', '#34d399', '#60a5fa', '#c084fc'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          particlesRef.current.push({
            x: player.x + Math.random() * player.width,
            y: player.y + Math.random() * player.height,
            vx: Math.random() * 1.2 - 0.6,
            vy: -0.6 - Math.random() * 0.6,
            size: Math.random() * 5 + 2,
            color: randomColor,
            alpha: 1.0,
            life: 0,
            maxLife: Math.random() * 25 + 10,
            type: 'sparkle'
          });
        }
      }

      // --- MOVING PLATFORMS COORDINATE DRIFTS ---
      // Update moving platform coordinates before calculating collision so dog rides smoothly
      level.platforms.forEach(plat => {
        if (plat.type === 'moving' && plat.startX !== undefined && plat.endX !== undefined && plat.startY !== undefined && plat.endY !== undefined) {
          if (plat.speed === undefined) plat.speed = 2;
          if (plat.direction === undefined) plat.direction = 1;
          if (plat.phase === undefined) plat.phase = 0;

          // Standard bounce route calculation
          const maxDistX = plat.endX - plat.startX;
          const maxDistY = plat.endY - plat.startY;

          plat.phase += (plat.speed / 150) * plat.direction;
          
          let pct = (Math.sin(plat.phase) + 1) / 2; // oscillates 0 to 1

          const prevX = plat.x;
          const prevY = plat.y;

          plat.x = plat.startX + maxDistX * pct;
          plat.y = plat.startY + maxDistY * pct;

          // If our dog is riding this platform, apply this frame delta directly!
          if (player.ridingPlatformId === plat.id) {
            const dx = plat.x - prevX;
            const dy = plat.y - prevY;
            player.x += dx;
            // Align dog's vertical exactly with platform's floating change
            player.y = plat.y - player.height;
          }
        }
      });

      // --- HORIZONTAL MOVEMENT CONTROLS & FRICTION ---
      // Distinguish ice sliding physics versus standard running land
      const isLeft = keysPressed.current['a'] || keysPressed.current['arrowleft'];
      const isRight = keysPressed.current['d'] || keysPressed.current['arrowright'];

      // Check current standing platform type to apply relevant friction
      let currentPlatformType: string = 'standard';
      if (player.onGround && player.ridingPlatformId) {
        const p = level.platforms.find(plat => plat.id === player.ridingPlatformId);
        if (p) currentPlatformType = p.type;
      }

      if (currentPlatformType === 'ice') {
        // ICE PHYSICS: sliding, low friction coefficient (Speed up if Chili)
        const iceAccel = player.powerup === 'chili' ? 0.35 : 0.15;
        const iceMaxSpeed = player.powerup === 'chili' ? 9.0 : 5.5;
        const iceFriction = 0.985;

        if (isLeft) {
          player.vx -= iceAccel;
          player.facing = 'left';
        } else if (isRight) {
          player.vx += iceAccel;
          player.facing = 'right';
        }
        
        // Cap speed
        player.vx = Math.max(-iceMaxSpeed, Math.min(iceMaxSpeed, player.vx));
        
        // slow passive deceleration
        if (!isLeft && !isRight) {
          player.vx *= iceFriction;
          if (Math.abs(player.vx) < 0.05) player.vx = 0;
        }
      } else if (currentPlatformType === 'mud' && player.powerup !== 'chili' && player.powerup !== 'star') {
        // MUD HAZARD PHYSICS: extremely sluggish speed, no jumping allowed (unless powered up!)
        const mudMaxSpeed = 1.5;
        if (isLeft) {
          player.vx = -mudMaxSpeed;
          player.facing = 'left';
        } else if (isRight) {
          player.vx = mudMaxSpeed;
          player.facing = 'right';
        } else {
          player.vx = 0;
        }
      } else {
        // STANDARD GRASS / STONE PHYSICS: crisp acceleration, swift halt
        let runSpeed = 4.4;
        if (player.powerup === 'chili') {
          runSpeed = 7.8;
        } else if (player.powerup === 'star') {
          runSpeed = 5.8;
        }

        if (isLeft) {
          player.vx = -runSpeed;
          player.facing = 'left';
        } else if (isRight) {
          player.vx = runSpeed;
          player.facing = 'right';
        } else {
          // Swift drag
          player.vx *= 0.72;
          if (Math.abs(player.vx) < 0.02) player.vx = 0;
        }
      }

      // --- VERTICAL PHYSICS ENGINE (GRAVITY AND VIRTUAL COORDS) ---
      if (!player.onGround) {
        // GRAVITY APPLIED AS PER SPEC
        let gravityVal = 0.44;
        let termVel = 12;
        if (player.powerup === 'balloon') {
          gravityVal = 0.13; // very floaty air drift
          termVel = 3.2; // slow fall rate
        }
        player.vy += gravityVal; // 8-bit aesthetic drift
        if (player.vy > termVel) player.vy = termVel; // Terminal fallback velocity
      }

      // Apply horizontal position change
      player.x += player.vx;
      
      // Virtual bounding edges check horizontally (stay inside map!)
      if (player.x < 0) {
        player.x = 0;
        player.vx = 0;
      }
      if (player.x + player.width > 1000) {
        player.x = 1000 - player.width;
        player.vx = 0;
      }

      // Apply vertical position change
      player.y += player.vy;

      // --- PLATFORM COLLISION CHECKS ---
      // We look ahead to check if the dog lands onto the top level surface of any platform.
      let fellOnPlatform = false;

      // Iterate through the platform arrays
      for (const plat of level.platforms) {
        const platX = plat.x;
        const platY = plat.y;
        const platW = plat.width;
        const platH = plat.height;

        // Custom bounds detection (AABB bounding box)
        if (
          player.x + player.width - 10 > platX && 
          player.x + 8 < platX + platW
        ) {
          // Landing condition:
          // Dog was previously higher than platform top, and now crosses top boundary downwards
          const wasAbove = (player.y + player.height - player.vy) <= (platY + 6);
          const isEntering = (player.y + player.height) >= platY;

          if (wasAbove && isEntering && player.vy >= 0) {
            // Check cloud (Super high jump boost trampoline pads!)
            if (plat.type === 'cloud') {
              player.vy = -12.5; // Launch dog skyward!
              player.onGround = false;
              player.ridingPlatformId = null;
              audio.playJump();
              createEmitterParticles(player.x + player.width / 2, platY, 'sparkle', '#2dd4bf', 15);
              fellOnPlatform = true;
              break;
            }

            // Normal landing
            player.y = platY - player.height;
            player.vy = 0;
            player.onGround = true;
            player.ridingPlatformId = plat.id;
            fellOnPlatform = true;
            break;
          }
        }
      }

      // If the dog didn't hit any platform and was previously on land, release anchoring
      if (!fellOnPlatform) {
        player.onGround = false;
        player.ridingPlatformId = null;
      }

      // --- HAZARD COLLISION SENSORS ---
      for (const hazard of level.hazards) {
        // AABB check with slightly tucked boundaries for fair play
        if (
          player.x + player.width - 12 > hazard.x &&
          player.x + 12 < hazard.x + hazard.width &&
          player.y + player.height - 4 > hazard.y &&
          player.y + 12 < hazard.y + hazard.height
        ) {
          if (hazard.type === 'water') {
            // Instant pit loss!
            handleInstantLifeLoss();
            break;
          } else if (hazard.type === 'mud') {
            // Handled as standing friction adjustment (sluggish walking, zero jump speed)
            // But if they sink deeply, subtract fraction of timing
          } else {
            // Spikes or Prickly Cacti: Hurts player with temporary blinking invincibility
            if (player.invincibleTimer === 0) {
              handleMinorDamage();
              break;
            }
          }
        }
      }

      // --- COLLECTIBLES HARVESTING ---
      level.collectibles.forEach(item => {
        if (!item.collected) {
          // AABB Collision overlap between player dog and bone
          if (
            player.x + player.width - 6 > item.x &&
            player.x + 6 < item.x + item.width &&
            player.y + player.height - 6 > item.y &&
            player.y + 6 < item.y + item.height
          ) {
            // Harvest item!
            item.collected = true;
            
            // Add scores
             if (item.type === 'bone') {
              setScore(prev => prev + item.points);
              setBonesCollected(prev => prev + 1);
              audio.playCollect();
              createEmitterParticles(item.x + item.width / 2, item.y + item.height / 2, 'sparkle', '#facc15', 6);
            } else if (item.type === 'golden_bone') {
              setScore(prev => prev + item.points);
              setBonesCollected(prev => prev + 1);
              audio.playGoldenCollect();
              createEmitterParticles(item.x + item.width / 2, item.y + item.height / 2, 'sparkle', '#fbbf24', 20);
            } else if (item.type === 'gift') {
              setScore(prev => prev + item.points);
              setBonesCollected(prev => prev + 1);
              audio.playFanfare();
              createEmitterParticles(item.x + item.width / 2, item.y + item.height / 2, 'sparkle', '#cbd5e1', 25);
            } else if (item.type === 'heart') {
              setLives(prev => Math.min(5, prev + 1));
              audio.playCollect();
              createEmitterParticles(item.x + item.width / 2, item.y + item.height / 2, 'heart', '#f43f5e', 14);
            } else if (item.type === 'chili') {
              player.powerup = 'chili';
              player.powerupTimer = 400; // ~6.5 seconds
              // Reset any size factors
              player.width = 48;
              player.height = 36;
              setScore(prev => prev + item.points);
              setBonesCollected(prev => prev + 1);
              audio.playGoldenCollect();
              createEmitterParticles(item.x + item.width / 2, item.y + item.height / 2, 'sparkle', '#f97316', 22);
            } else if (item.type === 'balloon') {
              player.powerup = 'balloon';
              player.powerupTimer = 450; // ~7.5 seconds
              player.width = 64; // puff up the dog boundaries!
              player.height = 48;
              setScore(prev => prev + item.points);
              setBonesCollected(prev => prev + 1);
              audio.playFanfare();
              createEmitterParticles(item.x + item.width / 2, item.y + item.height / 2, 'sparkle', '#a5f3fc', 22);
            } else if (item.type === 'star') {
              player.powerup = 'star';
              player.powerupTimer = 500; // ~8.3 seconds
              player.invincibleTimer = 500; // immune to damage
              player.width = 48;
              player.height = 36;
              setScore(prev => prev + item.points);
              setBonesCollected(prev => prev + 1);
              audio.playFanfare();
              createEmitterParticles(item.x + item.width / 2, item.y + item.height / 2, 'sparkle', '#8b5cf6', 30);
            }
          }
        }
      });

      // --- LEVEL EXIT / DOGHOUSE VERIFICATION ---
      const house = level.doghouse;
      if (
        player.x + player.width / 2 > house.x &&
        player.x + player.width / 2 < house.x + house.width &&
        player.y + player.height - 12 > house.y &&
        player.y < house.y + house.height
      ) {
        // Spark celebratory trigger
        triggerLevelCleared();
      }

      // --- FALLOUT RADAR (pitfalls) ---
      if (player.y > 540) {
        handleInstantLifeLoss();
      }

      // --- ANIMATED PARTICLES MOVEMENT ---
      particlesRef.current.forEach(part => {
        part.x += part.vx;
        part.y += part.vy;
        part.life++;
        part.alpha = 1 - part.life / part.maxLife;
      });
      // Filter dead ones
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);

      // Trigger landing sound if the dog lands onto any platform
      if (!wasOnGround && player.onGround) {
        audio.playLand();
      }
    };

    const handleMinorDamage = () => {
      const player = playerRef.current;
      setLives(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setIsGameOver(true);
          audio.stopMusic();
          audio.playHurt();
        } else {
          audio.playHurt();
          // Knockback dog
          player.vx = player.facing === 'right' ? -4 : 4;
          player.vy = -3.5;
          player.onGround = false;
          player.ridingPlatformId = null;
          player.invincibleTimer = 85; // Invincibility frames
        }
        return next;
      });
    };

    const handleInstantLifeLoss = () => {
      setLives(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setIsGameOver(true);
          audio.stopMusic();
          audio.playHurt();
        } else {
          audio.playHurt();
          handleRespawn();
        }
        return next;
      });
    };

    const triggerLevelCleared = () => {
      setIsLevelCleared(true);
      audio.stopMusic();
      audio.playFanfare();
      
      // Calculate bonus
      const timeBonus = Math.max(0, timeRemaining * 5);
      const levelBonus = currentLevelId * 200;
      setScore(prev => prev + timeBonus + levelBonus);

      // Spark massive celebratory fireworks inside the canvas!
      createEmitterParticles(500, 250, 'sparkle', '#facc15', 30);
      createEmitterParticles(250, 180, 'sparkle', '#fb7185', 25);
      createEmitterParticles(750, 180, 'sparkle', '#38bdf8', 25);
    };

    // Main 2D Canvas Drawer
    const renderGame = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear previous frames
      ctx.clearRect(0, 0, 1000, 550);

      // --- 1. BACKGROUND (Parallax, gradient sky) ---
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 550);
      bgGrad.addColorStop(0, level.bgColorStart);
      bgGrad.addColorStop(1, level.bgColorEnd);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1000, 550);

      // Draw warm glowing sun or night moon depending on theme
      const isNight = level.bgColorStart === '#1e1b4b'; // Level 4
      ctx.save();
      if (isNight) {
        // Glowing Neon Silver Moon
        ctx.fillStyle = '#f1f5f9';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(800, 100, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
        // Draw moon craters
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(785, 90, 6, 0, Math.PI * 2);
        ctx.arc(810, 110, 5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Warm retro yellow sun
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(820, 95, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      // Parallax rolling clouds
      ctx.fillStyle = isNight ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.45)';
      const cloudTick = animationTickRef.current * 0.15;
      
      ctx.beginPath();
      ctx.arc((150 + cloudTick) % 1150 - 100, 140, 45, 0, Math.PI * 2);
      ctx.arc((190 + cloudTick) % 1150 - 100, 130, 60, 0, Math.PI * 2);
      ctx.arc((240 + cloudTick) % 1150 - 100, 140, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc((550 + cloudTick) % 1150 - 100, 120, 35, 0, Math.PI * 2);
      ctx.arc((590 + cloudTick) % 1150 - 100, 110, 50, 0, Math.PI * 2);
      ctx.arc((635 + cloudTick) % 1150 - 100, 120, 35, 0, Math.PI * 2);
      ctx.fill();

      // --- 2. PLATFORMS RENDERING ---
      level.platforms.forEach(plat => {
        ctx.save();
        
        if (plat.type === 'cloud') {
          // Bouncy cloud drawing style
          ctx.fillStyle = plat.color || '#ffffff';
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Draw fluffy clouds using overlapping arcs
          const r = plat.height * 0.9;
          const circlesCount = Math.floor(plat.width / 22);
          for (let i = 0; i <= circlesCount; i++) {
            const arcX = plat.x + (plat.width / circlesCount) * i;
            ctx.arc(arcX, plat.y + plat.height / 2, r, 0, Math.PI * 2);
          }
          ctx.fill();
          
          // Draw sweet bounding blue stripes to indicate trampoline!
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(plat.x + 10, plat.y, plat.width - 20, 5);
        } else {
          // Normal block drawing
          let fillStyle = '#854d0e'; // Default dirt brown
          let strokeStyle = '#451a03';
          
          if (plat.type === 'ice') {
            fillStyle = '#a5f3fc'; // slippery light cyan glacier
            strokeStyle = '#0284c7';
          } else if (plat.type === 'moving') {
            fillStyle = '#475569'; // grey block slider
            strokeStyle = '#1e293b';
          }

          // Render platform base
          ctx.fillStyle = fillStyle;
          ctx.strokeStyle = strokeStyle;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 4);
          ctx.fill();
          ctx.stroke();

          // Green Grass tops for meadow levels
          if (plat.type === 'standard' && level.groundColor === '#22c55e') {
            ctx.fillStyle = '#22c55e'; // Grass layer
            ctx.fillRect(plat.x, plat.y, plat.width, 8);
          } else if (plat.type === 'standard' && level.id === 3) {
            // Sand top
            ctx.fillStyle = '#ea580c';
            ctx.fillRect(plat.x, plat.y, plat.width, 7);
          }
        }
        ctx.restore();
      });

      // --- 3. HAZARDS RENDERING ---
      level.hazards.forEach(haz => {
        ctx.save();
        if (haz.type === 'cactus') {
          // Draw cute desert cactus
          ctx.fillStyle = '#16a34a'; // green torso
          ctx.strokeStyle = '#14532d';
          ctx.lineWidth = 2;

          // Main vertical bar
          ctx.beginPath();
          ctx.roundRect(haz.x + haz.width/2 - 4, haz.y, 8, haz.height, 4);
          ctx.fill();
          ctx.stroke();

          // Left floppy arm
          ctx.beginPath();
          ctx.moveTo(haz.x + haz.width/2 - 4, haz.y + 16);
          ctx.lineTo(haz.x, haz.y + 16);
          ctx.lineTo(haz.x, haz.y + 6);
          ctx.lineWidth = 3.5;
          ctx.stroke();

          // Right arm
          ctx.beginPath();
          ctx.moveTo(haz.x + haz.width/2 + 4, haz.y + 10);
          ctx.lineTo(haz.x + haz.width, haz.y + 10);
          ctx.lineTo(haz.x + haz.width, haz.y + 2);
          ctx.stroke();

          // Cute pink flower on top peak of cactus!
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(haz.x + haz.width/2, haz.y, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (haz.type === 'spike') {
          // Sharp blue crystal glaciers or metal spike row
          ctx.fillStyle = '#94a3b8';
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1;
          const spikeWidth = 15;
          const count = Math.ceil(haz.width / spikeWidth);
          for (let i = 0; i < count; i++) {
            ctx.beginPath();
            ctx.moveTo(haz.x + i * spikeWidth, haz.y + haz.height);
            ctx.lineTo(haz.x + i * spikeWidth + spikeWidth / 2, haz.y);
            ctx.lineTo(haz.x + (i + 1) * spikeWidth, haz.y + haz.height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        } else if (haz.type === 'water') {
          // Dynamic waving blue water
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.moveTo(haz.x, haz.y);
          const t = animationTickRef.current * 0.08;
          for (let stepX = 0; stepX <= haz.width; stepX += 15) {
            const waveY = haz.y + Math.sin(stepX * 0.05 + t) * 4;
            ctx.lineTo(haz.x + stepX, waveY);
          }
          ctx.lineTo(haz.x + haz.width, haz.y + haz.height);
          ctx.lineTo(haz.x, haz.y + haz.height);
          ctx.closePath();
          ctx.fill();
        } else if (haz.type === 'mud') {
          // Brown thick sludge mud puddle backplate
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.roundRect(haz.x, haz.y, haz.width, haz.height, 6);
          ctx.fill();
        }
        ctx.restore();
      });

      // --- 4. COLLECTIBLES RENDERING ---
      level.collectibles.forEach(item => {
        if (item.collected) return;
        
        ctx.save();
        const floatDelta = Math.sin(animationTickRef.current * 0.06 + item.pulseOffset) * 3.5;
        const cy = item.y + floatDelta;

        if (item.type === 'bone' || item.type === 'golden_bone') {
          // Render beautiful 8-bit bone
          const isGold = item.type === 'golden_bone';
          
          ctx.fillStyle = isGold ? '#fbbf24' : '#f8fafc';
          ctx.strokeStyle = isGold ? '#b45309' : '#cbd5e1';
          ctx.lineWidth = 2;
          
          // Draw bone shaft
          ctx.beginPath();
          ctx.roundRect(item.x + 4, cy + item.height/2 - 2, item.width - 8, 4, 1);
          ctx.fill();
          ctx.stroke();

          // Left two bone bulbs
          ctx.beginPath();
          ctx.arc(item.x + 4, cy + item.height/2 - 3, 3.5, 0, Math.PI * 2);
          ctx.arc(item.x + 4, cy + item.height/2 + 3, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Right two bone bulbs
          ctx.beginPath();
          ctx.arc(item.x + item.width - 4, cy + item.height/2 - 3, 3.5, 0, Math.PI * 2);
          ctx.arc(item.x + item.width - 4, cy + item.height/2 + 3, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (item.type === 'heart') {
          // Glowing red extra live heart
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          const hw = item.width / 2;
          const hTop = cy + 4;
          ctx.moveTo(item.x + hw, cy + item.height - 2);
          // Left curve
          ctx.bezierCurveTo(item.x - 2, cy + 4, item.x, hTop - 3, item.x + hw, cy + 5);
          // Right curve
          ctx.bezierCurveTo(item.x + item.width, cy + 5, item.x + item.width + 2, cy + 4, item.x + hw, cy + item.height - 2);
          ctx.fill();
        } else if (item.type === 'gift') {
          // Wrapped gift container overlay box
          ctx.fillStyle = '#a855f7'; // Purple wrap
          ctx.fillRect(item.x, cy, item.width, item.height);
          ctx.fillStyle = '#eab308'; // Golden ribbon stripes
          ctx.fillRect(item.x + item.width / 2 - 2, cy, 4, item.height);
          ctx.fillRect(item.x, cy + item.height / 2 - 2, item.width, 4);
          // Bow ribbon loops
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(item.x + item.width/2 - 3, cy - 2, 3, 0, Math.PI*2);
          ctx.arc(item.x + item.width/2 + 3, cy - 2, 3, 0, Math.PI*2);
          ctx.stroke();
        } else if (item.type === 'chili') {
          // Fire hot red chili pepper
          ctx.fillStyle = '#ef4444'; // Red chili
          ctx.beginPath();
          ctx.ellipse(item.x + item.width / 2, cy + item.height / 2 + 1, 8, 11, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          
          // Green stem
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(item.x + item.width / 2 - 1, cy + 3);
          ctx.quadraticCurveTo(item.x + item.width / 2 - 5, cy - 2, item.x + item.width / 2 - 7, cy - 1);
          ctx.stroke();
          
          // Yellow fire glow pulsing outline
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(item.x + item.width / 2, cy + item.height / 2, 12 + Math.sin(animationTickRef.current * 0.12) * 2.5, 0, Math.PI * 2);
          ctx.stroke();
        } else if (item.type === 'balloon') {
          // Waving cute floating Helium balloon
          ctx.fillStyle = '#06b6d4'; // Bright cyan balloon
          ctx.strokeStyle = '#0891b2';
          ctx.lineWidth = 1.2;
          
          ctx.beginPath();
          ctx.ellipse(item.x + item.width / 2, cy + item.height / 2 - 3, 9, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Balloon tie
          ctx.fillStyle = '#0891b2';
          ctx.beginPath();
          ctx.moveTo(item.x + item.width / 2, cy + item.height / 2 + 9);
          ctx.lineTo(item.x + item.width / 2 - 3, cy + item.height / 2 + 13);
          ctx.lineTo(item.x + item.width / 2 + 3, cy + item.height / 2 + 13);
          ctx.closePath();
          ctx.fill();
          
          // String waving
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(item.x + item.width / 2, cy + item.height / 2 + 13);
          ctx.quadraticCurveTo(item.x + item.width / 2 + Math.sin(animationTickRef.current * 0.1) * 3, cy + item.height - 1, item.x + item.width / 2, cy + item.height + 4);
          ctx.stroke();
        } else if (item.type === 'star') {
          // 5-point rotating shiny rainbow star
          ctx.save();
          ctx.translate(item.x + item.width / 2, cy + item.height / 2);
          ctx.rotate(animationTickRef.current * 0.04);
          
          ctx.fillStyle = '#eab308'; // Sparkly yellow star
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const spikes = 5;
          const outerR = 12;
          const innerR = 5;
          let rot = (Math.PI / 2) * 3;
          const step = Math.PI / spikes;
          
          ctx.moveTo(0, -outerR);
          for (let i = 0; i < spikes; i++) {
            ctx.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
            rot += step;
            ctx.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR);
            rot += step;
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      });

      // --- 5. THE TARGET DOG HOUSE EXIT ---
      const house = level.doghouse;
      ctx.save();
      // Wooden kennel box base
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(house.x, house.y + 15, house.width, house.height - 15, 4);
      ctx.fill();
      ctx.stroke();

      // Slanted red triangular roof tops!
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(house.x - 8, house.y + 15);
      ctx.lineTo(house.x + house.width / 2, house.y);
      ctx.lineTo(house.x + house.width + 8, house.y + 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Black open tunnel entry doorway
      ctx.fillStyle = '#1e1b4b'; // deep dark entryway
      ctx.beginPath();
      ctx.roundRect(house.x + house.width/2 - 16, house.y + house.height - 35, 32, 35, 6);
      ctx.fill();

      // "HOME" writing label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("Floppy Home", house.x + house.width / 2, house.y + 28);
      ctx.restore();

      // --- 6. THE PLAYER (WHITE FLOOPY DOG COMPONENT) ---
      const player = playerRef.current;
      
      // Hit flash effect blink filter (drawn every alternate frame if invincible)
      const isVisible = player.invincibleTimer === 0 || (Math.floor(player.invincibleTimer / 4) % 2 === 0);
      if (isVisible) {
        drawDog(
          ctx,
          player.x,
          player.y,
          player.width,
          player.height,
          player.vx,
          player.vy,
          player.onGround,
          player.facing,
          animationTickRef.current,
          customization,
          player.powerup
        );
      }

      // --- 7. PARTICLES DRAWING ---
      particlesRef.current.forEach(part => {
        ctx.save();
        ctx.globalAlpha = part.alpha;
        ctx.fillStyle = part.color;

        if (part.type === 'heart') {
          // Tiny glowing custom heart particle shapes!
          ctx.beginPath();
          ctx.arc(part.x - 2, part.y, part.size / 2, 0, Math.PI * 2);
          ctx.arc(part.x + 2, part.y, part.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (part.type === 'sparkle') {
          // Sharp rotating star diamond sparkle
          ctx.beginPath();
          ctx.moveTo(part.x, part.y - part.size);
          ctx.lineTo(part.x + part.size / 2, part.y);
          ctx.lineTo(part.x, part.y + part.size);
          ctx.lineTo(part.x - part.size / 2, part.y);
          ctx.closePath();
          ctx.fill();
        } else {
          // Rounded dust clouds or water splashes
          ctx.beginPath();
          ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // --- DRAW RETRO POWERUP INDICATOR PANEL DIRECTLY ON CANVAS ---
      if (player.powerupTimer > 0 && player.powerup) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const bannerW = 185;
        const bannerH = 26;
        const bannerX = 500 - bannerW / 2;
        const bannerY = 75; // nice and clear below top bar
        
        // Draw banner frame
        ctx.fillStyle = '#0f172a'; // dark charcoal
        ctx.strokeStyle = '#facc15'; // yellow border
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 10);
        ctx.fill();
        ctx.stroke();
        
        let labelText = '';
        let fontColor = '#ffffff';
        if (player.powerup === 'chili') {
          labelText = `🔥 CHILI SPICE: ${Math.ceil(player.powerupTimer / 60)}s`;
          fontColor = '#f97316';
        } else if (player.powerup === 'balloon') {
          labelText = `🎈 HELIUM FLOAT: ${Math.ceil(player.powerupTimer / 60)}s`;
          fontColor = '#22d3ee';
        } else if (player.powerup === 'star') {
          labelText = `⭐ SUPER STAR: ${Math.ceil(player.powerupTimer / 60)}s`;
          fontColor = '#a855f7';
        }
        
        ctx.fillStyle = fontColor;
        ctx.font = 'black 10px monospace, Courier New, monospace';
        ctx.fillText(labelText, 500, bannerY + bannerH / 2 + 1);
        ctx.restore();
      }

      // --- Helper visual overlays ---
      // If paused, dark blur overlay is drawn via React Framer-Motion for maximum style
    };

    animId = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [level, isPaused, isGameOver, isLevelCleared, customization]);

  return (
    <div id="game_container" className="relative w-full flex flex-col justify-between items-center" style={{ height: '560px' }}>
      
      {/* HUD Top Bar details (Vibrant Palette style with comic containers) */}
      <div id="game_hud" className="absolute top-3 left-3 right-3 flex justify-between items-center bg-white/95 backdrop-blur-sm border-2 border-slate-900 px-4 py-2 rounded-2xl text-slate-900 select-none z-10 shadow-[3px_3px_0_rgba(15,23,42,1)]">
        
        {/* Left Side Statuses */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-300 border border-slate-900 px-3 py-1 rounded-xl shadow-[1px_1px_0_rgba(15,23,42,1)]">
            <Trophy className="w-4 h-4 text-slate-950" />
            <span className="font-mono font-black text-xs text-slate-950">Score: {score}</span>
          </div>

          <div className="flex items-center gap-1 bg-rose-50 border border-slate-200 px-2.5 py-1 rounded-xl">
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart 
                key={i} 
                className={`w-4 h-4 transition-all duration-300 ${
                  i < lives 
                    ? 'text-rose-500 fill-rose-500 scale-110 drop-shadow-[0_1px_2px_rgba(244,63,94,0.4)]' 
                    : 'text-slate-300 scale-90 opacity-40'
                }`} 
              />
            ))}
          </div>
        </div>

        {/* Level Banner */}
        <div className="hidden md:flex flex-col items-center">
          <h2 className="font-sans font-black text-xs uppercase tracking-widest text-indigo-900 bg-indigo-50 border border-indigo-200 px-3 py-0.5 rounded-full">{level.name}</h2>
          <span className="font-mono text-[10px] font-black text-sky-700 mt-0.5">Stage {level.id} of {LEVELS.length}</span>
        </div>

        {/* Right Side Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-sky-200 border border-slate-900 px-3 py-1 rounded-xl shadow-[1px_1px_0_rgba(15,23,42,1)]">
            <span className="font-mono text-[10px] font-bold text-sky-800 uppercase tracking-wider">Treats:</span>
            <span className="font-mono font-black text-xs text-slate-950">{bonesCollected}/{bonesInLevel}</span>
          </div>

          <div className="flex items-center gap-1 bg-amber-100 border border-slate-900 px-3 py-1 rounded-xl shadow-[1px_1px_0_rgba(15,23,42,1)]">
            <span className="font-mono text-[10px] font-bold text-amber-800 uppercase tracking-wider">Time:</span>
            <span className={`font-mono font-black text-xs ${timeRemaining < 30 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>

          {/* Sound, pause and info buttons with playful pop */}
          <div className="flex items-center gap-1">
            <button 
              id="hud_btn_music"
              onClick={toggleSoundState}
              className={`p-1.5 rounded-lg border-2 border-slate-900 transition-all shadow-[1.5px_1.5px_0_rgba(15,23,42,1)] active:translate-y-[1px] active:shadow-none cursor-pointer ${
                soundEnabled 
                  ? 'bg-emerald-400 text-slate-950' 
                  : 'bg-slate-100 text-slate-400'
              }`}
              title="Toggle Synth Sound"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 stroke-[2.5]" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button 
              id="hud_btn_pause"
              onClick={() => setIsPaused(prev => !prev)}
              className="p-1.5 rounded-lg bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0_rgba(15,23,42,1)] active:translate-y-[1px] active:shadow-none cursor-pointer transition"
              title="Pause Game"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-slate-950" /> : <Pause className="w-3.5 h-3.5 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Primary HTML5 Canvas Frame wrapper in Vibrant Comic board style */}
      <div 
        ref={containerRef} 
        className="relative w-full h-[550px] bg-sky-100 rounded-3xl border-[6px] border-slate-900 shadow-[10px_10px_0_rgba(15,23,42,1)] overflow-hidden cursor-crosshair group"
      >
        <canvas 
          ref={canvasRef}
          width={1000}
          height={550}
          className="w-full h-full block object-fill"
          onClick={handleManualJump}
        />

        {/* Touch / Click Help Callout overlays */}
        <div className="absolute bottom-3 left-4 text-slate-500 font-mono text-[10px] opacity-0 group-hover:opacity-80 transitionDuration-500 pointer-events-none select-none">
          Click Inside Screen or Press [SPACE] To Jump
        </div>

        {/* OVERLAYS USING INTERACTIVE FRAMER-MOTION */}
        <AnimatePresence>
          {/* PAUSE SCREEN */}
          {isPaused && (
            <motion.div 
              id="overlay_paused"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col justify-center items-center z-20 text-white"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-md bg-slate-900 border-2 border-indigo-500 p-8 rounded-3xl text-center space-y-6 shadow-2xl"
              >
                <div className="mx-auto w-16 h-16 bg-indigo-500/20 border-2 border-indigo-400 rounded-full flex justify-center items-center animate-pulse">
                  <Pause className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-3xl font-bold tracking-tight">Game Paused</h3>
                <p className="text-sm text-slate-400 px-4">
                  Take a quick breathing break! Our fluffy puppy dog is resting happily. Press any control buttons below to resume.
                </p>

                <div className="flex gap-4 justify-center">
                  <button 
                    id="pause_resume"
                    onClick={() => setIsPaused(false)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition shadow-md shadow-emerald-700/30"
                  >
                    <Play className="w-4 h-4" /> Resume Game
                  </button>
                  <button 
                    id="pause_exit"
                    onClick={onMenuReturn}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-bold transition border border-slate-700"
                  >
                    Main Menu
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* GAME OVER SCREEN */}
          {isGameOver && (
            <motion.div 
              id="overlay_gameover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col justify-center items-center z-25 text-white"
            >
              <motion.div 
                initial={{ scale: 0.9, rotate: -2 }}
                animate={{ scale: 1, rotate: 0 }}
                className="max-w-md bg-slate-900 border-2 border-rose-500/50 p-8 rounded-3xl text-center space-y-6 shadow-[0_0_30px_rgba(244,63,94,0.15)]"
              >
                <div className="mx-auto w-16 h-16 bg-rose-500/10 border-2 border-rose-500 rounded-full flex justify-center items-center">
                  <RotateCcw className="w-8 h-8 text-rose-500 animate-spin" />
                </div>
                <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-500">
                  Doggie got tired...
                </h3>
                <p className="text-sm text-slate-400">
                  You ran out of timing or took too much damage! Don't let your ears drop - try again to win maximum score!
                </p>

                <div className="p-4 bg-slate-850/60 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-slate-400">Treats Earned:</span>
                    <span className="text-teal-400 font-bold">{bonesCollected} / {bonesInLevel}</span>
                  </div>
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-slate-400">Final score:</span>
                    <span className="text-yellow-400 font-bold">{score}</span>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button 
                    id="gameover_retry"
                    onClick={() => {
                      setIsGameOver(false);
                      setLives(3);
                      setScore(0);
                      setLevel(JSON.parse(JSON.stringify(LEVELS.find(l => l.id === currentLevelId) || LEVELS[0])));
                      handleRespawn();
                      if (soundEnabled) audio.startMusic();
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 rounded-xl font-bold transition shadow-md shadow-rose-705/30"
                  >
                    <RefreshCw className="w-4 h-4" /> Try Again
                  </button>
                  <button 
                    id="gameover_exit"
                    onClick={onMenuReturn}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition"
                  >
                    Main Menu
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* LEVEL CLEARED CONGRATULATIONS */}
          {isLevelCleared && (
            <motion.div 
              id="overlay_cleared"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col justify-center items-center z-20 text-white"
            >
              <motion.div 
                initial={{ scale: 0.9, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-md bg-slate-900 border-2 border-emerald-500 p-8 rounded-3xl text-center space-y-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
              >
                <div className="mx-auto w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex justify-center items-center">
                  <Sparkles className="w-8 h-8 text-emerald-400 animate-bounce" />
                </div>
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-300">
                  Level Cleared! 🎉
                </h3>
                <p className="text-sm text-slate-400">
                  Amazing work! Your white puppy dog made it safely to the cozy dog house with floppy ears flapping beautifully.
                </p>

                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between font-mono text-xs text-slate-400">
                    <span>Clean Clearance Bonus:</span>
                    <span className="text-emerald-400 font-bold">+ {currentLevelId * 200}</span>
                  </div>
                  <div className="flex justify-between font-mono text-xs text-slate-400">
                    <span>Remaining Time Bonus:</span>
                    <span className="text-emerald-400 font-bold">+ {Math.max(0, timeRemaining * 5)}</span>
                  </div>
                  <div className="h-[1px] bg-slate-800 my-1" />
                  <div className="flex justify-between font-mono text-sm font-bold">
                    <span className="text-white">New Total Score:</span>
                    <span className="text-amber-400">{score}</span>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button 
                    id="cleared_next"
                    onClick={() => {
                      onLevelComplete(currentLevelId, score);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition shadow-lg shadow-emerald-705/30 text-white"
                  >
                    Next Level <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    id="cleared_exit"
                    onClick={onMenuReturn}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition"
                  >
                    End Session
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls Visualization (Vibrant Palette Theme) */}
      <div className="w-full bg-white/70 backdrop-blur-md p-4 rounded-3xl mt-4 border-4 border-slate-900 shadow-[6px_6px_0_rgba(15,23,42,1)] flex flex-wrap md:flex-nowrap justify-between items-center gap-6 select-none">
        
        {/* Movements keys with beautiful physical keycaps */}
        <div className="flex items-center gap-4 flex-1 justify-center md:justify-start">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex gap-1.5">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-900 border-2 border-slate-900 shadow-[1.5px_1.5px_0_rgba(15,23,42,1)] text-xs">W</div>
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-900 border-2 border-slate-900 shadow-[1.5px_1.5px_0_rgba(15,23,42,1)] text-xs">A</div>
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-900 border-2 border-slate-900 shadow-[1.5px_1.5px_0_rgba(15,23,42,1)] text-xs">S</div>
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-900 border-2 border-slate-900 shadow-[1.5px_1.5px_0_rgba(15,23,42,1)] text-xs">D</div>
            </div>
            <span className="text-[10px] uppercase font-black text-indigo-900 tracking-wider">Move keys / Left-Right</span>
          </div>
        </div>

        <div className="hidden md:block h-10 w-[2px] bg-slate-900/30"></div>

        {/* Spacebar to Jump Assist Button with actual trigger event */}
        <div className="flex flex-col items-center gap-1.5 flex-1 justify-center">
          <button
            id="mobile_tap_jump"
            onClick={handleManualJump}
            className="w-56 h-10 bg-amber-400 hover:bg-amber-500 font-sans font-black text-slate-950 border-2 border-slate-900 rounded-xl shadow-[3px_3px_0_rgba(15,23,42,1)] transition-all active:translate-y-[2px] active:shadow-none cursor-pointer uppercase tracking-wider text-xs flex items-center justify-center"
          >
            Space to Jump!
          </button>
          <span className="text-[10px] uppercase font-black text-amber-800 tracking-wider">Jump Force: Click to test</span>
        </div>

        <div className="hidden md:block h-10 w-[2px] bg-slate-900/30"></div>

        {/* Live Vector Variables panel */}
        <div className="flex items-center gap-3 justify-center md:justify-end flex-1 font-mono text-[11px] font-black">
          <div className="flex flex-col items-end gap-1 text-slate-905">
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-bold uppercase tracking-wide">GRAVITY:</span>
              <span className="bg-sky-100 text-sky-800 border border-sky-300 px-1.5 py-0.5 rounded font-black">-0.65v</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-bold uppercase tracking-wide">PHYSICS:</span>
              <span className="bg-emerald-100 text-[#047857] border border-emerald-300 px-1.5 py-0.5 rounded font-black">RUNNING</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
