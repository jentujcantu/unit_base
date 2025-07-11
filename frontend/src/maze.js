import { GAME_CONFIG } from './config.js';

const { DIRECTIONS, DX, DY, OPPOSITE } = GAME_CONFIG;
const { N, S, E, W } = DIRECTIONS;

/**
 * Generate a maze using recursive backtracker algorithm
 * @param {number} rows - Number of rows in the maze
 * @param {number} cols - Number of columns in the maze
 * @returns {Array<Array<number>>} 2D array representing the maze
 */
export function generateMaze(rows, cols) {
  const grid = Array(rows).fill().map(() => Array(cols).fill(0));
  const stack = [[0, 0]];
  
  while (stack.length) {
    const [cx, cy] = stack.pop();
    const dirs = shuffle([N, S, E, W]);
    
    for (const dir of dirs) {
      const nx = cx + DX[dir];
      const ny = cy + DY[dir];
      
      if (ny < 0 || ny >= rows || nx < 0 || nx >= cols || grid[ny][nx]) {
        continue;
      }
      
      grid[cy][cx] |= dir;
      grid[ny][nx] |= OPPOSITE[dir];
      stack.push([nx, ny]);
      stack.push([cx, cy]);
      break;
    }
  }
  
  return grid;
}

/**
 * Generate a random exit position on the perimeter
 * @param {number} rows - Number of rows in the maze
 * @param {number} cols - Number of columns in the maze
 * @returns {Object} Exit position with x and y coordinates
 */
export function generateRandomExit(rows, cols) {
  const possibleExits = [];
  const minDistance = Math.min(4, Math.floor(Math.min(rows, cols) / 3));
  
  // Generate all perimeter positions
  for (let x = 0; x < cols; x++) {
    // Top row (skip starting position)
    if (!(x === 0 && 0 === 0)) {
      const topDistance = Math.sqrt(x * x + 0 * 0);
      if (topDistance >= minDistance) {
        possibleExits.push({ x: x, y: 0 });
      }
    }
    
    // Bottom row
    const bottomDistance = Math.sqrt(x * x + (rows - 1) * (rows - 1));
    if (bottomDistance >= minDistance) {
      possibleExits.push({ x: x, y: rows - 1 });
    }
  }
  
  // Left and right columns (skip corners already covered)
  for (let y = 1; y < rows - 1; y++) {
    // Left column
    const leftDistance = Math.sqrt(0 * 0 + y * y);
    if (leftDistance >= minDistance) {
      possibleExits.push({ x: 0, y: y });
    }
    
    // Right column
    const rightDistance = Math.sqrt((cols - 1) * (cols - 1) + y * y);
    if (rightDistance >= minDistance) {
      possibleExits.push({ x: cols - 1, y: y });
    }
  }
  
  // Fallback to bottom right if no valid exits found
  if (possibleExits.length === 0) {
    return { x: cols - 1, y: rows - 1 };
  }
  
  // Randomly select one of the possible exits
  const randomIndex = Math.floor(Math.random() * possibleExits.length);
  return possibleExits[randomIndex];
}

/**
 * Check if movement in a direction is valid
 * @param {Array<Array<number>>} maze - The maze grid
 * @param {number} x - Current x position
 * @param {number} y - Current y position
 * @param {number} direction - Direction to move (N, S, E, W)
 * @returns {boolean} True if movement is valid
 */
export function canMove(maze, x, y, direction) {
  const cell = maze[y][x];
  return !!(cell & direction);
}

/**
 * Get the size of maze for a given level
 * @param {number} level - Current game level
 * @returns {Object} Object with rows and cols properties
 */
export function getMazeSizeForLevel(level) {
  for (const progression of GAME_CONFIG.MAZE_SIZE_PROGRESSION) {
    if (level <= progression.maxLevel) {
      if (progression.size) {
        return { rows: progression.size, cols: progression.size };
      } else if (progression.sizeFormula) {
        const size = progression.sizeFormula(level);
        return { rows: size, cols: size };
      }
    }
  }
  
  // Fallback
  return { rows: 15, cols: 15 };
}

/**
 * Shuffle an array in place using Fisher-Yates algorithm
 * @param {Array} arr - Array to shuffle
 * @returns {Array} The shuffled array
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
} 