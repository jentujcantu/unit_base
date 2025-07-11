import { gameState } from './gameState.js';
import { renderer } from './renderer.js';
import { ui } from './ui.js';

class GameLoop {
  constructor() {
    this.animationFrameId = null;
    this.isRunning = false;
  }

  /**
   * Start the game loop
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.loop();
  }

  /**
   * Stop the game loop
   */
  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main game loop
   */
  loop() {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    
    // Only process game logic if the game is running
    if (gameState.gameRunning) {
      // Handle pause state
      if (gameState.gamePaused) {
        // Game is paused, still render but don't update game logic
        renderer.render();
        this.animationFrameId = requestAnimationFrame(() => this.loop());
        return;
      }

      // Check for beat timing
      if (gameState.shouldTriggerBeat(currentTime)) {
        const beatResult = gameState.onBeat();
        if (beatResult.gameOver) {
          ui.gameOver();
          // Don't return here - continue the loop for UI updates
        } else if (beatResult.streakReset) {
          // Update HUD when streak is reset on beat
          ui.updateHUD();
        }
      }

      // Update battery drain
      const batteryChanged = gameState.updateBatteryDrain(currentTime);
      
      // Update HUD if battery changed due to time-based drain
      if (batteryChanged) {
        ui.updateHUD();
      }
    }

    // Always render (handles both game and menu states)
    renderer.render();

    // Continue the loop
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  /**
   * Handle game state changes
   */
  onGameStart() {
    ui.updateHUD();
  }

  onGamePause() {
    ui.pause();
  }

  onGameResume() {
    ui.updateHUD();
  }

  onGameOver() {
    ui.gameOver();
  }

  onLevelComplete() {
    ui.updateHUD();
  }
}

// Create and export singleton instance
export const gameLoop = new GameLoop(); 