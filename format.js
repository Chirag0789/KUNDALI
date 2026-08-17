export function fmtDate(d) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function fmtDeg(deg) {
  const dd = Math.floor(deg);
  const mm = Math.floor((deg - dd) * 60);
  return `${dd}\u00B0${String(mm).padStart(2, '0')}'`;
}

/**
 * The chart object is computed server-side (Date objects for every dasha
 * start/end) and sent to the client as JSON, which turns Dates into ISO
 * strings. Call this once on the client right after fetch()'ing /api/kundali
 * to turn those strings back into real Date objects before handing the
 * chart to ResultsPage / PDFGenerator (both call .toLocaleDateString() etc.
 * on them directly).
 */
export function rehydrateChartDates(chart) {
  const fix = (period) => ({ ...period, start: new Date(period.start), end: new Date(period.end),
    antardashas: period.antardashas?.map((a) => ({ ...a, start: new Date(a.start), end: new Date(a.end) })) });
  return {
    ...chart,
    dasha: { ...chart.dasha, mahadashas: chart.dasha.mahadashas.map(fix) },
  };
}
