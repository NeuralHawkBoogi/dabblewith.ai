#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function arg(name, fallback = null) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  return args[idx + 1] || fallback;
}

const defaultSignals = '/home/clawdbot/dabblewith-whatsapp/data/community-signals.jsonl';
const inputPath = arg('signals', process.env.DABBLE_SIGNALS_JSONL || defaultSignals);
const since = arg('since', process.env.DABBLE_OUTREACH_SINCE || '2026-05-24T05:00:00Z');
const until = arg('until', process.env.DABBLE_OUTREACH_UNTIL || new Date().toISOString());
const targetCount = Number(arg('target', process.env.DABBLE_OUTREACH_TARGET || '5'));
const outPath = arg('out', null);
const generatedAt = arg('generated-at', process.env.DABBLE_OUTREACH_GENERATED_AT || new Date().toISOString());

function parseJsonLines(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try { return JSON.parse(line); }
      catch (err) { return { parse_error: true, index, error: err.message }; }
    });
}

function last4(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits ? digits.slice(-4).padStart(Math.min(4, digits.length), '*') : 'unknown';
}

function redactedUser(record) {
  return `wa_••••${last4(record.from)}`;
}

function normalizeText(text) {
  return String(text || '').toLowerCase();
}

function detectThemes(messages) {
  const text = normalizeText(messages.map(m => m.text).join(' '));
  const themes = [];
  const checks = [
    ['agentic workflows', /agentic|agent\b|agents\b|workflow automation|automation/],
    ['AI learning path', /learn|learning|tutor|collaborat|deeper|discussion/],
    ['developer workflow', /full stack|developer|software|coding|cli|filesystem|rust|python|openai|gemini/],
    ['task planning / productivity', /task planning|planning|day-to-day|productivity/],
    ['GenAI / AI agents', /gen ai|generative|ai agents|\bai\b/]
  ];
  for (const [label, regex] of checks) if (regex.test(text)) themes.push(label);
  return [...new Set(themes)];
}

function likelyStage(messages) {
  const text = normalizeText(messages.map(m => m.text).join(' '));
  if (/deeper builder discussion|call|discuss/.test(text)) return 'builder discussion requested';
  if (/learning|collaborat|tutor|everything in one response/.test(text)) return 'learning format captured';
  if (/thank you|sure/.test(text) && messages.length <= 2) return 'acknowledged, needs follow-up';
  return 'initial signal captured';
}

function nextAction(stage, themes) {
  if (stage === 'builder discussion requested') {
    return 'offer a 20-minute builder call and ask for one concrete workflow to inspect before the call';
  }
  if (themes.includes('agentic workflows') || themes.includes('developer workflow')) {
    return 'route to a hands-on agentic workflow mini-session and ask for preferred stack + sample task';
  }
  return 'ask one narrowing question: role, workflow pain, and preferred learning format';
}

const sinceDate = new Date(since);
const untilDate = new Date(until);
const rows = parseJsonLines(inputPath).filter(row => {
  if (!row || row.parse_error) return false;
  if (row.community !== 'dabblewith.ai') return false;
  const ts = new Date(row.received_at || row.timestamp || 0);
  return ts >= sinceDate && ts <= untilDate;
});

const byUser = new Map();
for (const row of rows) {
  const key = String(row.from || 'unknown');
  if (!byUser.has(key)) byUser.set(key, []);
  byUser.get(key).push(row);
}

const responders = [...byUser.values()].map(messages => {
  messages.sort((a, b) => String(a.received_at).localeCompare(String(b.received_at)));
  const themes = detectThemes(messages);
  const stage = likelyStage(messages);
  return {
    id: redactedUser(messages[0]),
    firstSeen: messages[0].received_at,
    lastSeen: messages[messages.length - 1].received_at,
    messageCount: messages.length,
    intents: [...new Set(messages.map(m => m.intent || 'unknown'))],
    themes,
    stage,
    nextAction: nextAction(stage, themes)
  };
}).sort((a, b) => a.firstSeen.localeCompare(b.firstSeen));

const themeCounts = new Map();
for (const responder of responders) {
  for (const theme of responder.themes) themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);
}
const topThemes = [...themeCounts.entries()].sort((a, b) => b[1] - a[1]);

const responseRate = targetCount > 0 ? `${responders.length}/${targetCount} (${Math.round((responders.length / targetCount) * 100)}%)` : `${responders.length}`;
const nextMove = responders.length >= 2
  ? 'convert the first responders into one concrete builder session/call before broadening outreach'
  : 'send two more warm DMs with the homepage join CTA and one specific workflow prompt';

const report = `# Homepage 5-contact outreach report

Generated: ${new Date(generatedAt).toISOString()}
Window: ${sinceDate.toISOString()} → ${untilDate.toISOString()}
Source: privacy-safe aggregate from community signal logs; phone numbers are redacted to last four digits only.

## Funnel read

- Outreach target: ${targetCount} known contacts
- Unique WhatsApp responders: ${responseRate}
- Inbound signal messages: ${rows.length}
- Current read: ${responders.length >= 2 ? 'the homepage → WhatsApp join path is working for early warm traffic' : 'not enough replies yet to judge the homepage route'}
- Best next move: ${nextMove}

## Top themes

${topThemes.length ? topThemes.map(([theme, count]) => `- ${theme}: ${count}`).join('\n') : '- none yet'}

## Responder routing

${responders.length ? responders.map((r, idx) => `### Responder ${idx + 1} (${r.id})

- First seen: ${r.firstSeen}
- Last seen: ${r.lastSeen}
- Messages: ${r.messageCount}
- Intents: ${r.intents.join(', ')}
- Themes: ${r.themes.length ? r.themes.join(', ') : 'unclear'}
- Stage: ${r.stage}
- Next action: ${r.nextAction}`).join('\n\n') : 'No responders in this window.'}

## Bookable follow-up copy

Use this when a responder has a builder/developer signal:

> Quick follow-up — I’m keeping this small before inviting more people. Send me one real workflow you want to automate or improve: current tool/stack, input you start with, output you want, what usually breaks, and what must stay private/safe. If it is concrete, I’ll turn it into a 20-minute builder walkthrough instead of generic AI talk.

Use this only if they mention running or helping manage a group:

> One more angle I’m validating: a lightweight AI host for WhatsApp communities — FAQs, registrations, summaries, reminders, and admin reports. If you run or help manage any group, would you do a 10-minute readiness check? https://dabblewith.ai/community-bot/

## Operator actions

1. For any responder asking for deeper discussion, send the bookable workflow-sample ask before proposing a time.
2. For agentic-workflow/developer signals, offer a focused mini-session: “Build a CLI/file-system memory agent safely.”
3. Ask the community-bot readiness question only when a responder has group-owner/admin context.
4. Keep the next warm outreach batch small: 3–5 contacts, same CTA, compare reply quality before a broad Casagrand post.

## Privacy guardrails

- Do not paste raw webhook payloads, message IDs, access tokens, verify tokens, or full phone numbers into reports.
- Keep public artifacts aggregate-first; use redacted last-four IDs only when a responder-level route is operationally necessary.
`;

if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, report);
} else {
  process.stdout.write(report);
}
