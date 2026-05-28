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
  ['casagrand_referral_sprint', /casagrand\s+referral|first[_\s-]?responder[_\s-]?referral|casagrand\s+referral\s+sprint/i],
  ['casagrand_date_poll', /casagrand\s+date\s+poll/i],
  ['casagrand_office_hours', /casagrand\s+office\s+hours/i],
  ['casagrand_champion', /casagrand\s+champion|resident\s+champion/i],
  ['casagrand_bot_readiness', /casagrand\s+bot\s+readiness\s+audit|casagrand\s+community\s+bot\s+readiness/i],
  ['casagrand_bot_design_call', /casagrand\s+bot\s+design\s+call|casagrand\s+community\s+bot\s+design\s+partner/i],
  ['casagrand_reboot_career', /casagrand\s+reboot\s+career/i],
  ['casagrand_reboot_workflow', /casagrand\s+reboot\s+workflow/i],
  ['casagrand_reboot_community_bot', /casagrand\s+reboot\s+community\s+bot/i],
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
  casagrand_bot_readiness: 'community_bot',
  casagrand_bot_design_call: 'community_bot',
  casagrand_reboot_career: 'career',
  casagrand_reboot_workflow: 'workflow',
  casagrand_reboot_community_bot: 'community_bot',
};

// Copy-ready, privacy-safe workflow-sample asks for the single-responder
// conversion stage. Keyed by the detected first-responder topic and tailored to
// QA/coding when that is the concrete signal (coding_assistant/event_interest);
// other topics fall back to their own concrete ask. These work only from
// redacted aggregates, never raw phones/messages/tokens.
const FIRST_RESPONDER_WORKFLOW_ASKS = {
  coding_assistant: 'Share one QA or coding task you repeat — a flaky test you keep re-running, a PR-review checklist, or a bug-triage step — and I will turn it into a small AI-by-doing sample you can reuse.',
  event_interest: 'Share one QA or coding task you repeat — a flaky test, a PR-review checklist, or a bug-triage step — and I will turn it into a small AI-by-doing sample you can reuse.',
  office_productivity: 'Share one report or spreadsheet step you repeat each week and I will turn it into a small AI-by-doing sample you can reuse.',
  job_search: 'Share one resume or interview-prep task you are working on and I will turn it into a small AI-by-doing sample you can reuse.',
  founder_tools: 'Share one sales, proposal, or lead-follow-up step you repeat and I will turn it into a small AI-by-doing sample you can reuse.',
  student_projects: 'Share one study or class-project task you repeat and I will turn it into a small AI-by-doing sample you can reuse.',
};
const FIRST_RESPONDER_DEFAULT_WORKFLOW_ASK = FIRST_RESPONDER_WORKFLOW_ASKS.coding_assistant;

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    runtimeDir: DEFAULT_RUNTIME_DIR,
    outputDir: DEFAULT_OUTPUT_DIR,
    date: currentDate(),
    includeAll: false,
    manualTracker: null,
    writeManualTrackerTemplate: null,
    writeReferralSprintTemplate: null,
    writeNoReplyNudgeTemplate: null,
    writeNarrowDiscoveryTemplate: null,
    writeRecoveryBatchTemplate: null,
    writeRecoveryOperatorBrief: null,
    excludeLast4: normalizeLast4List(process.env.DABBLE_CASAGRAND_EXCLUDE_LAST4 || ''),
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--runtime-dir') options.runtimeDir = argv[++i];
    else if (arg === '--output-dir') options.outputDir = argv[++i];
    else if (arg === '--date') options.date = argv[++i];
    else if (arg === '--manual-tracker') options.manualTracker = argv[++i];
    else if (arg === '--write-manual-tracker-template') options.writeManualTrackerTemplate = argv[++i];
    else if (arg === '--write-referral-sprint-template') options.writeReferralSprintTemplate = argv[++i];
    else if (arg === '--write-no-reply-nudge-template') options.writeNoReplyNudgeTemplate = argv[++i];
    else if (arg === '--write-narrow-discovery-template') options.writeNarrowDiscoveryTemplate = argv[++i];
    else if (arg === '--write-recovery-batch-template') options.writeRecoveryBatchTemplate = argv[++i];
    else if (arg === '--write-recovery-operator-brief') options.writeRecoveryOperatorBrief = argv[++i];
    else if (arg === '--exclude-last4') options.excludeLast4.push(...normalizeLast4List(argv[++i]));
    else if (arg === '--include-all') options.includeAll = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  options.excludeLast4 = [...new Set(options.excludeLast4)];
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

function normalizeLast4List(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.replace(/\D/g, '').slice(-4))
    .filter((item) => /^\d{4}$/.test(item));
}

function isExcludedLast4(signal, excludeLast4 = []) {
  if (!excludeLast4.length) return false;
  const digits = String(signal.from || '').replace(/\D/g, '');
  return digits.length >= 4 && excludeLast4.includes(digits.slice(-4));
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

function manualTrackerTemplate() {
  return {
    meta: {
      sprintStartedAt: '',
      reportRerunDueAt: '',
      notes: 'Fill timestamps in ISO format after the 5 DMs are sent. Store only privacy-safe notes.',
    },
    rows: [
      {
        segment: 'career',
        last4: '0001',
        route: 'no_reply',
        problem: '',
        followUpSent: false,
        nextAction: '',
      },
      {
        segment: 'career',
        last4: '0002',
        route: 'no_reply',
        problem: '',
        followUpSent: false,
        nextAction: '',
      },
      {
        segment: 'workflow',
        last4: '0003',
        route: 'no_reply',
        problem: '',
        followUpSent: false,
        nextAction: '',
      },
      {
        segment: 'workflow',
        last4: '0004',
        route: 'no_reply',
        problem: '',
        followUpSent: false,
        nextAction: '',
      },
      {
        segment: 'admin',
        last4: '0005',
        route: 'no_reply',
        problem: '',
        followUpSent: false,
        nextAction: '',
      },
    ],
  };
}

function referralSprintTrackerTemplate() {
  return {
    meta: {
      sprintStartedAt: '',
      reportRerunDueAt: '',
      route: 'first_responder_referral_sprint',
      notes: 'Fill timestamps after the first-responder referral ask. Store only last4, segment, short problem, and next action; no direct identifiers or copied chat text.',
    },
    rows: [
      {
        segment: 'qa_dev_student',
        last4: '1001',
        route: 'first_responder_referral_sprint',
        problem: '',
        followUpSent: false,
        nextAction: 'send referred-neighbor warm intro',
      },
      {
        segment: 'qa_dev_student',
        last4: '1002',
        route: 'first_responder_referral_sprint',
        problem: '',
        followUpSent: false,
        nextAction: 'ask topic/date vote after warm intro',
      },
      {
        segment: 'group_owner',
        last4: '1003',
        route: 'first_responder_referral_sprint',
        problem: '',
        followUpSent: false,
        nextAction: 'send bot-readiness audit only if they own/admin a WhatsApp group',
      },
    ],
  };
}

function noReplyNudgeTrackerTemplate() {
  return {
    meta: {
      sprintStartedAt: '',
      reportRerunDueAt: '',
      route: 'no_reply_nudge',
      notes: 'Fill after the one-time no-reply nudge. Store only last4, segment, route, short problem, and next action; no direct identifiers or copied chat text.',
    },
    rows: [
      {
        segment: 'qa_dev_student',
        last4: '2001',
        route: 'no_reply',
        problem: '',
        followUpSent: false,
        nextAction: 'if still silent, stop chasing and continue narrow discovery',
      },
      {
        segment: 'qa_dev_student',
        last4: '2002',
        route: 'no_reply',
        problem: '',
        followUpSent: false,
        nextAction: 'change route to problem if they share a tiny QA/coding sample',
      },
      {
        segment: 'qa_dev_student',
        last4: '2003',
        route: 'no_reply',
        problem: '',
        followUpSent: false,
        nextAction: 'change route to topic_vote only after an explicit slot/topic vote',
      },
      {
        segment: 'group_owner',
        last4: '2004',
        route: 'no_reply',
        problem: '',
        followUpSent: false,
        nextAction: 'change route to bot_readiness only if they own/admin a WhatsApp group',
      },
    ],
  };
}


function narrowDiscoveryTrackerTemplate() {
  return {
    meta: {
      sprintStartedAt: '',
      reportRerunDueAt: '',
      route: 'narrow_discovery',
      notes: 'Fill after the five narrow discovery DMs. Store only last4, segment, route, short problem, and next action; no direct identifiers or copied chat text.',
    },
    rows: [
      {
        segment: 'qa_dev_student',
        last4: '3001',
        route: 'no_reply',
        problem: '',
        problemType: 'qa_checklist',
        followUpSent: false,
        nextAction: 'qa_walkthrough | referral_sprint | continue_narrow_discovery',
      },
      {
        segment: 'qa_dev_student',
        last4: '3002',
        route: 'no_reply',
        problem: '',
        problemType: 'coding_helper',
        followUpSent: false,
        nextAction: 'qa_walkthrough | referral_sprint | continue_narrow_discovery',
      },
      {
        segment: 'excel_workflow',
        last4: '3003',
        route: 'no_reply',
        problem: '',
        problemType: 'excel_cleanup',
        followUpSent: false,
        nextAction: 'excel_walkthrough | referral_sprint | continue_narrow_discovery',
      },
      {
        segment: 'excel_workflow',
        last4: '3004',
        route: 'no_reply',
        problem: '',
        problemType: 'office_workflow',
        followUpSent: false,
        nextAction: 'excel_walkthrough | referral_sprint | continue_narrow_discovery',
      },
      {
        segment: 'group_owner',
        last4: '3005',
        route: 'no_reply',
        problem: '',
        problemType: 'bot_readiness',
        followUpSent: false,
        nextAction: 'bot_readiness | design_call | continue_narrow_discovery',
      },
    ],
  };
}

function recoveryBatchTrackerTemplate() {
  return {
    meta: {
      sprintStartedAt: '',
      reportRerunDueAt: '',
      route: 'stale_responder_recovery_batch',
      notes: 'Use this single private tracker for the current recovery send sheet: one stale-responder nudge plus five warm narrow-discovery sends. Store only last4, segment, route, problemType, followUpSent, nextAction, and short sanitized notes; no direct identifiers or copied chat text.',
    },
    rows: [
      {
        segment: 'qa_dev_student',
        last4: '4000',
        route: 'no_reply',
        problem: '',
        problemType: 'stale_first_responder_nudge',
        followUpSent: false,
        nextAction: 'qa_walkthrough | referral_sprint | continue_narrow_discovery',
      },
      {
        segment: 'other',
        last4: '4001',
        route: 'no_reply',
        problem: '',
        problemType: 'warm_intro_ask',
        followUpSent: false,
        nextAction: 'referral_sprint | continue_narrow_discovery',
      },
      {
        segment: 'qa_dev_student',
        last4: '4002',
        route: 'no_reply',
        problem: '',
        problemType: 'qa_checklist',
        followUpSent: false,
        nextAction: 'qa_walkthrough | referral_sprint | continue_narrow_discovery',
      },
      {
        segment: 'qa_dev_student',
        last4: '4003',
        route: 'no_reply',
        problem: '',
        problemType: 'coding_helper',
        followUpSent: false,
        nextAction: 'qa_walkthrough | referral_sprint | continue_narrow_discovery',
      },
      {
        segment: 'excel_workflow',
        last4: '4004',
        route: 'no_reply',
        problem: '',
        problemType: 'excel_cleanup',
        followUpSent: false,
        nextAction: 'excel_walkthrough | referral_sprint | continue_narrow_discovery',
      },
      {
        segment: 'excel_workflow',
        last4: '4005',
        route: 'no_reply',
        problem: '',
        problemType: 'office_workflow',
        followUpSent: false,
        nextAction: 'excel_walkthrough | referral_sprint | continue_narrow_discovery',
      },
      {
        segment: 'group_owner',
        last4: '4006',
        route: 'no_reply',
        problem: '',
        problemType: 'bot_readiness',
        followUpSent: false,
        nextAction: 'bot_readiness | design_call | continue_narrow_discovery',
      },
    ],
  };
}

function writeJsonTemplate(file, template, flagName) {
  if (!file) throw new Error(`${flagName} requires a file path`);
  const outputPath = path.resolve(file);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true, mode: 0o700 });
  fs.writeFileSync(outputPath, `${JSON.stringify(template, null, 2)}\n`, { mode: 0o600 });
  return outputPath;
}

function writeManualTrackerTemplate(file) {
  return writeJsonTemplate(file, manualTrackerTemplate(), '--write-manual-tracker-template');
}

function writeReferralSprintTrackerTemplate(file) {
  return writeJsonTemplate(file, referralSprintTrackerTemplate(), '--write-referral-sprint-template');
}

function writeNoReplyNudgeTrackerTemplate(file) {
  return writeJsonTemplate(file, noReplyNudgeTrackerTemplate(), '--write-no-reply-nudge-template');
}

function writeNarrowDiscoveryTrackerTemplate(file) {
  return writeJsonTemplate(file, narrowDiscoveryTrackerTemplate(), '--write-narrow-discovery-template');
}

function writeRecoveryBatchTrackerTemplate(file) {
  return writeJsonTemplate(file, recoveryBatchTrackerTemplate(), '--write-recovery-batch-template');
}

function loadManualTracker(file) {
  if (!file) return null;
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  return summarizeManualTracker(parsed);
}

function summarizeManualTracker(input) {
  const rows = Array.isArray(input) ? input : Array.isArray(input.rows) ? input.rows : [];
  const meta = (!Array.isArray(input) && input && typeof input === 'object') ? input.meta || {} : {};
  const allowedSegments = new Set(['career', 'workflow', 'admin', 'founder', 'student', 'community_bot', 'qa_dev_student', 'excel_workflow', 'group_owner', 'other', 'unknown']);
  const allowedRoutes = new Set(['no_reply', 'problem', 'referral', 'first_responder_referral_sprint', 'narrow_discovery', 'topic_vote', 'admin_pain', 'bot_readiness', 'design_call', 'no_fit']);
  const summary = {
    metaRoute: normalizeText(meta.route || ''),
    sprintStartedAt: safeIso(meta.sprintStartedAt),
    reportRerunDueAt: safeIso(meta.reportRerunDueAt),
    reportRerunDue: false,
    rows: 0,
    routeCounts: {},
    segmentCounts: {},
    concreteReplies: 0,
    topicVotes: 0,
    referrals: 0,
    adminPains: 0,
    botReadiness: 0,
    designCalls: 0,
    sanitizedRows: [],
    rejectedRows: 0,
  };

  if (summary.reportRerunDueAt) {
    summary.reportRerunDue = Date.parse(summary.reportRerunDueAt) <= Date.now();
  }

  for (const row of rows) {
    const last4 = String(row.last4 || row.phoneLast4 || '').replace(/\D/g, '');
    if (!/^\d{4}$/.test(last4)) {
      summary.rejectedRows += 1;
      continue;
    }
    const segment = allowedSegments.has(String(row.segment || '').trim()) ? String(row.segment).trim() : 'unknown';
    const route = allowedRoutes.has(String(row.route || '').trim()) ? String(row.route).trim() : 'no_reply';
    const problem = normalizeText(row.problem || row.problem8Words || '').split(/\s+/).slice(0, 8).join(' ');
    const problemType = normalizeText(row.problemType || row.problem_type || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 40) || null;
    const nextAction = normalizeText(row.nextAction || row.next || '').slice(0, 80);
    const followUpSent = Boolean(row.followUpSent || row.follow_up_sent);

    summary.rows += 1;
    summary.routeCounts[route] = (summary.routeCounts[route] || 0) + 1;
    summary.segmentCounts[segment] = (summary.segmentCounts[segment] || 0) + 1;
    if (['problem', 'referral', 'first_responder_referral_sprint', 'narrow_discovery', 'topic_vote', 'admin_pain', 'bot_readiness', 'design_call'].includes(route)) summary.concreteReplies += 1;
    if (route === 'topic_vote') summary.topicVotes += 1;
    if (route === 'referral' || route === 'first_responder_referral_sprint') summary.referrals += 1;
    if (route === 'admin_pain') summary.adminPains += 1;
    if (route === 'bot_readiness') summary.botReadiness += 1;
    if (route === 'design_call') summary.designCalls += 1;
    summary.sanitizedRows.push({ segment, last4: `****${last4}`, route, problem, problemType, followUpSent, nextAction });
  }

  summary.nextAction = computeManualNextAction(summary);
  return summary;
}

function safeIso(value) {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  const time = Date.parse(normalized);
  if (!Number.isFinite(time)) return null;
  return new Date(time).toISOString();
}

function computeManualNextAction(summary) {
  if (!summary || summary.rows === 0) return null;
  if (summary.metaRoute === 'narrow_discovery') {
    if (summary.concreteReplies >= 3) return 'Use /casagrand-firstcity/date-lock/ and prepare the clubhouse/admin slot ask; three narrow-discovery resident signals are logged.';
    if (summary.botReadiness >= 1 || summary.designCalls >= 1 || summary.adminPains >= 1) return 'Route the group-owner/admin row to /casagrand-firstcity/bot-readiness/; keep the remaining DMs narrow.';
    if (summary.referrals >= 1) return 'Move the warm referral into /casagrand-firstcity/referral-sprint/ and keep collecting last4-only outcomes.';
    if (summary.concreteReplies >= 1) return 'Route the concrete narrow-discovery reply to the matching walkthrough, then ask for one referral before broad-posting.';
    return 'No concrete narrow-discovery replies yet: rewrite the opener or ask for one different warm intro; do not broad-post yet.';
  }
  if (summary.metaRoute === 'stale_responder_recovery_batch') {
    if (summary.concreteReplies >= 3) return 'Use /casagrand-firstcity/date-lock/ and prepare the clubhouse/admin slot ask; recovery batch produced three concrete resident signals.';
    if (summary.botReadiness >= 1 || summary.designCalls >= 1 || summary.adminPains >= 1) return 'Route the group-owner/admin recovery reply to /casagrand-firstcity/bot-readiness/ before another public post.';
    if (summary.referrals >= 1) return 'Move the recovery referral into /casagrand-firstcity/referral-sprint/ and keep the remaining outcomes last4-only.';
    if (summary.concreteReplies >= 1) return 'Route the recovery reply to the matching QA/Excel walkthrough, then ask for one referral before broad-posting.';
    return 'No concrete recovery-batch replies yet: rewrite the warm intro or ask for one different trusted intro; do not broad-post yet.';
  }
  if (summary.designCalls >= 1 || summary.botReadiness >= 2 || summary.adminPains >= 2) {
    return 'Prioritize Get a Community Bot validation: book bot-readiness/design-partner calls before another broad event post.';
  }
  if (summary.topicVotes >= 3) return 'Open the date/topic poll and prepare a small Casagrand session.';
  if (summary.referrals >= 2) return 'Use the referred-neighbor warm intro path and open the date/topic poll once 3 total resident signals are logged.';
  if (summary.concreteReplies >= 2) return 'Send 5 more narrow DMs using the winning segment/problem language, then rerun the report.';
  if (summary.concreteReplies === 1) return 'Send one sharper follow-up to the concrete responder and ask for one referral before scaling.';
  return 'Rewrite the hook before another batch; the 5-DM manual tracker has no concrete replies yet.';
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

  const firstResponderTopics = new Set(['coding_assistant', 'student_projects', 'event_interest', 'job_search', 'office_productivity', 'founder_tools']);
  const hasConcreteFirstResponderTopic = Boolean(topTopic && firstResponderTopics.has(topTopic.key));

  const thresholds = [
    { name: 'clubhouse_intro', test: '>=25 unique users', met: uniqueUsers >= 25, value: uniqueUsers },
    { name: 'build_sprint', test: '10-24 unique users', met: uniqueUsers >= 10 && uniqueUsers <= 24, value: uniqueUsers },
    { name: 'design_partner_calls', test: '>=2 community_bot signals/tracks', met: communityBotSignals >= 2, value: communityBotSignals },
    { name: 'single_responder_conversion', test: '1-2 users with a concrete topic', met: uniqueUsers >= 1 && uniqueUsers <= 2 && communityBotSignals < 2 && hasConcreteFirstResponderTopic, value: uniqueUsers },
    { name: 'first10_tester_dms', test: '<10 weak/no signals', met: uniqueUsers < 10 && communityBotSignals < 2 && !hasConcreteFirstResponderTopic, value: uniqueUsers },
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
    nextAction = 'Use /casagrand-firstcity/design-partner-call/ and qualify group admins for design-partner calls.';
    rationale.push('2+ community_bot signals/tracks point to paid-product validation over a public event.');
  } else if (uniqueUsers >= 1 && uniqueUsers <= 2 && hasConcreteFirstResponderTopic) {
    stage = 'single_responder_conversion';
    route = 'Convert first responder';
    confidence = 'low';
    nextAction = 'Use /casagrand-firstcity/referral-sprint/ to turn the first QA/coding responder into 2-3 warm resident signals, then route any group-owner/admin referral to /casagrand-firstcity/bot-readiness/ before any broad post.';
    rationale.push('A small but concrete first signal is more useful as a conversion/referral loop than as justification for a broad post.');
  } else {
    stage = 'first10_tester_dms';
    route = 'Do not force event';
    confidence = 'low';
    nextAction = 'Send 5 narrow reboot DMs (2 career, 2 workflow, 1 group-owner/community-bot), ask each reply for one referral, then rerun this report after 24 hours before any broad post.';
    rationale.push('<10 weak/no signals: use the 5-DM reboot route before another public post.');
  }

  return { stage, route, confidence, rationale, thresholds, nextAction };
}

// Derives the responder's last-4 digits from already-redacted report data
// (redacted recent-signal phones, then manual-tracker sanitized rows). Never
// touches a raw phone number, so it cannot widen privacy exposure.
function firstResponderLast4(report) {
  const signals = Array.isArray(report.recentSignals) ? report.recentSignals : [];
  for (const signal of signals) {
    const digits = String(signal.from || '').replace(/\D/g, '');
    if (digits.length >= 4) return digits.slice(-4);
  }
  const rows = report.manualTracker && Array.isArray(report.manualTracker.sanitizedRows)
    ? report.manualTracker.sanitizedRows
    : [];
  for (const row of rows) {
    const digits = String(row.last4 || '').replace(/\D/g, '');
    if (digits.length >= 4) return digits.slice(-4);
  }
  return null;
}

// Builds copy-ready, privacy-safe first-responder follow-up asks for the
// single_responder_conversion stage; returns null for every other stage. Uses
// only redacted aggregates already on the report (top topic + last4), never raw
// phone numbers, message ids, or tokens. Deterministic for a given report.
function buildFirstResponderFollowUp(report) {
  if (!report || !report.decision || report.decision.stage !== 'single_responder_conversion') {
    return null;
  }
  const topTopic = topEntry(report.topics);
  const topic = topTopic ? topTopic.key : 'coding_assistant';
  const last4 = firstResponderLast4(report);
  const last4Label = last4 ? `last4=${last4}` : 'last4=unknown';
  return {
    topic,
    last4,
    workflowSampleAsk: FIRST_RESPONDER_WORKFLOW_ASKS[topic] || FIRST_RESPONDER_DEFAULT_WORKFLOW_ASK,
    slotVoteAsk: 'Which slot works for a 30-minute build session — weekend morning, weekend evening, or weekday evening — and which topic should we anchor on first?',
    referralAsk: 'Who is one other Casagrand First City resident who would want the same QA/coding workflow help? One quick intro is enough.',
    referralSprintLink: 'https://dabblewith.ai/casagrand-firstcity/referral-sprint/',
    referralSprintAsk: 'If they agree, send the referred-neighbor warm intro from /casagrand-firstcity/referral-sprint/ and log the new signal with last4 only.',
    communityBotGate: 'Only send /casagrand-firstcity/bot-readiness/ if the referral owns/admins a WhatsApp group or runs a resident/business/student community.',
    trackerNote: `Log in the manual tracker: ${last4Label} · segment=workflow · route=first_responder_referral_sprint · note="QA/coding workflow sample + one-referral ask sent".`,
  };
}

// Builds a copy-ready, privacy-safe "Referral sprint follow-up" section from the
// manual tracker when it contains referral-sprint rows
// (route=first_responder_referral_sprint). Uses only the already-sanitized
// tracker rows and aggregate counts (last4-masked rows, referral/segment
// counts) — never raw phones, messages, or tokens. Returns null when no
// referral-sprint rows are present. Deterministic for a given tracker summary.
function buildReferralSprintFollowUp(tracker) {
  if (!tracker || !Array.isArray(tracker.sanitizedRows)) return null;
  const rows = tracker.sanitizedRows.filter((row) => row.route === 'first_responder_referral_sprint');
  if (!rows.length) return null;
  const totalReferrals = tracker.referrals || 0;
  const hasGroupOwner = rows.some((row) => row.segment === 'group_owner')
    || Boolean(tracker.segmentCounts && tracker.segmentCounts.group_owner);
  const nextSteps = [];
  if (totalReferrals >= 2) {
    nextSteps.push(`Total referrals ${totalReferrals} (>=2): send the referred-neighbor warm intro from /casagrand-firstcity/referral-sprint/ and open /casagrand-firstcity/date-poll/ once 3 total resident signals are logged.`);
  } else {
    nextSteps.push(`Total referrals ${totalReferrals} (<2): keep running the referral sprint; need 2 referrals before opening /casagrand-firstcity/date-poll/.`);
  }
  if (hasGroupOwner) {
    nextSteps.push('Group-owner segment present: route that referral to /casagrand-firstcity/bot-readiness/ for the community-bot design-partner path.');
  }
  return {
    referralSprintRows: rows.length,
    totalReferrals,
    hasGroupOwner,
    nextSteps,
    rows: rows.map((row) => ({
      segment: row.segment,
      last4: row.last4,
      problem: row.problem,
      followUpSent: row.followUpSent,
      nextAction: row.nextAction,
    })),
  };
}


// Builds privacy-safe next steps from the five-DM narrow discovery tracker.
// It accepts only last4-masked rows and aggregate route/segment counts from the
// manual tracker, so it can turn private warm-DM outcomes into campaign routing
// without storing raw WhatsApp content or full phone numbers.
function buildNarrowDiscoveryFollowUp(tracker) {
  if (!tracker || tracker.metaRoute !== 'narrow_discovery' || !Array.isArray(tracker.sanitizedRows)) return null;
  const rows = tracker.sanitizedRows;
  const qaRows = rows.filter((row) => row.segment === 'qa_dev_student' && ['problem', 'narrow_discovery', 'topic_vote'].includes(row.route));
  const excelRows = rows.filter((row) => row.segment === 'excel_workflow' && ['problem', 'narrow_discovery', 'topic_vote'].includes(row.route));
  const groupOwnerRows = rows.filter((row) => row.segment === 'group_owner' && ['bot_readiness', 'admin_pain', 'design_call', 'narrow_discovery'].includes(row.route));
  const nextSteps = [];
  if (qaRows.length) nextSteps.push('QA/dev/student signal captured: route to /casagrand-firstcity/qa-walkthrough/ and ask for one referral after the sample.');
  if (excelRows.length) nextSteps.push('Excel/office-workflow signal captured: route to /casagrand-firstcity/excel-walkthrough/ and ask for one referral after the sample.');
  if (tracker.referrals > 0) nextSteps.push('Warm referral captured: move the referred-neighbor intro into /casagrand-firstcity/referral-sprint/.');
  if (groupOwnerRows.length || tracker.botReadiness > 0 || tracker.designCalls > 0 || tracker.adminPains > 0) nextSteps.push('Group-owner/admin signal captured: route only that row to /casagrand-firstcity/bot-readiness/ before discussing a community bot.');
  if (tracker.concreteReplies >= 3) nextSteps.push('Three or more concrete resident signals are logged: prepare /casagrand-firstcity/date-lock/ and the clubhouse/admin slot ask.');
  if (!nextSteps.length) nextSteps.push('No concrete narrow-discovery replies yet: rewrite the opener or ask one different warm intro; do not broad-post yet.');
  return {
    rows: tracker.rows,
    concreteReplies: tracker.concreteReplies,
    referrals: tracker.referrals,
    topicVotes: tracker.topicVotes,
    botReadiness: tracker.botReadiness,
    qaSignals: qaRows.length,
    excelSignals: excelRows.length,
    groupOwnerSignals: groupOwnerRows.length,
    nextSteps,
    rowsPreview: rows.map((row) => ({
      segment: row.segment,
      last4: row.last4,
      route: row.route,
      problem: row.problem,
      followUpSent: row.followUpSent,
      nextAction: row.nextAction,
    })),
  };
}


// Builds privacy-safe routing for the combined stale-responder recovery batch:
// one stale nudge, one warm-intro ask, two QA/dev DMs, two Excel/workflow DMs,
// and one group-owner/admin DM. It keeps the batch measurable without splitting
// evidence across multiple private files and only reads already-sanitized rows.
function buildRecoveryBatchFollowUp(tracker) {
  if (!tracker || tracker.metaRoute !== 'stale_responder_recovery_batch' || !Array.isArray(tracker.sanitizedRows)) return null;
  const rows = tracker.sanitizedRows;
  const staleResponderRows = rows.filter((row) => row.problemType === 'stale_first_responder_nudge');
  const warmIntroRows = rows.filter((row) => row.problemType === 'warm_intro_ask');
  const qaRows = rows.filter((row) => row.segment === 'qa_dev_student' && ['problem', 'narrow_discovery', 'topic_vote'].includes(row.route));
  const excelRows = rows.filter((row) => row.segment === 'excel_workflow' && ['problem', 'narrow_discovery', 'topic_vote'].includes(row.route));
  const groupOwnerRows = rows.filter((row) => row.segment === 'group_owner' && ['bot_readiness', 'admin_pain', 'design_call', 'narrow_discovery'].includes(row.route));
  const nextSteps = [];
  if (staleResponderRows.some((row) => row.route !== 'no_reply')) nextSteps.push('Stale first-responder replied: route the sample to /casagrand-firstcity/qa-walkthrough/ or /casagrand-firstcity/excel-walkthrough/, then ask for one referral.');
  if (warmIntroRows.some((row) => ['referral', 'first_responder_referral_sprint'].includes(row.route)) || tracker.referrals > 0) nextSteps.push('Warm intro/referral captured: move it into /casagrand-firstcity/referral-sprint/ and keep the referred-neighbor row last4-only.');
  if (qaRows.length) nextSteps.push('QA/dev/student recovery signal captured: use /casagrand-firstcity/qa-walkthrough/ and ask for one referral after the sample.');
  if (excelRows.length) nextSteps.push('Excel/office-workflow recovery signal captured: use /casagrand-firstcity/excel-walkthrough/ and ask for one referral after the sample.');
  if (groupOwnerRows.length || tracker.botReadiness > 0 || tracker.designCalls > 0 || tracker.adminPains > 0) nextSteps.push('Group-owner/admin recovery signal captured: route only that row to /casagrand-firstcity/bot-readiness/ before discussing the community-bot product.');
  if (tracker.concreteReplies >= 3) nextSteps.push('Three or more recovery-batch resident signals are logged: prepare /casagrand-firstcity/date-lock/ and the clubhouse/admin slot ask.');
  if (!nextSteps.length) nextSteps.push('No concrete recovery-batch replies yet: rewrite the warm-intro ask or request one different trusted intro; do not broad-post yet.');
  return {
    rows: tracker.rows,
    concreteReplies: tracker.concreteReplies,
    referrals: tracker.referrals,
    topicVotes: tracker.topicVotes,
    botReadiness: tracker.botReadiness,
    staleResponderRows: staleResponderRows.length,
    warmIntroRows: warmIntroRows.length,
    qaSignals: qaRows.length,
    excelSignals: excelRows.length,
    groupOwnerSignals: groupOwnerRows.length,
    nextSteps,
    rowsPreview: rows.map((row) => ({
      segment: row.segment,
      last4: row.last4,
      route: row.route,
      problemType: row.problemType,
      problem: row.problem,
      followUpSent: row.followUpSent,
      nextAction: row.nextAction,
    })),
  };
}


function latestRecentSignalAt(report) {
  const signals = Array.isArray(report && report.recentSignals) ? report.recentSignals : [];
  let latest = null;
  for (const signal of signals) {
    const receivedAt = safeIso(signal && signal.receivedAt);
    if (!receivedAt) continue;
    if (!latest || Date.parse(receivedAt) > Date.parse(latest)) latest = receivedAt;
  }
  return latest;
}

// Builds privacy-safe routing for the one-time no-reply nudge tracker. Uses
// only sanitized last4 rows and aggregate counts from the manual tracker.
function buildNoReplyNudgeFollowUp(tracker) {
  if (!tracker || tracker.metaRoute !== 'no_reply_nudge') return null;
  const nextSteps = [];
  if (tracker.referrals > 0) {
    nextSteps.push('Referral captured after the no-reply nudge: move that row into the referral sprint path and use /casagrand-firstcity/referral-sprint/.');
  }
  if (tracker.topicVotes > 0) {
    nextSteps.push('Topic/slot vote captured: keep it as a weak date-poll signal; lock a date only after 3 total resident signals.');
  }
  if (tracker.botReadiness > 0) {
    nextSteps.push('Group-owner/admin signal captured: route only that person to /casagrand-firstcity/bot-readiness/.');
  }
  if (tracker.concreteReplies > 0 && tracker.referrals === 0) {
    nextSteps.push('Concrete sample/problem captured: use /casagrand-firstcity/qa-walkthrough/ and ask for one referral after the walkthrough.');
  }
  if (tracker.concreteReplies === 0) {
    nextSteps.push('No concrete reply after the one-time nudge: stop chasing this responder, return to 3-5 narrow discovery DMs, and do not broad-post yet.');
  }
  return {
    rows: tracker.rows,
    concreteReplies: tracker.concreteReplies,
    topicVotes: tracker.topicVotes,
    referrals: tracker.referrals,
    botReadiness: tracker.botReadiness,
    nextSteps,
    rowsPreview: tracker.sanitizedRows.map((row) => ({
      segment: row.segment,
      last4: row.last4,
      route: row.route,
      problem: row.problem,
      followUpSent: row.followUpSent,
      nextAction: row.nextAction,
    })),
  };
}

// Builds a privacy-safe follow-up cadence for the current Casagrand wedge. This
// keeps the report actionable when a single first-responder signal goes stale:
// after 24h without a manual referral-sprint tracker row, the next best move is
// the one-time no-reply nudge rather than another broad IT-group post. Uses only
// aggregate counts and timestamps already present in the report.
function buildFollowUpCadence(report) {
  if (!report || !report.decision) return null;
  const latestSignalAt = latestRecentSignalAt(report);
  if (!latestSignalAt) return null;
  const generatedAt = safeIso(report.generatedAt) || new Date().toISOString();
  const ageHours = Math.max(0, Math.floor((Date.parse(generatedAt) - Date.parse(latestSignalAt)) / (60 * 60 * 1000)));
  const tracker = report.manualTracker || null;
  const referralsLogged = tracker ? tracker.referrals || 0 : 0;
  const trackerRows = tracker ? tracker.rows || 0 : 0;

  if (report.decision.stage !== 'single_responder_conversion') {
    return {
      stage: report.decision.stage,
      latestSignalAt,
      ageHours,
      state: 'not_single_responder',
      nextActionOverride: null,
      note: 'Cadence check recorded; launch decision handles this stage.',
    };
  }

  if (referralsLogged > 0) {
    return {
      stage: report.decision.stage,
      latestSignalAt,
      ageHours,
      state: 'referral_sprint_logged',
      nextActionOverride: null,
      note: 'Referral-sprint evidence exists; use the referral sprint follow-up and threshold rules.',
    };
  }

  if (trackerRows > 0) {
    return {
      stage: report.decision.stage,
      latestSignalAt,
      ageHours,
      state: 'manual_tracker_no_referral',
      nextActionOverride: 'Use /casagrand-firstcity/no-reply-nudge/ once for the first responder, then continue narrow discovery if no sample/referral is logged; do not broad-post yet.',
      note: 'Manual tracker rows exist but no referral-sprint row is logged, so the no-reply nudge is the safest recovery path.',
    };
  }

  if (ageHours >= 24) {
    return {
      stage: report.decision.stage,
      latestSignalAt,
      ageHours,
      state: 'single_responder_stale_24h',
      nextActionOverride: 'Use /casagrand-firstcity/no-reply-nudge/ once for the first responder, ask for one tiny sample/slot/referral signal, then continue narrow discovery if there is still no reply; do not broad-post yet.',
      note: 'The latest first-responder signal is 24h+ old and no referral-sprint tracker evidence is logged.',
    };
  }

  return {
    stage: report.decision.stage,
    latestSignalAt,
    ageHours,
    state: 'single_responder_fresh',
    nextActionOverride: null,
    note: 'First-responder signal is still fresh; keep the referral-sprint ask as the primary move.',
  };
}


function buildStaleResponderRecovery(report) {
  const cadence = report && report.followUpCadence;
  if (!cadence || !['single_responder_stale_24h', 'manual_tracker_no_referral'].includes(cadence.state)) return null;
  const firstResponder = buildFirstResponderFollowUp(report);
  const last4 = firstResponder && firstResponder.last4 ? firstResponder.last4 : 'last4_only';
  const topic = firstResponder && firstResponder.topic ? firstResponder.topic : 'current first-responder topic';
  return {
    state: cadence.state,
    signalAgeHours: cadence.ageHours,
    last4,
    topic,
    nudgeCopy: 'Quick nudge — if useful, send me one tiny QA/coding or Excel task you repeat. I will turn it into a small AI-by-doing sample. If now is not the right time, just reply with: weekend morning / weekend evening / weekday evening, or intro me to one Casagrand resident who may want this.',
    recoveryBatchTrackerCommand: 'node scripts/casagrand-campaign-report.js --write-recovery-batch-template private/casagrand-recovery-batch.json',
    recoveryBatchReportCommand: 'node scripts/casagrand-campaign-report.js --date YYYY-MM-DD --exclude-last4 2585 --manual-tracker private/casagrand-recovery-batch.json',
    trackerCommand: 'node scripts/casagrand-campaign-report.js --write-no-reply-nudge-template private/casagrand-no-reply-nudge.json',
    reportCommand: 'node scripts/casagrand-campaign-report.js --date YYYY-MM-DD --exclude-last4 2585 --manual-tracker private/casagrand-no-reply-nudge.json',
    fallbackCopy: 'If there is still no reply after the one-time nudge, stop chasing this responder and send the five warm narrow-discovery DMs: 2 QA/dev/student peers, 2 Excel/workflow peers, 1 group-owner/admin. Keep only last4 + segment + route + short problem note.',
    fallbackTrackerCommand: 'node scripts/casagrand-campaign-report.js --write-narrow-discovery-template private/casagrand-narrow-discovery.json',
    fallbackReportCommand: 'node scripts/casagrand-campaign-report.js --date YYYY-MM-DD --exclude-last4 2585 --manual-tracker private/casagrand-narrow-discovery.json',
    thresholds: [
      'Sample/problem reply -> use /casagrand-firstcity/qa-walkthrough/ or /casagrand-firstcity/excel-walkthrough/.',
      'One referral -> use /casagrand-firstcity/referral-sprint/.',
      'Group-owner/admin signal -> use /casagrand-firstcity/bot-readiness/.',
      'Three total resident signals -> use /casagrand-firstcity/date-lock/.',
      'No reply/no new signal -> continue narrow discovery; do not broad-post yet.',
    ],
  };
}

function buildCampaignReport(runtimeDir, options = {}) {
  const signals = readJsonl(path.join(runtimeDir, 'community-signals.jsonl'));
  const statusRows = readJsonl(path.join(runtimeDir, 'statuses.jsonl')).concat(readJsonl(path.join(runtimeDir, 'webhooks.jsonl')));
  const excludeLast4 = Array.isArray(options.excludeLast4) ? options.excludeLast4 : normalizeLast4List(options.excludeLast4 || '');
  const manualTracker = loadManualTracker(options.manualTracker || null);
  const campaignSignals = signals.filter((signal) => options.includeAll || isCampaignText(signal.text));
  const syntheticCampaignSignals = campaignSignals.filter((signal) => isSyntheticSignal(signal));
  const ownerOrTestExcludedSignals = campaignSignals.filter((signal) => !isSyntheticSignal(signal) && isExcludedLast4(signal, excludeLast4));
  const realCampaignSignals = campaignSignals.filter((signal) => !isSyntheticSignal(signal) && !isExcludedLast4(signal, excludeLast4));
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
    ? 'Send 5 narrow reboot DMs (2 career, 2 workflow, 1 group-owner/community-bot), ask each reply for one referral, then rerun this report after 24 hours before any broad post.'
    : 'Use the top topic cluster to select the first clubhouse event title and post the poll.';

  const report = {
    campaign: 'casagrand-firstcity',
    generatedAt: new Date().toISOString(),
    runtimeDir,
    totals: {
      campaignSignals: realCampaignSignals.length,
      uniqueUsers: users.size,
      syntheticOrExcludedSignals: campaignSignals.length - realCampaignSignals.length,
      ownerOrTestExcludedSignals: ownerOrTestExcludedSignals.length,
      syntheticSignals: syntheticCampaignSignals.length,
      allSignalsAvailable: signals.length,
    },
    intents,
    topics,
    sourceTags,
    trackCounts,
    slotVotes,
    deliveryStatuses: summarizeStatuses(statusRows),
    manualTracker,
    recentSignals: recentSignals.slice(-20).reverse(),
    nextAction,
    privacy: 'Phone numbers are redacted except last 4 digits; message IDs are hashed; tokens and raw webhook payloads are not included.',
  };
  report.decision = computeLaunchDecision(report);
  // Keep the bottom-of-report "Next action" aligned with the launch decision so
  // the markdown cannot contradict itself (decision card vs. final next action).
  // The signal-count default above only applies if no decision is computed.
  if (report.decision && report.decision.nextAction) {
    report.nextAction = report.decision.nextAction;
  }
  if (manualTracker && manualTracker.nextAction) {
    report.nextAction = manualTracker.nextAction;
  }
  report.followUpCadence = buildFollowUpCadence(report);
  if (report.followUpCadence && report.followUpCadence.nextActionOverride) {
    report.nextAction = report.followUpCadence.nextActionOverride;
    // Keep the launch decision card aligned with the effective cadence-driven
    // next action. This prevents stale single-responder reports from showing a
    // referral-sprint headline while the bottom of the report correctly routes
    // to the no-reply/narrow-discovery recovery path.
    if (report.decision) {
      report.decision.nextAction = report.followUpCadence.nextActionOverride;
      const cadenceReason = `Follow-up cadence override: ${report.followUpCadence.state}.`;
      if (Array.isArray(report.decision.rationale) && !report.decision.rationale.includes(cadenceReason)) {
        report.decision.rationale.push(cadenceReason);
      }
    }
  }
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
  const firstResponderFollowUp = buildFirstResponderFollowUp(report);
  if (firstResponderFollowUp) {
    appendFirstResponderFollowUp(lines, firstResponderFollowUp);
    lines.push('');
  }
  appendFollowUpCadence(lines, report.followUpCadence);
  lines.push('');
  const staleResponderRecovery = buildStaleResponderRecovery(report);
  if (staleResponderRecovery) {
    appendStaleResponderRecovery(lines, staleResponderRecovery);
    lines.push('');
  }
  const noReplyNudgeFollowUp = buildNoReplyNudgeFollowUp(report.manualTracker);
  if (noReplyNudgeFollowUp) {
    appendNoReplyNudgeFollowUp(lines, noReplyNudgeFollowUp);
    lines.push('');
  }
  const narrowDiscoveryFollowUp = buildNarrowDiscoveryFollowUp(report.manualTracker);
  if (narrowDiscoveryFollowUp) {
    appendNarrowDiscoveryFollowUp(lines, narrowDiscoveryFollowUp);
    lines.push('');
  }
  const recoveryBatchFollowUp = buildRecoveryBatchFollowUp(report.manualTracker);
  if (recoveryBatchFollowUp) {
    appendRecoveryBatchFollowUp(lines, recoveryBatchFollowUp);
    lines.push('');
  }
  lines.push('## Funnel snapshot');
  lines.push(`- Campaign signals: ${report.totals.campaignSignals}`);
  lines.push(`- Unique residents/users: ${report.totals.uniqueUsers}`);
  lines.push(`- All WhatsApp signals available: ${report.totals.allSignalsAvailable}`);
  lines.push(`- Synthetic/excluded campaign-like signals: ${report.totals.syntheticOrExcludedSignals}`);
  if (report.totals.ownerOrTestExcludedSignals) {
    lines.push(`- Owner/test signals excluded: ${report.totals.ownerOrTestExcludedSignals}`);
  }
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
  appendManualTracker(lines, report.manualTracker);
  lines.push('');
  const referralSprintFollowUp = buildReferralSprintFollowUp(report.manualTracker);
  if (referralSprintFollowUp) {
    appendReferralSprintFollowUp(lines, referralSprintFollowUp);
    lines.push('');
  }
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



function appendFollowUpCadence(lines, cadence) {
  lines.push('## Follow-up cadence');
  if (!cadence) {
    lines.push('- No cadence signal available yet.');
    return;
  }
  lines.push(`- Latest privacy-safe signal timestamp: ${cadence.latestSignalAt}`);
  lines.push(`- Signal age: ${cadence.ageHours}h`);
  lines.push(`- Cadence state: ${cadence.state}`);
  lines.push(`- Note: ${cadence.note}`);
  if (cadence.nextActionOverride) lines.push(`- Cadence next action: ${cadence.nextActionOverride}`);
}

function appendManualTracker(lines, tracker) {
  lines.push('## Manual 5-DM tracker outcomes');
  if (!tracker) {
    lines.push('- No manual tracker file supplied.');
    return;
  }
  lines.push(`- Rows accepted: ${tracker.rows}`);
  if (tracker.rejectedRows) lines.push(`- Rows rejected: ${tracker.rejectedRows}`);
  if (tracker.sprintStartedAt) lines.push(`- Sprint started: ${tracker.sprintStartedAt}`);
  if (tracker.reportRerunDueAt) lines.push(`- Report rerun due: ${tracker.reportRerunDueAt} (${tracker.reportRerunDue ? 'due now' : 'not due yet'})`);
  lines.push(`- Concrete replies: ${tracker.concreteReplies}`);
  lines.push(`- Topic votes: ${tracker.topicVotes}`);
  lines.push(`- Referrals: ${tracker.referrals}`);
  lines.push(`- Admin pains: ${tracker.adminPains}`);
  lines.push(`- Bot readiness: ${tracker.botReadiness}`);
  lines.push(`- Design calls: ${tracker.designCalls}`);
  lines.push(`- Manual next action: ${tracker.nextAction || 'none'}`);
  lines.push('- Route counts:');
  appendCounts(lines, tracker.routeCounts, 'No manual routes captured.');
  lines.push('- Sanitized rows:');
  if (!tracker.sanitizedRows.length) {
    lines.push('  - None.');
  } else {
    for (const row of tracker.sanitizedRows) {
      lines.push(`  - ${row.segment} · ${row.last4} · ${row.route} · problem="${row.problem || 'n/a'}" · follow_up=${row.followUpSent ? 'yes' : 'no'} · next="${row.nextAction || 'n/a'}"`);
    }
  }
}

function appendFirstResponderFollowUp(lines, followUp) {
  lines.push('## First responder follow-up (single responder conversion)');
  lines.push('Copy-ready, privacy-safe asks for the one concrete responder (last4 only, no phone/message exposure):');
  lines.push(`- Detected topic: ${followUp.topic}`);
  lines.push(`- Workflow sample ask: ${followUp.workflowSampleAsk}`);
  lines.push(`- Slot/topic vote ask: ${followUp.slotVoteAsk}`);
  lines.push(`- Referral ask: ${followUp.referralAsk}`);
  lines.push(`- Referral sprint link: ${followUp.referralSprintLink}`);
  lines.push(`- Referral sprint ask: ${followUp.referralSprintAsk}`);
  lines.push(`- Community-bot gate: ${followUp.communityBotGate}`);
  lines.push(`- Tracker note: ${followUp.trackerNote}`);
}


function appendStaleResponderRecovery(lines, recovery) {
  lines.push('## Stale responder recovery kit');
  lines.push('Copy-ready recovery for a 24h+ first-responder stall (last4 only, no phone/message/token exposure):');
  lines.push(`- Cadence state: ${recovery.state}`);
  lines.push(`- Signal age: ${recovery.signalAgeHours}h`);
  lines.push(`- Responder last4: ${recovery.last4}`);
  lines.push(`- Detected topic: ${recovery.topic}`);
  lines.push(`- One-time nudge copy: ${recovery.nudgeCopy}`);
  lines.push(`- Recommended combined tracker starter: ${recovery.recoveryBatchTrackerCommand}`);
  lines.push(`- Recommended combined report rerun: ${recovery.recoveryBatchReportCommand}`);
  lines.push('- Use the combined tracker if Boogi sends the stale nudge and the warm narrow-discovery batch in one sitting; it avoids splitting evidence across separate private files.');
  lines.push(`- Optional no-reply-only tracker starter: ${recovery.trackerCommand}`);
  lines.push(`- Optional no-reply-only report rerun: ${recovery.reportCommand}`);
  lines.push(`- Fallback if still quiet: ${recovery.fallbackCopy}`);
  lines.push(`- Narrow-discovery tracker starter: ${recovery.fallbackTrackerCommand}`);
  lines.push(`- Narrow-discovery report rerun: ${recovery.fallbackReportCommand}`);
  lines.push('- Routing thresholds:');
  for (const threshold of recovery.thresholds) lines.push(`  - ${threshold}`);
}

function appendNoReplyNudgeFollowUp(lines, followUp) {
  lines.push('## No-reply nudge follow-up');
  lines.push('Copy-ready, privacy-safe routing from the one-time nudge tracker (last4 only, no phone/message/token exposure):');
  lines.push(`- Rows logged: ${followUp.rows}`);
  lines.push(`- Concrete replies: ${followUp.concreteReplies}`);
  lines.push(`- Topic votes: ${followUp.topicVotes}`);
  lines.push(`- Referrals: ${followUp.referrals}`);
  lines.push(`- Bot-readiness rows: ${followUp.botReadiness}`);
  lines.push('- Recommended next steps:');
  for (const step of followUp.nextSteps) lines.push(`  - ${step}`);
  lines.push('- Nudge tracker rows (last4 only):');
  for (const row of followUp.rowsPreview) {
    lines.push(`  - ${row.segment} · ${row.last4} · ${row.route} · problem="${row.problem || 'n/a'}" · follow_up=${row.followUpSent ? 'yes' : 'no'} · next="${row.nextAction || 'n/a'}"`);
  }
}


function appendNarrowDiscoveryFollowUp(lines, followUp) {
  lines.push('## Narrow discovery follow-up');
  lines.push('Privacy-safe routing from the five-DM narrow discovery tracker (last4 only, no phone/message/token exposure):');
  lines.push(`- Rows logged: ${followUp.rows}`);
  lines.push(`- Concrete replies: ${followUp.concreteReplies}`);
  lines.push(`- QA/dev/student signals: ${followUp.qaSignals}`);
  lines.push(`- Excel/workflow signals: ${followUp.excelSignals}`);
  lines.push(`- Referrals: ${followUp.referrals}`);
  lines.push(`- Group-owner/admin signals: ${followUp.groupOwnerSignals}`);
  lines.push(`- Bot-readiness rows: ${followUp.botReadiness}`);
  lines.push('- Recommended next steps:');
  for (const step of followUp.nextSteps) lines.push(`  - ${step}`);
  lines.push('- Narrow discovery rows (last4 only):');
  for (const row of followUp.rowsPreview) {
    lines.push(`  - ${row.segment} · ${row.last4} · ${row.route} · problem="${row.problem || 'n/a'}" · follow_up=${row.followUpSent ? 'yes' : 'no'} · next="${row.nextAction || 'n/a'}"`);
  }
}

function appendRecoveryBatchFollowUp(lines, followUp) {
  lines.push('## Recovery batch follow-up');
  lines.push('Privacy-safe routing from the combined stale-responder recovery batch tracker (last4 only, no phone/message/token exposure):');
  lines.push(`- Rows logged: ${followUp.rows}`);
  lines.push(`- Concrete replies: ${followUp.concreteReplies}`);
  lines.push(`- Stale-responder rows: ${followUp.staleResponderRows}`);
  lines.push(`- Warm-intro rows: ${followUp.warmIntroRows}`);
  lines.push(`- QA/dev/student signals: ${followUp.qaSignals}`);
  lines.push(`- Excel/workflow signals: ${followUp.excelSignals}`);
  lines.push(`- Referrals: ${followUp.referrals}`);
  lines.push(`- Group-owner/admin signals: ${followUp.groupOwnerSignals}`);
  lines.push(`- Bot-readiness rows: ${followUp.botReadiness}`);
  lines.push('- Recommended next steps:');
  for (const step of followUp.nextSteps) lines.push(`  - ${step}`);
  lines.push('- Recovery batch rows (last4 only):');
  for (const row of followUp.rowsPreview) {
    lines.push(`  - ${row.segment} · ${row.last4} · ${row.route} · type=${row.problemType || 'n/a'} · problem="${row.problem || 'n/a'}" · follow_up=${row.followUpSent ? 'yes' : 'no'} · next="${row.nextAction || 'n/a'}"`);
  }
}

function appendReferralSprintFollowUp(lines, followUp) {
  lines.push('## Referral sprint follow-up');
  lines.push('Copy-ready, privacy-safe next steps from the manual tracker referral-sprint rows (last4 only, no phone/message/token exposure):');
  lines.push(`- Referral-sprint rows logged: ${followUp.referralSprintRows}`);
  lines.push(`- Total referrals: ${followUp.totalReferrals}`);
  lines.push(`- Group-owner segment present: ${followUp.hasGroupOwner ? 'yes' : 'no'}`);
  lines.push('- Recommended next steps:');
  for (const step of followUp.nextSteps) lines.push(`  - ${step}`);
  lines.push('- Referral-sprint rows (last4 only):');
  for (const row of followUp.rows) {
    lines.push(`  - ${row.segment} · ${row.last4} · problem="${row.problem || 'n/a'}" · follow_up=${row.followUpSent ? 'yes' : 'no'} · next="${row.nextAction || 'n/a'}"`);
  }
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


function renderRecoveryOperatorBrief(report, options = {}) {
  const date = options.date || (report.generatedAt || currentDate()).slice(0, 10);
  const excludeLast4 = normalizeLast4List((options.excludeLast4 || []).join ? options.excludeLast4.join(',') : options.excludeLast4 || '');
  const excludeArg = excludeLast4.length ? ` --exclude-last4 ${excludeLast4.join(',')}` : '';
  const runtimeArg = options.runtimeDir ? ` --runtime-dir ${options.runtimeDir}` : '';
  const recovery = buildStaleResponderRecovery(report);
  const lines = [];
  lines.push(`# Casagrand Recovery Operator Brief — ${date}`);
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Current state');
  lines.push(`- Unique resident signals: ${report.totals.uniqueUsers}`);
  lines.push(`- Campaign signals: ${report.totals.campaignSignals}`);
  lines.push(`- Owner/test signals excluded: ${report.totals.ownerOrTestExcludedSignals || 0}`);
  if (report.followUpCadence) {
    lines.push(`- Cadence: ${report.followUpCadence.state} (${report.followUpCadence.ageHours}h since latest signal)`);
  }
  lines.push(`- Next action: ${report.nextAction}`);
  lines.push('');

  if (!recovery) {
    lines.push('## Operator action');
    lines.push('- No stale-responder recovery batch is required for this report state. Follow the report next action above.');
    lines.push('');
    lines.push('Privacy: last4-only reporting; do not store raw WhatsApp text, names, screenshots, full phone numbers, message IDs, or tokens.');
    return `${lines.join('\n')}\n`;
  }

  lines.push('## One-sitting send queue');
  lines.push(`1. Send the one-time stale-responder nudge to last4 ${recovery.last4}.`);
  lines.push('2. Ask one trusted resident for a warm intro.');
  lines.push('3. Send two QA/dev/student DMs.');
  lines.push('4. Send two Excel/office-workflow DMs.');
  lines.push('5. Send one group-owner/admin DM only to someone who actually manages a WhatsApp group.');
  lines.push('6. Fill only last4 + segment + problemType + outcome in the private tracker.');
  lines.push('');
  lines.push('## Copy-ready stale nudge');
  lines.push(recovery.nudgeCopy);
  lines.push('');
  lines.push('## Tracker commands');
  lines.push('```sh');
  lines.push('mkdir -p private');
  lines.push('node scripts/casagrand-campaign-report.js --write-recovery-batch-template private/casagrand-recovery-batch.json');
  lines.push(`node scripts/casagrand-campaign-report.js${runtimeArg} --date ${date}${excludeArg} --manual-tracker private/casagrand-recovery-batch.json`);
  lines.push('```');
  lines.push('');
  lines.push('## Route after 24h');
  for (const threshold of recovery.thresholds) lines.push(`- ${threshold}`);
  lines.push('');
  lines.push('Privacy: last4-only reporting; do not store raw WhatsApp text, names, screenshots, full phone numbers, message IDs, or tokens.');
  return `${lines.join('\n')}\n`;
}

function writeRecoveryOperatorBrief(file, report, options = {}) {
  if (!file) throw new Error('--write-recovery-operator-brief requires a file path');
  const outputPath = path.resolve(file);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true, mode: 0o700 });
  fs.writeFileSync(outputPath, renderRecoveryOperatorBrief(report, options), { mode: 0o600 });
  return outputPath;
}

function writeCampaignReport(options = {}) {
  const runtimeDir = options.runtimeDir || DEFAULT_RUNTIME_DIR;
  const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
  const date = options.date || currentDate();
  const report = buildCampaignReport(runtimeDir, { includeAll: Boolean(options.includeAll), excludeLast4: options.excludeLast4, manualTracker: options.manualTracker });
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
    'Usage: node scripts/casagrand-campaign-report.js [--runtime-dir DIR] [--output-dir DIR] [--date YYYY-MM-DD] [--manual-tracker FILE] [--write-manual-tracker-template FILE] [--write-referral-sprint-template FILE] [--write-no-reply-nudge-template FILE] [--write-narrow-discovery-template FILE] [--write-recovery-batch-template FILE] [--write-recovery-operator-brief FILE] [--exclude-last4 1234[,5678]] [--include-all]',
    '',
    'Use --write-manual-tracker-template FILE to create a privacy-safe starter JSON with exactly 5 rows (2 career, 2 workflow, 1 admin) using last4 placeholders only.',
    'Use --write-referral-sprint-template FILE to create a privacy-safe starter JSON for first-responder referral-sprint follow-up rows.',
    'Use --write-no-reply-nudge-template FILE to create a privacy-safe starter JSON for one-time no-reply nudge outcomes.',
    'Use --write-narrow-discovery-template FILE to create a privacy-safe starter JSON for five narrow discovery DMs.',
    'Use --write-recovery-batch-template FILE to create one privacy-safe tracker for the current stale-responder nudge + warm-intro + five narrow-discovery sends.',
    'Use --write-recovery-operator-brief FILE to create a privacy-safe one-sitting recovery brief from the current aggregate report.',
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
    if (options.writeManualTrackerTemplate) {
      const templatePath = writeManualTrackerTemplate(options.writeManualTrackerTemplate);
      console.log(`casagrand manual tracker template written: ${templatePath}`);
      process.exit(0);
    }
    if (options.writeReferralSprintTemplate) {
      const templatePath = writeReferralSprintTrackerTemplate(options.writeReferralSprintTemplate);
      console.log(`casagrand referral sprint tracker template written: ${templatePath}`);
      process.exit(0);
    }
    if (options.writeNoReplyNudgeTemplate) {
      const templatePath = writeNoReplyNudgeTrackerTemplate(options.writeNoReplyNudgeTemplate);
      console.log(`casagrand no-reply nudge tracker template written: ${templatePath}`);
      process.exit(0);
    }
    if (options.writeNarrowDiscoveryTemplate) {
      const templatePath = writeNarrowDiscoveryTrackerTemplate(options.writeNarrowDiscoveryTemplate);
      console.log(`casagrand narrow discovery tracker template written: ${templatePath}`);
      process.exit(0);
    }
    if (options.writeRecoveryBatchTemplate) {
      const templatePath = writeRecoveryBatchTrackerTemplate(options.writeRecoveryBatchTemplate);
      console.log(`casagrand recovery batch tracker template written: ${templatePath}`);
      process.exit(0);
    }
    if (options.writeRecoveryOperatorBrief) {
      const report = buildCampaignReport(options.runtimeDir, { includeAll: Boolean(options.includeAll), excludeLast4: options.excludeLast4, manualTracker: options.manualTracker });
      const briefPath = writeRecoveryOperatorBrief(options.writeRecoveryOperatorBrief, report, options);
      console.log(`casagrand recovery operator brief written: ${briefPath}`);
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
  normalizeLast4List,
  isExcludedLast4,
  isCampaignText,
  inferTopics,
  inferSourceTags,
  inferSlotVotes,
  tracksForTags,
  manualTrackerTemplate,
  referralSprintTrackerTemplate,
  noReplyNudgeTrackerTemplate,
  narrowDiscoveryTrackerTemplate,
  recoveryBatchTrackerTemplate,
  writeManualTrackerTemplate,
  writeReferralSprintTrackerTemplate,
  writeNoReplyNudgeTrackerTemplate,
  writeNarrowDiscoveryTrackerTemplate,
  writeRecoveryBatchTrackerTemplate,
  summarizeManualTracker,
  computeManualNextAction,
  computeLaunchDecision,
  buildFirstResponderFollowUp,
  buildReferralSprintFollowUp,
  buildNoReplyNudgeFollowUp,
  buildNarrowDiscoveryFollowUp,
  buildRecoveryBatchFollowUp,
  latestRecentSignalAt,
  buildFollowUpCadence,
  buildStaleResponderRecovery,
  renderRecoveryOperatorBrief,
  writeRecoveryOperatorBrief,
  buildCampaignReport,
  renderMarkdown,
  writeCampaignReport,
};
