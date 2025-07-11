import { gameState } from './gameState.js';
import { audioSystem } from './audio.js';

class UI {
  constructor() {
    this.elements = {};
    this.init();
  }

  /**
   * Initialize UI elements and event listeners
   */
  init() {
    // Get all UI elements
    this.elements = {
      // HUD elements
      hudHealth: document.getElementById('health'),
      hudHealthBar: document.getElementById('health-bar'),
      hudHealthText: document.getElementById('health-text'),
      hudLevel: document.getElementById('level'),
      hudScore: document.getElementById('score'),
      hudBpm: document.getElementById('bpm'),
      hudSong: document.getElementById('song-name'),
      
      // Overlay elements
      overlay: document.getElementById('overlay'),
      overlayTitle: document.getElementById('overlay-title'),
      playBtn: document.getElementById('play-btn'),
      songSelection: document.getElementById('song-selection'),
      
      // Game over elements
      gameOverContent: document.getElementById('game-over-content'),
      nameInput: document.getElementById('name-input'),
      leaderboard: document.getElementById('leaderboard'),
      leaderboardList: document.getElementById('leaderboard-list'),
      scoreEntry: document.getElementById('score-entry'),
      scoreSubmitted: document.getElementById('score-submitted'),
      submitScoreBtn: document.getElementById('submit-score-btn'),
      skipScoreBtn: document.getElementById('skip-score-btn'),
      tryAgainBtn: document.getElementById('try-again-btn'),
      mainMenuBtn: document.getElementById('main-menu-btn'),
      
      // Pause elements
      pauseContent: document.getElementById('pause-content'),
      continueBtn: document.getElementById('continue-btn'),
      quitBtn: document.getElementById('quit-btn')
    };

    this.setupEventListeners();
  }

  /**
   * Set up event listeners for UI elements
   */
  setupEventListeners() {
    // Play button
    if (this.elements.playBtn) {
      this.elements.playBtn.addEventListener('click', () => this.startGame());
    }

    // Pause menu buttons
    if (this.elements.continueBtn) {
      this.elements.continueBtn.addEventListener('click', () => {
        gameState.resume();
        this.hideOverlay();
        this.updateHUD(); // Refresh HUD when resuming
      });
    }
    
    if (this.elements.quitBtn) {
      this.elements.quitBtn.addEventListener('click', () => this.quitToMenu());
    }

    // Game over buttons
    if (this.elements.submitScoreBtn) {
      this.elements.submitScoreBtn.addEventListener('click', () => this.handleScoreSubmission());
    }
    
    if (this.elements.skipScoreBtn) {
      this.elements.skipScoreBtn.addEventListener('click', () => this.skipScoreSubmission());
    }
    
    if (this.elements.tryAgainBtn) {
      this.elements.tryAgainBtn.addEventListener('click', () => this.tryAgain());
    }
    
    if (this.elements.mainMenuBtn) {
      this.elements.mainMenuBtn.addEventListener('click', () => this.quitToMenu());
    }

    // Name input enter key
    if (this.elements.nameInput) {
      this.elements.nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (this.elements.scoreEntry && !this.elements.scoreEntry.classList.contains('hidden')) {
            this.handleScoreSubmission();
          } else {
            this.startGame();
          }
        }
      });
    }
  }

  /**
   * Update the HUD display
   */
  updateHUD() {
    if (!gameState.gameRunning) return;

    // Update health
    const battery = gameState.currentBattery;
    if (this.elements.hudHealthText) {
      this.elements.hudHealthText.textContent = `${battery}%`;
    }
    
    if (this.elements.hudHealthBar) {
      this.elements.hudHealthBar.style.width = `${battery}%`;
      
      // Update health bar color based on health level
      if (battery > 60) {
        this.elements.hudHealthBar.className = 'h-full bg-green-500 transition-all duration-300';
      } else if (battery > 30) {
        this.elements.hudHealthBar.className = 'h-full bg-yellow-500 transition-all duration-300';
      } else {
        this.elements.hudHealthBar.className = 'h-full bg-red-500 transition-all duration-300';
      }
    }

    // Update level, score, and BPM
    if (this.elements.hudLevel) {
      this.elements.hudLevel.textContent = `Level ${gameState.currentLevel}`;
    }
    
    if (this.elements.hudScore) {
      this.elements.hudScore.textContent = `Score ${gameState.currentScore}`;
    }
    
    if (this.elements.hudBpm) {
      this.elements.hudBpm.textContent = `♫ ${gameState.currentBPM} BPM`;
    }

    // Update streak display in song name area when playing
    if (this.elements.hudSong) {
      this.elements.hudSong.textContent = `🔥 Streak: ${gameState.currentStreak} (Best: ${gameState.bestStreak})`;
      this.elements.hudSong.classList.remove('hidden');
      
      // Change color based on streak
      if (gameState.currentStreak >= 10) {
        this.elements.hudSong.className = 'text-yellow-400';
      } else if (gameState.currentStreak >= 5) {
        this.elements.hudSong.className = 'text-orange-400';
      } else {
        this.elements.hudSong.className = 'text-purple-400';
      }
    }
  }

  /**
   * Show overlay with different content based on context
   */
  showOverlay(title, isGameOver = false, isPaused = false) {
    if (this.elements.overlayTitle) {
      this.elements.overlayTitle.textContent = title;
    }
    
    if (this.elements.overlay) {
      this.elements.overlay.classList.remove('hidden');
    }

    // Hide all content sections first
    this.hideAllOverlayContent();

    if (isGameOver) {
      this.showGameOverContent();
    } else if (isPaused) {
      this.showPauseContent();
    } else {
      this.showMainMenuContent();
    }
  }

  /**
   * Hide the overlay
   */
  hideOverlay() {
    if (this.elements.overlay) {
      this.elements.overlay.classList.add('hidden');
    }
    this.hideAllOverlayContent();
  }

  /**
   * Hide all overlay content sections
   */
  hideAllOverlayContent() {
    const contentSections = [
      'gameOverContent', 'pauseContent', 'songSelection', 'playBtn'
    ];
    
    contentSections.forEach(section => {
      if (this.elements[section]) {
        this.elements[section].classList.add('hidden');
      }
    });
  }

  /**
   * Show game over content
   */
  showGameOverContent() {
    if (this.elements.gameOverContent) {
      this.elements.gameOverContent.classList.remove('hidden');
    }
    
    // Reset game over flow - show score entry, hide submitted state
    if (this.elements.scoreEntry) {
      this.elements.scoreEntry.classList.remove('hidden');
    }
    if (this.elements.scoreSubmitted) {
      this.elements.scoreSubmitted.classList.add('hidden');
    }
    
    if (this.elements.nameInput) {
      this.elements.nameInput.value = '';
      this.elements.nameInput.focus();
    }
    
    this.loadLeaderboard();
  }

  /**
   * Show pause content
   */
  showPauseContent() {
    if (this.elements.pauseContent) {
      this.elements.pauseContent.classList.remove('hidden');
    }
  }

  /**
   * Show main menu content
   */
  showMainMenuContent() {
    if (this.elements.songSelection) {
      this.elements.songSelection.classList.remove('hidden');
    }
    if (this.elements.playBtn) {
      this.elements.playBtn.classList.remove('hidden');
    }
  }

  /**
   * Start the game
   */
  async startGame() {
    this.hideOverlay();
    
    // Start song playback if available
    if (audioSystem.currentSongData) {
      await audioSystem.play();
    }
    
    gameState.start();
  }

  /**
   * Handle game over
   */
  gameOver() {
    this.showOverlay('Game Over', true);
  }

  /**
   * Handle pause
   */
  pause() {
    this.showOverlay('Game Paused', false, true);
  }

  /**
   * Quit to main menu
   */
  quitToMenu() {
    gameState.quitToMenu();
    this.showOverlay('Lumen Maze - Click to Start');
  }

  /**
   * Handle score submission
   */
  async handleScoreSubmission() {
    if (!this.elements.nameInput) return;
    
    const name = this.elements.nameInput.value.trim();
    if (!name) {
      this.elements.nameInput.focus();
      this.elements.nameInput.style.borderColor = 'red';
      setTimeout(() => {
        this.elements.nameInput.style.borderColor = '';
      }, 2000);
      return;
    }

    if (gameState.currentScore >= 0) {
      // Import API module dynamically to avoid circular dependencies
      const { submitScore } = await import('./api.js');
      await submitScore(name, gameState.currentScore);
    }
    
    this.showScoreSubmitted();
  }

  /**
   * Skip score submission
   */
  skipScoreSubmission() {
    this.showScoreSubmitted();
  }

  /**
   * Show score submitted state
   */
  showScoreSubmitted() {
    if (this.elements.scoreEntry) {
      this.elements.scoreEntry.classList.add('hidden');
    }
    if (this.elements.scoreSubmitted) {
      this.elements.scoreSubmitted.classList.remove('hidden');
    }
  }

  /**
   * Try again after game over
   */
  tryAgain() {
    this.hideOverlay();
    this.startGame();
  }

  /**
   * Load and display leaderboard
   */
  async loadLeaderboard() {
    if (!this.elements.leaderboardList) return;
    
    try {
      // Import API module dynamically to avoid circular dependencies
      const { getTopScores } = await import('./api.js');
      const scores = await getTopScores();
      
      this.elements.leaderboardList.innerHTML = '';
      
      if (scores.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No scores yet - be the first!';
        li.className = 'text-gray-400 italic';
        this.elements.leaderboardList.appendChild(li);
      } else {
        scores.forEach((entry, index) => {
          const li = document.createElement('li');
          li.textContent = `${index + 1}. ${entry.name} - ${entry.score}`;
          li.className = index === 0 ? 'text-yellow-400 font-bold' : 'text-white';
          this.elements.leaderboardList.appendChild(li);
        });
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      if (this.elements.leaderboardList) {
        this.elements.leaderboardList.innerHTML = '<li class="text-red-400">Failed to load leaderboard - check if backend is running</li>';
      }
    }
  }

  /**
   * Show main menu
   */
  showMainMenu() {
    this.showOverlay('Lumen Maze - Click to Start');
  }
}

// Create and export singleton instance
export const ui = new UI(); 