/**
 * Little Big World — WebAudio Synthesizer & Tactile Haptics
 * Zero external audio files or dependencies.
 * AudioContext initializes only after first user gesture.
 */

let audioCtx = null;
let isMuted = false;
let isHapticsEnabled = true;

// Initialize AudioContext lazily on user gesture
export const initAudio = () => {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
};

export const setMuted = (muted) => {
  isMuted = Boolean(muted);
};

export const setHapticsEnabled = (enabled) => {
  isHapticsEnabled = Boolean(enabled);
};

// Safe haptic vibration
export const triggerHaptic = (duration = 15) => {
  if (isHapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignore vibration errors if blocked by browser policy
    }
  }
};

// Generic note generator
const playTone = (freq, type, duration, startDelay = 0, gainLevel = 0.18) => {
  if (isMuted) return;
  initAudio();
  if (!audioCtx) return;

  try {
    const now = audioCtx.currentTime + startDelay;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(gainLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // Ignore audio context scheduling errors
  }
};

// 1. Hit Beep (Punchy reflex pop)
export const playHitSound = () => {
  triggerHaptic(15);
  playTone(720, 'sine', 0.08, 0, 0.2);
};

// 2. Wrong / Penalty Thud (Low buzzer)
export const playWrongSound = () => {
  triggerHaptic(30);
  playTone(140, 'sawtooth', 0.16, 0, 0.22);
};

// 3. Correct Pattern / Step Chime (Sweet two-note chime)
export const playCorrectSound = () => {
  triggerHaptic(18);
  playTone(523.25, 'triangle', 0.09, 0, 0.18); // C5
  playTone(659.25, 'triangle', 0.14, 0.07, 0.18); // E5
};

// 4. Level-Up Fanfare (Ascending bright arpeggio)
export const playLevelUpSound = () => {
  triggerHaptic([30, 40, 60]);
  playTone(523.25, 'triangle', 0.1, 0.0, 0.2); // C5
  playTone(659.25, 'triangle', 0.1, 0.08, 0.2); // E5
  playTone(783.99, 'triangle', 0.12, 0.16, 0.2); // G5
  playTone(1046.5, 'sine', 0.25, 0.24, 0.22); // C6
};

// 5. Win / Chest Sparkle Chime
export const playWinSound = () => {
  triggerHaptic([20, 30, 40]);
  playTone(659.25, 'sine', 0.1, 0.0, 0.18); // E5
  playTone(880.0, 'sine', 0.1, 0.07, 0.18); // A5
  playTone(1174.66, 'sine', 0.12, 0.14, 0.18); // D6
  playTone(1318.51, 'triangle', 0.3, 0.21, 0.22); // E6
};
