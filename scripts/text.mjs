// Turns text into SVG paths using the site's own fonts, so GitHub renders
// the exact same lettering as hemanthkumargopi.vercel.app (GitHub images can't load web fonts).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const cache = {};
export function font(name) {
  if (!cache[name]) {
    const b = fs.readFileSync(path.join(here, 'fonts', name + '.woff'));
    cache[name] = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
  }
  return cache[name];
}

export const FONTS = {
  display: 'unbounded-900',
  displayBold: 'unbounded-700',
  mono: 'jetbrains-mono-500',
  body: 'manrope-700',
};

// opentype's own toPathData() can emit NaN, so serialize commands ourselves
const n = v => (Math.round(v * 10) / 10).toString();
function toD(cmds) {
  return cmds.map(c => c.type === 'Z' ? 'Z'
    : c.type === 'C' ? `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`
    : c.type === 'Q' ? `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`
    : `${c.type}${n(c.x)} ${n(c.y)}`).join('');
}

// ls = letter spacing in em; anchor = start | middle | end
export function width(str, f, size, ls = 0) {
  return font(f).getAdvanceWidth(str, size, { letterSpacing: ls });
}
export function text(str, x, y, size, f, { ls = 0, anchor = 'start', fill = '#DCEBFF', cls = '', extra = '' } = {}) {
  const w = width(str, f, size, ls);
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  const d = toD(font(f).getPath(str, x0, y, size, { letterSpacing: ls }).commands);
  return `<path d="${d}" fill="${fill}"${cls ? ` class="${cls}"` : ''}${extra}/>`;
}

export const C = {
  void: '#04060B', navy: '#0A1120', char: '#111724', cyan: '#35E0FF', amber: '#FFB547',
  ice: '#DCEBFF', silver: '#B8C4D6', mute: '#93A1BA', uv: '#8B6CFF', line: '#1C2A42',
};

// deterministic pseudo-random so regenerated images don't jitter
export function rng(seed = 7) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
