// Game configuration and constants
export const GAME_CONFIG = {
  // Canvas and maze settings
  INITIAL_TILE_SIZE: 40,
  INITIAL_ROWS: 15,
  INITIAL_COLS: 15,
  MAX_CANVAS_SIZE: 600,
  
  // Maze directions
  DIRECTIONS: {
    N: 1,
    S: 2, 
    E: 4,
    W: 8
  },
  
  // Movement deltas
  DX: { 4: 1, 8: -1, 1: 0, 2: 0 }, // E, W, N, S
  DY: { 4: 0, 8: 0, 1: -1, 2: 1 }, // E, W, N, S
  
  // Opposite directions
  OPPOSITE: { 4: 8, 8: 4, 1: 2, 2: 1 }, // E->W, W->E, N->S, S->N
  
  // Game mechanics
  INITIAL_BATTERY: 100,
  INITIAL_BPM: 120,
  INITIAL_LEVEL: 1,
  INITIAL_SCORE: 0,
  
  // Difficulty scaling
  BPM_INCREASE_PER_LEVEL: 15,
  BATTERY_GAIN_PER_LEVEL: 25,
  BATTERY_DRAIN_BASE: 1, // Temporarily increased for testing
  BATTERY_DRAIN_INCREASE: 0.3,
  WALL_PENALTY_BASE: 5,
  WALL_PENALTY_INCREASE: 2,
  
  // Light radius system
  BASE_LIGHT_RADIUS: {
    EARLY: 2.5,    // Levels 1-3
    NORMAL: 2,     // Levels 4-6
    REDUCED: 1.8,  // Levels 7-10
    TIGHT: 1.5,    // Levels 11-15
    MINIMAL: 1.2   // Levels 16+
  },
  
  STREAK_BONUS_MULTIPLIER: 0.3,
  MAX_STREAK_BONUS: 4.5,
  
  // Timing
  FLASH_DURATION_FACTOR: 8000,
  MIN_FLASH_DURATION: 50,
  BEAT_TIMING_TOLERANCE: 0.8,
  BEAT_SAFETY_MULTIPLIER: 1.5,
  
  // Audio
  BEAT_SOUND_DURATION: 0.2,
  BEAT_SOUND_FREQUENCY: 60,
  AUDIO_VOLUME: 0.3,
  
  // BPM detection
  BPM_MIN: 60,
  BPM_MAX: 300,
  
  // Maze size progression
  MAZE_SIZE_PROGRESSION: [
    { maxLevel: 3, size: 15 },
    { maxLevel: 6, size: 18 },
    { maxLevel: 10, size: 20 },
    { maxLevel: Infinity, sizeFormula: (level) => Math.min(25, 15 + Math.floor(level / 2)) }
  ]
};

// Key mappings
export const KEY_MAPPINGS = {
  'ArrowUp': 1,    // N
  'KeyW': 1,       // N
  'ArrowDown': 2,  // S
  'KeyS': 2,       // S
  'ArrowRight': 4, // E
  'KeyD': 4,       // E
  'ArrowLeft': 8,  // W
  'KeyA': 8        // W
};

// Sample songs configuration
export const SAMPLE_SONGS = [
  {
    id: 'prog-electronic',
    name: 'Electronic Pulse',
    bpm: 128,
    description: 'Programmatic electronic beat',
    style: 'electronic'
  },
  {
    id: 'prog-ambient',
    name: 'Ambient Flow',
    bpm: 90,
    description: 'Slower ambient rhythm',
    style: 'ambient'
  },
  {
    id: 'prog-intense',
    name: 'Intense Rush',
    bpm: 160,
    description: 'Fast-paced intense rhythm',
    style: 'intense'
  }
]; 