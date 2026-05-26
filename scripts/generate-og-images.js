#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'media', 'og');
const W = 1200;
const H = 630;

const cards = [
  {
    file: 'home.svg',
    eyebrow: 'AI BUILDER\'S EXCHANGE',
    title: 'Discover, fork, and share practical AI workflows.',
    subtitle: 'Human-reviewed workflows, templates, experiments, and community bots.',
    tag: 'workflows / fork / share'
  },
  {
    file: 'workflow-exchange.svg',
    eyebrow: 'WORKFLOW EXCHANGE',
    title: 'Practical AI workflows you can fork.',
    subtitle: 'Mini-tutorials with tools, steps, privacy notes, and human-review gates.',
    tag: '10 seed workflows live'
  },
  {
    file: 'community-bot.svg',
    eyebrow: 'WHATSAPP COMMUNITY HOST',
    title: 'Your community needs a host, not just a group admin.',
    subtitle: 'Onboarding, FAQs, RSVPs, nudges, reports — with human escalation.',
    tag: 'AI-operated · human-guided'
  },
  {
    file: 'newsletter-issue-001.svg',
    eyebrow: 'NEWSLETTER ISSUE #001',
    title: 'Practical AI for one-person teams.',
    subtitle: 'Three workflows, two community asks, one honest experiment update.',
    tag: 'weekly workflows'
  },
  {
    file: 'templates.svg',
    eyebrow: 'COPYABLE WORKSHEETS',
    title: 'Turn a workflow into something you can run today.',
    subtitle: 'Downloadable Markdown worksheets with safety gates built in.',
    tag: '5 templates live'
  },
  {
    file: 'experiments.svg',
    eyebrow: 'ROADMAP / EXPERIMENTS',
    title: 'What is live, what is testing, and what is next.',
    subtitle: 'A public operating board for the AI Builder\'s Exchange.',
    tag: 'no fake traction'
  }
];

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
}

function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textLines(lines, x, y, size, fill, weight = 800, lh = Math.round(size * 1.08)) {
  return lines.map((line, i) => `<text x="${x}" y="${y + i * lh}" fill="${fill}" font-family="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="${size > 44 ? '-2.5' : '0'}">${esc(line)}</text>`).join('\n');
}

function cardSvg(card) {
  const title = wrap(card.title, 31).slice(0, 3);
  const subtitle = wrap(card.subtitle, 54).slice(0, 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(card.title)}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#060912"/><stop offset="0.52" stop-color="#0b1324"/><stop offset="1" stop-color="#08121d"/></linearGradient>
    <radialGradient id="glowA" cx="18%" cy="0%" r="55%"><stop offset="0" stop-color="#58a6ff" stop-opacity="0.36"/><stop offset="1" stop-color="#58a6ff" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowB" cx="92%" cy="10%" r="48%"><stop offset="0" stop-color="#74ff7b" stop-opacity="0.24"/><stop offset="1" stop-color="#74ff7b" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M 42 0 L 0 0 0 42" fill="none" stroke="#74ffdb" stroke-opacity="0.08" stroke-width="1"/></pattern>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#000" flood-opacity="0.45"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glowA)"/>
  <rect width="${W}" height="${H}" fill="url(#glowB)"/>
  <rect x="58" y="54" width="1084" height="522" rx="34" fill="rgba(16,27,48,0.92)" stroke="#74ffdb" stroke-opacity="0.35" filter="url(#shadow)"/>
  <rect x="58" y="54" width="1084" height="58" rx="34" fill="rgba(116,255,219,0.06)"/>
  <circle cx="104" cy="83" r="8" fill="#74ff7b"/><circle cx="130" cy="83" r="8" fill="#ffcc66"/><circle cx="156" cy="83" r="8" fill="#58a6ff"/>
  <text x="944" y="89" fill="#9eb0c2" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="18" text-anchor="end">dabblewith.ai</text>
  <rect x="92" y="145" width="${Math.max(260, card.eyebrow.length * 12)}" height="42" rx="21" fill="rgba(116,255,219,0.08)" stroke="#74ffdb" stroke-opacity="0.9"/>
  <text x="114" y="172" fill="#74ffdb" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="16" font-weight="700" letter-spacing="1.6">${esc(card.eyebrow)}</text>
  ${textLines(title, 92, 266, 64, '#f2fbff', 900, 69)}
  ${textLines(subtitle, 96, 468, 28, '#c9ddec', 500, 37)}
  <rect x="92" y="520" width="${Math.max(230, card.tag.length * 12)}" height="38" rx="19" fill="rgba(116,255,123,0.10)" stroke="#74ff7b" stroke-opacity="0.52"/>
  <text x="114" y="545" fill="#74ff7b" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="15" font-weight="700">${esc(card.tag)}</text>
  <path d="M1000 432c38 0 70 31 70 70s-32 70-70 70-70-31-70-70 32-70 70-70zm0 24c-26 0-46 20-46 46s20 46 46 46 46-20 46-46-20-46-46-46z" fill="#74ffdb" fill-opacity="0.17"/>
  <path d="M988 490l46 13-46 13v-26z" fill="#74ff7b" fill-opacity="0.74"/>
</svg>
`;
}

function run() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const card of cards) {
    const file = path.join(OUT, card.file);
    const content = cardSvg(card);
    if (process.argv.includes('--check')) {
      if (!fs.existsSync(file)) { console.error('[check] missing: ' + path.relative(ROOT, file)); process.exitCode = 1; continue; }
      const old = fs.readFileSync(file, 'utf8');
      if (old !== content) { console.error('[check] diff: ' + path.relative(ROOT, file)); process.exitCode = 1; }
    } else {
      fs.writeFileSync(file, content);
    }
  }
  if (!process.argv.includes('--check')) console.log(`Generated ${cards.length} OG SVG images.`);
}

run();
