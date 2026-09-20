# Intellia Comparing & Ordering Numbers — Grade 7

**Topic:** Numbers — **Title:** Comparing and Ordering Numbers

Built on **`Intellia-Types-of-angle-master.zip`** (the most recent zip you
attached — no new zip came through this turn). UI, structure, layout and
architecture are matched exactly; only the subject content and the Simulate
activities are new.

> Note: your message mentioned "the title is related to shapes". That looked
> like leftover boilerplate, so this module was built for **Comparing and
> Ordering Numbers** as stated. Say the word if you meant something else.

## Copied byte-for-byte from the reference
`src/App.css` (2,550 lines) · `src/App.jsx` (only storage key + 3 badge ids
changed) · `index.html` · `package.json` · `vite.config.js` · `.gitignore` ·
`scripts/generate_audio.js` + `clean_audio.js` (one import path repointed) ·
`src/hooks/useAudio.js` · `src/utils/audio.js` · `Mascot.jsx`

## Rebuilt in the reference's exact structure/style
- **`NumberLineViewer.jsx`** replaces `AngleViewer.jsx` — same role: a flat,
  purpose-built 2D SVG reused across Wonder/Simulate/Play. Renders a number
  line with ticks, a shaded negative region, plotted markers, and optional
  clickable drop-zones.
- **`IntroScreen`** — identical layout; faded background glyphs are now
  −7, 3/4, 0.75, `<`, 🔢.
- **`WonderPhase`** — same slider + auto-animate pattern as the door swing.
  Here it's a **freezer thermometer**: drag or Auto-Chill from 8°C to −9°C and
  watch the mercury and number-line marker cross zero, revealing that −7 < −3.
- **`StoryPhase`** — identical structure and font sizes, 4 new slides, 4 new
  cartoon SVGs at the **20:8 (2.5:1)** ratio.
- **`PlayPhase` / `ReflectPhase`** — same HUD, world list and two-column
  reflect layout; 10 new worlds, **61 validated questions**, 6 reflect topics.

## Simulate — four all-new heavier stations
Same A→D pedagogy (understand → try it → puzzle → real-world), new activities:

| | Station | What you do |
|---|---|---|
| **A** | **Number Line Lab** | Drag a −10…+10 slider in 0.5 steps; the marker slides live and the number-family card reclassifies (negative / zero / integer / decimal). 5 presets to unlock. |
| **B** | **Plot It** | A value appears (`-4`, `2.5`, `-1/2`, `7`, `-7.5`); **click the exact drop-zone on the number line** where it belongs. Correct plots render a permanent marker. |
| **C** | **Comparison Duel** | Two mixed-form values face off; pick `<`, `=` or `>`. On success both are plotted on a shared number line so you *see* the verdict. Per-round hints. |
| **D** | **Ordering Ladder** | Pick a real scenario (freezer temps, recipe cups, race times, lift levels), then **click the values smallest→largest**; each placement adds a numbered badge and plots onto a live number line. |

## "Begin Challenge Game" button
Station D completion is driven by **one direct click per value** with an
explicit `placed.length === sorted.length` check per scenario — no cyclical
toggle that can land back on "unanswered" (the original bug). Finish all four
scenarios and the gate opens reliably.

## Verified before packaging
Syntax check on all 18 JS/JSX files · full esbuild bundle resolve · all 61
questions validated (correct answer present in options, no duplicate options,
hints + explanation on every one) · all 4 SVGs parse as valid XML · every CSS
class used exists in `App.css` · every `speak()` string registered in
`narration.js` · every unlocked badge id has a matching icon + label.

## Image generation
No image-generation tool is available in this environment, so the 4 story
illustrations are hand-built cartoon-style SVGs at 20:8 — not AI-generated
PNGs. Swap in PNGs and update the four `<img src>` paths in `StoryPhase.jsx`
if you want that upgrade.

## Audio (ElevenLabs)
Key is in `.env.local` (gitignored). This sandbox can't reach elevenlabs.io so
`audioMap.js` ships empty — run locally to populate:

```bash
npm install
node scripts/generate_audio.js   # auto-pulls narration.js + SCENARIOS + questionBank
node scripts/clean_audio.js      # optional
npm run dev
```
