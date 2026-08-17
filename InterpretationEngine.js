import Anthropic from '@anthropic-ai/sdk';
import { PLANET_ORDER, SIGNS, NAKSHATRAS, SECTION_KEYS as ALL_SECTION_KEYS, LANG_NAMES } from '../astrology/constants.js';

/**
 * InterpretationEngine.js  (SERVER-SIDE ONLY)
 * ---------------------------------------------------------------------------
 * Turns a pre-calculated chart object (from AstrologyCalculator) into
 * natural-language interpretation text. This module NEVER computes or
 * modifies astronomical data — it only reads the structured chart object
 * and asks the model to interpret it, in the classical Vedic tradition,
 * with explicit instructions against deterministic/absolute claims.
 *
 * Runs server-side (e.g. a Next.js Route Handler) so ANTHROPIC_API_KEY is
 * never exposed to the browser. See app/api/interpret/route.js for the
 * route that calls this.
 */

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const SECTION_KEYS = ALL_SECTION_KEYS;

const GROUPS = [
  { keys: ['overview','personality','strengths','challenges'], titles: ['Kundali Overview','Personality','Strengths','Challenges'] },
  { keys: ['career','finance','marriage','education'], titles: ['Career','Finance','Marriage & Relationships','Education'] },
  { keys: ['family','wellbeing','lifePeriods','dasha'], titles: ['Family','General Wellbeing','Major Life Periods','Dasha Interpretation'] },
  { keys: ['yogas','summary','guidance'], titles: ['Important Yogas','Summary','General Guidance'] },
];

function buildDataPayload(chart) {
  const planets = {};
  PLANET_ORDER.forEach((name) => {
    const p = chart.planets[name];
    planets[name] = {
      sign: SIGNS[p.sign], house: p.house, nakshatra: NAKSHATRAS[p.nakshatraIndex],
      pada: p.pada, degreeInSign: +p.degreeInSign.toFixed(2), retrograde: p.retrograde,
    };
  });
  const dashaTimeline = chart.dasha.mahadashas.map((m) => ({
    lord: m.lord, start: m.start.toISOString().slice(0, 10), end: m.end.toISOString().slice(0, 10), years: +m.years.toFixed(2),
  }));
  return {
    lagna: { sign: SIGNS[chart.lagna.sign], nakshatra: NAKSHATRAS[chart.lagna.nakshatraIndex], pada: chart.lagna.pada },
    moonRashi: SIGNS[chart.planets.moon.sign],
    birthNakshatra: NAKSHATRAS[chart.planets.moon.nakshatraIndex],
    planets,
    currentMahadasha: dashaTimeline[chart.dasha.currentIndex],
    dashaTimeline,
    yogasPresent: chart.yogas.map((y) => ({ name: y.name, note: y.note })),
    gender: chart.meta.gender || 'not specified',
  };
}

async function fetchGroup(chart, group, langName) {
  const payload = buildDataPayload(chart);
  const system = `You are a Vedic astrology (Jyotish) interpreter writing for a general reader. You are given a pre-calculated birth chart as structured JSON — planetary signs, houses, nakshatras, retrograde status and Vimshottari Dasha periods, produced by an astronomical calculation engine. Do NOT recalculate, guess, invent, or alter any astronomical position, sign, house, nakshatra or date — use only what is given. Interpret strictly within the classical Vedic astrology tradition, referencing the actual planets/signs/houses provided. Never state that a specific event is guaranteed to happen; frame statements as traditional astrological tendencies ("classically associated with", "this placement often suggests"), not certainties. Write entirely in ${langName}. Respond with ONLY a single valid JSON object with exactly these keys: ${JSON.stringify(group.keys)} — no markdown, no code fences, no extra keys, no commentary outside the JSON. Each value: 3-5 sentences, specific and grounded in the supplied data.`;
  const user = `Birth chart data:\n${JSON.stringify(payload)}\n\nSections needed (in order): ${group.titles.join(', ')}.`;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    system,
    messages: [{ role: 'user', content: user }],
  });
  const text = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
  const cleaned = text.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  return JSON.parse(cleaned);
}

/**
 * @param {object} chart - the structured object returned by AstrologyCalculator.calculateChart()
 * @returns {Promise<Record<string,string>>} sections keyed by SECTION_KEYS
 */
export async function generateInterpretation(chart) {
  const langName = LANG_NAMES[chart.meta.lang] || 'English';
  const results = await Promise.all(GROUPS.map((g) => fetchGroup(chart, g, langName)));
  return Object.assign({}, ...results);
}
