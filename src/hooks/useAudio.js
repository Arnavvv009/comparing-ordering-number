import { useCallback } from 'react';

export function useAudio(audioEnabled) {
  // Web Audio API Sound Effects Generator
  const playSFX = useCallback((frequencies, durations) => {
    if (!audioEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      let timeOffset = 0;
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.frequency.value = freq;
        const dur = durations[i] / 1000;
        const t0 = ctx.currentTime + timeOffset;
        
        gainNode.gain.setValueAtTime(0.15, t0);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t0 + dur - 0.01);
        
        osc.start(t0);
        osc.stop(t0 + dur);
        
        timeOffset += dur;
      });
    } catch (e) {
      console.warn("Web Audio API failed or blocked: ", e);
    }
  }, [audioEnabled]);

  const playSound = useCallback((type) => {
    switch (type) {
      case 'correct':
        playSFX([880, 1100], [150, 150]);
        break;
      case 'wrong':
        playSFX([220], [300]);
        break;
      case 'badge':
        playSFX([523, 659, 784, 1047], [100, 100, 100, 200]);
        break;
      case 'streak':
        playSFX([440, 880], [100, 200]);
        break;
      case 'levelUp':
        playSFX([523, 659, 784, 1047, 1319], [80, 80, 80, 80, 300]);
        break;
      case 'shapeReveal':
        playSFX([400, 600, 800], [120, 120, 180]);
        break;
      case 'explore':
        playSFX([660, 720], [100, 150]);
        break;
      default:
        break;
    }
  }, [playSFX]);

  return {
    playSound,
    playSFX
  };
}
