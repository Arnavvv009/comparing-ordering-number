import React, { useState, useEffect } from 'react';
import Mascot from '../shared/Mascot';

export default function WonderPhase({ onNext, playSound, speak }) {
  const [value, setValue] = useState(8);
  const [revealed, setRevealed] = useState(false);
  const [isDropping, setIsDropping] = useState(false);

  useEffect(() => {
    speak("Robo checks two freezers: one reads minus 3 degrees, the other reads minus 7 degrees. Robo's friend says minus 7 must be warmer, because 7 is a bigger number than 3. Is that actually true?");
  }, [speak]);

  const dropTemperature = () => {
    if (isDropping) return;
    setIsDropping(true);
    playSound('explore');

    let current = 8;
    const interval = setInterval(() => {
      current -= 1;
      if (current <= -9) {
        setValue(-9);
        setIsDropping(false);
        clearInterval(interval);
        playSound('shapeReveal');
        setRevealed(true);
        speak("Not true at all! With negative numbers the rule flips — the bigger the digit after the minus sign, the SMALLER and colder the value. Minus 9 is colder than minus 3! Let's explore comparing every kind of number in the story!");
      } else {
        setValue(current);
      }
    }, 90);
  };

  const handleReveal = () => {
    if (revealed) {
      playSound('explore');
      onNext();
      return;
    }
    setValue(-9);
    setRevealed(true);
    playSound('shapeReveal');
    speak("Not true at all! With negative numbers the rule flips — the bigger the digit after the minus sign, the SMALLER and colder the value. Minus 9 is colder than minus 3! Let's explore comparing every kind of number in the story!");
  };

  // SVG geometry for the thermometer + number line
  const W = 340, H = 180;
  const lineY = 128;
  const padX = 26;
  const MIN = -10, MAX = 10;
  const xFor = (v) => padX + ((v - MIN) / (MAX - MIN)) * (W - padX * 2);

  // Thermometer fill height (bulb at bottom)
  const tubeTop = 24, tubeBottom = 96;
  const fillRatio = (value - MIN) / (MAX - MIN);
  const fillY = tubeBottom - fillRatio * (tubeBottom - tubeTop);

  const isNegative = value < 0;
  const mercuryColor = isNegative ? '#4A90D9' : '#ff8a50';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: '1', padding: '16px 18px', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden', animation: 'slideInUp 0.4s ease-out', justifyContent: 'space-between', height: '100%' }}>
      <Mascot
        mood={revealed ? "celebrating" : "thinking"}
        bubble={revealed ? <span style={{ fontSize: '18px', fontWeight: '800' }}>With negatives, a bigger digit means a SMALLER value! 🧊</span> : <span style={{ fontSize: '18px', fontWeight: '800' }}>Hmm... I wonder... 🤔</span>}
      />

      {/* Freezer Simulator Visual */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '-12px 0 6px 0', width: '100%', zIndex: 2 }}>
        <div style={{
          position: 'relative',
          width: '340px',
          height: '180px',
          backgroundColor: 'rgba(27, 16, 60, 0.6)',
          border: '1.5px solid rgba(74, 52, 133, 0.6)',
          borderRadius: '16px',
          padding: '8px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: '8px', left: '12px', fontSize: '11px', fontWeight: '900',
            color: 'var(--accent-gold)', letterSpacing: '1px', textTransform: 'uppercase'
          }}>
            🧊 Freezer Thermometer
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block', margin: '0 auto' }}>
            {/* Thermometer tube */}
            <rect x={W / 2 - 11} y={tubeTop - 6} width="22" height={tubeBottom - tubeTop + 14} rx="11" fill="rgba(255,255,255,0.06)" stroke="#4a3485" strokeWidth="2" />
            <rect x={W / 2 - 7} y={fillY} width="14" height={tubeBottom - fillY + 6} fill={mercuryColor} opacity="0.9" rx="7" />
            <circle cx={W / 2} cy={tubeBottom + 12} r="14" fill={mercuryColor} stroke="#130a2a" strokeWidth="2" />

            {/* Freezing marker on the tube */}
            <line x1={W / 2 - 18} y1={tubeBottom - ((0 - MIN) / (MAX - MIN)) * (tubeBottom - tubeTop)} x2={W / 2 + 18} y2={tubeBottom - ((0 - MIN) / (MAX - MIN)) * (tubeBottom - tubeTop)} stroke="#ffbe1a" strokeWidth="2" strokeDasharray="3,3" />

            {/* Number line */}
            <rect x={padX} y={lineY - 16} width={Math.max(0, xFor(0) - padX)} height="32" fill="#4A90D9" opacity="0.1" rx="5" />
            <line x1={padX - 10} y1={lineY} x2={W - padX + 10} y2={lineY} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.85" />

            {Array.from({ length: MAX - MIN + 1 }).map((_, i) => {
              const v = MIN + i;
              const x = xFor(v);
              const isZero = v === 0;
              const isMajor = v % 5 === 0;
              return (
                <g key={v}>
                  <line x1={x} y1={lineY - (isMajor ? 8 : 4)} x2={x} y2={lineY + (isMajor ? 8 : 4)} stroke={isZero ? '#ffbe1a' : '#bca8f2'} strokeWidth={isZero ? 2.5 : isMajor ? 1.8 : 1} opacity={isMajor ? 0.95 : 0.5} />
                  {isMajor && (
                    <text x={x} y={lineY + 24} fill={isZero ? '#ffbe1a' : '#bca8f2'} fontSize="10" fontWeight="800" fontFamily="Nunito, sans-serif" textAnchor="middle">{v}</text>
                  )}
                </g>
              );
            })}

            {/* Current value marker */}
            <circle cx={xFor(value)} cy={lineY} r="7" fill={mercuryColor} stroke="#130a2a" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Text description */}
        <div style={{ color: '#ffffff', fontSize: '15px', fontWeight: '800', margin: '4px 0', fontFamily: "'Inter', sans-serif" }}>
          Temperature: <span style={{ color: isNegative ? '#4A90D9' : '#ff8a50', fontWeight: '900' }}>{value}°C</span>
          {value < 0 ? ' (Below zero! 🧊)' : value === 0 ? ' (Exactly freezing ❄️)' : ' (Above zero 🌡️)'}
        </div>

        {/* Controls Row */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '6px' }}>
          <input
            type="range"
            min="-10"
            max="10"
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value);
              setValue(v);
              if (v < -3 && !revealed) {
                setRevealed(true);
                playSound('shapeReveal');
                speak("Not true at all! With negative numbers the rule flips — the bigger the digit after the minus sign, the smaller and colder the value!");
              }
            }}
            disabled={isDropping}
            style={{ width: '90%', maxWidth: '340px', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', outline: 'none', cursor: 'pointer' }}
          />

          <button
            className="btn-gold"
            onClick={dropTemperature}
            disabled={isDropping}
            style={{
              padding: '6px 16px', fontSize: '13px', fontWeight: '800', borderRadius: '999px',
              border: '1.5px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              opacity: isDropping ? 0.6 : 1, cursor: isDropping ? 'not-allowed' : 'pointer'
            }}
          >
            🧊 Auto-Chill (8°C ➔ −9°C)
          </button>
        </div>
      </div>

      <h2 className="wonder-heading" style={{ fontSize: '26px', fontWeight: '900', lineHeight: '1.3', margin: '4px 0', zIndex: 2 }}>
        Robo checks two freezers: one reads −3°C, the other reads −7°C. Robo's friend says −7 must be warmer, because 7 is a bigger number than 3. Is that actually true?
      </h2>

      <p className="wonder-subtitle" style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px', zIndex: 2, opacity: 0.9 }}>
        What if the number line keeps running the other way, past zero into the negatives?
      </p>

      <div className="hint-fact-pill" style={{ marginBottom: '8px', zIndex: 2, padding: '8px 16px', fontSize: '16px', fontWeight: '900' }}>
        ✨ On a number line, whatever sits further LEFT is always the smaller value! ✨
      </div>

      {revealed && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 0.5;
            const size = Math.random() * 6 + 6;
            const color = ['#ffbe1a', '#22c55e', '#a78bfa', '#ff8a50'][i % 4];
            return (
              <div key={i} style={{
                position: 'absolute', left: `${left}%`, top: '60%',
                width: `${size}px`, height: `${size}px`, backgroundColor: color,
                borderRadius: i % 2 === 0 ? '50%' : '0', opacity: 0.8,
                animation: `floatUp 1.2s ease-out forwards`, animationDelay: `${delay}s`
              }} />
            );
          })}
        </div>
      )}

      <button className="btn-gold" onClick={handleReveal} style={{ alignSelf: 'center', zIndex: 2, padding: '12px 40px', fontSize: '21px', fontWeight: '900' }}>
        {revealed ? "Let's Read the Story! ➔" : "I have a guess! 🔍 Let's Find Out!"}
      </button>
    </div>
  );
}
