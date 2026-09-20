import { audioMap } from './audioMap.js';

const segmentHelpers = {
  say: (text) => ({ text, style: 'statement' }),
  ask: (text) => ({ text, style: 'question' }),
  cheer: (text) => ({ text, style: 'encouragement' }),
  emphasize: (text) => ({ text, style: 'emphasis' }),
  think: (text) => ({ text, style: 'thinking' }),
  celebrate: (text) => ({ text, style: 'celebration' }),
  instruct: (text) => ({ text, style: 'instruction' })
};

const { say, ask, cheer, emphasize, think, celebrate, instruct } = segmentHelpers;

let isPlaying = false;
let currentAudio = null;
let isAudioMuted = false;

export function setMuted(muted) {
  isAudioMuted = Boolean(muted);
  if (isAudioMuted) {
    stopNarration();
  }
}

export function isMuted() {
  return isAudioMuted;
}

export function getAudioUrl(text) {
  if (!text) return null;
  const trimmed = text.trim();
  if (audioMap && audioMap[trimmed]) {
    return audioMap[trimmed];
  }
  if (audioMap && audioMap[text]) {
    return audioMap[text];
  }
  return null;
}

export async function playAudio(url) {
  if (isAudioMuted || !url) return;
  return new Promise((resolve) => {
    stopNarration();
    if (isAudioMuted) {
      resolve();
      return;
    }
    try {
      const audio = new Audio(url);
      currentAudio = audio;
      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        if (currentAudio === audio) currentAudio = null;
        resolve();
      };
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started
          })
          .catch(() => {
            if (currentAudio === audio) currentAudio = null;
            resolve();
          });
      }
    } catch (e) {
      currentAudio = null;
      resolve();
    }
  });
}

export async function speakText(text) {
  if (isAudioMuted || !text) return;

  // Purely play pre-generated local MP3 audio from audioMap (no browser speech synthesis)
  const localUrl = getAudioUrl(text);
  if (localUrl) {
    try {
      stopNarration();
      if (isAudioMuted) return;
      await playAudio(localUrl);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }
}

export async function narrate(segments, preloadNext = true) {
  if (!segments || segments.length === 0 || isAudioMuted) return;
  stopNarration();
  isPlaying = true;
  for (let i = 0; i < segments.length; i++) {
    if (isAudioMuted) break;
    const { text } = segments[i];
    await speakText(text);
  }
  isPlaying = false;
}

export function stopNarration() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }
  isPlaying = false;
}

// Call this on user gestures (e.g. click/tap) to unlock
// browser autoplay policy for HTMLAudioElement and Web Audio API
export function unlockAudio() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      if (!window.__intelliaAudioCtx) {
        window.__intelliaAudioCtx = new AudioContextClass();
      }
      if (window.__intelliaAudioCtx.state === 'suspended') {
        window.__intelliaAudioCtx.resume().catch(() => {});
      }
    }
    // Silent audio element to unlock HTMLAudioElement playback
    const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    silent.play().catch(() => {});
  } catch (e) {}
}

export {
  say,
  ask,
  cheer,
  emphasize,
  think,
  celebrate,
  instruct
};
