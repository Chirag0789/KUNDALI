'use client';
import { useState } from 'react';
import LocationSearch from './LocationSearch.jsx';

/**
 * BirthDetailsForm.jsx
 * ---------------------------------------------------------------------------
 * Collects and validates birth details, then hands a clean BirthInput object
 * (see AstrologyCalculator.js) to onSubmit. Does no astrology math itself.
 */
export default function BirthDetailsForm({ onSubmit, submitting }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [tob, setTob] = useState('');
  const [gender, setGender] = useState('');
  const [lang, setLang] = useState('en');
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!name.trim()) e.name = 'Please enter your full name.';
    if (!dob) e.dob = 'Please enter a valid date of birth.';
    if (!tob) e.tob = 'Please enter your birth time as accurately as possible.';
    if (!location) e.place = 'Please choose a birth place from the list, or enter coordinates manually.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    const [y, m, d] = dob.split('-').map(Number);
    const [hh, mm] = tob.split(':').map(Number);
    onSubmit({
      name: name.trim(), y, m, d, hh, mm,
      lat: location.lat, lon: location.lon, tz: location.tz, placeLabel: location.label,
      gender, lang,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={`field ${errors.name ? 'has-error' : ''}`}>
        <label htmlFor="inp-name">Full name <span className="req">*</span></label>
        <input id="inp-name" type="text" autoComplete="name" placeholder="e.g. Aanya Shah" value={name} onChange={(e) => setName(e.target.value)} />
        {errors.name && <div className="err">{errors.name}</div>}
      </div>

      <div className="row2">
        <div className={`field ${errors.dob ? 'has-error' : ''}`}>
          <label htmlFor="inp-dob">Date of birth <span className="req">*</span></label>
          <input id="inp-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          {errors.dob && <div className="err">{errors.dob}</div>}
        </div>
        <div className={`field ${errors.tob ? 'has-error' : ''}`}>
          <label htmlFor="inp-tob">Exact birth time <span className="req">*</span></label>
          <input id="inp-tob" type="time" step="60" value={tob} onChange={(e) => setTob(e.target.value)} />
          {errors.tob && <div className="err">{errors.tob}</div>}
          <div className="hint">Even 15 minutes of error can shift your Ascendant.</div>
        </div>
      </div>

      <div className={`field ${errors.place ? 'has-error' : ''}`}>
        <label>Birth place <span className="req">*</span></label>
        <LocationSearch value={location} onChange={setLocation} />
        {errors.place && <div className="err">{errors.place}</div>}
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="inp-gender">Gender <span style={{ color: 'var(--ink-500)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
          <select id="inp-gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="inp-lang">Preferred language <span className="req">*</span></label>
          <select id="inp-lang" value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">Hindi — हिन्दी</option>
            <option value="gu">Gujarati — ગુજરાતી</option>
          </select>
        </div>
      </div>

      <button type="submit" className={`btn-generate ${submitting ? 'loading' : ''}`} disabled={submitting}>
        {submitting && <span className="spinner" aria-hidden="true" />}
        <span>{submitting ? 'Calculating…' : 'Generate Kundali'}</span>
      </button>
      <div className="form-note">Birth details are sent to our server only to calculate your chart and generate the AI interpretation — see the privacy note in the README.</div>
    </form>
  );
}
