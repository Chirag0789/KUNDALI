# Vedic Kundali

A modular Vedic astrology birth-chart and Kundali report generator: birth
details form → real astronomical calculation → North Indian chart + planetary
positions + Vimshottari Dasha → AI interpretation of that calculated data →
downloadable PDF report.

This repo is the **production-shaped source tree**: a Next.js (App Router)
app with the calculation engine, AI interpretation, and PDF generation split
into clean, independently-replaceable modules. A fully working, deployable
single-file demo of the same engine and UI is also available (see "Two ways
to look at this project" below) — start there if you just want to see it run
in under a minute.

## Two ways to look at this project

1. **Interactive single-file demo** (`vedic-kundali-demo.html` if provided
   alongside this project) — the complete UI/UX polish (hero, how-it-works,
   demo-mode banner, full form, results, PDF export) in one file you can open
   directly in a browser. No install step. This is the reference for exact
   visual/interaction design.
2. **This source tree** — the same calculation logic (`lib/astrology/`),
   restructured as a real Next.js app: server-side chart calculation, a
   server-side AI interpretation route (so your Anthropic API key never
   reaches the browser), and componentized React UI. Use this as the base
   for an actual deployment.

## Folder structure

```
vedic-kundali/
├── app/
│   ├── page.jsx                 # main page: form + results
│   ├── layout.jsx                # root layout, font loading
│   ├── globals.css               # design system (navy/gold/cream theme)
│   └── api/
│       └── kundali/route.js      # POST birth details -> { chart } (calculates + interprets)
├── components/
│   ├── BirthDetailsForm.jsx      # form + validation
│   ├── LocationSearch.jsx        # city search (demo dataset) + manual coords
│   ├── KundaliChart.jsx          # North Indian chart SVG renderer
│   └── ResultsPage.jsx           # overview, planetary table, dasha, interpretation
├── lib/
│   ├── astrology/
│   │   ├── EphemerisEngine.js    # AstrologyCalculator + PlanetaryPositions core math
│   │   ├── DashaCalculator.js    # Vimshottari Mahadasha/Antardasha
│   │   ├── AstrologyCalculator.js# orchestrates the above into one chart object
│   │   ├── cities.js             # demo birthplace dataset + lookup
│   │   └── constants.js          # signs, nakshatras, dasha data, i18n labels
│   ├── ai/
│   │   └── InterpretationEngine.js  # AI interpretation, SERVER-SIDE ONLY
│   ├── pdf/
│   │   └── PDFGenerator.js       # client-side PDF export (jsPDF + html2canvas)
│   ├── payments/
│   │   └── PaymentGateway.js     # stub — see file for how to wire up real payments
│   └── format.js                 # shared date/degree formatting + date rehydration
├── package.json
├── next.config.js
├── .env.example
└── README.md
```

The split is deliberate: **nothing outside `lib/astrology/` computes or
alters an astronomical position.** `lib/ai/InterpretationEngine.js` only ever
reads the structured chart object; `components/` only ever render it;
`lib/pdf/PDFGenerator.js` only ever formats it into a PDF. That means you can
swap the calculation engine (see below) without touching the UI, AI prompt,
or PDF layout at all.

## Dependencies

Runtime: `next`, `react`, `react-dom`, `@anthropic-ai/sdk`, `jspdf`, `html2canvas`.
No other services are required to run in demo mode — the ephemeris math is
pure JavaScript with zero external calls, and birthplace search uses a
bundled dataset.

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000. Fill in the birth details form; the app will
POST to `/api/kundali`, which calculates the chart server-side and calls
Claude for the interpretation text, then returns both together.

## Deploying online

This is a standard Next.js app, so any Next-compatible host works:

- **Vercel** (simplest): `vercel` CLI or connect the repo in the dashboard,
  add `ANTHROPIC_API_KEY` under Project → Settings → Environment Variables,
  deploy.
- **Render / Railway / Fly.io / a plain Node server**: `npm run build && npm
  start`, with the same environment variable set on the host.

Either way, **never** put `ANTHROPIC_API_KEY` (or any future payment secret
key) in a `NEXT_PUBLIC_*` variable or in client code — it must only be read
inside `app/api/**/route.js` files, which run server-side.

## Connecting a production-accurate astrology engine

The bundled `EphemerisEngine.js` is genuinely calculated (Meeus low/medium-
precision algorithms — see the file header for exact methodology and
accuracy figures), not invented or AI-guessed data. It's good enough for a
demo and for most everyday chart reading, but for arcsecond-grade,
professional-Jyotish-software accuracy:

1. Stand up [Swiss Ephemeris](https://www.astro.com/swisseph/) (the de facto
   standard) via `pyswisseph` in a small backend service (Python), or use
   one of the maintained Node/WASM ports if you want to stay in JS.
2. Have that service accept `{ date, time, lat, lon, tz }` and return the
   same shape `AstrologyCalculator.calculateChart()` returns — planets with
   `sign/house/nakshatra/pada/degreeInSign/retrograde`, `lagna`, and raw
   longitudes for `DashaCalculator` to consume.
3. Point `app/api/kundali/route.js` at that service instead of the local
   `lib/astrology/EphemerisEngine.js` calls. Nothing else in the app needs to
   change, because every consumer only depends on the returned object shape.

The exact swap points and Swiss Ephemeris call signature are documented in
detail at the top of `lib/astrology/EphemerisEngine.js`.

## Connecting real birthplace search

`lib/astrology/cities.js` currently matches against ~90 bundled major cities.
For unlimited place search, replace `getCityMatches()` with a call to a
geocoding API (Google Maps Geocoding API, OpenCage, or LocationIQ all work)
behind a new server route (e.g. `app/api/geocode/route.js`) so the API key
stays server-side, and resolve the IANA timezone name from the geocoder's
own timezone field or a coordinates→timezone lookup. `LocationSearch.jsx`'s
props (`value`, `onChange`) don't need to change.

## AI interpretation — what it is and isn't allowed to do

`lib/ai/InterpretationEngine.js` calls Claude with a system prompt that
explicitly forbids computing, guessing, or altering any astronomical
position — it is only ever given the already-calculated chart object as
structured JSON and asked to interpret it in the classical Vedic tradition,
avoiding absolute/deterministic claims about specific events. If you change
the model or prompt, keep those two constraints (data-only input,
non-deterministic framing) — they're a safety property of the product, not
just a style choice.

## Payments (not implemented)

The app is structured for a future **Birth Details → Generate Preview →
Payment → Unlock Full Kundali PDF** flow, but no payment gateway is wired up
— `lib/payments/PaymentGateway.js` is a stub with the exact steps to add
Stripe/Razorpay/etc. In this build, the full report is always generated and
downloadable (no paywall).

## Demo-mode disclosures carried over from the interactive demo

- **Ephemeris precision**: medium precision (see `EphemerisEngine.js`
  header) — usually fine, occasionally shifts a nakshatra pada or house near
  a boundary. Swap to Swiss Ephemeris for production.
- **Birthplace search**: fixed list of ~90 cities; wire a geocoding API for
  unlimited search.
- **Ayanamsa**: Lahiri, linear approximation (~0.004"/century drift from the
  Swiss Ephemeris reference value) — fine for any birth year in living
  memory, negligible drift even over a century.
- **House system**: Whole Sign (the traditional Jyotish default). Add other
  systems (Placidus, etc.) in `EphemerisEngine.js` / `houseOf()` if needed.

## License / disclaimer

Vedic astrology is a traditional interpretive system. This app presents its
output as traditional astrological guidance, not scientific or deterministic
prediction — carry that framing through if you customize the AI prompt or
UI copy.
