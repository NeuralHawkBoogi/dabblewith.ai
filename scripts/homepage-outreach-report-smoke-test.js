const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'homepage-outreach-'));
const signals = path.join(tmp, 'community-signals.jsonl');
const out = path.join(tmp, 'report.md');

const rows = [
  {
    received_at: '2026-05-24T05:01:00.000Z',
    community: 'dabblewith.ai',
    intent: 'join_request',
    from: '919999991234',
    display_name: 'Private Person',
    text: 'I am a full stack developer and want to learn AI agents',
    message_id: 'wamid.secret-one'
  },
  {
    received_at: '2026-05-24T05:02:00.000Z',
    community: 'dabblewith.ai',
    intent: 'builder_interest',
    from: '919999991234',
    display_name: 'Private Person',
    text: 'Deeper builder discussion',
    message_id: 'wamid.secret-two'
  },
  {
    received_at: '2026-05-24T05:03:00.000Z',
    community: 'dabblewith.ai',
    intent: 'community_signal',
    from: '918888887654',
    display_name: 'Another Person',
    text: 'Agentic workflow automation in Python',
    message_id: 'wamid.secret-three'
  },
  {
    received_at: '2026-05-24T05:04:00.000Z',
    community: 'other',
    intent: 'community_signal',
    from: '917777770000',
    text: 'ignore me'
  }
];
fs.writeFileSync(signals, rows.map(row => JSON.stringify(row)).join('\n'));

execFileSync(process.execPath, [
  path.join(root, 'scripts', 'homepage-outreach-report.js'),
  '--signals', signals,
  '--since', '2026-05-24T05:00:00Z',
  '--until', '2026-05-24T06:00:00Z',
  '--target', '5',
  '--generated-at', '2026-05-24T06:15:00.000Z',
  '--out', out
], { cwd: root, stdio: 'pipe' });

const report = fs.readFileSync(out, 'utf8');
assert(report.includes('Unique WhatsApp responders: 2/5 (40%)'));
assert(report.includes('wa_••••1234'));
assert(report.includes('wa_••••7654'));
assert(report.includes('builder discussion requested'));
assert(report.includes('agentic workflows'));
assert(!report.includes('919999991234'));
assert(!report.includes('918888887654'));
assert(!report.includes('wamid.secret'));
assert(!report.includes('Private Person'));
assert(!report.includes('Another Person'));
console.log('homepage outreach report smoke test passed');
