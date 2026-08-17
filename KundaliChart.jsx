'use client';

/**
 * KundaliChart.jsx
 * ---------------------------------------------------------------------------
 * North Indian style chart. Geometry: square + both corner-to-corner
 * diagonals + the diamond joining the four side-midpoints. House 1 = top
 * diamond; numbering runs counter-clockwise (House 4 left, House 7 bottom,
 * House 10 right) — the standard, fixed North Indian layout. Verified against
 * multiple independent astrology references (see project README).
 *
 * Pure presentational component: it only ever reads ascSignIndex /
 * planetsByHouse from props — it never computes astrology data itself.
 */

const A = [0, 0], B = [400, 0], C = [400, 400], Dd = [0, 400];
const T = [200, 0], R = [400, 200], Bm = [200, 400], Lm = [0, 200];
const O = [200, 200];
const P_A = [100, 100], P_B = [300, 100], P_C = [300, 300], P_D = [100, 300];

const HOUSES = [
  { num: 1, pts: [T, P_B, O, P_A] },
  { num: 2, pts: [A, T, P_A] },
  { num: 3, pts: [A, P_A, Lm] },
  { num: 4, pts: [Lm, P_A, O, P_D] },
  { num: 5, pts: [Lm, P_D, Dd] },
  { num: 6, pts: [Dd, P_D, Bm] },
  { num: 7, pts: [Bm, P_D, O, P_C] },
  { num: 8, pts: [Bm, C, P_C] },
  { num: 9, pts: [C, P_C, R] },
  { num: 10, pts: [R, P_C, O, P_B] },
  { num: 11, pts: [R, B, P_B] },
  { num: 12, pts: [B, P_B, T] },
];
const ALL_LINES = [[A,C],[B,Dd],[T,R],[R,Bm],[Bm,Lm],[Lm,T],[A,B],[B,C],[C,Dd],[Dd,A]];

const centroid = (pts) => pts.reduce(([x, y], p) => [x + p[0] / pts.length, y + p[1] / pts.length], [0, 0]);
const farthest = (pts, from) => pts.reduce((best, p) => {
  const d = (p[0] - from[0]) ** 2 + (p[1] - from[1]) ** 2;
  const bd = (best[0] - from[0]) ** 2 + (best[1] - from[1]) ** 2;
  return d > bd ? p : best;
}, pts[0]);
const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];

/**
 * @param {number} ascSignIndex - 0=Aries..11=Pisces
 * @param {Record<number, {abbr:string, retro?:boolean}[]>} planetsByHouse - house number (1-12) -> planets in it
 * @param {number} [ascDegree] - degree-in-sign of the ascendant, shown as a footer readout
 */
export default function KundaliChart({ ascSignIndex, planetsByHouse = {}, ascDegree }) {
  return (
    <svg viewBox="-18 -18 436 436" width="100%" role="img" aria-label="North Indian Vedic kundali chart" xmlns="http://www.w3.org/2000/svg">
      <rect x="-16" y="-16" width="432" height="432" rx="10" fill="#0C1236" />
      {ALL_LINES.map(([p, q], i) => (
        <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="#CA9F2E" strokeWidth="1.4" strokeLinecap="round" />
      ))}
      {HOUSES.map((h) => {
        const signIndex = (ascSignIndex + h.num - 1) % 12;
        const rashiNum = signIndex + 1;
        const cen = centroid(h.pts);
        const outer = farthest(h.pts, O);
        const rashiPos = lerp(cen, outer, 0.62);
        const planetPos = lerp(cen, O, 0.18);
        const list = planetsByHouse[h.num] || [];
        const lineH = 15;
        const startY = planetPos[1] - ((list.length - 1) * lineH) / 2;
        return (
          <g key={h.num}>
            <text x={rashiPos[0]} y={rashiPos[1]} textAnchor="middle" dominantBaseline="middle"
              fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="600" fill="#8C93B8">{rashiNum}</text>
            {h.num === 1 && (
              <text x={lerp(cen, outer, 0.3)[0]} y={lerp(cen, outer, 0.3)[1] - 14} textAnchor="middle"
                fontFamily="IBM Plex Mono, monospace" fontSize="9.5" letterSpacing="1" fill="#CA9F2E">LAGNA</text>
            )}
            {list.map((p, idx) => (
              <text key={idx} x={planetPos[0]} y={startY + idx * lineH} textAnchor="middle" dominantBaseline="middle"
                fontFamily="Cormorant Garamond, serif" fontSize="16.5" fontWeight="600" fill={p.retro ? '#E8A2A2' : '#F5E7C0'}>
                {p.abbr}{p.retro ? '(R)' : ''}
              </text>
            ))}
          </g>
        );
      })}
      {ascDegree !== undefined && (
        <text x="200" y="416" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#8C93B8">
          Asc {ascDegree.toFixed(2)}°
        </text>
      )}
    </svg>
  );
}
