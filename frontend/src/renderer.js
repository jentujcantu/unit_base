import { GAME_CONFIG } from './config.js';
import { gameState } from './gameState.js';

class Renderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.init();
  }

  /**
   * Initialize the renderer
   */
  init() {
    this.canvas = document.getElementById('game');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
  }

  /**
   * Main render function
   */
  render() {
    if (!this.ctx || !gameState.gameRunning) return;

    // Clear canvas
    this.clearCanvas();

    // Draw maze with light radius effect
    this.drawMazeWithLightRadius();

    // Draw exit portal
    this.drawExit();

    // Draw player
    this.drawPlayer();
  }

  /**
   * Clear the canvas
   */
  clearCanvas() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw the maze with light radius effect
   */
  drawMazeWithLightRadius() {
    if (!gameState.mazeData) return;

    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 2;

    const effectiveRadius = gameState.getEffectiveLightRadius();
    const player = gameState.playerPosition;
    const maze = gameState.mazeData;
    const TILE = gameState.tileSize;
    const ROWS = gameState.mazeRows;
    const COLS = gameState.mazeCols;
    const { DIRECTIONS } = GAME_CONFIG;
    const { N, S, E, W } = DIRECTIONS;

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const distance = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);

        // Calculate alpha based on distance from player
        let alpha = Math.max(0, 1 - distance / effectiveRadius);

        // Add small minimum visibility for very close cells
        if (distance <= 1) {
          alpha = Math.max(alpha, 0.3);
        }

        if (alpha > 0.05) {
          this.ctx.globalAlpha = alpha;
          this.ctx.beginPath();

          const cell = maze[y][x];
          const sx = x * TILE;
          const sy = y * TILE;

          // Draw walls where passages don't exist
          if (!(cell & N)) { // North wall
            this.ctx.moveTo(sx, sy);
            this.ctx.lineTo(sx + TILE, sy);
          }
          if (!(cell & W)) { // West wall
            this.ctx.moveTo(sx, sy);
            this.ctx.lineTo(sx, sy + TILE);
          }
          // Draw south/east borders on grid edges
          if (y === ROWS - 1 && !(cell & S)) {
            this.ctx.moveTo(sx, sy + TILE);
            this.ctx.lineTo(sx + TILE, sy + TILE);
          }
          if (x === COLS - 1 && !(cell & E)) {
            this.ctx.moveTo(sx + TILE, sy);
            this.ctx.lineTo(sx + TILE, sy + TILE);
          }

          this.ctx.stroke();
        }
      }
    }
    this.ctx.globalAlpha = 1;
  }

  /**
   * Draw the exit portal
   */
  drawExit() {
    const exit = gameState.exitPosition;
    const player = gameState.playerPosition;
    const effectiveRadius = gameState.getEffectiveLightRadius();
    const TILE = gameState.tileSize;

    // Only draw exit if it's within light radius
    const exitDistance = Math.sqrt((exit.x - player.x) ** 2 + (exit.y - player.y) ** 2);
    if (exitDistance <= effectiveRadius) {
      this.ctx.globalAlpha = Math.max(0.3, 1 - exitDistance / effectiveRadius);
      this.ctx.fillStyle = '#00ff00';
      this.ctx.fillRect(exit.x * TILE + 8, exit.y * TILE + 8, TILE - 16, TILE - 16);
      this.ctx.globalAlpha = 1;
    }
  }

  /**
   * Draw the player with glow effect
   */
  drawPlayer() {
    const player = gameState.playerPosition;
    const TILE = gameState.tileSize;

    this.ctx.fillStyle = '#00ffff';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = '#00ffff';
    this.ctx.fillRect(player.x * TILE + 8, player.y * TILE + 8, TILE - 16, TILE - 16);
    this.ctx.shadowBlur = 0;
  }

  /**
   * Get canvas context for external use if needed
   */
  getContext() {
    return this.ctx;
  }

  /**
   * Get canvas element for external use if needed
   */
  getCanvas() {
    return this.canvas;
  }
}

// Create and export singleton instance
export const renderer = new Renderer(); 