// Draws my GitHub contributions for the last 26 weeks as a minimal bar chart.
// Runs daily in GitHub Actions (see .github/workflows/activity.yml).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { text, FONTS as F, A } from './text.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOGIN = process.env.GH_LOGIN || 'Hemanth-55';
const DAYS = 182;
const EO = 'cubic-bezier(0.23,1,0.32,1)';
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

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
  const total = days.reduce((a, d) => a + d.contributionCount, 0);
  const best = days.reduce((a, d) => Math.max(a, d.contributionCount), 0);
  const active = days.filter(d => d.contributionCount > 0).length;
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) streak++;
    else if (i === days.length - 1) continue; // today may still be empty
    else break;
  }
  return { total, active, best, streak };
}

function svg(days) {
  const W = 1280, H = 330, x0 = 56, x1 = W - 56, base = 270, hMax = 120;
  const s = days ? stats(days) : { total: 0, active: 0, best: 0, streak: 0 };
  let bars = '', months = '';
  if (days) {
    const pitch = (x1 - x0) / days.length, bw = Math.max(2, pitch * .56);
    let lastM = -1;
    days.forEach((d, i) => {
      const x = x0 + i * pitch, c = d.contributionCount;
      if (c > 0) {
        const h = Math.max(6, Math.sqrt(c / s.best) * hMax);
        bars += `<rect x="${x.toFixed(1)}" y="${(base - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${(bw / 2).toFixed(1)}" fill="${A.blue}" fill-opacity="${(.45 + .55 * c / s.best).toFixed(2)}" class="b" style="animation-delay:${(.3 + i * .004).toFixed(3)}s"/>`;
      } else {
        bars += `<rect x="${x.toFixed(1)}" y="${base - 2}" width="${bw.toFixed(1)}" height="2" rx="1" fill="${A.line}"/>`;
      }
      const m = d.date ? +d.date.slice(5, 7) - 1 : -1;
      if (m >= 0 && m !== lastM && +d.date.slice(8, 10) <= 7) { months += text(MONTHS[m], x, base + 28, 11, F.mono, { ls: .16, fill: A.sub }); lastM = m; }
    });
  }
  const stat = (v, l, x, i) => `<g class="up" style="animation-delay:${(.1 + i * .08).toFixed(2)}s">${text(v, x, 92, 34, F.sb, { ls: -.02, anchor: 'end', fill: i === 0 ? A.ink : A.ink })}${text(l, x, 116, 11, F.mono, { ls: .16, anchor: 'end', fill: A.sub })}</g>`;
  const updated = new Date().toISOString().slice(0, 10);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="GitHub activity, last 26 weeks: ${s.total} contributions, ${s.active} active days, best day ${s.best}, current streak ${s.streak} days.">
<style>
 .up{opacity:0;animation:up .9s ${EO} forwards}@keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
 .b{transform-box:fill-box;transform-origin:50% 100%;animation:grow .9s ${EO} backwards}@keyframes grow{from{transform:scaleY(0)}}
 @media (prefers-reduced-motion:reduce){*{animation:none!important;opacity:1!important}}
</style>
<rect width="${W}" height="${H}" rx="24" fill="${A.card}"/><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="24" fill="none" stroke="${A.line}"/>
<g class="up">${text('Activity', x0 - 2, 90, 30, F.sb, { ls: -.02, fill: A.ink })}${text('LAST 26 WEEKS  ·  UPDATED ' + updated, x0, 116, 11, F.mono, { ls: .16, fill: A.sub })}</g>
${stat(String(s.total), 'CONTRIBUTIONS', 800, 0)}${stat(String(s.active), 'ACTIVE DAYS', 940, 1)}${stat(String(s.best), 'BEST DAY', 1080, 2)}${stat(String(s.streak), 'DAY STREAK', x1, 3)}
${bars}${months}
</svg>`;
}

const outFile = path.join(root, 'assets', 'activity.svg');
const days = await fetchDays().catch(e => { console.error(e); return null; });
fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
if (!days && fs.existsSync(outFile) && process.env.GITHUB_TOKEN) { console.log('keeping previous chart'); process.exit(0); }

// local preview with sample data: SAMPLE=1 node scripts/activity.mjs
if (process.env.SAMPLE) {
  let r = 3; const rnd = () => ((r = (r * 1664525 + 1013904223) >>> 0) / 4294967296);
  const t0 = Date.now() - DAYS * 864e5;
  const sample = Array.from({ length: DAYS }, (_, i) => ({ date: new Date(t0 + i * 864e5).toISOString().slice(0, 10), contributionCount: rnd() < .5 ? 0 : Math.ceil(rnd() * rnd() * 12) }));
  fs.writeFileSync(path.join(root, 'assets', 'activity.sample.svg'), svg(sample));
  console.log('wrote activity.sample.svg');
} else {
  fs.writeFileSync(outFile, svg(days));
  console.log('wrote activity.svg', days ? `(${days.length} days)` : '(placeholder)');
}
