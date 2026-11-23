// Builds the animated profile images in /assets. Run: node scripts/build-assets.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { text, width, FONTS, C, rng } from './text.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = (name, svg) => { fs.mkdirSync(path.join(root, 'assets'), { recursive: true }); fs.writeFileSync(path.join(root, 'assets', name), svg); console.log('wrote', name, (svg.length / 1024).toFixed(1) + 'KB'); };
const EO = 'cubic-bezier(0.23,1,0.32,1)';
const RM = '@media (prefers-reduced-motion:reduce){*{animation:none!important}}';

/* ---------------------------------------------------------------- 1. stadium banner */
function banner() {
  const W = 1280, H = 420, r = rng(11);
  // stars
  let stars = '';
  for (let i = 0; i < 70; i++) {
    const x = (r() * W).toFixed(0), y = (r() * H * .9).toFixed(0), s = (r() * 1.4 + .4).toFixed(1);
    stars += `<circle cx="${x}" cy="${y}" r="${s}" fill="${r() < .2 ? C.amber : C.ice}" class="tw" style="animation-delay:${(r() * 4).toFixed(2)}s;opacity:${(r() * .5 + .15).toFixed(2)}"/>`;
  }
  // stadium bowl: dotted rings that slowly turn
  const cx = 930, top = 150;
  let rings = '';
  for (let k = 0; k < 9; k++) {
    const rx = 300 - k * 27, ry = rx * .34, cy = top + k * 15;
    const col = k % 3 === 2 ? C.uv : C.cyan, op = (.95 - k * .06).toFixed(2);
    rings += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry.toFixed(1)}" fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="3" stroke-linecap="round" stroke-dasharray="0 ${(9 + k * .6).toFixed(1)}" class="${k % 2 ? 'spinB' : 'spinA'}" style="animation-duration:${(26 + k * 3)}s"/>`;
  }
  // pitch at the bottom of the bowl
  const pitch = `<rect x="${cx - 9}" y="${top + 8 * 15 - 20}" width="18" height="44" rx="2" fill="none" stroke="${C.amber}" stroke-width="2" stroke-dasharray="0 6" stroke-linecap="round" transform="rotate(-8 ${cx} ${top + 120})"/>`;
  // floodlights
  const lamp = (x, flip, cls) => {
    let lamps = '';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) lamps += `<rect x="${x - 26 + i * 14}" y="${30 + j * 12}" width="10" height="8" rx="1.5" fill="#fff"/>`;
    const beam = flip ? `${x - 10},48 ${x + 10},48 ${x - 140},${H} ${x - 420},${H}` : `${x - 10},48 ${x + 10},48 ${x + 420},${H} ${x + 140},${H}`;
    return `<g class="${cls}"><polygon points="${beam}" fill="url(#beam)" opacity=".55"/><circle cx="${x}" cy="40" r="60" fill="url(#glow)"/>${lamps}<rect x="${x - 2}" y="54" width="4" height="${H}" fill="${C.line}"/></g>`;
  };
  // ball flying into the lights (loops)
  const ballPath = `M ${cx} ${top + 118} Q ${cx + 120} ${-40} 1196 44`;
  const t = (s, x, y, sz, f, o) => text(s, x, y, sz, f, o);
  const kicker = t('PRO CRICKETER  ·  SPORTS ANALYST  ·  BUILDER', 84, 112, 15, FONTS.mono, { ls: .16, fill: C.cyan });
  const hemi = t('HEMI', 78, 262, 150, FONTS.display, { fill: C.ice });
  const full = t('HEMANTH KUMAR GOPI', 84, 304, 16, FONTS.mono, { ls: .32, fill: C.silver });
  let x = 84; const sz = 30, y = 358;
  const words = [['Athlete.', C.amber], ['Analyst.', C.cyan], ['Builder.', C.ice]];
  let tri = '';
  for (const [w, c] of words) { tri += t(w, x, y, sz, FONTS.displayBold, { fill: c }); x += width(w, FONTS.displayBold, sz) + 16; }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="HEMI — Hemanth Kumar Gopi. Pro cricketer, sports analyst, builder.">
<title>HEMI — Hemanth Kumar Gopi</title>
<defs>
 <radialGradient id="bg" cx="72%" cy="40%" r="75%"><stop offset="0" stop-color="#0E1A30"/><stop offset=".55" stop-color="${C.void}"/><stop offset="1" stop-color="${C.void}"/></radialGradient>
 <radialGradient id="glow"><stop offset="0" stop-color="#EAF4FF" stop-opacity=".9"/><stop offset=".4" stop-color="${C.cyan}" stop-opacity=".25"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient>
 <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCEBFF" stop-opacity=".35"/><stop offset="1" stop-color="#DCEBFF" stop-opacity="0"/></linearGradient>
 <radialGradient id="bowl" cx="50%" cy="60%" r="50%"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".12"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient>
 <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
</defs>
<style>
 .tw{animation:tw 4s ease-in-out infinite}
 @keyframes tw{50%{opacity:.05}}
 .spinA{animation:spin linear infinite}.spinB{animation:spin linear infinite reverse}
 @keyframes spin{to{stroke-dashoffset:-400}}
 .fl1{opacity:0;animation:flon 1.3s linear .2s forwards}.fl2{opacity:0;animation:flon 1.3s linear .6s forwards}
 @keyframes flon{0%{opacity:0}8%{opacity:.95}12%{opacity:.08}20%{opacity:1}25%{opacity:.25}33%{opacity:1}100%{opacity:1}}
 .up{opacity:0;animation:up .7s ${EO} forwards}
 @keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
 .d1{animation-delay:1.1s}.d2{animation-delay:1.25s}.d3{animation-delay:1.4s}.d4{animation-delay:1.55s}
 .trail{stroke-dasharray:640;stroke-dashoffset:640;animation:trail 6s ${EO} 2s infinite}
 @keyframes trail{0%{stroke-dashoffset:640;opacity:1}35%{stroke-dashoffset:0;opacity:1}55%{opacity:0}100%{opacity:0}}
 .flash{opacity:0;animation:flash 6s ease-out 2s infinite}
 @keyframes flash{0%,32%{opacity:0}38%{opacity:1}60%,100%{opacity:0}}
 ${RM}
</style>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
${stars}
${lamp(84, false, 'fl1')}${lamp(1196, true, 'fl2')}
<ellipse cx="${cx}" cy="${top + 70}" rx="330" ry="150" fill="url(#bowl)"/>
${rings}${pitch}
<path d="${ballPath}" fill="none" stroke="${C.amber}" stroke-width="2.5" stroke-linecap="round" class="trail"/>
<circle r="5" fill="#FFE2B0"><animateMotion dur="6s" begin="2s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.35;1" calcMode="spline" keySplines=".23 1 .32 1;0 0 1 1" path="${ballPath}"/><animate attributeName="opacity" dur="6s" begin="2s" repeatCount="indefinite" values="1;1;0;0" keyTimes="0;.34;.36;1"/></circle>
<circle cx="1196" cy="44" r="46" fill="url(#glow)" class="flash"/>
<g class="up d1">${kicker}</g>
<g class="up d2">${hemi}</g>
<g class="up d3">${full}</g>
<g class="up d4">${tri}</g>
<rect x="0" y="${H - 2}" width="${W}" height="2" fill="${C.cyan}" opacity=".35"/>
</svg>`;
}

/* ---------------------------------------------------------------- 2. scoreboard */
function scoreboard() {
  const W = 1280, rows = [
    ['NOW BATTING', 'MS Business Analytics · Suffolk University · 2027'],
    ['ROLE', 'Graduate Fellow · Teaching Assistant (SAP S/4HANA)'],
    ['MENTOR', 'MIT Sloan Sports Analytics Conference · 2026'],
    ['STILL PLAYING', 'Massachusetts State Cricket League · Charlotte Premier League'],
    ['STANCE', 'Opening bat · Right-handed'],
    ['TARGETS', 'NFL · NBA · MLB · NHL'],
  ];
  const rowH = 44, top = 92, H = top + rows.length * rowH + 34;
  let body = '';
  rows.forEach(([k, v], i) => {
    const y = top + i * rowH;
    body += `<g class="row" style="animation-delay:${(0.3 + i * 0.12).toFixed(2)}s">
      <rect x="40" y="${y - 30}" width="880" height="${rowH - 6}" rx="6" fill="${i % 2 ? '#0C1526' : '#0A1120'}"/>
      ${text(k, 64, y - 4, 13, FONTS.mono, { ls: .16, fill: k === 'STILL PLAYING' ? C.amber : C.mute })}
      ${text(v, 262, y - 3, 19, FONTS.body, { fill: C.ice })}</g>`;
  });
  const side = `<g class="row" style="animation-delay:.2s">
    <rect x="944" y="62" width="296" height="${rows.length * rowH - 6}" rx="8" fill="#0A1120" stroke="${C.line}"/>
    ${text('7+', 1092, 200, 96, FONTS.display, { anchor: 'middle', fill: C.amber })}
    ${text('YEARS OF PRO CRICKET', 1092, 238, 13, FONTS.mono, { ls: .18, anchor: 'middle', fill: C.silver })}
    ${text('INDIA  —  USA', 1092, 268, 13, FONTS.mono, { ls: .18, anchor: 'middle', fill: C.cyan })}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Scoreboard: MS Business Analytics at Suffolk University; Graduate Fellow and teaching assistant; MIT Sloan Sports Analytics Conference mentee 2026; still playing in the Massachusetts State Cricket League and Charlotte Premier League; opening bat, right-handed; targets NFL, NBA, MLB, NHL.">
<defs><pattern id="led" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r=".8" fill="#13203A"/></pattern></defs>
<style>
 .row{opacity:0;animation:in .6s ${EO} forwards}
 @keyframes in{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}
 .live{animation:live 1.6s ease-in-out infinite}@keyframes live{50%{opacity:.2}}
 ${RM}
</style>
<rect width="${W}" height="${H}" rx="14" fill="${C.void}"/>
<rect width="${W}" height="${H}" rx="14" fill="url(#led)"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${C.line}"/>
${text('SCOREBOARD', 40, 40, 16, FONTS.displayBold, { ls: .06, fill: C.ice })}
${text('HEMI · INNINGS IN PROGRESS', 214, 40, 13, FONTS.mono, { ls: .14, fill: C.mute })}
<circle cx="1200" cy="35" r="5" fill="${C.amber}" class="live"/>${text('LIVE', 1188, 40, 13, FONTS.mono, { ls: .18, anchor: 'end', fill: C.amber })}
${body}${side}
</svg>`;
}

/* ---------------------------------------------------------------- 3. typing line */
function typing() {
  const W = 1280, H = 64, lines = ['Pro cricketer — sports analyst', 'Python · SQL · Tableau · Gen AI · Machine learning', 'Every shot is data.'];
  const n = lines.length, dur = 12;
  let g = '';
  lines.forEach((s, i) => {
    const w = width('> ' + s, FONTS.mono, 26, .02) + 6, x0 = (W - w) / 2;
    const a = i / n, b = (i + 1) / n, typeEnd = a + 0.11, hold = b - 0.03;
    const kt = i === n - 1 ? `0;${a.toFixed(3)};${typeEnd.toFixed(3)};${hold.toFixed(3)};1` : `0;${a.toFixed(3)};${typeEnd.toFixed(3)};${hold.toFixed(3)};${b.toFixed(3)};1`;
    const wv = i === n - 1 ? `0;0;${w.toFixed(0)};${w.toFixed(0)};0` : `0;0;${w.toFixed(0)};${w.toFixed(0)};0;0`;
    g += `<clipPath id="c${i}"><rect x="${x0.toFixed(0)}" y="0" height="${H}" width="0"><animate attributeName="width" dur="${dur}s" repeatCount="indefinite" values="${wv}" keyTimes="${kt}"/></rect></clipPath>
    <g clip-path="url(#c${i})">${text('> ', x0, 42, 26, FONTS.mono, { fill: C.amber })}${text(s, x0 + width('> ', FONTS.mono, 26, .02), 42, 26, FONTS.mono, { ls: .02, fill: C.cyan })}</g>
    <rect y="18" width="12" height="30" fill="${C.cyan}" opacity="0"><animate attributeName="x" dur="${dur}s" repeatCount="indefinite" values="${i === n - 1 ? `${x0};${x0};${x0 + w};${x0 + w};${x0}` : `${x0};${x0};${x0 + w};${x0 + w};${x0};${x0}`}" keyTimes="${kt}"/><animate attributeName="opacity" dur="${dur}s" repeatCount="indefinite" calcMode="discrete" values="0;1;0" keyTimes="0;${a.toFixed(3)};${b.toFixed(3)}"/></rect>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Pro cricketer to sports analyst. Python, SQL, Tableau, Gen AI, machine learning. Every shot is data.">
<rect width="${W}" height="${H}" rx="10" fill="${C.void}"/>${g}</svg>`;
}

/* ---------------------------------------------------------------- 4. project cards */
function card({ file, kicker, title, chips, viz, label }) {
  const W = 620, H = 270;
  let cx = 28, cy = 196, chipSvg = '';
  chips.forEach((c, i) => {
    const w = width(c, FONTS.mono, 12.5, .04) + 24;
    if (cx + w > 372) { cx = 28; cy += 34; }
    chipSvg += `<g class="chip" style="animation-delay:${(0.4 + i * 0.1).toFixed(2)}s"><rect x="${cx}" y="${cy - 19}" width="${w.toFixed(0)}" height="26" rx="13" fill="#0C1526" stroke="${i === 0 ? C.amber : C.line}"/>${text(c, cx + 12, cy - 1.5, 12.5, FONTS.mono, { ls: .04, fill: i === 0 ? C.amber : C.ice })}</g>`;
    cx += w + 8;
  });
  const titleLines = title.split('\n');
  const tl = titleLines.map((t, i) => text(t, 28, 92 + i * 34, 25, FONTS.displayBold, { fill: C.ice })).join('');
  return [file, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${label}">
<style>.chip{opacity:0;animation:in .5s ${EO} forwards}@keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
 .pulse{animation:pulse 2.4s ease-in-out infinite}@keyframes pulse{50%{opacity:.35}}
 .spin{animation:spin 30s linear infinite}@keyframes spin{to{stroke-dashoffset:-300}}${RM}</style>
<rect width="${W}" height="${H}" rx="14" fill="${C.navy}"/><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${C.line}"/>
${text(kicker, 28, 44, 12.5, FONTS.mono, { ls: .16, fill: C.cyan })}
${tl}${chipSvg}${viz}
</svg>`];
}
function footballViz() {
  const r = rng(5), L = 400, B = 236, Wd = 190, Hd = 180;
  let s = `<line x1="${L}" y1="${B}" x2="${L + Wd}" y2="${B - Hd}" stroke="${C.mute}" stroke-dasharray="4 6"/>`;
  for (let i = 0; i < 46; i++) {
    const q = r(), dev = (r() - .5) * .42, under = dev < -.12 && q > .2;
    const x = L + q * Wd, y = B - Math.min(1, Math.max(.03, q + dev)) * Hd;
    s += under ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="${C.amber}" class="pulse" style="animation-delay:${(r() * 2).toFixed(2)}s"/>` : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${C.cyan}" opacity=".7"/>`;
  }
  return s + text('MODEL VALUE', L + Wd, B + 20, 10.5, FONTS.mono, { anchor: 'end', fill: C.mute }) + `<circle cx="${L + 6}" cy="46" r="4.5" fill="${C.amber}"/>` + text('UNDERVALUED', L + 16, 50, 10.5, FONTS.mono, { fill: C.amber });
}
function portfolioViz() {
  let s = '';
  for (let k = 0; k < 7; k++) {
    const rx = 100 - k * 11, cy = 110 + k * 10;
    s += `<ellipse cx="500" cy="${cy}" rx="${rx}" ry="${(rx * .36).toFixed(1)}" fill="none" stroke="${k % 3 === 2 ? C.uv : C.cyan}" stroke-opacity="${(.95 - k * .08).toFixed(2)}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="0 7" class="spin" style="animation-duration:${20 + k * 4}s${k % 2 ? ';animation-direction:reverse' : ''}"/>`;
  }
  return s + `<rect x="494" y="166" width="12" height="28" rx="2" fill="none" stroke="${C.amber}" stroke-dasharray="0 5" stroke-width="2" stroke-linecap="round"/>`;
}

out('banner.svg', banner());
out('scoreboard.svg', scoreboard());
out('typing.svg', typing());
for (const [f, svg] of [
  card({ file: 'card-football.svg', kicker: 'MACHINE LEARNING · FOOTBALL', title: 'Football Player\nMarket Value Model', chips: ['R² 0.612', '~80% vs linear baselines', '-€1.7M error / player', '64 undervalued targets'], viz: footballViz(), label: 'Football Player Market Value Model: R squared 0.612, about 80 percent better than linear baselines, 1.7 million euro less error per player, 64 undervalued targets.' }),
  card({ file: 'card-portfolio.svg', kicker: 'WEB · BUILT WITH CLAUDE', title: 'Hemi — Beyond\nthe Game', chips: ['2,600-particle engine', '10+ scroll scenes', 'Phone edition', 'GitHub + Vercel'], viz: portfolioViz(), label: 'Hemi, Beyond the Game: interactive portfolio with a 2,600-particle engine, 10+ scroll scenes, a phone edition, deployed from GitHub to Vercel.' }),
]) out(f, svg);
