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

  // Web Speech API Text-to-Speech Narration
  const speak = useCallback((text, options = {}) => {
    if (!audioEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate ?? 0.85;   // Child friendly slower speed
      utterance.pitch = options.pitch ?? 1.1;  // Warm child-friendly pitch
      
      // Attempt to load Singapore English voice
      const voices = window.speechSynthesis.getVoices();
      const sgVoice = voices.find(v => v.lang.toLowerCase().includes('en-sg') || v.lang.toLowerCase() === 'en_sg');
      if (sgVoice) {
        utterance.voice = sgVoice;
      } else {
        const enVoice = voices.find(v => v.lang.toLowerCase().startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }
      
      utterance.lang = sgVoice ? sgVoice.lang : 'en-SG';
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error: ", e);
    }
  }, [audioEnabled]);

  const speakQuestion = useCallback((q) => {
    let narrationText = q.questionText;
    // For visual questions, supplement with a verbal description for accessibility
    if (q.type === 'shape_name' && q.targetShape) {
      narrationText = `Look at this shape. ${narrationText}`;
    }
    speak(narrationText);
  }, [speak]);

  const speakShapeName = useCallback((name) => {
    speak(`This is a ${name}!`);
  }, [speak]);

  const speakProperty = useCallback((shape, prop, val) => {
    speak(`A ${shape} has ${val} ${prop}.`);
  }, [speak]);

  const speakPraise = useCallback(() => {
    const praises = ['Excellent!', 'Well done!', 'Brilliant!', 'You got it!', 'Super smart!'];
    const p = praises[Math.floor(Math.random() * praises.length)];
    speak(p);
  }, [speak]);

  const speakHint = useCallback((text) => {
    speak(text, { rate: 0.8 });
  }, [speak]);

  const speakFunFact = useCallback((text) => {
    speak(text, { rate: 0.85, pitch: 1.15 });
  }, [speak]);

  const speakExplanation = useCallback((text) => {
    speak(text, { rate: 0.82 });
  }, [speak]);

  return {
    speak,
    speakQuestion,
    speakShapeName,
    speakProperty,
    speakPraise,
    speakHint,
    speakFunFact,
    speakExplanation,
    playSound
  };
}
