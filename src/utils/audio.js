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

// Helper to convert math characters to spoken words for natural speech synthesis
function formatTextForSpeech(text) {
  if (!text) return '';
  let s = text;
  // Replace negative signs and temperatures
  s = s.replace(/−(\d+)\s*°C/g, 'minus $1 degrees Celsius');
  s = s.replace(/(\d+)\s*°C/g, '$1 degrees Celsius');
  s = s.replace(/−(\d+)/g, 'minus $1');
  s = s.replace(/-\s*(\d+)/g, 'minus $1');

  // Replace fractions
  s = s.replace(/\b1\/2\b/g, 'one half');
  s = s.replace(/\b1\/3\b/g, 'one third');
  s = s.replace(/\b2\/3\b/g, 'two thirds');
  s = s.replace(/\b1\/4\b/g, 'one fourth');
  s = s.replace(/\b3\/4\b/g, 'three fourths');
  s = s.replace(/\b1\/5\b/g, 'one fifth');
  s = s.replace(/\b2\/5\b/g, 'two fifths');
  s = s.replace(/\b3\/5\b/g, 'three fifths');
  s = s.replace(/\b4\/5\b/g, 'four fifths');
  s = s.replace(/\b1\/6\b/g, 'one sixth');
  s = s.replace(/\b5\/6\b/g, 'five sixths');
  s = s.replace(/\b1\/8\b/g, 'one eighth');
  s = s.replace(/\b3\/8\b/g, 'three eighths');
  s = s.replace(/\b5\/8\b/g, 'five eighths');
  s = s.replace(/\b7\/8\b/g, 'seven eighths');
  s = s.replace(/\b(\d+)\/(\d+)\b/g, '$1 over $2');

  // Replace comparison operators
  s = s.replace(/\s*<\s*/g, ' is less than ');
  s = s.replace(/\s*>\s*/g, ' is greater than ');
  s = s.replace(/\s*=\s*/g, ' equals ');
  s = s.replace(/➔|→/g, ' ');

  // Clean decorative emojis
  s = s.replace(/[🧊⚪🔢🍕📍✨💡🎮🔄📋🏆🔍📖✏️🤔🌡️❄️]/g, '');
  return s.trim();
}

export function getAudioUrl(text) {
  if (audioMap && audioMap[text]) {
    return audioMap[text];
  }
  return null;
}

export async function playAudio(url) {
  if (isAudioMuted) return;
  return new Promise((resolve, reject) => {
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
      audio.onerror = (err) => {
        if (currentAudio === audio) currentAudio = null;
        reject(err);
      };
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started successfully
          })
          .catch((err) => {
            if (currentAudio === audio) currentAudio = null;
            reject(err);
          });
      }
    } catch (e) {
      currentAudio = null;
      reject(e);
    }
  });
}

function speakWithSpeechSynthesis(text) {
  if (isAudioMuted || !text) return;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      stopNarration();
      if (isAudioMuted) return;

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const cleanText = formatTextForSpeech(text);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.92;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.toLowerCase().includes('en-sg') || v.lang.toLowerCase() === 'en_sg')
        || voices.find(v => v.lang.toLowerCase().startsWith('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
    }
  }
}

export async function speakText(text) {
  if (isAudioMuted || !text) return;

  // 1. If static MP3 exists in audioMap, play the generated MP3
  const localUrl = getAudioUrl(text);
  if (localUrl) {
    try {
      stopNarration();
      if (isAudioMuted) return;
      await playAudio(localUrl);
      return;
    } catch (e) {
      console.warn('Static MP3 playback blocked/failed, falling back to SpeechSynthesis:', e);
      speakWithSpeechSynthesis(text);
    }
  } else {
    // 2. Fallback directly to native browser SpeechSynthesis
    speakWithSpeechSynthesis(text);
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
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
  isPlaying = false;
}

// Call this on user gestures (e.g. click/tap) to unlock
// browser autoplay policy and AudioContext/SpeechSynthesis
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
    // Prime SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
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
