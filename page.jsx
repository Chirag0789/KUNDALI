'use client';
import { useState, useRef } from 'react';
import BirthDetailsForm from '../components/BirthDetailsForm.jsx';
import ResultsPage from '../components/ResultsPage.jsx';
import { rehydrateChartDates } from '../lib/format.js';

export default function HomePage() {
  const [chart, setChart] = useState(null);
  const [interpretationError, setInterpretationError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastBirthInput, setLastBirthInput] = useState(null);
  const resultsRef = useRef(null);
  const formRef = useRef(null);

  async function runCalculation(birthInput) {
    setSubmitting(true);
    setInterpretationError(null);
    try {
      const res = await fetch('/api/kundali', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(birthInput),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      const hydrated = rehydrateChartDates(data.chart);
      setChart(hydrated);
      setInterpretationError(data.interpretationError || null);
      setLastBirthInput(birthInput);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch (err) {
      alert('Something went wrong calculating this chart: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetryInterpretation() {
    if (lastBirthInput) runCalculation(lastBirthInput);
  }

  return (
    <main>
      <section className="hero" id="home">
        <div className="wrap hero-grid">
          <div>
            <div className="hero-eyebrow">Vedic · Sidereal · Lahiri Ayanamsa</div>
            <h1>Discover Your <em>Vedic Kundali</em></h1>
            <p className="sub">Generate your personalized birth chart and detailed Vedic astrology report — calculated from real planetary positions, interpreted with traditional Jyotish principles.</p>
            <div className="hero-actions">
              <a href="#generate" className="btn-primary">Generate Kundali</a>
            </div>
          </div>
        </div>
      </section>

      <section className="form-section" id="generate" ref={formRef}>
        <div className="wrap">
          <div className="form-shell">
            <div className="form-side">
              <div className="eyebrow" style={{ color: '#E6C97A' }}>Birth Details Form</div>
              <h2>Tell us when and where you were born</h2>
              <p>Every field feeds the calculation engine directly.</p>
            </div>
            <div className="form-main">
              <BirthDetailsForm onSubmit={runCalculation} submitting={submitting} />
            </div>
          </div>
        </div>
      </section>

      <section className="results-section" id="results" ref={resultsRef}>
        <div className="wrap">
          {!chart && (
            <div className="empty-state">
              <h3 style={{ color: 'var(--ink-500)' }}>Your report will appear here</h3>
              <p>Fill in the birth details form above and select “Generate Kundali” to see your chart, planetary positions, dasha timeline and interpretation.</p>
            </div>
          )}
          {chart && (
            <ResultsPage
              chart={chart}
              interpretationError={interpretationError}
              onRetryInterpretation={handleRetryInterpretation}
              onStartOver={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
            />
          )}
        </div>
      </section>
    </main>
  );
}
