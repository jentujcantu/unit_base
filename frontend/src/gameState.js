import { GAME_CONFIG } from './config.js';
import { generateMaze, generateRandomExit, getMazeSizeForLevel } from './maze.js';
import { audioSystem } from './audio.js';

class GameState {
  constructor() {
    this.reset();
  }

  /**
   * Reset the game state to initial values
   */
  reset() {
    // Core game state
    this.score = GAME_CONFIG.INITIAL_SCORE;
    this.level = GAME_CONFIG.INITIAL_LEVEL;
    this.battery = GAME_CONFIG.INITIAL_BATTERY;
    this.levelStartBattery = GAME_CONFIG.INITIAL_BATTERY;
    
    // Game state flags
    this.running = false;
    this.paused = false;
    
    // Timing variables
    this.bpm = GAME_CONFIG.INITIAL_BPM;
    this.beatLen = 60000 / this.bpm;
    this.flashDur = Math.max(GAME_CONFIG.FLASH_DURATION_FACTOR / this.bpm, GAME_CONFIG.MIN_FLASH_DURATION);
    this.lastBeat = 0;
    this.startTime = 0;
    this.expectedBeatCount = 0;
    this.beatCounter = 0;
    
    // Player state
    this.player = { x: 0, y: 0 };
    this.moveReady = true;
    this.playerMovedThisBeat = false;
    
    // Movement tracking for battery cost
    this.moveCount = 0;
    
    // Streak system
    this.beatStreak = 0;
    this.maxStreak = 0;
    this.currentLightRadius = this.getBaseLightRadius();
    this.pulseIntensity = 1;
    
    // Difficulty variables
    this.batteryDrainRate = GAME_CONFIG.BATTERY_DRAIN_BASE;
    this.wallPenalty = GAME_CONFIG.WALL_PENALTY_BASE;
    
    // Canvas/maze variables
    this.TILE = GAME_CONFIG.INITIAL_TILE_SIZE;
    this.ROWS = GAME_CONFIG.INITIAL_ROWS;
    this.COLS = GAME_CONFIG.INITIAL_COLS;
    this.maze = null;
    this.exit = null;
  }

  /**
   * Initialize a new level
   */
  initLevel() {
    // Progressive maze size increases
    const { rows, cols } = getMazeSizeForLevel(this.level);
    this.ROWS = rows;
    this.COLS = cols;
    
    // Adjust canvas and tile size for larger mazes
    this.TILE = Math.floor(GAME_CONFIG.MAX_CANVAS_SIZE / Math.max(this.ROWS, this.COLS));
    
    // Update canvas size
    const canvas = document.getElementById('game');
    if (canvas) {
      canvas.width = this.COLS * this.TILE;
      canvas.height = this.ROWS * this.TILE;
    }
    
    // Generate new maze and exit
    this.maze = generateMaze(this.ROWS, this.COLS);
    this.player = { x: 0, y: 0 };
    this.exit = generateRandomExit(this.ROWS, this.COLS);
    
    // Enhanced battery management - gain health on level up
    if (this.level === 1) {
      this.battery = GAME_CONFIG.INITIAL_BATTERY;
    } else {
      this.battery = Math.min(this.battery + GAME_CONFIG.BATTERY_GAIN_PER_LEVEL, GAME_CONFIG.INITIAL_BATTERY);
    }
    
    // Track starting battery level for drain calculation
    this.levelStartBattery = this.battery;
    
    // Enhanced BPM progression with song integration
    this.updateBPMForLevel();
    this.updateDifficultyForLevel();
    this.resetStreakSystem();
    this.resetTiming();
    
    // Reset move count for new level
    this.moveCount = 0;
  }

  /**
   * Update BPM based on current level and song
   */
  updateBPMForLevel() {
    const currentSong = audioSystem.currentSongData;
    
    if (currentSong) {
      this.bpm = audioSystem.baseBPM + (this.level - 1) * GAME_CONFIG.BPM_INCREASE_PER_LEVEL;
      
      // Adjust song playback rate to match the increased BPM
      if (currentSong.isUserUploaded || currentSong.isProgrammatic) {
        const playbackRate = this.bpm / audioSystem.baseBPM;
        audioSystem.setPlaybackRate(playbackRate);
        console.log(`Level ${this.level}: Adjusted song playback rate to ${playbackRate.toFixed(2)}x (${this.bpm} BPM)`);
      }
    } else {
      this.bpm = GAME_CONFIG.INITIAL_BPM + (this.level - 1) * GAME_CONFIG.BPM_INCREASE_PER_LEVEL;
    }
    
    this.beatLen = 60000 / this.bpm;
    this.flashDur = Math.max(GAME_CONFIG.FLASH_DURATION_FACTOR / this.bpm, GAME_CONFIG.MIN_FLASH_DURATION);
  }

  /**
   * Update difficulty scaling for current level
   */
  updateDifficultyForLevel() {
    this.batteryDrainRate = GAME_CONFIG.BATTERY_DRAIN_BASE + (this.level - 1) * GAME_CONFIG.BATTERY_DRAIN_INCREASE;
    this.wallPenalty = GAME_CONFIG.WALL_PENALTY_BASE + (this.level - 1) * GAME_CONFIG.WALL_PENALTY_INCREASE;
  }

  /**
   * Get base light radius for current level
   */
  getBaseLightRadius() {
    if (this.level <= 3) {
      return GAME_CONFIG.BASE_LIGHT_RADIUS.EARLY;
    } else if (this.level <= 6) {
      return GAME_CONFIG.BASE_LIGHT_RADIUS.NORMAL;
    } else if (this.level <= 10) {
      return GAME_CONFIG.BASE_LIGHT_RADIUS.REDUCED;
    } else if (this.level <= 15) {
      return GAME_CONFIG.BASE_LIGHT_RADIUS.TIGHT;
    } else {
      return GAME_CONFIG.BASE_LIGHT_RADIUS.MINIMAL;
    }
  }

  /**
   * Reset streak system for new level
   */
  resetStreakSystem() {
    this.beatStreak = 0;
    this.maxStreak = 0;
    this.currentLightRadius = this.getBaseLightRadius();
    this.pulseIntensity = 1;
    this.playerMovedThisBeat = false;
    this.moveReady = true;
  }

  /**
   * Reset timing variables
   */
  resetTiming() {
    this.lastBeat = performance.now();
    this.startTime = performance.now();
    this.beatCounter = 0;
    this.expectedBeatCount = 0;
  }

  /**
   * Start the game
   */
  start() {
    this.running = true;
    this.paused = false;
    this.initLevel();
  }

  /**
   * Pause the game
   */
  pause() {
    this.paused = true;
    audioSystem.pause();
  }

  /**
   * Resume the game
   */
  resume() {
    this.paused = false;
    audioSystem.resume();
    // Reset timing to prevent beat drift
    this.lastBeat = performance.now();
    this.startTime = performance.now() - (this.level - 1) * 60000; // Adjust start time
  }

  /**
   * End the game
   */
  gameOver() {
    this.running = false;
    this.paused = false;
    audioSystem.pause();
  }

  /**
   * Quit to main menu
   */
  quitToMenu() {
    this.reset();
    audioSystem.pause();
  }

  /**
   * Advance to next level
   */
  nextLevel() {
    this.score += this.battery * 100 + this.level * 1000;
    this.level++;
    this.initLevel();
  }

  /**
   * Handle successful player move
   */
  onSuccessfulMove() {
    this.playerMovedThisBeat = true;
    
    // Check win condition first
    if (this.player.x === this.exit.x && this.player.y === this.exit.y) {
      this.nextLevel();
      return true; // Level completed
    }
    
    // Increment move counter
    this.moveCount++;
    
    // Move cost - higher levels cost battery every 10 moves (instead of every move)
    if (this.level > 5 && this.moveCount % 10 === 0) {
      this.battery -= Math.floor(this.level / 5);
    }
    
    // Successful move - increase streak and light radius
    this.beatStreak++;
    this.maxStreak = Math.max(this.maxStreak, this.beatStreak);
    
    // Calculate light radius based on streak
    const streakBonus = Math.min(GAME_CONFIG.MAX_STREAK_BONUS, this.beatStreak * GAME_CONFIG.STREAK_BONUS_MULTIPLIER);
    this.currentLightRadius = this.getBaseLightRadius() + streakBonus;
    
    // Play beat sound feedback
    audioSystem.playBeatSound();
    
    return false; // Level not completed
  }

  /**
   * Handle failed move (wall collision or bounds)
   */
  onFailedMove() {
    this.battery -= this.wallPenalty;
    this.beatStreak = 0;
    this.currentLightRadius = this.getBaseLightRadius();
    this.playerMovedThisBeat = true; // Mark as moved for timing purposes
  }

  /**
   * Handle beat timing
   */
  onBeat() {
    this.beatCounter++;
    
    let streakReset = false;
    
    // If player had a previous move opportunity but didn't use it, reset streak
    if (this.moveReady && !this.playerMovedThisBeat) {
      this.beatStreak = 0;
      this.currentLightRadius = this.getBaseLightRadius();
      streakReset = true;
    }
    
    // Reset for next beat
    this.playerMovedThisBeat = false;
    this.moveReady = true;
    
    // Game over check
    if (this.battery <= 0) {
      this.gameOver();
      return { gameOver: true, streakReset: false };
    }
    
    return { gameOver: false, streakReset };
  }

  /**
   * Update battery drain based on elapsed time
   */
  updateBatteryDrain(currentTime) {
    const elapsed = currentTime - this.startTime;
    const expectedBattery = Math.max(0, this.levelStartBattery - Math.floor(elapsed * this.batteryDrainRate / 1000));
    
    if (this.battery > expectedBattery) {
      this.battery = expectedBattery;
      return true; // Battery changed
    }
    
    return false; // No change
  }

  /**
   * Check if should trigger beat based on timing
   */
  shouldTriggerBeat(currentTime) {
    let shouldTrigger = false;
    
    // Use song timing if available and playing at normal speed
    const currentSong = audioSystem.currentSongData;
    if (currentSong && !audioSystem.songPaused && audioSystem.songReady && audioSystem.songPlaybackRate === 1.0) {
      const songTime = audioSystem.songCurrentTime * 1000;
      const beatTime = 60000 / this.bpm;
      const beatsSinceStart = Math.floor(songTime / beatTime);
      const expectedBeatTime = beatsSinceStart * beatTime;
      
      if (songTime - expectedBeatTime >= beatTime * 0.9 && (currentTime - this.lastBeat) >= beatTime * GAME_CONFIG.BEAT_TIMING_TOLERANCE) {
        shouldTrigger = true;
        this.lastBeat = currentTime;
      }
    } else {
      // Fallback to original timing system
      const timeSinceStart = currentTime - this.startTime;
      const currentExpectedBeatCount = Math.floor(timeSinceStart / this.beatLen);
      
      if (currentExpectedBeatCount > this.expectedBeatCount && 
          (currentTime - this.lastBeat) >= this.beatLen * GAME_CONFIG.BEAT_TIMING_TOLERANCE) {
        shouldTrigger = true;
        this.lastBeat = currentTime;
        this.expectedBeatCount = currentExpectedBeatCount;
      }
    }
    
    // Safety mechanism: ensure moveReady is available if too much time has passed
    if (!this.moveReady && (currentTime - this.lastBeat) >= this.beatLen * GAME_CONFIG.BEAT_SAFETY_MULTIPLIER) {
      console.warn('Beat timing safety trigger activated');
      this.moveReady = true;
    }
    
    return shouldTrigger;
  }

  /**
   * Check if movement in bounds
   */
  isInBounds(x, y) {
    return x >= 0 && x < this.COLS && y >= 0 && y < this.ROWS;
  }

  /**
   * Get effective light radius with pulse effect
   */
  getEffectiveLightRadius() {
    const time = performance.now();
    const pulseFactor = this.beatStreak > 0 ? 1 + 0.1 * Math.sin(time * 0.01) : 1;
    return this.currentLightRadius * pulseFactor;
  }

  // Getters for read-only access
  get gameRunning() { return this.running; }
  get gamePaused() { return this.paused; }
  get currentScore() { return this.score; }
  get currentLevel() { return this.level; }
  get currentBattery() { return this.battery; }
  get currentBPM() { return this.bpm; }
  get currentStreak() { return this.beatStreak; }
  get bestStreak() { return this.maxStreak; }
  get canMove() { return this.moveReady; }
  get playerPosition() { return { ...this.player }; }
  get exitPosition() { return { ...this.exit }; }
  get mazeData() { return this.maze; }
  get tileSize() { return this.TILE; }
  get mazeRows() { return this.ROWS; }
  get mazeCols() { return this.COLS; }
}

// Create and export singleton instance
export const gameState = new GameState(); 