import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Mascot from '../shared/Mascot';
import NumberLineViewer from '../shared/NumberLineViewer';
import { NUMBER_TYPES, classifyNumber, toDecimal, compareValues, sortAscending, SCENARIOS, getScenario } from '../../data/numberData';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

// Station A — Number Line Lab: presets that walk the learner across every
// number family, showing each one's live position, decimal value and class.
const LAB_PRESETS = [
  { id: 'p1', label: '🧊 Negative', value: -6 },
  { id: 'p2', label: '⚪ Zero', value: 0 },
  { id: 'p3', label: '🔢 Integer', value: 7 },
  { id: 'p4', label: '🍕 Fraction', value: 2.5 },
  { id: 'p5', label: '📍 Decimal', value: -3.5 },
];

// Station B — Plot It: place a written value at the right spot on the line by
// clicking the correct drop zone.
const PLOT_ROUNDS = [
  { id: 'b1', display: '-4',   value: -4,   targets: [-6, -4, -2, 1, 3] },
  { id: 'b2', display: '2.5',  value: 2.5,  targets: [-2.5, 0.5, 2.5, 4.5, 6] },
  { id: 'b3', display: '-1/2', value: -0.5, targets: [-4, -2, -0.5, 1.5, 5] },
  { id: 'b4', display: '7',    value: 7,    targets: [-3, 0, 3, 5, 7] },
  { id: 'b5', display: '-7.5', value: -7.5, targets: [-7.5, -5, -1, 2, 6] },
];

// Station C — Comparison Duel: choose <, > or = between two mixed-form values.
const DUEL_ROUNDS = [
  { id: 'c1', left: '-7',   right: '-3',   hint: 'Both are negative — which sits further left?' },
  { id: 'c2', left: '3/4',  right: '0.75', hint: 'Convert the fraction to a decimal first.' },
  { id: 'c3', left: '0.5',  right: '0.45', hint: 'Line up the decimal points: 0.50 vs 0.45.' },
  { id: 'c4', left: '-2',   right: '1/4',  hint: 'Every negative is smaller than every positive.' },
  { id: 'c5', left: '1/3',  right: '3/8',  hint: 'As decimals: 0.333... and 0.375.' },
  { id: 'c6', left: '-0.5', right: '-1/2', hint: 'Convert −1/2 to a decimal.' },
];

// Station D — Ordering Ladder: click values smallest → largest, real-world framed.
const SANDBOX_IDS = SCENARIOS.map(s => s.id);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SimulatePhase({ onNext, playSound, speak }) {
  const [station, setStation] = useState(0);
  const [completedStations, setCompletedStations] = useState([false, false, false, false]);

  const markDone = useCallback((idx) => {
    setCompletedStations(prev => {
      const next = [...prev]; next[idx] = true; return next;
    });
  }, []);

  useEffect(() => {
    const msgs = [
      "Welcome to the Number Line Lab! Drag the slider from minus ten to plus ten and watch where each value lands and what family it belongs to. Try every preset!",
      "Station B — Plot It! Read the number, then click the exact spot where it belongs on the number line.",
      "Station C — Comparison Duel! Two numbers face off. Choose whether the left one is less than, greater than, or equal to the right one.",
      "Station D — Ordering Ladder! Pick a real scenario, then click its values from smallest to largest to build the ladder."
    ];
    speak(msgs[station]);
  }, [station, speak]);

  // ──────────────────────────────────────────────────────────────────────────
  // STATION A — Number Line Lab (single slider, live redraw + classification)
  // ──────────────────────────────────────────────────────────────────────────
  const [labVal, setLabVal] = useState(3);
  const [labPresetsSeen, setLabPresetsSeen] = useState(new Set());

  const labType = labVal < 0 ? 'negative' : Number.isInteger(labVal) ? 'integer' : 'decimal';
  const labInfo = NUMBER_TYPES[labType];

  const handleLabSlider = (val) => setLabVal(Number(val));

  const handleLabPreset = (preset) => {
    setLabVal(preset.value);
    playSound('explore');
    speak(`${preset.label.replace(/[^\w ]/g, '').trim()}: ${preset.value}.`);
    setLabPresetsSeen(prev => {
      const next = new Set(prev);
      next.add(preset.id);
      if (next.size >= LAB_PRESETS.length) markDone(0);
      return next;
    });
  };

  const handleResetA = () => {
    setLabVal(3);
    setLabPresetsSeen(new Set());
    setCompletedStations(prev => { const n = [...prev]; n[0] = false; return n; });
    speak("Station A reset! Drag the slider or tap a preset.");
  };

  // ──────────────────────────────────────────────────────────────────────────
  // STATION B — Plot It
  // ──────────────────────────────────────────────────────────────────────────
  const [plotIdx, setPlotIdx] = useState(0);
  const [plotGuess, setPlotGuess] = useState(null);
  const [plotFb, setPlotFb] = useState(null);
  const [plotSolvedCount, setPlotSolvedCount] = useState(0);

  const plotRound = PLOT_ROUNDS[plotIdx];

  const handlePlotClick = (target) => {
    if (plotFb === 'correct') return;
    const correct = Math.abs(target - plotRound.value) < 1e-9;
    setPlotGuess(target);
    setPlotFb(correct ? 'correct' : 'wrong');
    if (correct) {
      playSound('correct');
      speak(`Correct! ${plotRound.display} belongs exactly there on the number line.`);
      const newCount = plotSolvedCount + 1;
      setPlotSolvedCount(newCount);
      if (newCount >= PLOT_ROUNDS.length) {
        setTimeout(() => speak("Fantastic plotting! Station B is complete!"), 1200);
        markDone(1);
      }
    } else {
      playSound('wrong');
      speak("Not quite — remember, negatives sit to the LEFT of zero and positives to the right.");
    }
  };

  const handlePlotNext = () => {
    if (plotIdx < PLOT_ROUNDS.length - 1) {
      setPlotIdx(i => i + 1);
      setPlotGuess(null); setPlotFb(null);
      speak("Next number! Click where it belongs.");
    }
  };

  const handleResetB = () => {
    setPlotIdx(0);
    setPlotGuess(null); setPlotFb(null);
    setPlotSolvedCount(0);
    setCompletedStations(prev => { const n = [...prev]; n[1] = false; return n; });
    speak("Station B reset! Let's plot some numbers.");
  };

  // ──────────────────────────────────────────────────────────────────────────
  // STATION C — Comparison Duel
  // ──────────────────────────────────────────────────────────────────────────
  const [duelIdx, setDuelIdx] = useState(0);
  const [duelGuess, setDuelGuess] = useState(null);
  const [duelFb, setDuelFb] = useState(null);
  const [duelSolvedCount, setDuelSolvedCount] = useState(0);

  const duelRound = DUEL_ROUNDS[duelIdx];
  const duelCorrect = compareValues(duelRound.left, duelRound.right);

  const handleDuelGuess = (symbol) => {
    if (duelFb === 'correct') return;
    const correct = symbol === duelCorrect;
    setDuelGuess(symbol);
    setDuelFb(correct ? 'correct' : 'wrong');
    if (correct) {
      playSound('correct');
      speak(`Correct! ${duelRound.left} is ${duelCorrect === '<' ? 'less than' : duelCorrect === '>' ? 'greater than' : 'equal to'} ${duelRound.right}.`);
      const newCount = duelSolvedCount + 1;
      setDuelSolvedCount(newCount);
      if (newCount >= DUEL_ROUNDS.length) {
        setTimeout(() => speak("Amazing! You've won every comparison duel. Station C is complete!"), 1200);
        markDone(2);
      }
    } else {
      playSound('wrong');
      speak("Not quite — convert both numbers to decimals, then check which sits further left.");
    }
  };

  const handleDuelNext = () => {
    if (duelIdx < DUEL_ROUNDS.length - 1) {
      setDuelIdx(i => i + 1);
      setDuelGuess(null); setDuelFb(null);
      speak("Next duel! Which symbol goes in the middle?");
    }
  };

  const handleResetC = () => {
    setDuelIdx(0);
    setDuelGuess(null); setDuelFb(null);
    setDuelSolvedCount(0);
    setCompletedStations(prev => { const n = [...prev]; n[2] = false; return n; });
    speak("Station C reset! Let's duel some numbers.");
  };

  // ──────────────────────────────────────────────────────────────────────────
  // STATION D — Ordering Ladder (sandbox + gated final button)
  // ──────────────────────────────────────────────────────────────────────────
  const [sandboxId, setSandboxId] = useState(SANDBOX_IDS[0]);
  const sandboxScenario = getScenario(sandboxId);
  const [placed, setPlaced] = useState([]);
  const [ladderWrong, setLadderWrong] = useState(null);
  const [sandboxSolvedCount, setSandboxSolvedCount] = useState(0);
  const [sandboxDoneIds, setSandboxDoneIds] = useState(new Set());

  const shuffledLadder = useMemo(() => shuffle(sandboxScenario.values), [sandboxId]);
  const ladderSorted = useMemo(() => sortAscending(sandboxScenario.values), [sandboxId]);

  const handleLadderClick = (val) => {
    if (placed.includes(val)) return;
    const expected = ladderSorted[placed.length];
    if (val === expected) {
      playSound('correct');
      const nextPlaced = [...placed, val];
      setPlaced(nextPlaced);
      if (nextPlaced.length === ladderSorted.length && !sandboxDoneIds.has(sandboxId)) {
        const newDone = new Set(sandboxDoneIds);
        newDone.add(sandboxId);
        setSandboxDoneIds(newDone);
        const newCount = sandboxSolvedCount + 1;
        setSandboxSolvedCount(newCount);
        speak(`Perfect ordering! ${sandboxScenario.explanation}`);
        if (newCount >= SANDBOX_IDS.length) {
          setTimeout(() => speak("Outstanding! You've ordered every real-world list. Station D is complete! You can now begin the challenge game!"), 1200);
          markDone(3);
        }
      }
    } else {
      setLadderWrong(val);
      playSound('wrong');
      speak("Not the smallest remaining — convert them all to decimals and compare again.");
      setTimeout(() => setLadderWrong(null), 700);
    }
  };

  const switchSandboxScenario = (id) => {
    setSandboxId(id);
    setPlaced([]);
    setLadderWrong(null);
    playSound('explore');
    speak(getScenario(id).context);
  };

  const handleResetD = () => {
    setSandboxId(SANDBOX_IDS[0]);
    setPlaced([]);
    setLadderWrong(null);
    setSandboxSolvedCount(0);
    setSandboxDoneIds(new Set());
    setCompletedStations(prev => { const n = [...prev]; n[3] = false; return n; });
    speak("Station D reset! Pick a real-world list to order.");
  };

  // -------------------------------------------------------------
  return (
    <div style={{ width: '100%' }}>
      <div className="simulate-header" style={{ marginBottom: '8px', textAlign: 'center' }}>
        <h2 className="simulate-heading" style={{ fontSize: '28px', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '2px' }}>✏️ Simulate</h2>
        <p className="simulate-sub" style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>Explore and discover — no wrong answers!</p>
      </div>

      <div className="simulate-tabs">
        {[
          { id: 0, label: "Number Line Lab", badge: "A", color: "#a78bfa" },
          { id: 1, label: "Plot It", badge: "B", color: "#34d399" },
          { id: 2, label: "Comparison Duel", badge: "C", color: "#ffbe1a" },
          { id: 3, label: "Ordering Ladder", badge: "D", color: "#ff8a50" }
        ].map((tab) => (
          <div key={tab.id} className={`sim-tab ${station === tab.id ? 'sim-tab--active' : ''}`} onClick={() => setStation(tab.id)}>
            <div className="sim-tab-badge" style={{ backgroundColor: tab.color }}>{tab.badge}</div>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>{tab.label}</span>
            {completedStations[tab.id] && <span style={{ color: 'var(--accent-success-green)' }}>✓</span>}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: '1', padding: '12px 14px 20px 14px', position: 'relative', overflow: 'hidden', animation: 'slideInUp 0.4s ease-out' }}>

        {/* ================= STATION A: NUMBER LINE LAB ================= */}
        {station === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 className="sim-station-title" style={{ fontSize: '22px', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '4px' }}><span>🔬</span> Number Line Lab</h3>
            <p className="sim-station-instruction" style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-muted-lavender)', marginBottom: '8px' }}>
              Drag the slider from −10 to +10 — watch the marker slide and its number family change live!
            </p>

            <NumberLineViewer
              min={-10} max={10} step={1}
              width={620} height={140}
              markers={[{ value: labVal, label: String(labVal), color: labInfo.color }]}
            />

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-30px' }}>
              <div style={{
                textAlign: 'center', padding: '12px 26px', borderRadius: 14,
                background: `${labInfo.color}22`, border: `2px solid ${labInfo.color}`,
                color: labInfo.color, fontWeight: 800, fontSize: 19,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', transition: 'all 0.3s ease'
              }}>
                {labInfo.emoji} {labVal} — {labInfo.name}
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted-lavender)', marginTop: 4 }}>
                  {labVal < 0 ? 'Left of zero → smaller than every positive' : labVal === 0 ? 'Exactly zero → the dividing point' : 'Right of zero → greater than every negative'}
                </div>
              </div>
            </div>

            <div style={{ maxWidth: 440, margin: '0 auto', width: '100%' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 18, fontWeight: '800', color: 'var(--text-muted-lavender)' }}>
                Value: {labVal}
                <input type="range" min="-10" max="10" step="0.5" value={labVal} onChange={(e) => handleLabSlider(e.target.value)} style={{ width: '100%', cursor: 'pointer' }} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {LAB_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  className={`shape-selector-btn ${labPresetsSeen.has(preset.id) ? 'shape-selector-btn--active' : ''}`}
                  onClick={() => handleLabPreset(preset)}
                >
                  {labPresetsSeen.has(preset.id) ? '✓ ' : ''}{preset.label}
                </button>
              ))}
            </div>

            {labPresetsSeen.size >= LAB_PRESETS.length && (
              <div style={{ textAlign: 'center', color: 'var(--accent-success-green)', fontWeight: 800, fontSize: 17 }}>
                🎉 You've explored every number family! Station A complete!
              </div>
            )}

            <button className="btn-nav-outline" style={{ alignSelf: 'center', fontSize: '14px', fontWeight: '800' }} onClick={handleResetA}>🔄 Reset Station A</button>

            <Mascot mood={labPresetsSeen.size >= LAB_PRESETS.length ? 'celebrating' : 'curious'}
              bubble={<span style={{ fontSize: '15.5px', fontWeight: '800' }}>{labInfo.funFact}</span>} />
          </div>
        )}

        {/* ================= STATION B: PLOT IT ================= */}
        {station === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 className="sim-station-title" style={{ fontSize: '22px', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '4px' }}><span>📍</span> Plot It</h3>
            <p className="sim-station-instruction" style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-muted-lavender)', marginBottom: '8px' }}>
              Number {plotIdx + 1} of {PLOT_ROUNDS.length}: Click the circle where this value belongs!
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                padding: '12px 34px', borderRadius: 14, fontFamily: 'monospace', fontSize: 40, fontWeight: 900,
                background: 'var(--surface-pill-darkest)', border: '2.5px solid #8b5cf6', color: '#ffffff'
              }}>
                {plotRound.display}
              </div>
            </div>

            <NumberLineViewer
              min={-10} max={10} step={1}
              width={620} height={150}
              clickTargets={plotRound.targets}
              onTargetClick={handlePlotClick}
              selectedTarget={plotFb === null ? null : plotGuess}
              correctTarget={plotFb === 'correct' ? plotRound.value : null}
              wrongTarget={plotFb === 'wrong' ? plotGuess : null}
              markers={plotFb === 'correct' ? [{ value: plotRound.value, label: plotRound.display, color: '#22c55e' }] : []}
            />

            {plotFb === 'correct' && (
              <div style={{
                textAlign: 'center', padding: '8px 14px', borderRadius: 10, alignSelf: 'center',
                background: 'rgba(34,197,94,0.15)', border: '2px solid var(--accent-success-green)',
                color: 'var(--accent-success-green)', fontWeight: 800, fontSize: 14
              }}>
                ✅ Spot on! {plotRound.display} = {toDecimal(plotRound.value)} on the line.
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {plotFb === 'correct' && plotIdx < PLOT_ROUNDS.length - 1 && (
                <button className="btn-gold" style={{ fontSize: '14px', fontWeight: '800' }} onClick={handlePlotNext}>Next Number ➔</button>
              )}
              <button className="btn-nav-outline" style={{ fontSize: '14px', fontWeight: '800' }} onClick={handleResetB}>🔄 Reset Station B</button>
            </div>

            {plotSolvedCount >= PLOT_ROUNDS.length && (
              <div style={{ textAlign: 'center', color: 'var(--accent-success-green)', fontWeight: 800, fontSize: 15 }}>
                🏆 Plotting master! Station B complete!
              </div>
            )}

            <Mascot mood={plotFb === 'correct' ? 'happy' : 'thinking'}
              bubble={<span style={{ fontSize: '15.5px', fontWeight: '800' }}>Negatives go LEFT of zero, positives go RIGHT. Halves sit exactly between two ticks!</span>} />
          </div>
        )}

        {/* ================= STATION C: COMPARISON DUEL ================= */}
        {station === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h3 className="sim-station-title" style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '4px' }}><span>⚔️</span> Comparison Duel</h3>
            <p className="sim-station-instruction" style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-muted-lavender)', marginBottom: '8px' }}>
              Duel {duelIdx + 1} of {DUEL_ROUNDS.length}: Which symbol belongs in the middle?
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', flexWrap: 'wrap' }}>
              <div style={{
                minWidth: 130, textAlign: 'center', padding: '18px 24px', borderRadius: 14,
                background: 'rgba(74,144,217,0.15)', border: '3px solid #4A90D9',
                fontFamily: 'monospace', fontSize: 36, fontWeight: 900, color: '#4A90D9'
              }}>
                {duelRound.left}
              </div>

              <div style={{
                minWidth: 70, textAlign: 'center', fontSize: 44, fontWeight: 900,
                color: duelFb === 'correct' ? 'var(--accent-success-green)' : 'var(--accent-gold)'
              }}>
                {duelFb === 'correct' ? duelCorrect : '?'}
              </div>

              <div style={{
                minWidth: 130, textAlign: 'center', padding: '18px 24px', borderRadius: 14,
                background: 'rgba(167,139,250,0.15)', border: '3px solid #a78bfa',
                fontFamily: 'monospace', fontSize: 36, fontWeight: 900, color: '#a78bfa'
              }}>
                {duelRound.right}
              </div>
            </div>

            {duelFb === 'correct' && (
              <NumberLineViewer
                min={-8} max={8} step={1}
                width={600} height={130}
                markers={[
                  { value: toDecimal(duelRound.left), label: duelRound.left, color: '#4A90D9' },
                  { value: toDecimal(duelRound.right), label: duelRound.right, color: '#a78bfa' },
                ]}
              />
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['<', '=', '>'].map((sym) => {
                const isSelected = duelGuess === sym;
                const isCorrectOpt = duelFb === 'correct' && sym === duelCorrect;
                return (
                  <button
                    key={sym}
                    onClick={() => handleDuelGuess(sym)}
                    disabled={duelFb === 'correct'}
                    style={{
                      width: 90, padding: '16px 0', borderRadius: 14, fontWeight: 900, fontSize: 34, fontFamily: 'monospace',
                      cursor: duelFb === 'correct' ? 'default' : 'pointer',
                      border: `3px solid ${isCorrectOpt ? 'var(--accent-success-green)' : isSelected ? 'var(--accent-alert-coral)' : 'rgba(255,255,255,0.2)'}`,
                      background: isCorrectOpt ? 'rgba(34,197,94,0.15)' : isSelected ? 'rgba(239,68,68,0.15)' : 'var(--surface-card-nested)',
                      color: isCorrectOpt ? 'var(--accent-success-green)' : isSelected ? 'var(--accent-alert-coral)' : 'var(--text-primary)'
                    }}>
                    {sym}
                  </button>
                );
              })}
            </div>

            <div style={{
              textAlign: 'center', padding: '10px 18px', borderRadius: 8, alignSelf: 'center',
              background: 'rgba(139, 92, 246, 0.1)', border: '2px solid rgba(139, 92, 246, 0.35)',
              color: '#bca8f2', fontWeight: 800, fontSize: 15
            }}>
              💡 {duelRound.hint}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {duelFb === 'correct' && duelIdx < DUEL_ROUNDS.length - 1 && (
                <button className="btn-gold" style={{ fontSize: '16px', fontWeight: '800' }} onClick={handleDuelNext}>Next Duel ➔</button>
              )}
              <button className="btn-nav-outline" style={{ fontSize: '16px', fontWeight: '800' }} onClick={handleResetC}>🔄 Reset Station C</button>
            </div>

            {duelSolvedCount >= DUEL_ROUNDS.length && (
              <div style={{ textAlign: 'center', color: 'var(--accent-success-green)', fontWeight: 800, fontSize: 17 }}>
                🎉 Undefeated duellist! Station C complete!
              </div>
            )}

            <Mascot mood={duelFb === 'correct' ? 'happy' : 'thinking'}
              bubble={<span style={{ fontSize: '17.5px', fontWeight: '800' }}>The symbol always opens towards the BIGGER number — like a hungry mouth!</span>} />
          </div>
        )}

        {/* ================= STATION D: ORDERING LADDER ================= */}
        {station === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 className="sim-station-title" style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '4px' }}><span>🪜</span> Ordering Ladder</h3>
            <p className="sim-station-instruction" style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-muted-lavender)', marginBottom: '8px' }}>
              Pick a real scenario, then click its values from <strong style={{ color: '#22c55e' }}>smallest to largest</strong>.
            </p>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {SANDBOX_IDS.map((id) => {
                const sc = getScenario(id);
                return (
                  <button
                    key={id}
                    className={`shape-selector-btn ${sandboxId === id ? 'shape-selector-btn--active' : ''}`}
                    onClick={() => switchSandboxScenario(id)}
                    style={{ fontSize: '15px', padding: '10px 18px' }}
                  >
                    {sandboxDoneIds.has(id) ? '✓ ' : ''}{sc.icon} {sc.title}
                  </button>
                );
              })}
            </div>

            <div style={{
              textAlign: 'center', padding: '14px 18px', borderRadius: 12, background: 'var(--surface-card-nested)',
              border: '1px solid rgba(255,255,255,0.1)', fontSize: '16px', fontWeight: '700', color: '#f0eaff'
            }}>
              {sandboxScenario.icon} {sandboxScenario.context}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {shuffledLadder.map((val, i) => {
                const isPlaced = placed.includes(val);
                const isWrong = ladderWrong === val;
                const rank = placed.indexOf(val);
                const colors = ['#4A90D9', '#FF8A50', '#A78BFA', '#34D399'];
                return (
                  <button
                    key={`${val}-${i}`}
                    onClick={() => handleLadderClick(val)}
                    disabled={isPlaced}
                    style={{
                      position: 'relative', minWidth: 96, padding: '18px 14px', borderRadius: 14,
                      fontFamily: 'monospace', fontSize: 26, fontWeight: 900,
                      cursor: isPlaced ? 'default' : 'pointer', transition: 'all 0.2s',
                      background: isPlaced ? 'rgba(34,197,94,0.15)' : isWrong ? 'rgba(239,68,68,0.25)' : `${colors[i % 4]}22`,
                      border: `3px solid ${isPlaced ? 'var(--accent-success-green)' : isWrong ? 'var(--accent-alert-coral)' : colors[i % 4]}`,
                      color: isPlaced ? 'var(--accent-success-green)' : isWrong ? 'var(--accent-alert-coral)' : '#f0eaff',
                      opacity: isPlaced ? 0.65 : 1
                    }}
                  >
                    {val}{sandboxScenario.unit}
                    {isPlaced && (
                      <span style={{
                        position: 'absolute', top: -9, right: -9, width: 24, height: 24, borderRadius: '50%',
                        background: 'var(--accent-success-green)', color: '#0e0724', fontSize: 13, fontWeight: 900,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif'
                      }}>{rank + 1}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {placed.length > 0 && (
              <NumberLineViewer
                min={Math.floor(Math.min(...sandboxScenario.values.map(toDecimal)) - 1)}
                max={Math.ceil(Math.max(...sandboxScenario.values.map(toDecimal)) + 1)}
                step={1}
                width={600} height={130}
                markers={placed.map((v, i) => ({ value: toDecimal(v), label: v, color: ['#4A90D9', '#FF8A50', '#A78BFA', '#34D399'][i % 4] }))}
              />
            )}

            {placed.length === ladderSorted.length && (
              <div style={{
                textAlign: 'center', padding: '10px 18px', borderRadius: 10, alignSelf: 'center',
                background: 'rgba(34,197,94,0.12)', border: '2px solid var(--accent-success-green)',
                color: 'var(--accent-success-green)', fontWeight: 800, fontSize: 15
              }}>
                ✅ {sandboxScenario.explanation}
              </div>
            )}

            <button className="btn-nav-outline" style={{ alignSelf: 'center', fontSize: '14px', fontWeight: '800' }} onClick={handleResetD}>🔄 Reset Station D</button>

            {sandboxSolvedCount >= SANDBOX_IDS.length && (
              <div style={{ textAlign: 'center', color: 'var(--accent-success-green)', fontWeight: 800, fontSize: 15 }}>
                🏆 Ordering master! Station D complete!
              </div>
            )}

            <Mascot mood={placed.length === ladderSorted.length ? 'happy' : 'curious'}
              bubble={<span style={{ fontSize: '15.5px', fontWeight: '800' }}>
                {placed.length === 0 ? 'Convert them all to decimals first, then click the smallest!'
                  : placed.length === ladderSorted.length ? 'Perfect ladder! 🪜'
                  : `${placed.length} placed — what is the next smallest?`}
              </span>} />
          </div>
        )}

      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
        <button className="btn-nav-outline" onClick={() => { if (station > 0) setStation(p => p - 1); }} disabled={station === 0} style={{ fontSize: '15px', fontWeight: '800', padding: '10px 20px' }}>
          🠔 Previous Station
        </button>

        {station < 3 ? (
          <button className="btn-nav-outline" onClick={() => setStation(p => p + 1)} style={{ fontSize: '15px', fontWeight: '800', padding: '10px 20px' }}>
            Next Station ➔
          </button>
        ) : (
          <button
            className="btn-gold"
            onClick={onNext}
            disabled={!completedStations[3]}
            style={{ padding: '12px 28px', fontSize: '15px', fontWeight: '800', opacity: completedStations[3] ? 1 : 0.5, cursor: completedStations[3] ? 'pointer' : 'not-allowed' }}
          >
            Begin Challenge Game! ➔
          </button>
        )}
      </div>
    </div>
  );
}
