import MusicTempo from 'music-tempo';
import { GAME_CONFIG, SAMPLE_SONGS } from './config.js';

class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.beatSoundBuffer = null;
    this.currentSong = null;
    this.songAudio = null;
    this.baseBPM = GAME_CONFIG.INITIAL_BPM;
    this.songStartTime = 0;
    
    // DOM elements - will be set by init method
    this.songSelect = null;
    this.uploadBtn = null;
    this.fileInput = null;
    this.bpmInput = null;
  }

  /**
   * Initialize the audio system
   */
  async init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.beatSoundBuffer = this.createBeatSound();
      
      // Get DOM elements
      this.songSelect = document.getElementById('song-select');
      this.uploadBtn = document.getElementById('upload-btn');
      this.fileInput = document.getElementById('file-input');
      this.bpmInput = document.getElementById('bpm-input');
      
      this.populateSongSelect();
      this.setupEventListeners();
      
      console.log('Audio system initialized');
    } catch (e) {
      console.warn('Audio not available:', e);
    }
  }

  /**
   * Create a drum kick sound for beat feedback
   */
  createBeatSound() {
    if (!this.audioContext) return null;
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = GAME_CONFIG.BEAT_SOUND_DURATION;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const baseFreq = GAME_CONFIG.BEAT_SOUND_FREQUENCY;
      const envelope = Math.exp(-t * 15);
      const kick = Math.sin(2 * Math.PI * baseFreq * t) * envelope;
      const attackEnvelope = t < 0.01 ? t * 100 : 1;
      data[i] = kick * attackEnvelope * 0.5;
    }
    
    return buffer;
  }

  /**
   * Play the beat sound
   */
  playBeatSound() {
    if (!this.audioContext || !this.beatSoundBuffer) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = this.beatSoundBuffer;
    source.connect(this.audioContext.destination);
    source.start();
  }

  /**
   * Populate the song selection dropdown
   */
  populateSongSelect() {
    if (!this.songSelect) return;
    
    this.songSelect.innerHTML = '<option value="">Select a song...</option>';
    
    // Add programmatic songs
    SAMPLE_SONGS.forEach(song => {
      const option = document.createElement('option');
      option.value = song.id;
      option.textContent = `${song.name} (${song.bpm} BPM)`;
      option.dataset.bpm = song.bpm;
      option.dataset.programmatic = 'true';
      this.songSelect.appendChild(option);
    });
  }

  /**
   * Set up event listeners for audio controls
   */
  setupEventListeners() {
    if (!this.songSelect || !this.uploadBtn || !this.fileInput || !this.bpmInput) return;
    
    // Song selection change
    this.songSelect.addEventListener('change', (e) => {
      const selectedOption = e.target.selectedOptions[0];
      if (selectedOption && selectedOption.value && selectedOption.dataset.programmatic === 'true') {
        const songData = SAMPLE_SONGS.find(s => s.id === selectedOption.value);
        if (songData) {
          this.loadProgrammaticSong(songData);
        }
      }
    });
    
    // File upload
    this.uploadBtn.addEventListener('click', () => {
      this.fileInput.click();
    });
    
    this.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('audio/')) {
        this.clearBPMMessages();
        
        if (this.audioContext) {
          this.loadUserSongWithAnalysis(file);
        } else {
          const bpm = parseInt(this.bpmInput.value) || GAME_CONFIG.INITIAL_BPM;
          this.loadUserSong(file, bpm);
        }
      }
    });
    
    // BPM input validation
    this.bpmInput.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      if (value && value >= GAME_CONFIG.BPM_MIN && value <= GAME_CONFIG.BPM_MAX) {
        e.target.classList.remove('border-red-500');
        e.target.classList.add('border-green-500');
      } else {
        e.target.classList.remove('border-green-500');
        e.target.classList.add('border-red-500');
      }
    });
  }

  /**
   * Load a user-uploaded song
   */
  async loadUserSong(file, bpm) {
    try {
      const url = URL.createObjectURL(file);
      
      this.currentSong = {
        id: 'user-upload',
        name: file.name.replace(/\.[^/.]+$/, ''),
        bpm: bpm,
        url: url,
        isUserUploaded: true,
        description: 'User uploaded track'
      };
      
      this.baseBPM = bpm;
      this.updateSongDisplay();
      
      // Clean up previous audio
      if (this.songAudio) {
        this.songAudio.pause();
        this.songAudio = null;
      }
      
      this.songAudio = new Audio();
      this.songAudio.src = url;
      this.songAudio.loop = true;
      this.songAudio.preload = 'auto';
      
      this.songAudio.addEventListener('error', (e) => {
        console.error('Error loading user song audio:', e);
        this.currentSong = null;
        this.updateSongDisplay();
      });
      
      this.songAudio.addEventListener('canplaythrough', () => {
        console.log(`Loaded user song: ${this.currentSong.name} at ${bpm} BPM`);
      });
      
    } catch (error) {
      console.error('Error loading user song:', error);
      this.currentSong = null;
    }
  }

  /**
   * Load a programmatic song
   */
  async loadProgrammaticSong(songData) {
    try {
      this.currentSong = {
        ...songData,
        isUserUploaded: false,
        isProgrammatic: true
      };
      
      this.baseBPM = songData.bpm;
      this.updateSongDisplay();
      
      // Create programmatic audio
      const audioBuffer = this.createProgrammaticSong(songData.bpm, songData.style);
      
      // Clean up previous audio
      if (this.songAudio) {
        this.songAudio.pause();
        this.songAudio = null;
      }
      
      const blob = this.bufferToWave(audioBuffer);
      const url = URL.createObjectURL(blob);
      
      this.songAudio = new Audio();
      this.songAudio.src = url;
      this.songAudio.loop = true;
      this.songAudio.preload = 'auto';
      
      this.songAudio.addEventListener('error', (e) => {
        console.error('Error loading programmatic song audio:', e);
        this.currentSong = null;
        this.updateSongDisplay();
      });
      
      this.songAudio.addEventListener('canplaythrough', () => {
        console.log(`Loaded programmatic song: ${songData.name} at ${songData.bpm} BPM`);
      });
      
    } catch (error) {
      console.error('Error loading programmatic song:', error);
      this.currentSong = null;
    }
  }

  /**
   * Load user song with automatic BPM analysis
   */
  async loadUserSongWithAnalysis(file) {
    try {
      this.showBPMLoading();
      
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const detectedBPM = await this.analyzeAudioForBPM(audioBuffer);
      
      this.hideBPMLoading();
      this.updateBPMInput(detectedBPM);
      this.showBPMDetected(detectedBPM);
      
      await this.loadUserSong(file, detectedBPM);
      
      console.log(`Auto-detected BPM: ${detectedBPM} for ${file.name}`);
      
    } catch (error) {
      console.error('Error analyzing audio:', error);
      
      this.hideBPMLoading();
      this.showBPMError();
      
      const bpm = parseInt(this.bpmInput.value) || GAME_CONFIG.INITIAL_BPM;
      await this.loadUserSong(file, bpm);
    }
  }

  /**
   * Analyze audio for BPM using music-tempo library
   */
  async analyzeAudioForBPM(audioBuffer) {
    try {
      const channelData = audioBuffer.getChannelData(0);
      const audioData = new Float32Array(channelData);
      const musicTempo = new MusicTempo(audioData);
      
      let detectedBPM = Math.round(musicTempo.tempo);
      
      if (detectedBPM < GAME_CONFIG.BPM_MIN || detectedBPM > GAME_CONFIG.BPM_MAX || isNaN(detectedBPM)) {
        console.warn('BPM detection failed or out of range, using fallback analysis');
        detectedBPM = this.fallbackBPMDetection(channelData, audioBuffer.sampleRate);
      }
      
      console.log(`music-tempo detected BPM: ${detectedBPM}`);
      return detectedBPM;
      
    } catch (error) {
      console.error('Error with music-tempo BPM detection:', error);
      return this.fallbackBPMDetection(audioBuffer.getChannelData(0), audioBuffer.sampleRate);
    }
  }

  /**
   * Fallback BPM detection method
   */
  fallbackBPMDetection(channelData, sampleRate) {
    console.log('Using fallback BPM detection');
    
    const windowSize = 1024;
    const hopSize = 512;
    const energyThreshold = 0.5;
    
    const onsets = [];
    let previousEnergy = 0;
    
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      let energy = 0;
      for (let j = 0; j < windowSize; j++) {
        energy += Math.abs(channelData[i + j]);
      }
      energy /= windowSize;
      
      if (energy > previousEnergy * (1 + energyThreshold)) {
        onsets.push(i / sampleRate);
      }
      previousEnergy = energy;
    }
    
    if (onsets.length === 0) {
      console.warn('No onsets detected, using default BPM');
      return GAME_CONFIG.INITIAL_BPM;
    }
    
    const intervals = [];
    for (let i = 1; i < onsets.length; i++) {
      intervals.push(onsets[i] - onsets[i-1]);
    }
    
    intervals.sort((a, b) => a - b);
    const medianInterval = intervals[Math.floor(intervals.length / 2)];
    const detectedBPM = Math.round(60 / medianInterval);
    
    return Math.max(GAME_CONFIG.BPM_MIN, Math.min(GAME_CONFIG.BPM_MAX, detectedBPM));
  }

  /**
   * Create programmatic song audio
   */
  createProgrammaticSong(bpm, style) {
    if (!this.audioContext) return null;
    
    const duration = 60; // 60 seconds
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
    
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    const beatInterval = 60 / bpm;
    
    for (let i = 0; i < buffer.length; i++) {
      const time = i / sampleRate;
      const beatPhase = (time % beatInterval) / beatInterval;
      
      let sample = 0;
      
      if (style === 'electronic') {
        const beat = Math.floor(time / beatInterval) % 4;
        if (beat === 0 || beat === 2) {
          sample = Math.sin(2 * Math.PI * 60 * time) * Math.exp(-beatPhase * 10);
        } else if (beat === 1 || beat === 3) {
          sample = (Math.random() - 0.5) * Math.exp(-beatPhase * 5);
        }
      } else if (style === 'ambient') {
        sample = Math.sin(2 * Math.PI * 40 * time) * Math.exp(-beatPhase * 3) * 0.5;
        sample += Math.sin(2 * Math.PI * 80 * time) * Math.exp(-beatPhase * 5) * 0.3;
      } else if (style === 'intense') {
        sample = Math.sin(2 * Math.PI * 100 * time) * Math.exp(-beatPhase * 15);
        sample += (Math.random() - 0.5) * Math.exp(-beatPhase * 8) * 0.5;
      }
      
      leftChannel[i] = sample * GAME_CONFIG.AUDIO_VOLUME;
      rightChannel[i] = sample * GAME_CONFIG.AUDIO_VOLUME;
    }
    
    return buffer;
  }

  /**
   * Convert AudioBuffer to WAV blob
   */
  bufferToWave(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;
    
    const buffer = new ArrayBuffer(44 + length * numChannels * 2);
    const view = new DataView(buffer);
    
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numChannels * 2, true);
    
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = audioBuffer.getChannelData(channel)[i];
        const intSample = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, intSample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * Update the song display in the UI
   */
  updateSongDisplay() {
    const hudSong = document.getElementById('song-name');
    if (hudSong) {
      if (this.currentSong) {
        hudSong.textContent = `♪ ${this.currentSong.name}`;
        hudSong.classList.remove('hidden');
      } else {
        hudSong.classList.add('hidden');
      }
    }
  }

  /**
   * Set the playback rate for the current song
   */
  setPlaybackRate(rate) {
    if (this.songAudio && (this.currentSong?.isUserUploaded || this.currentSong?.isProgrammatic)) {
      this.songAudio.playbackRate = rate;
    }
  }

  /**
   * Play the current song
   */
  play() {
    if (this.songAudio && this.currentSong && this.songAudio.readyState >= 2) {
      this.songAudio.currentTime = 0;
      this.songAudio.playbackRate = 1.0;
      return this.songAudio.play().catch(e => {
        console.warn('Could not play song:', e);
        this.currentSong = null;
        this.updateSongDisplay();
      });
    }
    return Promise.resolve();
  }

  /**
   * Pause the current song
   */
  pause() {
    if (this.songAudio && !this.songAudio.paused) {
      this.songAudio.pause();
    }
  }

  /**
   * Resume the current song
   */
  resume() {
    if (this.songAudio && this.songAudio.paused && this.currentSong) {
      return this.songAudio.play().catch(e => {
        console.warn('Could not resume song playback:', e);
      });
    }
    return Promise.resolve();
  }

  // UI Helper methods
  clearBPMMessages() {
    if (!this.bpmInput) return;
    const existingMessages = this.bpmInput.parentNode.querySelectorAll('.bpm-detected, .bpm-error, #bpm-loading');
    existingMessages.forEach(msg => msg.remove());
  }

  showBPMLoading() {
    if (!this.bpmInput) return;
    const loadingIndicator = document.createElement('div');
            loadingIndicator.textContent = 'Analyzing BPM...';
    loadingIndicator.className = 'text-blue-400 text-sm mt-1';
    loadingIndicator.id = 'bpm-loading';
    this.bpmInput.parentNode.appendChild(loadingIndicator);
  }

  hideBPMLoading() {
    const loadingEl = document.getElementById('bpm-loading');
    if (loadingEl) loadingEl.remove();
  }

  updateBPMInput(bpm) {
    if (!this.bpmInput) return;
    this.bpmInput.value = bpm;
    this.bpmInput.classList.remove('border-red-500');
    this.bpmInput.classList.add('border-green-500');
  }

  showBPMDetected(bpm) {
    if (!this.bpmInput) return;
    const existingDisplay = this.bpmInput.parentNode.querySelector('.bpm-detected');
    if (existingDisplay) existingDisplay.remove();
    
    const bpmDisplay = document.createElement('div');
            bpmDisplay.textContent = `Detected BPM: ${bpm}`;
    bpmDisplay.className = 'text-green-400 text-sm mt-1 bpm-detected';
    this.bpmInput.parentNode.appendChild(bpmDisplay);
  }

  showBPMError() {
    if (!this.bpmInput) return;
    const errorDisplay = document.createElement('div');
            errorDisplay.textContent = 'BPM detection failed, using manual input';
    errorDisplay.className = 'text-red-400 text-sm mt-1 bpm-error';
    this.bpmInput.parentNode.appendChild(errorDisplay);
  }

  // Getters
  get currentSongData() {
    return this.currentSong;
  }

  get songPlaybackRate() {
    return this.songAudio?.playbackRate || 1.0;
  }

  get songCurrentTime() {
    return this.songAudio?.currentTime || 0;
  }

  get songPaused() {
    return this.songAudio?.paused ?? true;
  }

  get songReady() {
    return this.songAudio?.readyState >= 2;
  }
}

// Create and export a singleton instance
export const audioSystem = new AudioSystem(); 