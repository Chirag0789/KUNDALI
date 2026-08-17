import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PLANET_ORDER, PLANET_LABEL, SIGNS, NAKSHATRAS, SECTION_LABELS_FALLBACK } from '../astrology/constants.js';
import { fmtDate, fmtDeg } from '../format.js';

/**
 * PDFGenerator.js
 * ---------------------------------------------------------------------------
 * Builds the downloadable Kundali PDF report: cover header, birth details,
 * chart image (captured from the on-screen chart via html2canvas), planetary
 * table, dasha tables, interpretation sections, and a footer with page
 * numbers on every page. Pure client-side — no server round trip needed
 * beyond whatever already populated `chart`.
 */

const MARGIN = 16, PAGE_W = 210, PAGE_H = 297;
const NAVY = [12, 18, 54], GOLD = [180, 136, 26], CREAM = [251, 246, 234], INK = [28, 26, 18];

function ensureSpace(doc, cursor, needed) {
  if (cursor.y + needed > PAGE_H - MARGIN - 10) {
    doc.addPage();
    cursor.y = MARGIN + 4;
  }
}
function heading(doc, cursor, text, num) {
  ensureSpace(doc, cursor, 14);
  doc.setFillColor(...GOLD); doc.rect(MARGIN, cursor.y, 3, 6, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...NAVY);
  doc.text(`${num}. ${text}`, MARGIN + 6, cursor.y + 5);
  cursor.y += 11;
}
function paragraph(doc, cursor, text, opts = {}) {
  doc.setFont('helvetica', 'normal'); doc.setFontSize(opts.size || 10.5); doc.setTextColor(...INK);
  const lines = doc.splitTextToSize(text || '', PAGE_W - MARGIN * 2);
  lines.forEach((line) => {
    ensureSpace(doc, cursor, 6);
    doc.text(line, MARGIN, cursor.y);
    cursor.y += opts.lh || 5.4;
  });
  cursor.y += 3;
}
function labelValueGrid(doc, cursor, pairs) {
  const colW = (PAGE_W - MARGIN * 2) / 2;
  let col = 0;
  pairs.forEach(([label, value]) => {
    const x = MARGIN + col * colW;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(120, 110, 90);
    doc.text(label.toUpperCase(), x, cursor.y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...NAVY);
    doc.text(String(value), x, cursor.y + 5.5);
    col++;
    if (col === 2) { col = 0; cursor.y += 14; }
  });
  if (col !== 0) cursor.y += 14;
  cursor.y += 2;
}
function table(doc, cursor, headers, rows, colWidths) {
  const totalW = PAGE_W - MARGIN * 2;
  const widths = colWidths || headers.map(() => totalW / headers.length);
  ensureSpace(doc, cursor, 10);
  doc.setFillColor(...NAVY); doc.rect(MARGIN, cursor.y, totalW, 7, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...CREAM);
  let x = MARGIN;
  headers.forEach((h, i) => { doc.text(h, x + 2, cursor.y + 4.8); x += widths[i]; });
  cursor.y += 7;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...INK);
  rows.forEach((row, ri) => {
    ensureSpace(doc, cursor, 7);
    if (ri % 2 === 0) { doc.setFillColor(245, 240, 226); doc.rect(MARGIN, cursor.y, totalW, 6.5, 'F'); }
    x = MARGIN;
    row.forEach((cell, i) => { doc.text(String(cell), x + 2, cursor.y + 4.5); x += widths[i]; });
    cursor.y += 6.5;
  });
  cursor.y += 6;
}

/**
 * @param {object} chart - structured chart object (with .interpretation optionally attached)
 * @param {HTMLElement} chartElement - the DOM node containing the rendered KundaliChart SVG, for image capture
 * @param {string[]} sectionKeys - ordered interpretation section keys
 * @param {string[]} sectionLabels - matching display labels (already localized)
 */
export async function generateKundaliPdf(chart, chartElement, sectionKeys, sectionLabels) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const cursor = { y: MARGIN };

  doc.setFillColor(...NAVY); doc.rect(0, 0, PAGE_W, 34, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(...GOLD);
  doc.text('VEDIC KUNDALI REPORT', MARGIN, 16);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(...CREAM);
  doc.text(chart.meta.name, MARGIN, 25);
  doc.setFontSize(8.5); doc.setTextColor(200, 200, 210);
  doc.text(`North Indian chart \u00B7 Ayanamsa: ${chart.meta.ayanamsaLabel}`, MARGIN, 30);
  cursor.y = 42;

  labelValueGrid(doc, cursor, [
    ['Date of birth', chart.meta.dobDisplay],
    ['Time of birth', chart.meta.tobDisplay],
    ['Birth place', chart.meta.place],
    ['Coordinates', `${chart.meta.lat.toFixed(4)}, ${chart.meta.lon.toFixed(4)}`],
    ['Lagna (Ascendant)', `${SIGNS[chart.lagna.sign]} ${fmtDeg(chart.lagna.degreeInSign)}`],
    ['Moon Rashi', SIGNS[chart.planets.moon.sign]],
    ['Birth Nakshatra', `${NAKSHATRAS[chart.planets.moon.nakshatraIndex]}, Pada ${chart.planets.moon.pada}`],
    ['Ayanamsa value', `${chart.meta.ayanamsa.toFixed(4)}\u00B0`],
  ]);

  if (chartElement) {
    try {
      const canvas = await html2canvas(chartElement, { backgroundColor: '#0C1236', scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const imgW = 90, imgH = 90;
      ensureSpace(doc, cursor, imgH + 6);
      doc.addImage(imgData, 'PNG', MARGIN, cursor.y, imgW, imgH);
      cursor.y += imgH + 8;
    } catch { /* chart image is a nice-to-have — continue without it if capture fails */ }
  }

  heading(doc, cursor, 'Planetary Positions', '02');
  table(doc, cursor, ['Planet','Sign','Deg','Nakshatra','Pada','House','R'],
    PLANET_ORDER.map((name) => {
      const p = chart.planets[name];
      return [PLANET_LABEL[name], SIGNS[p.sign], fmtDeg(p.degreeInSign), NAKSHATRAS[p.nakshatraIndex], p.pada, p.house, p.retrograde ? 'R' : '-'];
    }), [24, 22, 18, 34, 12, 16, 10]);

  if (chart.yogas.length) {
    heading(doc, cursor, 'Yogas Present', 'Y');
    chart.yogas.forEach((y) => paragraph(doc, cursor, `${y.name} \u2014 ${y.note}`, { size: 10 }));
  }

  heading(doc, cursor, 'Vimshottari Dasha (Mahadasha)', '03');
  table(doc, cursor, ['Lord','Start','End','Years'],
    chart.dasha.mahadashas.map((m) => [PLANET_LABEL[m.lord], fmtDate(m.start), fmtDate(m.end), m.years.toFixed(2)]),
    [40, 45, 45, 24]);

  const curM = chart.dasha.mahadashas[chart.dasha.currentIndex];
  heading(doc, cursor, `Current Antardasha \u2014 ${PLANET_LABEL[curM.lord]} Mahadasha`, '03a');
  table(doc, cursor, ['Antardasha','Start','End','Years'],
    curM.antardashas.map((a) => [PLANET_LABEL[a.lord], fmtDate(a.start), fmtDate(a.end), a.years.toFixed(2)]),
    [40, 45, 45, 24]);

  if (chart.interpretation) {
    doc.addPage(); cursor.y = MARGIN;
    heading(doc, cursor, 'Detailed Interpretation', '04');
    (sectionKeys || []).forEach((k, i) => {
      heading(doc, cursor, (sectionLabels && sectionLabels[i]) || SECTION_LABELS_FALLBACK[i] || k, `04.${i + 1}`);
      paragraph(doc, cursor, chart.interpretation[k] || '');
    });
  }

  paragraph(doc, cursor, 'This report reflects traditional Vedic astrological interpretation of the calculated chart above. It is offered for reflection and self-understanding, not as scientific or deterministic prediction.', { size: 8.5 });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...GOLD); doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(130, 120, 100);
    doc.text('Vedic Kundali \u2014 Not a substitute for professional advice', MARGIN, PAGE_H - 9);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_W - MARGIN, PAGE_H - 9, { align: 'right' });
  }

  doc.save(`Vedic-Kundali-${chart.meta.name.replace(/\s+/g, '-')}.pdf`);
}
