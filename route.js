import { NextResponse } from 'next/server';
import { calculateChart } from '../../../lib/astrology/AstrologyCalculator.js';
import { generateInterpretation } from '../../../lib/ai/InterpretationEngine.js';

/**
 * POST /api/kundali
 * ---------------------------------------------------------------------------
 * Body: BirthInput (see AstrologyCalculator.js) — birth details ONLY.
 * Response: { chart, interpretation }
 *
 * Calculation happens server-side here (moving it off the client also means
 * you can swap EphemerisEngine for a Swiss-Ephemeris-backed implementation
 * without shipping that dependency to the browser at all — see
 * lib/astrology/EphemerisEngine.js for the swap instructions).
 */
export async function POST(request) {
  let birth;
  try {
    birth = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const required = ['name', 'y', 'm', 'd', 'hh', 'mm', 'lat', 'lon', 'tz', 'lang'];
  const missing = required.filter((k) => birth[k] === undefined || birth[k] === null || birth[k] === '');
  if (missing.length) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
  }

  let chart;
  try {
    chart = calculateChart(birth);
  } catch (err) {
    console.error('Chart calculation failed:', err);
    return NextResponse.json({ error: 'Could not calculate this chart. Please check the birth details.' }, { status: 422 });
  }

  try {
    chart.interpretation = await generateInterpretation(chart);
  } catch (err) {
    console.error('AI interpretation failed:', err);
    // Chart data is still valid and useful even if interpretation text fails —
    // return it with a flag so the client can show a retry option.
    return NextResponse.json({ chart, interpretationError: err.message || 'Interpretation failed' }, { status: 200 });
  }

  return NextResponse.json({ chart });
}
