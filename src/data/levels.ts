import { LevelDefinition, Platform, Collectible, Hazard } from '../types';

export const LEVELS: LevelDefinition[] = [
  {
    id: 1,
    name: "Sandy Paths & Green Meadows",
    description: "Learn the basics: Walk with A/D or Arrow Keys, and jump with Space, W, or Up Arrow! Collect some delicious dog bones along the path.",
    bgColorStart: "#e0f2fe", // light blue Sky
    bgColorEnd: "#bae6fd",
    groundColor: "#22c55e", // rich meadow green
    accentColor: "#facc15", // bright yellow
    startPos: { x: 80, y: 400 },
    doghouse: { x: 910, y: 380, width: 70, height: 75, label: "Dog House" },
    platforms: [
      // Ground platforms (with some gaps to jump over!)
      { id: "g1", x: 0, y: 470, width: 350, height: 80, type: "standard" },
      { id: "g2", x: 450, y: 470, width: 550, height: 80, type: "standard" },
      
      // Floating coaching platforms
      { id: "f1", x: 180, y: 370, width: 120, height: 25, type: "standard" },
      { id: "f2", x: 380, y: 310, width: 140, height: 25, type: "standard" },
      { id: "f3", x: 580, y: 350, width: 120, height: 25, type: "standard" },
      { id: "f4", x: 750, y: 260, width: 110, height: 25, type: "standard" },
      { id: "f5", x: 850, y: 380, width: 150, height: 90, type: "standard" }
    ],
    collectibles: [
      { id: "b1", x: 100, y: 430, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.1 },
      { id: "b2", x: 240, y: 330, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.2 },
      { id: "b3", x: 450, y: 270, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.4 },
      { id: "b4", x: 640, y: 310, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.6 },
      { id: "b5", x: 800, y: 220, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.8 },
      { id: "b6", x: 480, y: 430, width: 35, height: 23, type: "golden_bone", points: 50, collected: false, pulseOffset: 1.0 },
      { id: "heart1", x: 770, y: 400, width: 20, height: 20, type: "heart", points: 0, collected: false, pulseOffset: 1.2 }
    ],
    hazards: [
      // Easy level - just a mud puddle at the bottom gap!
      { id: "haz1", x: 350, y: 530, width: 100, height: 20, type: "mud", damage: 1 }
    ]
  },
  {
    id: 2,
    name: "Cloud Hop & Sky Breezes",
    description: "Welcome to the skies! Bounce high off the Puffy Clouds (white pads) and time your jumps carefully with the breeze-guided moving platforms.",
    bgColorStart: "#fef3c7", // sunset orange gradient
    bgColorEnd: "#fde68a",
    groundColor: "#475569", // slate gray rocks
    accentColor: "#f97316", // fiery orange
    startPos: { x: 70, y: 400 },
    doghouse: { x: 880, y: 150, width: 70, height: 75, label: "Sky House" },
    platforms: [
      // Left starting ground
      { id: "p1_start", x: 0, y: 470, width: 200, height: 80, type: "standard" },
      
      // Cloudy bounce pad
      { id: "bounce_cloud_1", x: 250, y: 440, width: 100, height: 30, type: "cloud", color: "#38bdf8" },
      
      // Floating sky high platform
      { id: "sky_f1", x: 180, y: 280, width: 120, height: 25, type: "standard" },
      
      // Moving platform horizontally
      { id: "moving_f1", x: 420, y: 260, width: 110, height: 20, type: "moving", startX: 350, endX: 620, startY: 260, endY: 260, speed: 2, direction: 1 },
      
      // Big cloud platform
      { id: "cloud_platform_1", x: 670, y: 320, width: 160, height: 30, type: "cloud", color: "#38bdf8" },
      
      // Bounce Cloud 2
      { id: "bounce_cloud_2", x: 800, y: 440, width: 90, height: 30, type: "cloud", color: "#38bdf8" },
      
      // Goal platform high up
      { id: "goal_plat", x: 860, y: 245, width: 140, height: 305, type: "standard" }
    ],
    collectibles: [
      { id: "cb1", x: 300, y: 180, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.1 },
      { id: "cb2", x: 480, y: 200, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.3 },
      { id: "cb3", x: 750, y: 250, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.5 },
      { id: "cb4", x: 840, y: 380, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.7 },
      { id: "cb_golden", x: 240, y: 100, width: 35, height: 23, type: "golden_bone", points: 50, collected: false, pulseOffset: 0.9 },
      { id: "cb_gift", x: 920, y: 210, width: 24, height: 24, type: "gift", points: 100, collected: false, pulseOffset: 1.1 }
    ],
    hazards: [
      // Falling into the bottom of the map in sky is instant respawn
      { id: "haz_sky_floor", x: 200, y: 535, width: 660, height: 15, type: "water", damage: 1 }
    ]
  },
  {
    id: 3,
    name: "The Prickly Cactus Valley",
    description: "Ouch! Watch out for the pink-flowered prickly Cacti on the ground and blocks. Jump across moving vertical platforms and retrieve the hidden dog bone treats.",
    bgColorStart: "#ffedd5", // warm clay sunrise
    bgColorEnd: "#fed7aa",
    groundColor: "#c2410c", // reddish dirt
    accentColor: "#ea580c",
    startPos: { x: 70, y: 400 },
    doghouse: { x: 900, y: 400, width: 70, height: 75, label: "Desert Oasis" },
    platforms: [
      { id: "d_g1", x: 0, y: 470, width: 250, height: 80, type: "standard" },
      { id: "d_g2", x: 380, y: 470, width: 300, height: 80, type: "standard" },
      { id: "d_g3", x: 800, y: 470, width: 200, height: 80, type: "standard" },
      
      // Cactus supports
      { id: "d_f1", x: 200, y: 340, width: 100, height: 20, type: "standard" },
      { id: "d_f2", x: 420, y: 290, width: 140, height: 20, type: "standard" },
      
      // Moving platform going up and down vertical
      { id: "d_moving_v1", x: 710, y: 380, width: 80, height: 20, type: "moving", startX: 710, endX: 710, startY: 200, endY: 450, speed: 1.8, direction: 1 },
      
      // Cloud bouncy on top
      { id: "d_cloud", x: 570, y: 190, width: 90, height: 20, type: "cloud", color: "#fbcc15" }
    ],
    collectibles: [
      { id: "db1", x: 250, y: 290, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.1 },
      { id: "db2", x: 450, y: 240, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.3 },
      { id: "db3", x: 610, y: 130, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.5 },
      { id: "db4", x: 750, y: 280, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.7 },
      { id: "db_gold", x: 910, y: 280, width: 35, height: 23, type: "golden_bone", points: 50, collected: false, pulseOffset: 0.9 },
      { id: "db_h", x: 520, y: 430, width: 20, height: 20, type: "heart", points: 0, collected: false, pulseOffset: 1.1 }
    ],
    hazards: [
      // Prickly cacti placements
      { id: "cac1", x: 120, y: 435, width: 24, height: 35, type: "cactus", damage: 1 },
      { id: "cac2", x: 240, y: 305, width: 24, height: 35, type: "cactus", damage: 1 },
      { id: "cac3", x: 480, y: 435, width: 24, height: 35, type: "cactus", damage: 1 },
      { id: "cac4", x: 620, y: 435, width: 24, height: 35, type: "cactus", damage: 1 },
      // Bottom pits
      { id: "pit1", x: 250, y: 535, width: 130, height: 15, type: "mud", damage: 1 },
      { id: "pit2", x: 680, y: 535, width: 120, height: 15, type: "mud", damage: 1 }
    ]
  },
  {
    id: 4,
    name: "The Slippery Summit & Golden Peaks",
    description: "The ultimate peak! Sliding Ice platforms have very low friction. Navigate moving vertical and horizontal elements to retrieve the crown of bones and make it back safe!",
    bgColorStart: "#1e1b4b", // midnight deep dark theme
    bgColorEnd: "#312e81",
    groundColor: "#0284c7", // frosty blue glaciers
    accentColor: "#38bdf8",
    startPos: { x: 50, y: 400 },
    doghouse: { x: 920, y: 130, width: 70, height: 75, label: "Summit Retreat" },
    platforms: [
      // Ground left
      { id: "i1", x: 0, y: 470, width: 200, height: 80, type: "standard" },
      { id: "i_slip1", x: 200, y: 470, width: 350, height: 80, type: "ice" }, // slippery ice ground
      { id: "i2", x: 800, y: 470, width: 200, height: 80, type: "standard" },
      
      // Floating slippery blocks
      { id: "i_slip2", x: 250, y: 340, width: 150, height: 25, type: "ice" },
      
      // Floating vertical moving cloud
      { id: "i_mov1", x: 470, y: 190, width: 90, height: 20, type: "moving", startX: 470, endX: 470, startY: 140, endY: 380, speed: 2, direction: -1 },
      
      // Top clouds leading to the right summit
      { id: "i_c1", x: 620, y: 180, width: 120, height: 20, type: "cloud", color: "#a5f3fc" },
      { id: "i_c2", x: 800, y: 200, width: 200, height: 270, type: "standard" }
    ],
    collectibles: [
      { id: "sum_b1", x: 300, y: 420, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.1 },
      { id: "sum_b2", x: 320, y: 290, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.2 },
      { id: "sum_b3", x: 510, y: 100, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.4 },
      { id: "sum_b4", x: 670, y: 130, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.6 },
      { id: "sum_bgold", x: 880, y: 130, width: 35, height: 23, type: "golden_bone", points: 50, collected: false, pulseOffset: 0.8 },
      { id: "sum_gift", x: 920, y: 420, width: 24, height: 24, type: "gift", points: 100, collected: false, pulseOffset: 1.1 }
    ],
    hazards: [
      // Deep glacial water
      { id: "sum_water", x: 550, y: 520, width: 250, height: 30, type: "water", damage: 1 },
      { id: "cold_spikes", x: 280, y: 445, width: 120, height: 25, type: "spike", damage: 1 }
    ]
  },
  {
    id: 5,
    name: "Volcanic Bounces & Chili Spice Cave",
    description: "Heat up with fiery Chili Peppers! Run like lightning to outpace magma mud, ignore slow-downs, and bounce sky-high off super-bouncy steam platforms!",
    bgColorStart: "#7c2d12", // fiery deep rustic cooper
    bgColorEnd: "#292524", // volcanic ash black
    groundColor: "#ea580c", // molten hot orange lava crust
    accentColor: "#ef4444",
    startPos: { x: 80, y: 400 },
    doghouse: { x: 900, y: 150, width: 70, height: 75, label: "Lava Keep" },
    platforms: [
      // Starting platform
      { id: "v_g1", x: 0, y: 470, width: 220, height: 80, type: "standard" },
      // Magma mud pool in center
      { id: "v_mud1", x: 220, y: 470, width: 340, height: 80, type: "standard" },
      // Sluggish stepping blocks
      { id: "v_b1", x: 300, y: 350, width: 120, height: 25, type: "standard" },
      // Extreme bouncy steam cloud pads
      { id: "v_bouncy1", x: 560, y: 440, width: 90, height: 25, type: "cloud", color: "#f97316" },
      { id: "v_bouncy2", x: 700, y: 340, width: 90, height: 25, type: "cloud", color: "#f97316" },
      // Goal summit
      { id: "v_g2", x: 840, y: 255, width: 160, height: 295, type: "standard" }
    ],
    collectibles: [
      // Spiciest chili power-up placement!
      { id: "v_chili1", x: 120, y: 410, width: 24, height: 24, type: "chili", points: 25, collected: false, pulseOffset: 0.1 },
      { id: "v_chili2", x: 420, y: 200, width: 24, height: 24, type: "chili", points: 25, collected: false, pulseOffset: 0.3 },
      // Regular bones
      { id: "v_b1_pt", x: 310, y: 300, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.5 },
      { id: "v_b2_pt", x: 350, y: 300, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.7 },
      { id: "v_gold", x: 600, y: 150, width: 35, height: 23, type: "golden_bone", points: 50, collected: false, pulseOffset: 0.9 },
      // Friendly heart
      { id: "v_heart", x: 880, y: 200, width: 20, height: 20, type: "heart", points: 0, collected: false, pulseOffset: 1.2 }
    ],
    hazards: [
      // Mud pit traps covering the lava base
      { id: "v_haz_mud", x: 220, y: 450, width: 340, height: 25, type: "mud", damage: 0 },
      // Spiky lava protrusions
      { id: "v_spikes1", x: 340, y: 325, width: 45, height: 25, type: "spike", damage: 1 },
      // Fluid bottomless lava
      { id: "v_lava_pool", x: 560, y: 535, width: 280, height: 15, type: "water", damage: 1 }
    ]
  },
  {
    id: 6,
    name: "Floppy's Cosmic Star Skyway",
    description: "Floating in orbit! Collect Magic Stars for rainbow invinvible armor and grab Helium Balloons to expand, drift slowly, and flap wings/ears to reach orbit!",
    bgColorStart: "#090514", // dark outer space
    bgColorEnd: "#1d103c", // neon cosmic purple nebula
    groundColor: "#7c3aed", // violet asteroids
    accentColor: "#ec4899",
    startPos: { x: 80, y: 400 },
    doghouse: { x: 890, y: 160, width: 70, height: 75, label: "Space Hub" },
    platforms: [
      // Base meteor platform
      { id: "s_g1", x: 0, y: 470, width: 170, height: 80, type: "standard" },
      // Slippery icy comet platform
      { id: "s_comet1", x: 220, y: 400, width: 160, height: 25, type: "ice" },
      // Moving cosmic platform
      { id: "s_move_h", x: 430, y: 300, width: 110, height: 20, type: "moving", startX: 430, endX: 620, startY: 300, endY: 300, speed: 2.2, direction: 1 },
      // Bouncy asteroid clouds leading upwards
      { id: "s_nebula_cloud", x: 670, y: 420, width: 100, height: 25, type: "cloud", color: "#a78bfa" },
      // High retreat landing
      { id: "s_g2", x: 850, y: 255, width: 150, height: 295, type: "standard" }
    ],
    collectibles: [
      // Helium Balloon Power-up
      { id: "s_balloon1", x: 100, y: 360, width: 24, height: 24, type: "balloon", points: 40, collected: false, pulseOffset: 0.1 },
      // Magic Star Power-up
      { id: "s_star1", x: 500, y: 180, width: 24, height: 24, type: "star", points: 50, collected: false, pulseOffset: 0.3 },
      
      // Cosmic treats
      { id: "s_b1", x: 260, y: 350, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.5 },
      { id: "s_b2", x: 320, y: 350, width: 25, height: 16, type: "bone", points: 10, collected: false, pulseOffset: 0.7 },
      { id: "s_b_gold", x: 720, y: 220, width: 35, height: 23, type: "golden_bone", points: 50, collected: false, pulseOffset: 0.9 },
      // Extra gift container
      { id: "s_gift", x: 910, y: 220, width: 24, height: 24, type: "gift", points: 100, collected: false, pulseOffset: 1.1 }
    ],
    hazards: [
      // Falling below into bottomless outer space void is instant respawn
      { id: "s_space_void", x: 170, y: 535, width: 680, height: 15, type: "water", damage: 1 },
      // Comet shards / spikes sitting on landing pads
      { id: "s_shards", x: 280, y: 375, width: 45, height: 25, type: "spike", damage: 1 }
    ]
  }
];
