// Canonical registry of every static narrated string used across the Comparing
// and Ordering Numbers module. Components call the shared `speak(text)`
// function directly with these exact strings (see WonderPhase.jsx,
// StoryPhase.jsx, SimulatePhase.jsx and PlayPhase.jsx), so this file is the
// single source of truth that scripts/generate_audio.js reads from to
// pre-generate matching static MP3s. Content Policy: Paragraphs & Questions ONLY.

export function introNarration() {
  return [];
}

export function wonderNarration() {
  return [
    "Robo checks two freezers: one reads minus 3 degrees, the other reads minus 7 degrees. Robo's friend says minus 7 must be warmer, because 7 is a bigger number than 3. Is that actually true?",
    "Not true at all! With negative numbers the rule flips — the bigger the digit after the minus sign, the SMALLER and colder the value. Minus 9 is colder than minus 3! Let's explore comparing every kind of number in the story!",
    "Not true at all! With negative numbers the rule flips — the bigger the digit after the minus sign, the smaller and colder the value!"
  ];
}

export function getStoryNarration() {
  return [
    "Robo draws a number line and keeps going left past zero into the NEGATIVES. Every number has its own spot, and the rule is beautifully simple: whatever sits further LEFT is always the smaller value, and whatever sits further RIGHT is always the greater one.",
    "Freezer A reads −7°C and Freezer B reads −3°C. Since −7 sits further LEFT on the number line, it is the smaller, colder value — even though 7 looks like a bigger digit than 3. So −7 < −3.",
    "Robo needs to order 3/8, 0.5, 1/4 and 0.75. You cannot compare a fraction against a decimal directly, so Robo converts every one into a decimal first: 0.375, 0.5, 0.25 and 0.75. Now a single glance puts them in order!",
    "To order a list, Robo compares two numbers at a time, again and again, until every value has found its place. Ascending order means smallest first; descending order means largest first. The finished line-up tells the whole story at a glance!"
  ];
}

export function simulateStationNarration() {
  return [
    "Welcome to the Number Line Lab! Drag the slider from minus ten to plus ten and watch where each value lands and what family it belongs to. Try every preset!",
    "Station B — Plot It! Read the number, then click the exact spot where it belongs on the number line.",
    "Station C — Comparison Duel! Two numbers face off. Choose whether the left one is less than, greater than, or equal to the right one.",
    "Station D — Ordering Ladder! Pick a real scenario, then click its values from smallest to largest to build the ladder."
  ];
}

export function simulateFeedbackNarration() {
  return [
    "Not quite — remember, negatives sit to the LEFT of zero and positives to the right.",
    "Fantastic plotting! Station B is complete!",
    "Next number! Click where it belongs.",
    "Not quite — convert both numbers to decimals, then check which sits further left.",
    "Amazing! You've won every comparison duel. Station C is complete!",
    "Next duel! Which symbol goes in the middle?",
    "Not the smallest remaining — convert them all to decimals and compare again.",
    "Outstanding! You've ordered every real-world list. Station D is complete! You can now begin the challenge game!",
    "Station A reset! Drag the slider or tap a preset.",
    "Station B reset! Let's plot some numbers.",
    "Station C reset! Let's duel some numbers.",
    "Station D reset! Pick a real-world list to order."
  ];
}

export function praisePhrases() {
  return ["Excellent!", "Well done!", "Brilliant!", "You got it!", "Super smart!"];
}

export function playPhaseNarration() {
  return [
    "That's correct!",
    "Not quite!",
    "Not quite! Oh no, you have run out of hearts. Let's retry this world."
  ];
}

export function reflectQuestionNarration() {
  return [
    "What is the golden rule for comparing any two numbers on a number line?",
    "Why is minus 7 smaller than minus 3, even though 7 is a bigger digit than 3?",
    "How do you compare two decimals, or two fractions, fairly?",
    "What is the first step when a list mixes fractions, decimals and negatives together?",
    "What does absolute value mean, and why isn't a bigger absolute value always a bigger number?",
    "Can you name a real-life situation where ordering numbers really matters?"
  ];
}
