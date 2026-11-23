// Draws GitHub activity as a cricket wagon wheel: one shot per active day.
// Runs daily in GitHub Actions (see .github/workflows/wagon-wheel.yml).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { text, FONTS, C } from './text.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOGIN = process.env.GH_LOGIN || 'Hemanth-55';
const DAYS = 182;

async function fetchDays() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  const q = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST', headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: q, variables: { login: LOGIN } }),
  });
  const j = await res.json();
  const weeks = j?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (!weeks) { console.error('No data', JSON.stringify(j).slice(0, 300)); return null; }
  return weeks.flatMap(w => w.contributionDays).slice(-DAYS);
}

function stats(days) {
  const active = days.filter(d => d.contributionCount > 0);
  const total = days.reduce((a, d) => a + d.contributionCount, 0);
  const best = days.reduce((a, d) => Math.max(a, d.contributionCount), 0);
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) streak++;
    else if (i === days.length - 1) continue; // today may not be played yet
    else break;
  }
  return { total, active: active.length, best, streak };
}

function svg(days) {
  const W = 1280, H = 520, cx = 300, cy = 260, R = 220;
  const EO = 'cubic-bezier(0.23,1,0.32,1)';
  const s = days ? stats(days) : null;
  let shots = '';
  if (days && s.best > 0) {
    days.forEach((d, i) => {
      const c = d.contributionCount; if (!c) return;
      const a = (i / days.length) * Math.PI * 2 - Math.PI / 2 + 0.05;
      const f = c / s.best, six = f >= 0.8, len = six ? R - 4 : R * (0.22 + 0.62 * Math.sqrt(f));
      const x2 = cx + Math.cos(a) * len, y2 = cy + Math.sin(a) * len;
      const col = six ? C.amber : f > .35 ? C.cyan : C.uv;
      const delay = (0.4 + i * 0.012).toFixed(3);
      shots += `<line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="${six ? 2.6 : 1.6}" stroke-linecap="round" pathLength="1" class="shot" style="animation-delay:${delay}s"/>`;
      if (six) shots += `<circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="4.5" fill="${C.amber}" class="dot" style="animation-delay:${(+delay + .5).toFixed(3)}s"/>`;
    });
  }
  const field = `
  <circle cx="${cx}" cy="${cy}" r="${R + 18}" fill="#06101A"/>
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.cyan}" stroke-opacity=".55" stroke-width="2" stroke-dasharray="0 8" stroke-linecap="round"/>
  <circle cx="${cx}" cy="${cy}" r="${R * .45}" fill="none" stroke="${C.mute}" stroke-opacity=".35" stroke-dasharray="3 7"/>
  <rect x="${cx - 7}" y="${cy - 30}" width="14" height="60" rx="2" fill="${C.amber}" fill-opacity=".18" stroke="${C.amber}" stroke-opacity=".7"/>`;
  const lx = 640;
  const row = (k, v, y, col = C.ice) => text(k, lx, y, 13, FONTS.mono, { ls: .16, fill: C.mute }) + text(v, 1220, y, 22, FONTS.display, { anchor: 'end', fill: col });
  const right = s ? `
  ${row('CONTRIBUTIONS', String(s.total), 190, C.ice)}
  ${row('ACTIVE DAYS', String(s.active), 240, C.cyan)}
  ${row('BEST DAY', String(s.best), 290, C.amber)}
  ${row('CURRENT STREAK', s.streak + (s.streak === 1 ? ' day' : ' days'), 340, C.ice)}` :
    `${text('First innings loading…', lx, 250, 26, FONTS.displayBold, { fill: C.ice })}${text('The chart fills in after the next daily update.', lx, 288, 16, FONTS.body, { fill: C.mute })}`;
  const legend = `
  <line x1="${lx}" y1="420" x2="${lx + 30}" y2="420" stroke="${C.amber}" stroke-width="2.6"/>${text('BOUNDARY = BIGGEST DAYS', lx + 42, 425, 12, FONTS.mono, { ls: .12, fill: C.mute })}
  <line x1="${lx + 330}" y1="420" x2="${lx + 360}" y2="420" stroke="${C.cyan}" stroke-width="1.6"/>${text('SOLID DAYS', lx + 372, 425, 12, FONTS.mono, { ls: .12, fill: C.mute })}
  <line x1="${lx + 500}" y1="420" x2="${lx + 530}" y2="420" stroke="${C.uv}" stroke-width="1.6"/>${text('SINGLES', lx + 542, 425, 12, FONTS.mono, { ls: .12, fill: C.mute })}`;
  const updated = new Date().toISOString().slice(0, 10);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="GitHub activity drawn as a cricket wagon wheel${s ? `: ${s.total} contributions over the last 26 weeks, ${s.active} active days, best day ${s.best}` : ''}.">
<style>
 .shot{stroke-dasharray:1;stroke-dashoffset:1;animation:hit .9s ${EO} forwards}
 @keyframes hit{to{stroke-dashoffset:0}}
 .dot{opacity:0;animation:pop .4s ${EO} forwards}@keyframes pop{from{opacity:0}to{opacity:1}}
 @media (prefers-reduced-motion:reduce){.shot{animation:none;stroke-dashoffset:0}.dot{animation:none;opacity:1}}
</style>
<rect width="${W}" height="${H}" rx="14" fill="${C.void}"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${C.line}"/>
${field}${shots}
${text('WAGON WHEEL', lx, 92, 30, FONTS.displayBold, { fill: C.ice })}
${text('MY GITHUB ACTIVITY, LAST 26 WEEKS · EVERY LINE IS A DAY AT THE CREASE', lx, 124, 12, FONTS.mono, { ls: .1, fill: C.cyan })}
${right}${legend}
${text('UPDATED ' + updated, 1220, 490, 11, FONTS.mono, { ls: .14, anchor: 'end', fill: C.mute })}
</svg>`;
}

const days = await fetchDays().catch(e => { console.error(e); return null; });
fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
const outFile = path.join(root, 'assets', 'wagon-wheel.svg');
if (!days && fs.existsSync(outFile) && process.env.GITHUB_TOKEN) { console.log('keeping previous chart'); process.exit(0); }
fs.writeFileSync(outFile, svg(days));
console.log('wrote wagon-wheel.svg', days ? `(${days.length} days)` : '(placeholder)');

// local preview with sample data: SAMPLE=1 node scripts/wagon-wheel.mjs
if (process.env.SAMPLE) {
  const r = (() => { let s = 3; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })();
  const sample = Array.from({ length: DAYS }, (_, i) => ({ date: '', contributionCount: r() < .45 ? 0 : Math.floor(r() * r() * 14) }));
  fs.writeFileSync(path.join(root, 'assets', 'wagon-wheel.sample.svg'), svg(sample));
}
