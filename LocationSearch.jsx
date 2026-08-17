'use client';
import { useState, useRef, useEffect } from 'react';
import { getCityMatches } from '../lib/astrology/cities.js';

/**
 * LocationSearch.jsx
 * ---------------------------------------------------------------------------
 * Demo-mode city search against the bundled dataset (lib/astrology/cities.js).
 * For production, swap getCityMatches() for a real geocoding API call (see
 * comments in that file) — this component's props/contract stay the same.
 */
export default function LocationSearch({ value, onChange }) {
  const [query, setQuery] = useState(value?.label || '');
  const [matches, setMatches] = useState([]);
  const [open, setOpen] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manual, setManual] = useState({ lat: '', lon: '', tz: '' });
  const boxRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function handleInput(e) {
    const q = e.target.value;
    setQuery(q);
    onChange(null);
    if (q.trim().length < 2) { setMatches([]); setOpen(false); return; }
    setMatches(getCityMatches(q));
    setOpen(true);
  }
  function selectCity(c) {
    setQuery(c.label);
    setOpen(false);
    onChange(c);
  }
  function handleManualChange(field, val) {
    const next = { ...manual, [field]: val };
    setManual(next);
    const lat = parseFloat(next.lat), lon = parseFloat(next.lon);
    if (!isNaN(lat) && !isNaN(lon) && next.tz.trim()) {
      onChange({ label: `${lat.toFixed(4)}, ${lon.toFixed(4)} (${next.tz.trim()})`, lat, lon, tz: next.tz.trim() });
    } else {
      onChange(null);
    }
  }

  return (
    <div>
      <div className="location-wrap" ref={boxRef} style={{ position: 'relative' }}>
        <input type="text" autoComplete="off" placeholder="Start typing a city…" value={query} onChange={handleInput} />
        {open && (
          <div className="location-results open">
            {matches.length === 0 && <div className="none">No match in the demo city list — try entering coordinates manually below.</div>}
            {matches.map((c, i) => (
              <button type="button" key={i} onClick={() => selectCity(c)}>
                {c.label} <span style={{ color: '#8C93B8', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>({c.lat.toFixed(2)}, {c.lon.toFixed(2)})</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {value && <div className="location-chosen show">✓ {value.label} — {value.lat.toFixed(4)}, {value.lon.toFixed(4)} · {value.tz}</div>}
      <button type="button" className="manual-toggle" onClick={() => setManualMode((m) => !m)}>
        {manualMode ? 'Use the city search instead' : 'City not listed? Enter coordinates & timezone manually'}
      </button>
      {manualMode && (
        <div className="manual-fields open">
          <div>
            <label>Latitude</label>
            <input type="text" placeholder="e.g. 22.3072" value={manual.lat} onChange={(e) => handleManualChange('lat', e.target.value)} />
          </div>
          <div>
            <label>Longitude</label>
            <input type="text" placeholder="e.g. 73.1812" value={manual.lon} onChange={(e) => handleManualChange('lon', e.target.value)} />
          </div>
          <div>
            <label>IANA Timezone</label>
            <input type="text" placeholder="e.g. Asia/Kolkata" value={manual.tz} onChange={(e) => handleManualChange('tz', e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}
