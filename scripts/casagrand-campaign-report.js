'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_RUNTIME_DIR = process.env.DABBLE_WHATSAPP_DATA_DIR || '/home/clawdbot/dabblewith-whatsapp/data';
const DEFAULT_OUTPUT_DIR = process.env.DABBLE_CASAGRAND_REPORT_DIR || path.join(process.cwd(), 'reports', 'casagrand-firstcity');
const CAMPAIGN_TERMS = [
  'casagrand',
  'first city',
  'ai by doing',
  'clubhouse',
  'resident helper',
];
const TOPIC_RULES = [
  ['job_search', /\b(job|resume|cv|interview|career|opportunit)/i],
  ['office_productivity', /\b(office|productivity|workflow|automation|meeting|email|excel|sheet|report)/i],
  ['coding_assistant', /\b(coding|code|developer|software|app|agent|build|github)/i],
  ['founder_tools', /\b(founder|startup|business|sales|proposal|lead|customer|freelance)/i],
  ['student_projects', /\b(student|college|school|project|learn|study|intern)/i],
  ['community_bot', /\b(whatsapp bot|community bot|resident helper|faq bot|bot)/i],
  ['event_interest', /\b(event|session|workshop|clubhouse|attend|register|join)/i],
];
const SOURCE_TAG_RULES = [
  ['casagrand_rsvp', /casagrand\s+rsvp/i],
  ['casagrand_date_poll', /casagrand\s+date\s+poll/i],
  ['casagrand_office_hours', /casagrand\s+office\s+hours/i],
  ['casagrand_champion', /casagrand\s+champion|resident\s+champion/i],
  ['tester_career', /casagrand\s+(?:first\s+city\s+)?tester\s*[-–]\s*career|casagrand\s+career\s+help/i],
  ['tester_workflow', /casagrand\s+(?:first\s+city\s+)?tester\s*[-–]\s*workflow|casagrand\s+workflow\s+help/i],
  ['tester_founder', /casagrand\s+(?:first\s+city\s+)?tester\s*[-–]\s*founder|casagrand\s+founder\s+help/i],
  ['tester_student', /casagrand\s+(?:first\s+city\s+)?tester\s*[-–]\s*student|casagrand\s+student\s+help/i],
  ['tester_community_bot', /casagrand\s+(?:first\s+city\s+)?tester\s*[-–]\s*community\s*bot|casagrand\s+community\s+bot\s+demo/i],
];
const SLOT_RULES = [
  ['weekend_morning', /weekend\s+morning/i],
  ['weekend_evening', /weekend\s+evening/i],
  ['weekday_evening', /weekday\s+evening/i],
];
const TRACK_FOR_TAG = {
  tester_career: 'career',
  tester_workflow: 'workflow',
  tester_founder: 'founder',
  tester_student: 'student',
  tester_community_bot: 'community_bot',
};

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    runtimeDir: DEFAULT_RUNTIME_DIR,
    outputDir: DEFAULT_OUTPUT_DIR,
    date: currentDate(),
    includeAll: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--runtime-dir') options.runtimeDir = argv[++i];
    else if (arg === '--output-dir') options.outputDir = argv[++i];
    else if (arg === '--date') options.date = argv[++i];
    else if (arg === '--include-all') options.includeAll = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.date)) throw new Error('--date must be YYYY-MM-DD');
  return options;
}

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try { return JSON.parse(line); }
      catch (err) { return { parse_error: true, file: path.basename(file), line: index + 1 }; }
    });
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function redactPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return null;
  return `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

function hashId(value) {
  if (!value) return null;
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 12);
}

function isSyntheticSignal(signal) {
  return /^1000000000\d+/.test(String(signal.from || '')) || /synthetic|llmtest/i.test(String(signal.message_id || ''));
}

function isCampaignText(text) {
  const lower = normalizeText(text).toLowerCase();
  return CAMPAIGN_TERMS.some((term) => lower.includes(term));
}

function inferTopics(text, intent) {
  const joined = `${intent || ''} ${normalizeText(text)}`;
  const topics = TOPIC_RULES.filter(([, re]) => re.test(joined)).map(([topic]) => topic);
  return topics.length ? [...new Set(topics)] : ['unclassified'];
}

function inferSourceTags(text) {
  const normalized = normalizeText(text);
  const tags = [];
  for (const [tag, re] of SOURCE_TAG_RULES) {
    if (re.test(normalized)) tags.push(tag);
  }
  if (tags.length) return tags;
  if (/casagrand\s+first\s+city/i.test(normalized)) return ['casagrand_first_city'];
  if (/casagrand/i.test(normalized)) return ['untagged_casagrand'];
  return [];
}

function inferSlotVotes(text) {
  const normalized = normalizeText(text);
  const votes = SLOT_RULES.filter(([, re]) => re.test(normalized)).map(([slot]) => slot);
  return [...new Set(votes)];
}

function tracksForTags(tags) {
  const tracks = [];
  for (const tag of tags) {
    if (TRACK_FOR_TAG[tag]) tracks.push(TRACK_FOR_TAG[tag]);
  }
  return [...new Set(tracks)];
}

function summarizeStatuses(statusRows) {
  const counts = {};
  for (const row of statusRows) {
    const payload = row.payload || row;
    const changes = (((payload.entry || [])[0] || {}).changes || []);
    for (const change of changes) {
      const statuses = (((change || {}).value || {}).statuses || []);
      for (const status of statuses) {
        const key = status.status || 'unknown';
        counts[key] = (counts[key] || 0) + 1;
      }
    }
  }
  return counts;
}

function topEntry(counts) {
  const entries = Object.entries(counts || {}).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (!entries.length) return null;
  return { key: entries[0][0], count: entries[0][1] };
}

// Mirrors the T+24 hour decision table in
// docs/growth/casagrand-firstcity-24hour-launch-brief.md. Works only from
// privacy-safe aggregates (counts and category names), never raw phones/messages.
function computeLaunchDecision(report) {
  const totals = report.totals || {};
  const uniqueUsers = totals.uniqueUsers || 0;
  const campaignSignals = totals.campaignSignals || 0;
  const communityBotTopic = (report.topics && report.topics.community_bot) || 0;
  const communityBotTrack = (report.trackCounts && report.trackCounts.community_bot) || 0;
  const communityBotSignals = Math.max(communityBotTopic, communityBotTrack);
  const topTopic = topEntry(report.topics);
  const topSourceTag = topEntry(report.sourceTags);

  const thresholds = [
    { name: 'clubhouse_intro', test: '>=25 unique users', met: uniqueUsers >= 25, value: uniqueUsers },
    { name: 'build_sprint', test: '10-24 unique users', met: uniqueUsers >= 10 && uniqueUsers <= 24, value: uniqueUsers },
    { name: 'design_partner_calls', test: '>=2 community_bot signals/tracks', met: communityBotSignals >= 2, value: communityBotSignals },
    { name: 'first10_tester_dms', test: '<10 weak/no signals', met: uniqueUsers < 10, value: uniqueUsers },
  ];

  const rationale = [
    `${uniqueUsers} unique residents/users across ${campaignSignals} campaign signals`,
    topTopic ? `Top topic cluster: ${topTopic.key} (${topTopic.count})` : 'No topic clusters captured yet',
    topSourceTag ? `Top source tag: ${topSourceTag.key} (${topSourceTag.count})` : 'No source tags captured yet',
    `community_bot signals/tracks: ${communityBotSignals}`,
  ];

  let stage;
  let route;
  let confidence;
  let nextAction;
  if (uniqueUsers >= 25) {
    stage = 'clubhouse_intro';
    route = 'Run clubhouse intro';
    confidence = 'high';
    nextAction = 'Pick the top topic cluster, propose 2 clubhouse slots, and prepare the QR/flyer.';
    rationale.push('25+ unique users clears the clubhouse-intro threshold.');
  } else if (uniqueUsers >= 10) {
    stage = 'build_sprint';
    route = 'Run smaller build sprint';
    confidence = 'medium';
    nextAction = 'Invite the first 10-12 residents to a focused 60-minute build sprint.';
    rationale.push('10-24 unique users supports a smaller sprint, not a full clubhouse event yet.');
  } else if (communityBotSignals >= 2) {
    stage = 'design_partner_calls';
    route = 'Run design-partner calls';
    confidence = 'medium';
    nextAction = 'Use /casagrand-firstcity/community-bot/ and qualify group admins for design-partner calls.';
    rationale.push('2+ community_bot signals/tracks point to paid-product validation over a public event.');
  } else {
    stage = 'first10_tester_dms';
    route = 'Do not force event';
    confidence = 'low';
    nextAction = 'Send first-10 tester DMs and rewrite the positioning before another public post.';
    rationale.push('<10 weak/no signals: gather more evidence before another public post.');
  }

  return { stage, route, confidence, rationale, thresholds, nextAction };
}

function buildCampaignReport(runtimeDir, options = {}) {
  const signals = readJsonl(path.join(runtimeDir, 'community-signals.jsonl'));
  const statusRows = readJsonl(path.join(runtimeDir, 'statuses.jsonl')).concat(readJsonl(path.join(runtimeDir, 'webhooks.jsonl')));
  const campaignSignals = signals.filter((signal) => options.includeAll || isCampaignText(signal.text));
  const realCampaignSignals = campaignSignals.filter((signal) => !isSyntheticSignal(signal));
  const users = new Map();
  const intents = {};
  const topics = {};
  const sourceTags = {};
  const trackCounts = {};
  const slotVotes = {};
  const recentSignals = [];

  for (const signal of realCampaignSignals) {
    const userKey = hashId(signal.from || signal.display_name || signal.message_id) || 'unknown';
    users.set(userKey, true);
    const intent = signal.intent || 'unknown';
    intents[intent] = (intents[intent] || 0) + 1;
    const signalTopics = inferTopics(signal.text, intent);
    for (const topic of signalTopics) topics[topic] = (topics[topic] || 0) + 1;
    const signalSourceTags = inferSourceTags(signal.text);
    for (const tag of signalSourceTags) sourceTags[tag] = (sourceTags[tag] || 0) + 1;
    const signalTracks = tracksForTags(signalSourceTags);
    for (const track of signalTracks) trackCounts[track] = (trackCounts[track] || 0) + 1;
    const signalSlotVotes = inferSlotVotes(signal.text);
    for (const slot of signalSlotVotes) slotVotes[slot] = (slotVotes[slot] || 0) + 1;
    recentSignals.push({
      receivedAt: signal.received_at || null,
      source: signal.source || 'unknown',
      intent,
      topics: signalTopics,
      sourceTags: signalSourceTags,
      tracks: signalTracks,
      slotVotes: signalSlotVotes,
      displayName: normalizeText(signal.display_name || 'unknown').slice(0, 40),
      from: redactPhone(signal.from),
      messageRef: hashId(signal.message_id),
      textPreview: normalizeText(signal.text).slice(0, 120),
    });
  }

  const nextAction = realCampaignSignals.length === 0
    ? 'Forward the Casagrand WhatsApp launch copy once, then run this report after 24 hours to pick the first clubhouse topic.'
    : 'Use the top topic cluster to select the first clubhouse event title and post the poll.';

  const report = {
    campaign: 'casagrand-firstcity',
    generatedAt: new Date().toISOString(),
    runtimeDir,
    totals: {
      campaignSignals: realCampaignSignals.length,
      uniqueUsers: users.size,
      syntheticOrExcludedSignals: campaignSignals.length - realCampaignSignals.length,
      allSignalsAvailable: signals.length,
    },
    intents,
    topics,
    sourceTags,
    trackCounts,
    slotVotes,
    deliveryStatuses: summarizeStatuses(statusRows),
    recentSignals: recentSignals.slice(-20).reverse(),
    nextAction,
    privacy: 'Phone numbers are redacted except last 4 digits; message IDs are hashed; tokens and raw webhook payloads are not included.',
  };
  report.decision = computeLaunchDecision(report);
  return report;
}

function renderMarkdown(report) {
  const lines = [];
  lines.push(`# Casagrand First City Campaign Report — ${report.generatedAt.slice(0, 10)}`);
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  appendLaunchDecision(lines, report.decision);
  lines.push('');
  lines.push('## Funnel snapshot');
  lines.push(`- Campaign signals: ${report.totals.campaignSignals}`);
  lines.push(`- Unique residents/users: ${report.totals.uniqueUsers}`);
  lines.push(`- All WhatsApp signals available: ${report.totals.allSignalsAvailable}`);
  lines.push(`- Synthetic/excluded campaign-like signals: ${report.totals.syntheticOrExcludedSignals}`);
  lines.push('');
  lines.push('## Intent counts');
  appendCounts(lines, report.intents, 'No Casagrand-specific intents captured yet.');
  lines.push('');
  lines.push('## Requested topic clusters');
  appendCounts(lines, report.topics, 'No topic clusters captured yet.');
  lines.push('');
  lines.push('## Source tag counts');
  appendCounts(lines, report.sourceTags, 'No Casagrand source tags captured yet.');
  lines.push('');
  lines.push('## Tester track counts');
  appendCounts(lines, report.trackCounts, 'No tester tracks captured yet.');
  lines.push('');
  lines.push('## Date/slot poll counts');
  appendCounts(lines, report.slotVotes, 'No date poll votes captured yet.');
  lines.push('');
  lines.push('## Delivery/status counts');
  appendCounts(lines, report.deliveryStatuses, 'No status events available.');
  lines.push('');
  lines.push('## Recent campaign signals');
  if (report.recentSignals.length === 0) {
    lines.push('- None yet.');
  } else {
    for (const signal of report.recentSignals) {
      const sourceTags = signal.sourceTags && signal.sourceTags.length ? signal.sourceTags.join(', ') : 'no_source_tag';
      const tracks = signal.tracks && signal.tracks.length ? signal.tracks.join(', ') : 'no_track';
      const slots = signal.slotVotes && signal.slotVotes.length ? signal.slotVotes.join(', ') : 'no_slot_vote';
      lines.push(`- ${signal.receivedAt || 'unknown'} · ${signal.from || 'unknown'} · ${signal.intent} · topics=${signal.topics.join(', ')} · tags=${sourceTags} · tracks=${tracks} · slots=${slots} · “${signal.textPreview}” · ref=${signal.messageRef || 'n/a'}`);
    }
  }
  lines.push('');
  lines.push('## Next action');
  lines.push(`- ${report.nextAction}`);
  lines.push('');
  lines.push(`Privacy: ${report.privacy}`);
  return `${lines.join('\n')}\n`;
}

function appendLaunchDecision(lines, decision) {
  lines.push('## Launch decision');
  if (!decision) {
    lines.push('- No decision computed.');
    return;
  }
  lines.push(`- Stage: ${decision.stage}`);
  lines.push(`- Route: ${decision.route}`);
  lines.push(`- Confidence: ${decision.confidence}`);
  lines.push(`- Next action: ${decision.nextAction}`);
  lines.push('- Rationale:');
  for (const reason of decision.rationale) lines.push(`  - ${reason}`);
  lines.push('- Thresholds:');
  for (const threshold of decision.thresholds) {
    lines.push(`  - [${threshold.met ? 'x' : ' '}] ${threshold.name}: ${threshold.test} (observed ${threshold.value})`);
  }
}

function appendCounts(lines, counts, empty) {
  const entries = Object.entries(counts || {}).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (!entries.length) {
    lines.push(`- ${empty}`);
    return;
  }
  for (const [key, count] of entries) lines.push(`- ${key}: ${count}`);
}

function writeCampaignReport(options = {}) {
  const runtimeDir = options.runtimeDir || DEFAULT_RUNTIME_DIR;
  const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
  const date = options.date || currentDate();
  const report = buildCampaignReport(runtimeDir, { includeAll: Boolean(options.includeAll) });
  fs.mkdirSync(outputDir, { recursive: true, mode: 0o700 });
  const base = `casagrand-firstcity-campaign-${date}`;
  const mdPath = path.join(outputDir, `${base}.md`);
  const jsonPath = path.join(outputDir, `${base}.json`);
  fs.writeFileSync(mdPath, renderMarkdown(report), { mode: 0o600 });
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  return { report, mdPath, jsonPath };
}

function usage() {
  return [
    'Usage: node scripts/casagrand-campaign-report.js [--runtime-dir DIR] [--output-dir DIR] [--date YYYY-MM-DD] [--include-all]',
    '',
    `Default runtime dir: ${DEFAULT_RUNTIME_DIR}`,
    `Default output dir: ${DEFAULT_OUTPUT_DIR}`,
  ].join('\n');
}

if (require.main === module) {
  try {
    const options = parseArgs();
    if (options.help) {
      console.log(usage());
      process.exit(0);
    }
    const result = writeCampaignReport(options);
    console.log(`casagrand campaign report written: ${result.mdPath}`);
    console.log(`casagrand campaign report written: ${result.jsonPath}`);
  } catch (err) {
    console.error(err.message || err);
    console.error(usage());
    process.exit(1);
  }
}

module.exports = {
  CAMPAIGN_TERMS,
  parseArgs,
  readJsonl,
  redactPhone,
  isCampaignText,
  inferTopics,
  inferSourceTags,
  inferSlotVotes,
  tracksForTags,
  computeLaunchDecision,
  buildCampaignReport,
  renderMarkdown,
  writeCampaignReport,
};
