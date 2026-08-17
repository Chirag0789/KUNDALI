import { DASHA_ORDER, DASHA_YEARS } from './constants.js';

/**
 * DashaCalculator.js
 * ---------------------------------------------------------------------------
 * Standard Vimshottari Dasha mechanical algorithm:
 *   - Starting Mahadasha lord = ruler of the Moon's birth nakshatra.
 *   - Balance of the first Mahadasha = unelapsed fraction of that nakshatra
 *     x that lord's full dasha length.
 *   - Subsequent Mahadashas follow the fixed 9-lord sequence at full length.
 *   - Antardasha (sub-period) length = mahadashaYears * antardashaLordYears / 120,
 *     with the antardasha sequence starting at the mahadasha's own lord and
 *     cycling through the same fixed 9-lord order.
 *
 * Years are approximated at 365.25 days — documented approximation; classical
 * texts sometimes use the exact sidereal year. Adjust YEAR_DAYS if your
 * production system needs to match a specific software's convention.
 */

const YEAR_DAYS = 365.25;
const addYears = (date, years) => new Date(date.getTime() + years * YEAR_DAYS * 86400000);

function buildAntardashas(mahaLord, mahaStart, mahaYears) {
  const startIdx = DASHA_ORDER.indexOf(mahaLord);
  let cursor = new Date(mahaStart.getTime());
  const list = [];
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startIdx + i) % 9];
    const years = (mahaYears * DASHA_YEARS[lord]) / 120;
    const start = new Date(cursor.getTime());
    const end = addYears(cursor, years);
    list.push({ lord, start, end, years });
    cursor = end;
  }
  return list;
}

/**
 * @param {number} moonSiderealLon - Moon's sidereal ecliptic longitude (deg)
 * @param {Date} birthUtcDate - birth instant in UTC
 * @returns {{mahadashas: Array, currentIndex: number, birthNakshatraIndex: number, fractionElapsed: number}}
 */
export function calculate(moonSiderealLon, birthUtcDate) {
  const span = 360 / 27;
  const nakIndex = Math.floor(moonSiderealLon / span);
  const fractionElapsed = (moonSiderealLon - nakIndex * span) / span;
  const startIdx = DASHA_ORDER.indexOf(DASHA_ORDER[nakIndex % 9]);

  const mahadashas = [];
  let cursor = new Date(birthUtcDate.getTime());
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startIdx + i) % 9];
    const fullYears = DASHA_YEARS[lord];
    const years = i === 0 ? fullYears * (1 - fractionElapsed) : fullYears;
    const start = new Date(cursor.getTime());
    const end = addYears(cursor, years);
    mahadashas.push({ lord, start, end, years, fullYears, antardashas: buildAntardashas(lord, start, years) });
    cursor = end;
  }
  const now = new Date();
  let currentIndex = mahadashas.findIndex((m) => now >= m.start && now < m.end);
  if (currentIndex === -1) currentIndex = now < mahadashas[0].start ? 0 : mahadashas.length - 1;
  return { mahadashas, currentIndex, birthNakshatraIndex: nakIndex, fractionElapsed };
}
