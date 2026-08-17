'use client';
import { useRef, useState } from 'react';
import KundaliChart from './KundaliChart.jsx';
import { PLANET_ORDER, PLANET_LABEL, PLANET_ABBR, SIGNS, NAKSHATRAS, UI_LABELS, SECTION_KEYS, SECTION_LABELS } from '../lib/astrology/constants.js';
import { fmtDate, fmtDeg } from '../lib/format.js';
import { generateKundaliPdf } from '../lib/pdf/PDFGenerator.js';

function planetsByHouseFor(chart) {
  const map = {};
  PLANET_ORDER.forEach((name) => {
    const p = chart.planets[name];
    map[p.house] = map[p.house] || [];
    map[p.house].push({ abbr: PLANET_ABBR[name], retro: !!p.retrograde });
  });
  return map;
}

export default function ResultsPage({ chart, interpretationError, onRetryInterpretation, onStartOver }) {
  const chartHolderRef = useRef(null);
  const [activeTab, setActiveTab] = useState(chart.dasha.currentIndex);
  const [activeSection, setActiveSection] = useState(SECTION_KEYS[0]);
  const [pdfBusy, setPdfBusy] = useState(false);
  const t = UI_LABELS[chart.meta.lang] || UI_LABELS.en;
  const labels = SECTION_LABELS[chart.meta.lang] || SECTION_LABELS.en;

  async function handleDownloadPdf() {
    setPdfBusy(true);
    try {
      await generateKundaliPdf(chart, chartHolderRef.current, SECTION_KEYS, labels);
    } catch (err) {
      console.error(err);
      alert('Sorry, the PDF could not be generated. Please try again.');
    } finally {
      setPdfBusy(false);
    }
  }

  const curM = chart.dasha.mahadashas[activeTab];

  return (
    <div>
      <div className="results-header">
        <div>
          <h2>{chart.meta.name}&rsquo;s Kundali</h2>
          <div className="meta">{chart.meta.dobDisplay} · {chart.meta.tobDisplay} · {chart.meta.place}</div>
        </div>
        <div className="results-actions">
          <button type="button" className="btn-gold" disabled={pdfBusy} onClick={handleDownloadPdf}>
            {pdfBusy ? 'Preparing PDF…' : 'Download PDF'}
          </button>
          <button type="button" className="btn-outline" onClick={onStartOver}>Start Over</button>
        </div>
      </div>

      <div className="card">
        <h3><span className="sec-num">01</span> {t.overview}</h3>
        <div className="overview-grid">
          <div className="ov-item"><div className="lbl">Name</div><div className="val">{chart.meta.name}</div></div>
          <div className="ov-item"><div className="lbl">Date of birth</div><div className="val">{chart.meta.dobDisplay}</div></div>
          <div className="ov-item"><div className="lbl">Time of birth</div><div className="val">{chart.meta.tobDisplay}</div></div>
          <div className="ov-item"><div className="lbl">Birth place</div><div className="val" style={{ fontSize: 15 }}>{chart.meta.place}</div></div>
          <div className="ov-item"><div className="lbl">{t.lagna}</div><div className="val">{SIGNS[chart.lagna.sign]} {fmtDeg(chart.lagna.degreeInSign)}</div></div>
          <div className="ov-item"><div className="lbl">{t.rashi}</div><div className="val">{SIGNS[chart.planets.moon.sign]}</div></div>
          <div className="ov-item"><div className="lbl">{t.nakshatra}</div><div className="val" style={{ fontSize: 16 }}>{NAKSHATRAS[chart.planets.moon.nakshatraIndex]} · Pada {chart.planets.moon.pada}</div></div>
        </div>
        <div className="ayanamsa-note">Ayanamsa used: {chart.meta.ayanamsaLabel} ({chart.meta.ayanamsa.toFixed(4)}°) · Chart style: North Indian · House system: Whole Sign</div>
      </div>

      <div className="card">
        <h3><span className="sec-num">02</span> {t.planetary}</h3>
        <div className="chart-columns">
          <div><div className="chart-holder" ref={chartHolderRef}>
            <KundaliChart ascSignIndex={chart.lagna.sign} planetsByHouse={planetsByHouseFor(chart)} ascDegree={chart.lagna.degreeInSign} />
          </div></div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Planet</th><th>Sign</th><th>Degree</th><th>Nakshatra</th><th>Pada</th><th>House</th><th>Retro</th></tr></thead>
              <tbody>
                {PLANET_ORDER.map((name) => {
                  const p = chart.planets[name];
                  return (
                    <tr key={name}>
                      <td className="planet-name">{PLANET_LABEL[name]}</td>
                      <td>{SIGNS[p.sign]}</td>
                      <td>{fmtDeg(p.degreeInSign)}</td>
                      <td>{NAKSHATRAS[p.nakshatraIndex]}</td>
                      <td>{p.pada}</td>
                      <td>{p.house}</td>
                      <td>{p.retrograde === null ? '—' : p.retrograde ? <span className="retro-tag">R</span> : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {chart.yogas.length > 0 && (
        <div className="card">
          <h3><span className="sec-num">Y</span> Yogas Present</h3>
          {chart.yogas.map((y, i) => (
            <p key={i} style={{ margin: '6px 0', fontFamily: 'var(--font-serif)', fontSize: 16 }}><strong>{y.name}</strong> — {y.note}</p>
          ))}
        </div>
      )}

      <div className="card">
        <h3><span className="sec-num">03</span> {t.dasha}</h3>
        <div className="dasha-tabs">
          {chart.dasha.mahadashas.map((m, i) => (
            <button type="button" key={i} className={`dasha-tab ${i === activeTab ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
              {PLANET_LABEL[m.lord]} · {m.start.getFullYear()}
            </button>
          ))}
        </div>
        {activeTab === chart.dasha.currentIndex && (
          <div className="dasha-current">Currently running: <strong>{PLANET_LABEL[curM.lord]} Mahadasha</strong></div>
        )}
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-500)', margin: '0 0 14px' }}>
          {PLANET_LABEL[curM.lord]} Mahadasha &nbsp;·&nbsp; {fmtDate(curM.start)} – {fmtDate(curM.end)} &nbsp;·&nbsp; {curM.years.toFixed(2)} years
        </p>
        <table className="data-table">
          <thead><tr><th>Antardasha</th><th>Start</th><th>End</th><th>Duration</th></tr></thead>
          <tbody>
            {curM.antardashas.map((a, i) => (
              <tr key={i}>
                <td className="planet-name">{PLANET_LABEL[a.lord]}</td>
                <td>{fmtDate(a.start)}</td>
                <td>{fmtDate(a.end)}</td>
                <td>{a.years.toFixed(2)} yrs</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ayanamsa-note">Years approximated at 365.25 days. Birth nakshatra: {NAKSHATRAS[chart.dasha.birthNakshatraIndex]} ({(chart.dasha.fractionElapsed * 100).toFixed(1)}% elapsed at birth).</div>
      </div>

      <div className="card">
        <h3><span className="sec-num">04</span> {t.interpretation}</h3>
        {!chart.interpretation && !interpretationError && (
          <div className="interp-loading"><span className="spinner" style={{ display: 'inline-block', borderTopColor: '#B4881A', borderColor: 'rgba(180,136,26,.25)' }} /> {t.generating}</div>
        )}
        {interpretationError && (
          <div className="interp-error">
            Couldn&rsquo;t generate the AI interpretation ({interpretationError}). The chart data above was still calculated normally.
            <br /><button type="button" className="btn-outline" onClick={onRetryInterpretation}>Retry interpretation</button>
          </div>
        )}
        {chart.interpretation && (
          <>
            <div className="interp-nav">
              {SECTION_KEYS.map((k, i) => (
                <button type="button" key={k} className={activeSection === k ? 'active' : ''} onClick={() => setActiveSection(k)}>
                  {i + 1}. {labels[i]}
                </button>
              ))}
            </div>
            {SECTION_KEYS.map((k, i) => activeSection === k && (
              <div className="interp-section active" key={k}>
                <h4>{i + 1}. {labels[i]}</h4>
                <p>{chart.interpretation[k]}</p>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="disclaimer">This report reflects traditional Vedic astrological interpretation of the calculated chart above. It is offered for reflection and self-understanding, not as scientific or deterministic prediction — please don&rsquo;t treat it as the sole basis for major medical, legal or financial decisions.</div>
    </div>
  );
}
