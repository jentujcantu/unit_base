/*  Lumen Maze – Modular Implementation
   ------------------------------------------------------- */

// Import all modules
import { GAME_CONFIG } from './config.js';
import { audioSystem } from './audio.js';
import { gameState } from './gameState.js';
import { inputHandler } from './input.js';
import { renderer } from './renderer.js';
import { ui } from './ui.js';
import { gameLoop } from './gameLoop.js';
import { checkServerHealth } from './api.js';

/**
 * Main application class that coordinates all systems
 */
class LumenLoopGame {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize the game and all its systems
   */
  async init() {
    if (this.initialized) return;

    console.log('Initializing Lumen Maze...');

    try {
      // Initialize audio system first (needed for song selection)
      await audioSystem.init();
      console.log('Audio system initialized');

      // Initialize input handler (sets up keyboard listeners)
      // inputHandler is initialized automatically when imported
      console.log('Input handler initialized');

      // Initialize renderer (gets canvas context)
      // renderer is initialized automatically when imported
      console.log('Renderer initialized');

      // Initialize UI system (gets DOM elements and sets up event listeners)
      // ui is initialized automatically when imported
      console.log('UI system initialized');

      // Check backend server health
      const serverHealthy = await checkServerHealth();
      if (serverHealthy) {
        console.log('Backend server is reachable');
      } else {
        console.log('Backend server is not reachable - leaderboard features may not work');
      }

      // Start the main game loop
      gameLoop.start();
      console.log('Game loop started');

      // Show main menu
      ui.showMainMenu();
      console.log('Main menu displayed');

      this.initialized = true;

    } catch (error) {
      console.error('Failed to initialize Lumen Maze:', error);
      this.showInitializationError(error);
    }
  }

  showInitializationError(error) {
    const overlay = document.getElementById('overlay');
    const overlayTitle = document.getElementById('overlay-title');
    
    if (overlay && overlayTitle) {
      overlayTitle.textContent = 'Initialization Error';
      overlay.classList.remove('hidden');
      
      // Create error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'text-red-400 text-center p-4 max-w-md';
      errorDiv.innerHTML = `
        <p class="mb-4">Failed to initialize the game:</p>
        <p class="text-sm font-mono bg-gray-800 p-2 rounded">${error.message}</p>
        <p class="mt-4 text-sm">Please refresh the page and try again.</p>
      `;
      
      // Clear existing content and add error message
      const existingContent = overlay.querySelector('.text-red-400');
      if (existingContent) {
        existingContent.remove();
      }
      overlay.appendChild(errorDiv);
    }
  }

  /**
   * Clean up and restart the game
   */
  restart() {
    gameState.reset();
    ui.showMainMenu();
  }

  /**
   * Get game statistics for debugging
   */
  getStats() {
    return {
      initialized: this.initialized,
      gameRunning: gameState.gameRunning,
      gamePaused: gameState.gamePaused,
      currentLevel: gameState.currentLevel,
      currentScore: gameState.currentScore,
      currentBattery: gameState.currentBattery,
      currentStreak: gameState.currentStreak,
      hasAudio: !!audioSystem.currentSongData,
      canvasSize: {
        width: renderer.getCanvas()?.width || 0,
        height: renderer.getCanvas()?.height || 0
      }
    };
  }
}

// Create game instance
const game = new LumenLoopGame();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => game.init());
} else {
  // DOM is already ready
  game.init();
}

// Expose game instance for debugging
window.LumenLoop = {
  game,
  gameState,
  audioSystem,
  renderer,
  ui,
  config: GAME_CONFIG,
  restart: () => game.restart(),
  stats: () => game.getStats()
};

console.log('Lumen Maze modules loaded. Access via window.LumenLoop for debugging.');
    