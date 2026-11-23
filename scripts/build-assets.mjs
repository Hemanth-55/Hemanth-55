// Builds the profile images in /assets. Run: node scripts/build-assets.mjs
// Text is converted to vector paths so GitHub renders the exact typography.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { text, width, FONTS as F, A } from './text.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const out = (name, svg) => { fs.mkdirSync(path.join(root, 'assets'), { recursive: true }); fs.writeFileSync(path.join(root, 'assets', name), svg); console.log('wrote', name, (svg.length / 1024).toFixed(1) + 'KB'); };
const EO = 'cubic-bezier(0.23,1,0.32,1)';
const BASE = `.up{opacity:0;animation:up .9s ${EO} forwards}@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
 .fade{opacity:0;animation:fade 1.2s ease-out forwards}@keyframes fade{to{opacity:1}}
 @media (prefers-reduced-motion:reduce){*{animation:none!important;opacity:1!important}}`;
const d = s => `style="animation-delay:${s.toFixed(2)}s"`;
// fit a line of text into a max width by shrinking the size
const fit = (s, f, size, max, ls = 0) => { while (width(s, f, size, ls) > max && size > 10) size -= .5; return size; };

/* ------------------------------------------------------------ dotted sphere (nod to the site's particle engine) */
function sphere(cx, cy, R, { lat = 7, mer = 6, dur = 36, op = 1 } = {}) {
  let s = '';
  for (let i = 1; i < lat; i++) {
    const a = -Math.PI / 2 + (i / lat) * Math.PI, rx = R * Math.cos(a), y = cy + R * Math.sin(a) * .96;
    s += `<ellipse cx="${cx}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * .2).toFixed(1)}" fill="none" stroke="${A.ink}" stroke-opacity="${(.16 * op).toFixed(3)}" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="0 6"/>`;
  }
  // meridians: rx follows |cos| so the globe appears to turn
  const N = 24;
  for (let k = 0; k < mer; k++) {
    const vals = Array.from({ length: N + 1 }, (_, j) => (R * Math.abs(Math.cos((j / N) * Math.PI))).toFixed(1)).join(';');
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R}" fill="none" stroke="${A.blue}" stroke-opacity="${(.55 * op).toFixed(2)}" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="0 6"><animate attributeName="rx" dur="${dur}s" begin="-${((k / mer) * dur).toFixed(2)}s" repeatCount="indefinite" values="${vals}"/></ellipse>`;
  }
  return s + `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${A.ink}" stroke-opacity="${(.12 * op).toFixed(2)}"/>`;
}

/* ------------------------------------------------------------ 1. hero */
function hero() {
  const W = 1280, H = 460, x = 80;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Hemi. Hemanth Kumar Gopi. Machine learning for sport. Professional cricketer, MS Business Analytics at Suffolk University.">
<title>Hemi — Hemanth Kumar Gopi</title>
<defs>
 <linearGradient id="ink" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${A.ink}"/><stop offset="1" stop-color="#A1A1A6"/></linearGradient>
 <radialGradient id="glow" cx="78%" cy="48%" r="38%"><stop offset="0" stop-color="${A.blue}" stop-opacity=".16"/><stop offset="1" stop-color="${A.blue}" stop-opacity="0"/></radialGradient>
</defs>
<style>${BASE}</style>
<rect width="${W}" height="${H}" rx="24" fill="${A.bg}"/>
<rect width="${W}" height="${H}" rx="24" fill="url(#glow)"/>
<g class="fade" ${d(.6)}>${sphere(1000, 230, 150)}</g>
<g class="up" ${d(.1)}>${text('HEMANTH KUMAR GOPI', x + 4, 138, 14, F.mono, { ls: .24, fill: A.sub })}</g>
<g class="up" ${d(.22)}>${text('Hemi.', x - 6, 266, 138, F.sb, { ls: -.035, fill: 'url(#ink)' })}</g>
<g class="up" ${d(.36)}>${text('Machine learning for sport.', x, 328, 32, F.sb, { ls: -.015, fill: A.ink })}</g>
<g class="up" ${d(.48)}>${text('Professional cricketer  ·  MS Business Analytics, Suffolk University', x, 368, 19, F.m, { fill: A.sub })}</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="24" fill="none" stroke="${A.line}"/>
</svg>`;
}

/* ------------------------------------------------------------ 2. profile sheet */
function sheet() {
  const rows = [
    ['EDUCATION', 'MS Business Analytics · Suffolk University, Boston · 2027'],
    ['ROLE', 'Graduate Fellow · Teaching Assistant, SAP S/4HANA'],
    ['PROGRAM', 'Mentee · MIT Sloan Sports Analytics Conference 2026'],
    ['CRICKET', 'Professional · TNCA, TNPL · Massachusetts State Cricket League, Charlotte Premier League'],
  ];
  const W = 1280, rh = 72, top = 36, H = top * 2 + rows.length * rh - 8, vx = 300;
  let s = '';
  rows.forEach(([k, v], i) => {
    const y = top + i * rh + 40, size = fit(v, F.m, 21, W - vx - 56);
    s += `<g class="up" ${d(.1 + i * .1)}>${text(k, 56, y - 2, 12.5, F.mono, { ls: .2, fill: A.sub })}${text(v, vx, y, size, F.m, { fill: A.ink })}</g>`;
    if (i < rows.length - 1) s += `<rect x="56" y="${top + (i + 1) * rh - 4}" width="${W - 112}" height="1" fill="${A.line}"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Education: MS Business Analytics, Suffolk University, Boston, 2027. Role: Graduate Fellow and Teaching Assistant, SAP S/4HANA. Program: Mentee, MIT Sloan Sports Analytics Conference 2026. Cricket: professional, TNCA and TNPL in India, Massachusetts State Cricket League and Charlotte Premier League in the US.">
<style>${BASE}</style>
<rect width="${W}" height="${H}" rx="24" fill="${A.card}"/><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="24" fill="none" stroke="${A.line}"/>
${s}</svg>`;
}

/* ------------------------------------------------------------ 3. project cards */
function metrics(list, x0, y, colW, vSize) {
  return list.map(([v, l1, l2], i) => {
    const x = x0 + i * colW;
    return `<g class="up" ${d(.45 + i * .1)}>${text(v, x, y, vSize, F.sb, { ls: -.02, fill: i === 0 ? A.blue : A.ink })}${text(l1, x + 2, y + 30, 11.5, F.mono, { ls: .14, fill: A.sub })}${l2 ? text(l2, x + 2, y + 48, 11.5, F.mono, { ls: .14, fill: A.sub }) : ''}</g>`;
  }).join('');
}
function frame(W, H, label, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${label}">
<style>${BASE}
 .pt{opacity:0;animation:fade .6s ease-out forwards}</style>
<rect width="${W}" height="${H}" rx="24" fill="${A.card}"/><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="24" fill="none" stroke="${A.line}"/>
${body}</svg>`;
}

function soccerCard() {
  const W = 1280, H = 420, x = 56;
  const pts = JSON.parse(fs.readFileSync(path.join(here, 'data', 'soccer-test.json'), 'utf8'));
  // real held-out predictions: x = predicted, y = actual (goals + assists per 90)
  const L = 880, T = 64, S = 300, max = 1.2;
  const px = v => L + Math.min(v, max) / max * S, py = v => T + S - Math.min(v, max) / max * S;
  let sc = `<rect x="${L}" y="${T}" width="${S}" height="${S}" fill="none" stroke="${A.line}"/>
   <line x1="${L}" y1="${T + S}" x2="${L + S}" y2="${T}" stroke="${A.dim}" stroke-dasharray="3 5"/>`;
  pts.forEach(([p, a], i) => { sc += `<circle cx="${px(p).toFixed(1)}" cy="${py(a).toFixed(1)}" r="3.4" fill="${A.blue}" fill-opacity=".62" class="pt" ${d(.6 + i * .006)}/>`; });
  sc += text('PREDICTED', L + S, T + S + 24, 10.5, F.mono, { ls: .16, anchor: 'end', fill: A.sub })
      + text('ACTUAL 2025–26', L, T - 14, 10.5, F.mono, { ls: .16, fill: A.sub })
      + text('189 held-out players', L + 12, T + 26, 12, F.m, { fill: A.sub });
  const body = `
<g class="up" ${d(.05)}>${text('MACHINE LEARNING  ·  RECRUITMENT', x, 74, 12.5, F.mono, { ls: .2, fill: A.blue })}</g>
<g class="up" ${d(.15)}>${text('Soccer Player Recruitment Model', x - 2, 130, 42, F.sb, { ls: -.02, fill: A.ink })}</g>
<g class="up" ${d(.25)}>${text('Forecasts next-season goals + assists per 90 for 941 Big-5 league players.', x, 172, 19, F.r, { fill: A.sub })}</g>
<g class="up" ${d(.32)}>${text('Python  ·  pandas  ·  scikit-learn  ·  ridge + random forest blend', x, 202, 15, F.r, { fill: A.dim })}</g>
${metrics([['0.68', 'R² ON HELD-OUT', 'TEST SET'], ['−19%', 'ERROR VS LAST', "SEASON'S RATE"], ['0.82', 'RANKING ACCURACY', '(SPEARMAN)'], ['1,484', 'PLAYERS FORECAST', 'FOR 2026–27']], x, 300, 190, 46)}
<g class="fade" ${d(.4)}>${sc}</g>`;
  return frame(W, H, "Soccer Player Recruitment Model. Forecasts next-season goals plus assists per 90 for 941 Big-5 league players. R squared 0.68 on a held-out test set, 19 percent less error than last season's rate, ranking accuracy 0.82, 1,484 players forecast for 2026-27. Chart: predicted versus actual for 189 held-out players.", body);
}

function halfCard({ kicker, title, sub, stats, label, viz = '' }) {
  const W = 630, H = 360, x = 44;
  const tl = title.map((t, i) => `<g class="up" ${d(.15 + i * .06)}>${text(t, x - 2, 108 + i * 40, 32, F.sb, { ls: -.02, fill: A.ink })}</g>`).join('');
  const body = `
<g class="up" ${d(.05)}>${text(kicker, x, 62, 12, F.mono, { ls: .2, fill: A.blue })}</g>
${tl}
<g class="up" ${d(.3)}>${text(sub, x, 108 + title.length * 40 - 2, 16, F.r, { fill: A.sub })}</g>
${metrics(stats, x, 286, 182, 36)}${viz}`;
  return frame(W, H, label, body);
}

out('hero.svg', hero());
out('profile.svg', sheet());
out('card-soccer.svg', soccerCard());
out('card-football.svg', halfCard({
  kicker: 'MACHINE LEARNING  ·  FOOTBALL', title: ['Football Player', 'Market Value Model'],
  sub: 'Prices players from performance and career data.',
  stats: [['0.612', 'R²'], ['€1.7M', 'LESS ERROR', 'PER PLAYER'], ['64', 'UNDERVALUED', 'TARGETS']],
  label: 'Football Player Market Value Model. R squared 0.612, 1.7 million euro less error per player, 64 undervalued targets.',
}));
out('card-portfolio.svg', halfCard({
  kicker: 'WEB  ·  INTERACTIVE', title: ['Hemi — Beyond', 'the Game'],
  sub: 'A cinematic portfolio in a single HTML file.',
  stats: [['2,600', 'PARTICLES'], ['10+', 'SCROLL SCENES'], ['0', 'FRAMEWORKS']],
  viz: `<g class="fade" ${d(.6)}>${sphere(522, 108, 58, { lat: 6, mer: 5, dur: 30, op: .9 })}</g>`,
  label: 'Hemi, Beyond the Game. A cinematic portfolio in a single HTML file: a 2,600-particle engine, 10+ scroll scenes, no frameworks.',
}));
