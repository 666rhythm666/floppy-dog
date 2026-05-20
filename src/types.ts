export type PlatformType = 'standard' | 'moving' | 'bouncy' | 'cloud' | 'ice';

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PlatformType;
  color?: string;
  // For moving platforms
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  speed?: number;
  direction?: 1 | -1;
  phase?: number;
}

export type CollectibleType = 'bone' | 'golden_bone' | 'gift' | 'heart' | 'chili' | 'balloon' | 'star';

export interface Collectible {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: CollectibleType;
  points: number;
  collected: boolean;
  pulseOffset: number;
}

export interface Hazard {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cactus' | 'spike' | 'water' | 'mud';
  damage: number;
  // Moving hazards
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  speed?: number;
  direction?: 1 | -1;
}

export interface Portal {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface LevelDefinition {
  id: number;
  name: string;
  description: string;
  platforms: Platform[];
  collectibles: Collectible[];
  hazards: Hazard[];
  doghouse: Portal;
  startPos: { x: number; y: number };
  bgColorStart: string;
  bgColorEnd: string;
  groundColor: string;
  accentColor: string;
  musicTempo?: number;
}

export type CosmeticHat = 'none' | 'detective' | 'party' | 'tophat' | 'crown' | 'flower';
export type CosmeticCollar = 'none' | 'red_collar' | 'gold_bell' | 'scarf';

export interface PlayerCustomization {
  hat: CosmeticHat;
  collar: CosmeticCollar;
  earColor: 'black' | 'brown' | 'white' | 'gray';
  bodyColor: '#ffffff' | '#fcfbf7' | '#f3f4f6'; // shades of white as per requirement
  noseColor: '#000000'; // black nose as per requirement
  spotted: boolean;
}

export interface ScoreEntry {
  name: string;
  score: number;
  level: number;
  date: string;
}
