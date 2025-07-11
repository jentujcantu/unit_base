# Lumen Maze - Song Integration Edition

A top-down memory & rhythm maze game where you navigate through pitch-black mazes using brief camera-flash pulses synchronized with the music's beat.

## Game Overview

- **Objective**: Navigate through progressively larger mazes from start to exit before your health runs out
- **Core Mechanic**: The world is dark except for a light radius around you that grows with your streak off corrrectly timed movements to the beat
- **Movement**: One move per beat using arrow keys or WASD
- **Streak System**: Hit consecutive beats to expand your light radius and see more of the maze
- **Progression**: Each level increases BPM, reduces base light radius, enlarges maze, and adds penalties
- **Scoring**: Battery remaining × 100 + Level × 1000

## Song Integration System

### **Multiple Song Options**
- **Built-in Songs**: 3 programmatic songs with different styles and BPMs
- **User Uploads**: Support for MP3, WAV, OGG, and other audio formats
- **Automatic BPM Detection**: Rhythm analysis for uploaded songs
- **Manual BPM Override**: Fine-tune the detected BPM for perfect sync

### **Advanced Beat Synchronization**
- **Real-time Sync**: Game beats sync to actual song playback
- **Dual Audio**: Background song + gameplay beat sounds
- **Loop Support**: Seamless song looping during gameplay
- **Pause Control**: Songs pause/resume with game state

## Enhanced Difficulty Features

### **Progressive Maze Scaling**
- **Levels 1-3**: 15×15 mazes (classic size)
- **Levels 4-6**: 18×18 mazes  
- **Levels 7-10**: 20×20 mazes
- **Levels 11+**: Up to 25×25 mazes (grows every 2 levels)

### **Aggressive Battery Management**
- **Drain Rate**: 1% per second + 0.3% per level (Level 10 = 3.7% per second!)
- **Wall Penalties**: 5% + 2% per level (Level 10 = 25% per collision!)
- **Movement Cost**: Starting at Level 6, every 10 moves costs 1% battery per 5 levels

### **Enhanced Rhythm Challenges**
- **BPM Progression**: 120 + 15 per level 
- **Streak-Based Light System**: Light radius grows with consecutive successful moves
- **Base Light Radius**: Decreases with each level, forcing better streak maintenance
- **Streak Rewards**: Each successful beat move increases light radius (+0.3 per streak, max +4.5)
- **Streak Penalties**: Missing beats or hitting walls resets your streak to 0
- **Memory Challenge**: Higher levels have smaller base light radius, requiring longer streaks to see ahead

### **Difficulty Scaling Examples**
| Level | BPM | Base Light Radius | Max Light Radius | Battery Drain | Wall Penalty | Maze Size |
|-------|-----|------------------|------------------|---------------|--------------|-----------|
| 1     | 120 | 2.5 tiles        | 7.0 tiles        | 1%/sec        | 5%           | 15×15     |
| 5     | 180 | 2.0 tiles        | 6.5 tiles        | 2.2%/sec      | 13%          | 18×18     |
| 8     | 225 | 1.8 tiles        | 6.3 tiles        | 3.1%/sec      | 21%          | 20×20     |
| 10    | 255 | 1.5 tiles        | 6.0 tiles        | 3.7%/sec      | 25%          | 20×20     |
| 15    | 330 | 1.2 tiles        | 5.7 tiles        | 5.2%/sec      | 35%          | 25×25     |

## Controls

- **Arrow Keys** or **WASD**: Move player (one move per beat)
- **Song Selection**: Choose from built-in songs or upload your own before starting
- **Demo Button**: Quick-start with Electronic Pulse song
- **Movement Rules**: 
  - Can only move on each beat
  - Hitting walls costs escalating battery penalties
  - Movement is locked to the beat timing of your selected song
  - Higher levels cost battery per move

## Game Mechanics

### Beat System
- **Song-Based BPM**: Uses your selected song's BPM as the base (+15 BPM per level)
- **Fallback BPM**: 120 BPM if no song selected (+15 BPM per level)
- **Beat Timing**: Synced to actual song playback or programmatic timing
- **Audio Feedback**: Drum kick sound plays only when you successfully move on beat (not on wall collisions)
- **Success Reward**: Perfect timing is rewarded with satisfying drum kick feedback

### Battery System
- **Progressive Drain**: 1% + 0.3% per level per second
- **No Full Recovery**: Lose 5% battery between levels (minimum 20%)
- **Wall Collision**: 5% + 2% per level penalty
- **Movement Cost**: 1% battery per 10 moves starting at Level 6

### Scoring & Anti-Cheat
- Level completion score: `batteryRemaining × 100 + level × 1000`
- Backend rejects scores > 20,000 or negative scores
- Scores are stored with timestamps for leaderboard ranking

## Technical Stack

- **Frontend**: Vanilla JavaScript + Vite + Tailwind CSS
- **Backend**: Express.js + SQLite + CORS
- **Audio**: Web Audio API for beat synchronization + music-tempo for BPM detection
- **Maze Generation**: Recursive backtracker algorithm

## Installation & Setup

### Prerequisites
- Node.js 20 LTS
- pnpm

### Backend Setup
```bash
cd backend
pnpm install
node server.js
```
The backend will run on `http://localhost:4000`

### Frontend Setup - **Windows PowerShell Users**
```bash
cd frontend
pnpm install
pnpm run dev
```
**Note**: Windows PowerShell doesn't support `&&` operator. Use separate commands:
```powershell
cd frontend
pnpm run dev
```

The frontend will run on `http://localhost:5173`

## Development

### Backend API Endpoints
- `POST /score` - Submit player score
  - Body: `{ name: string, score: number }`
  - Returns: 201 on success
- `GET /top10` - Get top 10 leaderboard
  - Returns: `[{ name: string, score: number }]`

### Frontend Structure
```
frontend/src/
├── main.js          # Application entry point and system coordination
├── config.js        # Game configuration and constants
├── audio.js         # Audio system and song management with BPM detection
├── maze.js          # Maze generation and utilities
├── gameState.js     # Game state management and level progression
├── input.js         # Input handling and player movement
├── renderer.js      # Canvas rendering system
├── ui.js           # UI management and HUD updates
├── gameLoop.js     # Main game loop coordination
└── api.js          # Backend API communication
```
- `index.html` - Game interface with HUD and overlays
- `vite.config.js` - Vite configuration


## Features

### Core Features
- Canvas rendering with maze visualization
- Beat-synchronized lighting
- One move per beat input system
- Battery drain and collision penalties
- Level progression with increasing BPM
- Score submission and leaderboard
- Game-over flow with name input
- Arrow keys + WASD controls

### Audio Features
- Drum kick sound generation via Web Audio API (plays only on successful moves)
- Synchronized audio with visual lighting 
- **Song integration system with 3 built-in programmatic songs**
- **User audio file upload support (MP3, WAV, OGG)**
- **Automatic BPM detection for uploaded songs**
- **Real-time beat synchronization with song playback**
- **Dual audio system (background song + success feedback)**

### Visual Features
- Player glow effect (cyan)
- Exit portal glow (green, 50% opacity when dark)
- HUD with battery, level, and score
- Battery indicator turns red when < 20%
- Responsive overlay system


## Instructions for Building

```bash
# Frontend
cd frontend
pnpm run build
pnpm run preview

# Backend 
cd backend
node server.js
```

## Game Balance - Enhanced Difficulty

- **Memory Challenge**: Dramatically reduced flash duration forces better memorization
- **Escalating Penalties**: Progressive wall collision penalties punish mistakes heavily
- **Spatial Scaling**: Larger mazes increase navigation complexity
- **Rhythm Pressure**: Faster BPM progression tests reaction time and rhythm skills
- **Movement Economy**: Higher levels require strategic movement to conserve battery

## Song System Usage

### **Getting Started**
1. **Built-in Songs**: Select from dropdown menu (Electronic Pulse, Ambient Flow, Intense Rush)
2. **Upload Your Own**: Click "Upload Song" and select any audio file
3. **BPM Detection**: The system automatically detects BPM for uploaded songs
4. **Manual Override**: Adjust the detected BPM if needed (60-300 range)

### **Best Practices**
- **Start with Built-in Songs**: They're optimized for gameplay
- **Choose BPM Wisely**: Higher BPM = faster, more challenging gameplay
- **Test Your Songs**: Use familiar music to better predict beat timing
- **Audio Quality**: Better quality audio = better BPM detection
- **File Formats**: MP3, WAV, OGG work best for uploads

### **Technical Notes**
- BPM detection uses onset analysis of audio energy
- Songs loop seamlessly during gameplay
- Game beats sync to actual song playback timing
- Beat sounds overlay background music for gameplay feedback

## Survival Tips

1. **Build Your Streak**: Consecutive successful moves expand your light radius - aim for long streaks!
2. **Perfect Navigation**: Wall collisions reset your streak and become extremely costly at higher levels
3. **Rhythm Mastery**: Stay synchronized with your selected song's increasingly fast beats
4. **Don't Miss Beats**: Missing a beat opportunity resets your streak to 0
5. **Plan Ahead**: Use maximum light radius (15+ streak) to scout future paths
6. **Battery Conservation**: Plan moves carefully - every move counts at higher levels
7. **Pattern Recognition**: Learn maze generation patterns to navigate more efficiently
8. **Song Selection**: Choose songs with clear, consistent beats for better timing

