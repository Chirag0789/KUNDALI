import * as Ephemeris from './EphemerisEngine.js';
import { calculate as calculateDasha } from './DashaCalculator.js';
import { PLANET_ORDER, AYANAMSA_LABEL } from './constants.js';

/**
 * AstrologyCalculator.js
 * ---------------------------------------------------------------------------
 * The ONLY place that turns raw birth details into the structured chart
 * object consumed by everything else (KundaliChart, ResultsPage, the PDF
 * generator, and the AI InterpretationEngine). Neither the UI nor the AI
 * layer is allowed to compute or alter astronomical positions — they only
 * ever read from the object returned here.
 *
 * @typedef {Object} BirthInput
 * @property {string} name
 * @property {number} y  full year
 * @property {number} m  month 1-12
 * @property {number} d  day of month
 * @property {number} hh hour 0-23 (local)
 * @property {number} mm minute (local)
 * @property {number} lat  degrees, positive North
 * @property {number} lon  degrees, positive East
 * @property {string} tz   IANA timezone name, e.g. "Asia/Kolkata"
 * @property {string} placeLabel  display string for the birthplace
 * @property {string} [gender]
 * @property {"en"|"hi"|"gu"} lang
 */

export function calculateChart(birth) {
  const utcDate = Ephemeris.zonedLocalToUtc(birth.y, birth.m, birth.d, birth.hh, birth.mm, birth.tz);
  const hourUT = utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60 + utcDate.getUTCSeconds() / 3600;
  const jd = Ephemeris.julianDay(utcDate.getUTCFullYear(), utcDate.getUTCMonth() + 1, utcDate.getUTCDate(), hourUT);
  const ayanamsa = Ephemeris.lahiriAyanamsa(jd);

  const ascTropical = Ephemeris.ascendantDeg(jd, birth.lon, birth.lat);
  const ascSidereal = Ephemeris.norm360(ascTropical - ayanamsa);

  const planets = {};
  PLANET_ORDER.forEach((name) => {
    const trop = Ephemeris.tropicalLon(name, jd);
    const sid = Ephemeris.norm360(trop - ayanamsa);
    const nak = Ephemeris.nakshatraOf(sid);
    planets[name] = {
      name,
      siderealLon: sid,
      sign: Ephemeris.signOf(sid),
      degreeInSign: sid - Ephemeris.signOf(sid) * 30,
      nakshatraIndex: nak.index,
      pada: nak.pada,
      house: Ephemeris.houseOf(sid, ascSidereal),
      retrograde: Ephemeris.isRetrograde(name, jd),
    };
  });

  const ascNak = Ephemeris.nakshatraOf(ascSidereal);
  const lagna = {
    siderealLon: ascSidereal,
    sign: Ephemeris.signOf(ascSidereal),
    degreeInSign: ascSidereal - Ephemeris.signOf(ascSidereal) * 30,
    nakshatraIndex: ascNak.index,
    pada: ascNak.pada,
  };

  const dasha = calculateDasha(planets.moon.siderealLon, utcDate);
  const yogas = detectYogas(planets);

  return {
    meta: {
      name: birth.name, gender: birth.gender, lang: birth.lang,
      dobDisplay: `${birth.y}-${String(birth.m).padStart(2, '0')}-${String(birth.d).padStart(2, '0')}`,
      tobDisplay: `${String(birth.hh).padStart(2, '0')}:${String(birth.mm).padStart(2, '0')}`,
      place: birth.placeLabel, lat: birth.lat, lon: birth.lon, tz: birth.tz,
      utcISO: utcDate.toISOString(), jd, ayanamsa, ayanamsaLabel: AYANAMSA_LABEL,
    },
    lagna, planets, dasha, yogas,
  };
}

// Transparent, rule-based yoga checks. A yoga is only ever reported when the
// calculated data actually satisfies the classical condition — never invented.
// Extend this list as needed; keep each check traceable to a citable rule.
function detectYogas(planets) {
  const yogas = [];
  const kendraFromMoon = (((planets.jupiter.sign - planets.moon.sign + 12) % 12) % 3 === 0);
  if (kendraFromMoon) yogas.push({ name: 'Gajakesari Yoga', note: 'Jupiter is angular (kendra) from the Moon.' });
  if (planets.sun.sign === planets.mercury.sign) yogas.push({ name: 'Budhaditya Yoga', note: 'Sun and Mercury conjunct in the same sign.' });
  if (planets.moon.sign === planets.mars.sign) yogas.push({ name: 'Chandra-Mangal Yoga', note: 'Moon and Mars conjunct in the same sign.' });
  return yogas;
}
