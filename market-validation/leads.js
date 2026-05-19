'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REQUIRED_FIELDS = [
  'communityName',
  'ownerName',
  'audienceSize',
  'whatsappUsage',
  'painPoints',
  'eventCadence',
  'budgetRange',
  'urgency',
  'source',
];

const BUDGET_SCORE = [
  { match: /(?:39,?999|40000|50k|₹\s*50|pro|enterprise|custom|above|over)/i, score: 5, label: 'pro_or_enterprise' },
  { match: /(?:14,?999|15000|20k|growth|₹\s*15|₹\s*20)/i, score: 4, label: 'growth' },
  { match: /(?:4,?999|5000|10k|starter|₹\s*5|₹\s*10)/i, score: 3, label: 'starter' },
  { match: /(?:free|trial|not sure|unknown|later|low)/i, score: 1, label: 'unqualified_or_low' },
];

const URGENCY_SCORE = [
  { match: /(?:now|urgent|immediate|this week|asap|launching|today)/i, score: 5, label: 'immediate' },
  { match: /(?:month|soon|2 weeks|two weeks|next event)/i, score: 4, label: 'near_term' },
  { match: /(?:quarter|exploring|pilot|maybe)/i, score: 2, label: 'exploratory' },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function sanitizeId(value, fallback = 'unknown') {
  const clean = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  return clean || fallback;
}

function hashRef(value) {
  if (!value) return null;
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 16);
}

function redact(value) {
  return String(value || '')
    .replace(/\+?\d[\d\s().-]{7,}\d/g, '[phone]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/(?:token|secret|key|bearer)[:=]\s*\S+/gi, '[secret]')
    .trim();
}

function normalizeLead(input = {}) {
  const now = new Date().toISOString();
  const communityId = sanitizeId(input.communityId || input.communityName || `lead-${Date.now()}`);
  const ownerId = sanitizeId(input.ownerId || input.ownerName || 'owner');
  const missing = REQUIRED_FIELDS.filter((field) => !String(input[field] || '').trim());
  if (missing.length) {
    throw new Error(`Missing required lead fields: ${missing.join(', ')}`);
  }

  return {
    id: `${communityId}-${hashRef(`${ownerId}:${communityId}:${input.source || ''}`)}`,
    communityId,
    ownerId,
    capturedAt: input.capturedAt || now,
    updatedAt: now,
    source: redact(input.source),
    attribution: {
      landingPage: redact(input.landingPage || '/community-bot/'),
      campaign: redact(input.campaign || 'organic'),
      externalRefHash: hashRef(input.externalRef || input.phone || input.email || input.whatsappNumber),
    },
    fields: {
      communityName: redact(input.communityName),
      ownerName: redact(input.ownerName),
      audienceSize: redact(input.audienceSize),
      whatsappUsage: redact(input.whatsappUsage),
      painPoints: Array.isArray(input.painPoints) ? input.painPoints.map(redact).filter(Boolean) : redact(input.painPoints),
      eventCadence: redact(input.eventCadence),
      budgetRange: redact(input.budgetRange),
      urgency: redact(input.urgency),
      segment: redact(input.segment || inferSegment(input)),
      notes: redact(input.notes || ''),
    },
    score: scoreLead(input),
  };
}

function inferSegment(input) {
  const text = `${input.communityName || ''} ${input.painPoints || ''} ${input.eventCadence || ''}`.toLowerCase();
  if (/course|workshop|learn|student|cohort|training/.test(text)) return 'learning_community';
  if (/founder|startup|builder|product/.test(text)) return 'builder_or_founder_community';
  if (/event|meetup|conference/.test(text)) return 'event_community';
  if (/resident|association|apartment|society/.test(text)) return 'resident_community';
  return 'general_community';
}

function pickScore(value, table, fallbackLabel) {
  const text = String(value || '');
  for (const row of table) {
    if (row.match.test(text)) return { score: row.score, label: row.label };
  }
  return { score: 2, label: fallbackLabel };
}

function scoreLead(input) {
  const budget = pickScore(input.budgetRange, BUDGET_SCORE, 'unclear_budget');
  const urgency = pickScore(input.urgency, URGENCY_SCORE, 'unclear_urgency');
  const painText = Array.isArray(input.painPoints) ? input.painPoints.join(' ') : String(input.painPoints || '');
  const painScore = /(?:manual|miss|chaos|spam|follow.?up|registration|faq|scale|volunteer|admin)/i.test(painText) ? 4 : 2;
  const total = budget.score * 0.4 + urgency.score * 0.4 + painScore * 0.2;
  return {
    budget: budget.score,
    budgetBand: budget.label,
    urgency: urgency.score,
    urgencyBand: urgency.label,
    pain: painScore,
    total: Number(total.toFixed(2)),
    qualified: total >= 3.2,
  };
}

function leadPath(storageDir, lead) {
  return path.join(storageDir, `${lead.id}.json`);
}

function recordLead(storageDir, input) {
  ensureDir(storageDir);
  const lead = normalizeLead(input);
  fs.writeFileSync(leadPath(storageDir, lead), `${JSON.stringify(lead, null, 2)}\n`);
  return lead;
}

function listLeads(storageDir) {
  if (!fs.existsSync(storageDir)) return [];
  return fs.readdirSync(storageDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => JSON.parse(fs.readFileSync(path.join(storageDir, name), 'utf8')))
    .sort((a, b) => b.score.total - a.score.total || a.capturedAt.localeCompare(b.capturedAt));
}

function buildValidationReport(storageDir) {
  const leads = listLeads(storageDir);
  const segments = new Map();
  for (const lead of leads) {
    const key = lead.fields.segment || 'general_community';
    const current = segments.get(key) || { segment: key, leads: 0, qualified: 0, totalScore: 0, urgency: 0, budget: 0 };
    current.leads += 1;
    current.qualified += lead.score.qualified ? 1 : 0;
    current.totalScore += lead.score.total;
    current.urgency += lead.score.urgency;
    current.budget += lead.score.budget;
    segments.set(key, current);
  }
  const rankedSegments = Array.from(segments.values()).map((segment) => ({
    segment: segment.segment,
    leads: segment.leads,
    qualified: segment.qualified,
    averageScore: Number((segment.totalScore / segment.leads).toFixed(2)),
    averageUrgency: Number((segment.urgency / segment.leads).toFixed(2)),
    averageBudget: Number((segment.budget / segment.leads).toFixed(2)),
  })).sort((a, b) => b.averageScore - a.averageScore || b.qualified - a.qualified);

  const qualified = leads.filter((lead) => lead.score.qualified).length;
  return {
    generatedAt: new Date().toISOString(),
    totals: {
      leads: leads.length,
      qualified,
      needsMoreInterviews: Math.max(0, 10 - qualified),
      decision: qualified >= 10 ? 'continue_or_segment' : 'keep_interviewing',
    },
    rankedSegments,
    topLeads: leads.slice(0, 10).map((lead) => ({
      id: lead.id,
      communityId: lead.communityId,
      segment: lead.fields.segment,
      source: lead.source,
      budgetBand: lead.score.budgetBand,
      urgencyBand: lead.score.urgencyBand,
      score: lead.score.total,
      qualified: lead.score.qualified,
    })),
  };
}

function renderMarkdownReport(report) {
  const lines = [];
  lines.push('# Community Bot Market Validation Report');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push(`- Leads captured: ${report.totals.leads}`);
  lines.push(`- Qualified leads: ${report.totals.qualified}`);
  lines.push(`- More qualified interviews needed: ${report.totals.needsMoreInterviews}`);
  lines.push(`- Decision gate: ${report.totals.decision}`);
  lines.push('');
  lines.push('## Ranked segments');
  for (const segment of report.rankedSegments) {
    lines.push(`- ${segment.segment}: score ${segment.averageScore}, qualified ${segment.qualified}/${segment.leads}, urgency ${segment.averageUrgency}, budget ${segment.averageBudget}`);
  }
  lines.push('');
  lines.push('## Top leads');
  for (const lead of report.topLeads) {
    lines.push(`- ${lead.communityId} (${lead.segment}) — score ${lead.score}, ${lead.budgetBand}, ${lead.urgencyBand}, source ${lead.source}`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function exportReport(storageDir, outputPath) {
  const report = buildValidationReport(storageDir);
  ensureDir(path.dirname(outputPath));
  if (outputPath.endsWith('.json')) {
    fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  } else {
    fs.writeFileSync(outputPath, renderMarkdownReport(report));
  }
  return report;
}

module.exports = {
  REQUIRED_FIELDS,
  sanitizeId,
  redact,
  normalizeLead,
  recordLead,
  listLeads,
  buildValidationReport,
  renderMarkdownReport,
  exportReport,
  scoreLead,
};

if (require.main === module) {
  const [,, command, storageDir = './market-validation-data', outputPath] = process.argv;
  if (command === 'report') {
    const report = outputPath ? exportReport(storageDir, outputPath) : buildValidationReport(storageDir);
    if (!outputPath) console.log(JSON.stringify(report, null, 2));
  } else {
    console.error('Usage: node market-validation/leads.js report <storageDir> [output.md|output.json]');
    process.exit(1);
  }
}
