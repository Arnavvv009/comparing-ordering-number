// Core reference data for "Comparing and Ordering Numbers" (Grade 7, MOE
// syllabus: comparing and ordering integers, fractions, decimals and negative
// rational numbers; placing them on a number line; using <, > and = correctly;
// solving real-life ordering problems).

// ─── Value helpers ───────────────────────────────────────────────────────────

// Parse any supported written form ("-3", "3/4", "-2/5", "0.75", "2 1/2")
// into a plain JS number so mixed representations can be compared fairly.
export function toDecimal(value) {
  if (typeof value === 'number') return value;
  const str = String(value).trim();

  // Mixed number, e.g. "2 1/2" or "-2 1/2"
  const mixed = str.match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const sign = mixed[1] === '-' ? -1 : 1;
    return sign * (Number(mixed[2]) + Number(mixed[3]) / Number(mixed[4]));
  }

  // Simple fraction, e.g. "3/4" or "-2/5"
  const frac = str.match(/^(-?\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);

  return Number(str);
}

// Returns '<', '>' or '=' describing a relative to b.
export function compareValues(a, b) {
  const da = toDecimal(a);
  const db = toDecimal(b);
  if (Math.abs(da - db) < 1e-9) return '=';
  return da < db ? '<' : '>';
}

// Sort a list of written values ascending (smallest first) by true value.
export function sortAscending(values) {
  return [...values].sort((a, b) => toDecimal(a) - toDecimal(b));
}

// Classify a value into one of the four NUMBER_TYPES below.
export function classifyNumber(value) {
  const d = toDecimal(value);
  const str = String(value).trim();
  if (d < 0) return 'negative';
  if (str.includes('/')) return 'fraction';
  if (str.includes('.')) return 'decimal';
  return 'integer';
}

// ─── The four number families this module compares ───────────────────────────

export const NUMBER_TYPES = {
  integer: {
    id: 'integer',
    name: 'Whole Number',
    shortLabel: 'Integer',
    emoji: '🔢',
    color: '#34D399',
    description: 'A counting number with no fraction or decimal part.',
    rule: 'Compare integers by size directly — the further right on the number line, the greater the value.',
    realWorldExamples: ['floor numbers in a building', 'number of students', 'a test score out of 100'],
    funFact: 'Zero is an integer too — it sits exactly between the positives and the negatives!',
  },
  negative: {
    id: 'negative',
    name: 'Negative Number',
    shortLabel: 'Negative',
    emoji: '🧊',
    color: '#4A90D9',
    description: 'A value less than zero, written with a minus sign in front.',
    rule: 'With negatives, the BIGGER the digit, the SMALLER the value — −9 is less than −2!',
    realWorldExamples: ['temperatures below freezing', 'basement floor levels', 'money owed'],
    funFact: 'Every negative number is smaller than every positive number — and smaller than zero too!',
  },
  fraction: {
    id: 'fraction',
    name: 'Fraction',
    shortLabel: 'Fraction',
    emoji: '🍕',
    color: '#A78BFA',
    description: 'A part of a whole, written as a numerator over a denominator.',
    rule: 'To compare fractions, give them a common denominator — or convert both to decimals.',
    realWorldExamples: ['half a pizza', 'three-quarters of an hour', 'two-fifths of a class'],
    funFact: 'A fraction with a bigger denominator has SMALLER slices — 1/8 is less than 1/3!',
  },
  decimal: {
    id: 'decimal',
    name: 'Decimal',
    shortLabel: 'Decimal',
    emoji: '📍',
    color: '#FF8A50',
    description: 'A value written with a decimal point separating whole from fractional parts.',
    rule: 'Line up the decimal points, then compare digit by digit from the left.',
    realWorldExamples: ['prices in dollars and cents', 'race times in seconds', 'measured heights in metres'],
    funFact: '0.5 is bigger than 0.45, even though 45 looks like a bigger number — line up the points!',
  },
};

// ─── Real-world scenarios for Simulate Station D and Play World 8 ────────────

export const SCENARIOS = [
  {
    id: 'temperature',
    title: 'Freezer Temperatures',
    icon: '🧊',
    values: ['-3', '-7', '0', '2'],
    unit: '°C',
    context: "Four freezer compartments read −3°C, −7°C, 0°C and 2°C. Order them from coldest to warmest.",
    explanation: "With negatives, the bigger the digit the colder it is: −7 is coldest, then −3, then 0, then 2.",
  },
  {
    id: 'recipe',
    title: 'Recipe Amounts',
    icon: '🍰',
    values: ['1/4', '1/2', '3/8', '0.75'],
    unit: ' cup',
    context: "A recipe lists 1/4, 1/2, 3/8 and 0.75 of a cup. Order these amounts from smallest to largest.",
    explanation: "Converting to decimals: 0.25, 0.5, 0.375 and 0.75 — so the order is 1/4, 3/8, 1/2, 0.75.",
  },
  {
    id: 'race',
    title: 'Race Times',
    icon: '🏃',
    values: ['12.45', '12.4', '12.53', '12.05'],
    unit: 's',
    context: "Four runners finished in 12.45s, 12.4s, 12.53s and 12.05s. Order them from fastest to slowest.",
    explanation: "Lining up the decimal points: 12.05 < 12.40 < 12.45 < 12.53, so 12.05s is fastest.",
  },
  {
    id: 'elevation',
    title: 'Building Levels',
    icon: '🏢',
    values: ['-2', '5', '-1', '0'],
    unit: 'F',
    context: "A lift visits levels −2, 5, −1 and 0. Order these levels from lowest to highest.",
    explanation: "Basement levels are negative: −2 is the lowest, then −1, then 0 (ground), then 5.",
  },
];

export function getScenario(id) {
  return SCENARIOS.find(s => s.id === id);
}
