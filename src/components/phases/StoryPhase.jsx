import React, { useState, useEffect } from 'react';
import Mascot from '../shared/Mascot';

const Slide1Illustration = () => (
  <img
    src="/assets/images/story_slide1_numberline.jpg"
    alt="Robo drawing a glowing number line with negatives and positives"
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
);

const Slide2Illustration = () => (
  <img
    src="/assets/images/story_slide2_negatives.jpg"
    alt="Robo comparing two freezers: -7°C is colder than -3°C"
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
);

const Slide3Illustration = () => (
  <img
    src="/assets/images/story_slide3_mixed.jpg"
    alt="Robo converting fractions into decimals to compare them"
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
);

const Slide4Illustration = () => (
  <img
    src="/assets/images/story_slide4_ordering.jpg"
    alt="Robo celebrating number blocks arranged on a podium from smallest to largest"
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
);

const slidesData = [
  {
    title: "The Number Line Runs Both Ways",
    body: "Robo draws a number line and keeps going left past zero into the NEGATIVES. Every number has its own spot, and the rule is beautifully simple: whatever sits further LEFT is always the smaller value, and whatever sits further RIGHT is always the greater one.",
    fact: "Further left = smaller. Further right = greater. Always.",
    nudge: "Let's see what that means for two freezing-cold temperatures!",
    Illustration: Slide1Illustration
  },
  {
    title: "With Negatives, the Rule Flips",
    body: "Freezer A reads \u22127\u00B0C and Freezer B reads \u22123\u00B0C. Since \u22127 sits further LEFT on the number line, it is the smaller, colder value \u2014 even though 7 looks like a bigger digit than 3. So \u22127 < \u22123.",
    fact: "The bigger the digit after the minus sign, the SMALLER the value",
    nudge: "But what about fractions and decimals mixed together?",
    Illustration: Slide2Illustration
  },
  {
    title: "Convert to a Common Form",
    body: "Robo needs to order 3/8, 0.5, 1/4 and 0.75. You cannot compare a fraction against a decimal directly, so Robo converts every one into a decimal first: 0.375, 0.5, 0.25 and 0.75. Now a single glance puts them in order!",
    fact: "Turn every number into the same form, then compare",
    nudge: "Now let's put a whole mixed list into order from smallest to largest!",
    Illustration: Slide3Illustration
  },
  {
    title: "Ordering a Whole List",
    body: "To order a list, Robo compares two numbers at a time, again and again, until every value has found its place. Ascending order means smallest first; descending order means largest first. The finished line-up tells the whole story at a glance!",
    fact: "Ascending = smallest first. Descending = largest first.",
    nudge: "Now let's go compare and order some numbers ourselves!",
    Illustration: Slide4Illustration
  }
];

export default function StoryPhase({ onNext, speak, playSound }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const currentSlide = slidesData[slideIdx];

  useEffect(() => {
    speak(currentSlide.body);
  }, [slideIdx, speak]);

  const handleNext = () => {
    if (playSound) playSound('explore');
    if (slideIdx < slidesData.length - 1) {
      setSlideIdx(prev => prev + 1);
    } else {
      onNext();
    }
  };

  const handlePrev = () => {
    if (slideIdx > 0) {
      if (playSound) playSound('explore');
      setSlideIdx(prev => prev - 1);
    }
  };

  const handleDotClick = (idx) => {
    if (idx !== slideIdx) {
      if (playSound) playSound('explore');
      setSlideIdx(idx);
    }
  };

  const handleReplayAudio = () => {
    if (playSound) playSound('explore');
    speak(currentSlide.body);
  };

  const pct = Math.round(((slideIdx + 1) / slidesData.length) * 100);
  const CurrentIllustration = currentSlide.Illustration;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: '1', height: '100%', overflow: 'hidden' }}>
      <div className="story-header" style={{ flexShrink: 0 }}>
        <span>Slide {slideIdx + 1} of 4</span>
        <div className="story-dots">
          {slidesData.map((_, idx) => (
            <div
              key={idx}
              className={`story-dot ${idx === slideIdx ? 'story-dot--active' : ''}`}
              onClick={() => handleDotClick(idx)}
              style={{ cursor: 'pointer' }}
              title={`Jump to Slide ${idx + 1}`}
            />
          ))}
        </div>
        <span>{pct}%</span>
      </div>

      <div className="progress-track" style={{ flexShrink: 0 }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: '1', padding: '16px 14px 20px 14px', position: 'relative', overflow: 'hidden', animation: 'slideInUp 0.4s ease-out', marginTop: '8px' }}>
        <div className="story-img-bleed" style={{ aspectRatio: '20 / 8', height: 'auto', maxHeight: '360px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', overflow: 'hidden', flexShrink: 0, marginLeft: '-14px', width: 'calc(100% + 28px)' }}>
          <CurrentIllustration />
        </div>

        <div className="story-content-section" style={{ paddingTop: '12px', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h2 className="story-title" style={{ fontSize: '32px', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '4px', lineHeight: '1.2' }}>{currentSlide.title}</h2>
            <button
              onClick={handleReplayAudio}
              className="btn-nav-outline"
              style={{ padding: '6px 14px', fontSize: '13.5px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '999px' }}
              title="Listen to slide audio again"
            >
              <span>🔊</span> Listen
            </button>
          </div>

          <p className="story-body" style={{ fontSize: '21px', fontWeight: '700', color: '#ece9f5', lineHeight: '1.45', marginBottom: '4px' }}>{currentSlide.body}</p>
          <div className="hint-fact-pill" style={{ alignSelf: 'flex-start', fontSize: '17px', fontWeight: '900', padding: '6px 14px', marginBottom: '4px' }}>
            ✨ {currentSlide.fact} ✨
          </div>
          <Mascot mood="idle" bubble={<span style={{ fontSize: '18px', fontWeight: '800' }}>{currentSlide.nudge}</span>} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', flexShrink: 0 }}>
        <button className="btn-nav-outline" onClick={handlePrev} disabled={slideIdx === 0} style={{ opacity: slideIdx === 0 ? 0.5 : 1, fontSize: '15px', fontWeight: '800', padding: '10px 20px' }}>
          ← Previous
        </button>
        <button className="btn-nav-outline" onClick={handleNext} style={{ fontSize: '15px', fontWeight: '800', padding: '10px 20px' }}>
          {slideIdx < slidesData.length - 1 ? "Next ➔" : "Next: Simulate ➔"}
        </button>
      </div>
    </div>
  );
}
