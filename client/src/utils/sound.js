// Sound utility for task interactions
class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.3;
    this.audioContext = null;
    this.initialized = false;
    this.loadSettings();
  }

  // Initialize AudioContext only when needed
  async initAudioContext() {
    if (this.audioContext && this.audioContext.state === "running") {
      return;
    }

    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Resume AudioContext if it's suspended (required by browsers)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.initialized = true;
    } catch (error) {
      console.warn("AudioContext initialization failed:", error);
      this.enabled = false;
    }
  }

  // Create sounds only when needed
  async createCheckSound() {
    if (!this.enabled) return;

    try {
      await this.initAudioContext();

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        1200,
        this.audioContext.currentTime + 0.1
      );

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        this.volume,
        this.audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.2
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn("Failed to create check sound:", error);
    }
  }

  async createUncheckSound() {
    if (!this.enabled) return;

    try {
      await this.initAudioContext();

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        400,
        this.audioContext.currentTime + 0.15
      );

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        this.volume * 0.7,
        this.audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.15
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.15);
    } catch (error) {
      console.warn("Failed to create uncheck sound:", error);
    }
  }

  async createSubtaskCheckSound() {
    if (!this.enabled) return;

    try {
      await this.initAudioContext();

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        1400,
        this.audioContext.currentTime + 0.08
      );

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        this.volume * 0.6,
        this.audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.15
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.15);
    } catch (error) {
      console.warn("Failed to create subtask check sound:", error);
    }
  }

  async createSubtaskUncheckSound() {
    if (!this.enabled) return;

    try {
      await this.initAudioContext();

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        300,
        this.audioContext.currentTime + 0.12
      );

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        this.volume * 0.5,
        this.audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.12
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.12);
    } catch (error) {
      console.warn("Failed to create subtask uncheck sound:", error);
    }
  }

  async playCheckSound() {
    if (!this.enabled) return;
    await this.createCheckSound();
  }

  async playUncheckSound() {
    if (!this.enabled) return;
    await this.createUncheckSound();
  }

  async playSubtaskCheckSound() {
    if (!this.enabled) return;
    await this.createSubtaskCheckSound();
  }

  async playSubtaskUncheckSound() {
    if (!this.enabled) return;
    await this.createSubtaskUncheckSound();
  }

  async createCrowdCheeringSound() {
    if (!this.enabled) return;

    try {
      await this.initAudioContext();

      // Fetch the audio file
      const response = await fetch("/sounds/crowd-cheer.wav");
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Create source and gain nodes
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Set volume
      gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

      // Play only the first 3 seconds (from 2 seconds to 5 seconds)
      const startTime = 2; // Start at 2 seconds
      const duration = 3; // Play for 3 seconds

      source.start(0, startTime, duration);
    } catch (error) {
      console.warn("Failed to play crowd cheering sound:", error);
    }
  }

  async playCrowdCheeringSound() {
    if (!this.enabled) return;
    await this.createCrowdCheeringSound();
  }

  toggleSound() {
    this.enabled = !this.enabled;
    localStorage.setItem("soundEnabled", this.enabled.toString());
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem("soundVolume", this.volume.toString());
  }

  getVolume() {
    return this.volume;
  }

  isEnabled() {
    return this.enabled;
  }

  // Load settings from localStorage
  loadSettings() {
    const soundEnabled = localStorage.getItem("soundEnabled");
    if (soundEnabled !== null) {
      this.enabled = soundEnabled === "true";
    }

    const soundVolume = localStorage.getItem("soundVolume");
    if (soundVolume !== null) {
      this.volume = parseFloat(soundVolume);
    }
  }
}

// Create a singleton instance
const soundManager = new SoundManager();

export default soundManager;
