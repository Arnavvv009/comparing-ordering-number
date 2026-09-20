import React, { useState } from 'react';
import Mascot from '../shared/Mascot';

const getBadgeIcon = (id) => {
  switch (id) {
    case 'value_spotter': return '🔍';
    case 'ordering_pro': return '✏️';
    case 'number_master': return '👑';
    case 'perfect_world': return '🎯';
    case 'streak_legend': return '🔥';
    case 'real_world_champion': return '🌍';
    case 'number_explorer': return '🔢';
    case 'comparison_champion': return '⚔️';
    case 'full_journey': return '🎓';
    default: return '⭐';
  }
};

const getBadgeLabel = (id) => {
  switch (id) {
    case 'value_spotter': return 'Value Spotter';
    case 'ordering_pro': return 'Ordering Pro';
    case 'number_master': return 'Number Master';
    case 'perfect_world': return 'Perfect World';
    case 'streak_legend': return 'Streak Legend';
    case 'real_world_champion': return 'Real World Champion';
    case 'number_explorer': return 'Number Explorer';
    case 'comparison_champion': return 'Comparison Champion';
    case 'full_journey': return 'Full Journey';
    default: return 'Badge Unlocked';
  }
};

const WORLD_DATA = [
  { name: "Number Line Basics", emoji: "📏" },
  { name: "Negative Numbers", emoji: "🧊" },
  { name: "Comparing Decimals", emoji: "📍" },
  { name: "Comparing Fractions", emoji: "🍕" },
  { name: "Fractions vs Decimals", emoji: "🔀" },
  { name: "Ordering Mixed Lists", emoji: "🪜" },
  { name: "Number Line Plotting", emoji: "🎯" },
  { name: "Absolute Value & Opposites", emoji: "↔️" },
  { name: "Real World Ordering", emoji: "🏙️" },
  { name: "Mystery Number Detective", emoji: "🕵️" },
];

const CONCEPT_PROMPTS = [
  {
    worldIndices: [0, 1],
    prompt: "What is the golden rule for comparing any two numbers on a number line?",
    explanation: "Whatever sits further LEFT is always the smaller value, and whatever sits further RIGHT is always the greater one. That one rule works for integers, negatives, fractions and decimals alike!"
  },
  {
    worldIndices: [1],
    prompt: "Why is \u22127 smaller than \u22123, even though 7 is a bigger digit than 3?",
    explanation: "With negatives the size rule flips. \u22127 sits further left on the number line than \u22123, so it is the smaller (colder, deeper) value. The bigger the digit after the minus sign, the smaller the number!"
  },
  {
    worldIndices: [2, 3],
    prompt: "How do you compare two decimals, or two fractions, fairly?",
    explanation: "For decimals, line up the decimal points and compare digit by digit from the left \u2014 0.5 becomes 0.50 so it can face 0.45. For fractions, give them a common denominator, or just convert both into decimals."
  },
  {
    worldIndices: [4, 5],
    prompt: "What is the first step when a list mixes fractions, decimals and negatives together?",
    explanation: "Convert every value into the SAME form \u2014 usually decimals. Once 3/8 becomes 0.375 and 1/4 becomes 0.25, a single glance puts the whole list in order."
  },
  {
    worldIndices: [6, 7],
    prompt: "What does absolute value mean, and why isn't a bigger absolute value always a bigger number?",
    explanation: "Absolute value is a number's distance from zero, so it is always positive. \u22129 has a bigger absolute value than 5, but \u22129 is still the SMALLER number because it sits further left."
  },
  {
    worldIndices: [8, 9],
    prompt: "Can you name a real-life situation where ordering numbers really matters?",
    explanation: "Freezer temperatures, basement lift levels, race times and bank balances all mix positives and negatives \u2014 and getting the order wrong could mean a spoiled meal, a wrong floor, or the wrong winner!"
  }
];

export default function ReflectPhase({
  xp,
  totalStars,
  unlockedBadges,
  worldScores,
  correctAnswers,
  onReset,
  playSound,
  speak,
  unlockBadge
}) {
  const getStarRating = (score) => {
    if (score === null) return 0;
    if (score >= 9) return 3;
    if (score >= 7) return 2;
    if (score >= 5) return 1;
    return 0;
  };

  const totalStarsEarned = worldScores.reduce((acc, score) => acc + getStarRating(score), 0);
  const worldsCompleted = worldScores.filter(score => score !== null).length;

  // Find which concepts are unlocked
  const unlockedConcepts = CONCEPT_PROMPTS.map((cp, cIdx) => {
    const isUnlocked = cp.worldIndices.some(wIdx => worldScores[wIdx] !== null);
    return { ...cp, index: cIdx, isUnlocked };
  });

  // Automatically determine the recommended/default concept index based on user interactions
  const getAutoConceptIndex = () => {
    const completedWorldIndices = [];
    worldScores.forEach((score, idx) => {
      if (score !== null) completedWorldIndices.push(idx);
    });

    if (completedWorldIndices.length === 0) return 0; // default to first

    // Find the world index with the lowest score (to target reflection on their hardest concept)
    let lowestScoreIdx = completedWorldIndices[0];
    let lowestScore = worldScores[lowestScoreIdx];
    completedWorldIndices.forEach(idx => {
      if (worldScores[idx] < lowestScore) {
        lowestScore = worldScores[idx];
        lowestScoreIdx = idx;
      }
    });

    if (lowestScore < 10) {
      const targetConcept = CONCEPT_PROMPTS.findIndex(cp => cp.worldIndices.includes(lowestScoreIdx));
      if (targetConcept !== -1) return targetConcept;
    }

    // Otherwise target the latest completed world concept
    const latestWorldIdx = completedWorldIndices[completedWorldIndices.length - 1];
    const targetConcept = CONCEPT_PROMPTS.findIndex(cp => cp.worldIndices.includes(latestWorldIdx));
    return targetConcept !== -1 ? targetConcept : 0;
  };

  const autoIndex = getAutoConceptIndex();

  const [selectedConceptIdx, setSelectedConceptIdx] = useState(null);
  const activeConceptIdx = selectedConceptIdx !== null ? selectedConceptIdx : autoIndex;
  const activeConcept = CONCEPT_PROMPTS[activeConceptIdx];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      gap: '36px',
      padding: '22px 26px',
      alignItems: 'stretch',
      position: 'relative',
      overflow: 'hidden',
      animation: 'slideInUp 0.4s ease-out',
      marginTop: '-20px'
    }}>
      {/* Left Column: Title, Performance Stats, Badges, Mascot, Button */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1.2',
        gap: '20px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center' }}>
          <h2 style={{ color: 'var(--accent-gold)', fontSize: '42px', fontWeight: '900', textAlign: 'center', margin: 0, fontFamily: "'Fredoka', sans-serif" }}>
            Your Performance!
          </h2>

          <div className="results-stats-row" style={{ width: '100%', gap: '16px', display: 'flex' }}>
            <div className="results-stat-card stat-card-gold" style={{ flex: 1, padding: '16px' }}>
              <div style={{ fontSize: '48px', marginBottom: '4px' }}>⭐</div>
              <div className="results-stat-val" style={{ fontSize: '38px', fontWeight: '900', color: 'var(--accent-gold)' }}>{totalStarsEarned}</div>
              <div className="results-stat-label" style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>Total Stars</div>
            </div>
            <div className="results-stat-card stat-card-green" style={{ flex: 1, padding: '16px' }}>
              <div style={{ fontSize: '48px', marginBottom: '4px' }}>✅</div>
              <div className="results-stat-val" style={{ fontSize: '38px', fontWeight: '900', color: 'var(--accent-gold)' }}>{correctAnswers}</div>
              <div className="results-stat-label" style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>Correct Answers</div>
            </div>
            <div className="results-stat-card stat-card-blue" style={{ flex: 1, padding: '16px' }}>
              <div style={{ fontSize: '48px', marginBottom: '4px' }}>🌍</div>
              <div className="results-stat-val" style={{ fontSize: '38px', fontWeight: '900', color: 'var(--accent-gold)' }}>{worldsCompleted}/10</div>
              <div className="results-stat-label" style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>Worlds Done</div>
            </div>
          </div>

          {unlockedBadges.length > 0 && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '28px', fontWeight: '900', fontFamily: "'Fredoka', sans-serif" }}>Badges Earned</h3>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {unlockedBadges.map((badgeId) => (
                  <div key={badgeId} className="badge-card-premium" style={{
                    background: 'var(--surface-card-nested)', borderRadius: '16px', padding: '14px 18px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '110px'
                  }}>
                    <span style={{ fontSize: '34px' }}>{getBadgeIcon(badgeId)}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted-lavender)', textAlign: 'center' }}>
                      {getBadgeLabel(badgeId)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Mascot mood="excited" bubble={<span style={{ fontSize: '21px', fontWeight: '800' }}>Amazing work! Let's reflect a little! 📋</span>} />

        <button className="btn-gold btn-shimmer" onClick={onReset} style={{ padding: '18px 44px', fontSize: '25px', fontWeight: '800', alignSelf: 'center', width: '90%', margin: 0 }}>
          Begin New Journey
        </button>
      </div>

      {/* Right Column: World Progress & Time to Reflect */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1.5',
        gap: '20px',
        justifyContent: 'space-between'
      }}>
        <div style={{ width: '100%', border: '1.5px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '16px 20px', background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '28px', fontWeight: '900', textAlign: 'center', fontFamily: "'Fredoka', sans-serif" }}>
            World Progress
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', justifyContent: 'center' }}>
            {WORLD_DATA.map((world, idx) => {
              const stars = getStarRating(worldScores[idx]);
              const completed = worldScores[idx] !== null;
              return (
                <div key={idx} className={completed ? "world-grid-cell world-grid-cell-completed" : "world-grid-cell"} style={{
                  background: completed ? 'rgba(255, 190, 26, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                }}>
                  <span style={{ fontSize: '30px' }}>{world.emoji}</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{ fontSize: '13px', opacity: i < stars ? 1 : 0.2 }}>☆</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="reflect-panel-glow" style={{ textAlign: 'center', width: '100%', border: '1.5px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '22px 28px', background: 'var(--surface-pill-darkest)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ color: 'var(--accent-gold)', fontSize: '30px', fontWeight: '900', marginBottom: '16px', fontFamily: "'Fredoka', sans-serif" }}>
            Time to Reflect!
          </h3>
          
          {/* Concept selector tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
            {unlockedConcepts.map((c, idx) => {
              const isActive = idx === activeConceptIdx;
              const isRecommended = idx === autoIndex && selectedConceptIdx === null;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedConceptIdx(idx)}
                  style={{
                    fontSize: '16.5px',
                    fontWeight: '800',
                    padding: '10px 18px',
                    borderRadius: '24px',
                    border: `2px solid ${isActive ? 'var(--accent-gold)' : isRecommended ? 'rgba(255, 190, 26, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: isActive ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#130a2a' : isRecommended ? 'var(--accent-gold)' : 'var(--text-muted-lavender)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Topic {idx + 1} {isRecommended ? '💡' : ''}
                </button>
              );
            })}
          </div>

          <div key={activeConceptIdx} className="reflect-content-fade" style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
            <p style={{ color: '#ffffff', fontSize: '23px', fontWeight: '800', marginBottom: '16px', lineHeight: '1.35' }}>
              {activeConcept.prompt}
            </p>
            <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1.5px solid rgba(139, 92, 246, 0.2)', borderRadius: '12px', padding: '20px', color: 'var(--text-muted-lavender)', fontSize: '21px', fontWeight: '700', lineHeight: '1.45', textAlign: 'left', width: '100%' }}>
              {activeConcept.explanation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
