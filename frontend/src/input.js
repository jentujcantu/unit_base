import { GAME_CONFIG, KEY_MAPPINGS } from './config.js';
import { canMove } from './maze.js';
import { gameState } from './gameState.js';
import { ui } from './ui.js';

class InputHandler {
  constructor() {
    this.setupEventListeners();
  }

  /**
   * Set up keyboard event listeners
   */
  setupEventListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  /**
   * Handle keydown events
   */
  handleKeyDown(e) {
    // Handle escape key for pause/resume
    if (e.code === 'Escape' && gameState.gameRunning) {
      e.preventDefault();
      if (gameState.gamePaused) {
        gameState.resume();
        ui.hideOverlay();
        ui.updateHUD(); // Refresh HUD when resuming
      } else {
        gameState.pause();
        ui.pause();
      }
      return;
    }

    // Only process movement keys when game is running and not paused
    if (!gameState.canMove || !gameState.gameRunning || gameState.gamePaused) {
      return;
    }

    const direction = KEY_MAPPINGS[e.code];
    if (!direction) return;

    e.preventDefault();
    this.handleMovement(direction);
  }

  /**
   * Handle player movement in a given direction
   */
  handleMovement(direction) {
    const { DX, DY } = GAME_CONFIG;
    const player = gameState.playerPosition;
    
    // Calculate destination position
    const newX = player.x + DX[direction];
    const newY = player.y + DY[direction];

    // Check bounds first
    if (!gameState.isInBounds(newX, newY)) {
      gameState.onFailedMove();
      ui.updateHUD(); // Update UI when health changes
      return;
    }

    // Check if movement is valid (no wall blocking)
    if (!canMove(gameState.mazeData, player.x, player.y, direction)) {
      gameState.onFailedMove();
      ui.updateHUD(); // Update UI when health changes
      return;
    }

    // Valid move - update player position
    gameState.player.x = newX;
    gameState.player.y = newY;
    
    // Only set moveReady to false if we have a valid move
    gameState.moveReady = false;

    // Handle successful move (this may advance to next level)
    const levelCompleted = gameState.onSuccessfulMove();
    
    // Update UI after move (battery may have changed, or level completed)
    ui.updateHUD();
    
    // If level was completed, onSuccessfulMove already called initLevel which resets everything
    // so the HUD update above will show the new level data
  }
}

// Create and export singleton instance
export const inputHandler = new InputHandler(); 