'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REQUIRED_FIELDS = [
  'communityId',
  'segment',
  'interviewDate',
  'willingnessToPay',
  'urgency',
  'painScore',
  'expectedMonthlyConversations',
  'recommendation',
];

const RECOMMENDATIONS = new Set(['continue', 'pivot', 'pause']);

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
    .replace(/(?:token|secret|key|bearer|password)[:=]\s*\S+/gi, '[secret]')
    .trim();
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function normalizeRecommendation(value) {
  const recommendation = sanitizeId(value, 'pause');
  if (!RECOMMENDATIONS.has(recommendation)) return 'pause';
  return recommendation;
}

function normalizeInterview(input = {}) {
  const missing = REQUIRED_FIELDS.filter((field) => !String(input[field] ?? '').trim());
  if (missing.length) {
    throw new Error(`Missing required interview fields: ${missing.join(', ')}`);
  }

  const communityId = sanitizeId(input.communityId || input.communityName);
  const leadId = sanitizeId(input.leadId || communityId, communityId);
  const segment = sanitizeId(input.segment || 'general_community');
  const interviewDate = String(input.interviewDate).slice(0, 10);
  const recommendation = normalizeRecommendation(input.recommendation);
  const externalRefHash = hashRef(input.externalRef || input.phone || input.email || input.whatsappNumber || input.rawContact);
  const sequenceHash = hashRef(`${leadId}:${communityId}:${interviewDate}:${externalRefHash || input.ownerName || ''}`);

  return {
    id: `${communityId}-${interviewDate}-${sequenceHash}`,
    leadId,
    communityId,
    segment,
    createdAt: input.createdAt || new Date().toISOString(),
    interviewDate,
    interviewer: sanitizeId(input.interviewer || 'unassigned'),
    source: redact(input.source || 'manual_interview'),
    externalRefHash,
    signals: {
      willingnessToPay: redact(input.willingnessToPay),
      budgetBand: inferBudgetBand(input.willingnessToPay),
      urgency: redact(input.urgency),
      urgencyScore: inferUrgencyScore(input.urgency),
      painScore: clampNumber(input.painScore, 1, 5, 3),
      expectedMonthlyConversations: Math.round(clampNumber(input.expectedMonthlyConversations, 0, 1000000, 0)),
      recommendation,
    },
    findings: {
      jobsToBeDone: redact(input.jobsToBeDone || input.findings || ''),
      objections: redact(input.objections || ''),
      notes: redact(input.notes || ''),
      nextStep: redact(input.nextStep || ''),
    },
    score: scoreInterview(input),
  };
}

function inferBudgetBand(value) {
  const text = String(value || '');
  if (/(?:39,?999|40000|50k|enterprise|pro|custom|above|over)/i.test(text)) return 'pro_or_enterprise';
  if (/(?:14,?999|15000|20k|growth|₹\s*15|₹\s*20)/i.test(text)) return 'growth';
  if (/(?:4,?999|5000|10k|starter|₹\s*5|₹\s*10)/i.test(text)) return 'starter';
  if (/(?:free|trial|not sure|unknown|later|low)/i.test(text)) return 'unqualified_or_low';
  return 'unclear_budget';
}

function budgetScore(band) {
  return {
    pro_or_enterprise: 5,
    growth: 4,
    starter: 3,
    unclear_budget: 2,
    unqualified_or_low: 1,
  }[band] || 2;
}

function inferUrgencyScore(value) {
  const text = String(value || '');
  if (/(?:now|urgent|immediate|this week|asap|launching|today)/i.test(text)) return 5;
  if (/(?:month|soon|2 weeks|two weeks|next event)/i.test(text)) return 4;
  if (/(?:quarter|exploring|pilot|maybe)/i.test(text)) return 2;
  return 3;
}

function scoreInterview(input = {}) {
  const budget = budgetScore(inferBudgetBand(input.willingnessToPay));
  const urgency = inferUrgencyScore(input.urgency);
  const pain = clampNumber(input.painScore, 1, 5, 3);
  const volume = clampNumber(input.expectedMonthlyConversations, 0, 1000000, 0) >= 500 ? 4 : 2;
  const recommendation = normalizeRecommendation(input.recommendation);
  const recommendationScore = recommendation === 'continue' ? 5 : recommendation === 'pivot' ? 3 : 1;
  const total = budget * 0.3 + urgency * 0.2 + pain * 0.25 + volume * 0.1 + recommendationScore * 0.15;
  return {
    budget,
    urgency,
    pain,
    volume,
    recommendation: recommendationScore,
    total: Number(total.toFixed(2)),
    qualified: total >= 3.5 && recommendation !== 'pause',
  };
}

function interviewPath(storageDir, interview) {
  return path.join(storageDir, `${interview.id}.json`);
}

function recordInterview(storageDir, input) {
  ensureDir(storageDir);
  const interview = normalizeInterview(input);
  fs.writeFileSync(interviewPath(storageDir, interview), `${JSON.stringify(interview, null, 2)}\n`);
  return interview;
}

function listInterviews(storageDir) {
  if (!fs.existsSync(storageDir)) return [];
  return fs.readdirSync(storageDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => JSON.parse(fs.readFileSync(path.join(storageDir, name), 'utf8')))
    .sort((a, b) => b.score.total - a.score.total || a.interviewDate.localeCompare(b.interviewDate));
}

function summarizeInterviews(storageDir) {
  const interviews = listInterviews(storageDir);
  const segments = new Map();
  for (const interview of interviews) {
    const key = interview.segment || 'general_community';
    const current = segments.get(key) || {
      segment: key,
      interviews: 0,
      qualified: 0,
      totalScore: 0,
      totalPain: 0,
      totalUrgency: 0,
      totalBudget: 0,
      expectedMonthlyConversations: 0,
      recommendations: { continue: 0, pivot: 0, pause: 0 },
    };
    current.interviews += 1;
    current.qualified += interview.score.qualified ? 1 : 0;
    current.totalScore += interview.score.total;
    current.totalPain += interview.score.pain;
    current.totalUrgency += interview.score.urgency;
    current.totalBudget += interview.score.budget;
    current.expectedMonthlyConversations += interview.signals.expectedMonthlyConversations;
    current.recommendations[interview.signals.recommendation] += 1;
    segments.set(key, current);
  }

  const rankedSegments = Array.from(segments.values()).map((segment) => ({
    segment: segment.segment,
    interviews: segment.interviews,
    qualified: segment.qualified,
    averageScore: Number((segment.totalScore / segment.interviews).toFixed(2)),
    averagePain: Number((segment.totalPain / segment.interviews).toFixed(2)),
    averageUrgency: Number((segment.totalUrgency / segment.interviews).toFixed(2)),
    averageBudget: Number((segment.totalBudget / segment.interviews).toFixed(2)),
    expectedMonthlyConversations: segment.expectedMonthlyConversations,
    recommendations: segment.recommendations,
  })).sort((a, b) => b.qualified - a.qualified || b.averageScore - a.averageScore || b.expectedMonthlyConversations - a.expectedMonthlyConversations);

  const qualified = interviews.filter((interview) => interview.score.qualified).length;
  const continueVotes = interviews.filter((interview) => interview.signals.recommendation === 'continue').length;
  const pivotVotes = interviews.filter((interview) => interview.signals.recommendation === 'pivot').length;
  const decision = qualified >= 10 && continueVotes >= pivotVotes
    ? 'continue'
    : qualified >= 10
      ? 'pivot_segment'
      : 'keep_interviewing';

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      interviews: interviews.length,
      qualified,
      moreQualifiedInterviewsNeeded: Math.max(0, 10 - qualified),
      continueVotes,
      pivotVotes,
      pauseVotes: interviews.filter((interview) => interview.signals.recommendation === 'pause').length,
      expectedMonthlyConversations: interviews.reduce((sum, interview) => sum + interview.signals.expectedMonthlyConversations, 0),
      decision,
    },
    rankedSegments,
    recentInterviews: interviews.slice(0, 10).map((interview) => ({
      id: interview.id,
      leadId: interview.leadId,
      communityId: interview.communityId,
      segment: interview.segment,
      interviewDate: interview.interviewDate,
      budgetBand: interview.signals.budgetBand,
      expectedMonthlyConversations: interview.signals.expectedMonthlyConversations,
      recommendation: interview.signals.recommendation,
      score: interview.score.total,
      qualified: interview.score.qualified,
    })),
  };
}

function renderMarkdownReport(summary) {
  const lines = [];
  lines.push('# Community Bot Interview Findings');
  lines.push('');
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push('');
  lines.push(`- Interviews recorded: ${summary.totals.interviews}`);
  lines.push(`- Qualified interviews: ${summary.totals.qualified}`);
  lines.push(`- More qualified interviews needed: ${summary.totals.moreQualifiedInterviewsNeeded}`);
  lines.push(`- Expected monthly conversations: ${summary.totals.expectedMonthlyConversations}`);
  lines.push(`- Decision gate: ${summary.totals.decision}`);
  lines.push('');
  lines.push('## Ranked segments');
  for (const segment of summary.rankedSegments) {
    lines.push(`- ${segment.segment}: score ${segment.averageScore}, qualified ${segment.qualified}/${segment.interviews}, pain ${segment.averagePain}, urgency ${segment.averageUrgency}, budget ${segment.averageBudget}, expected monthly conversations ${segment.expectedMonthlyConversations}, votes continue/pivot/pause ${segment.recommendations.continue}/${segment.recommendations.pivot}/${segment.recommendations.pause}`);
  }
  lines.push('');
  lines.push('## Recent interviews');
  for (const interview of summary.recentInterviews) {
    lines.push(`- ${interview.communityId} (${interview.segment}) — ${interview.interviewDate}, score ${interview.score}, ${interview.budgetBand}, ${interview.expectedMonthlyConversations} conversations/mo, ${interview.recommendation}`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function exportInterviewReport(storageDir, outputPath) {
  const summary = summarizeInterviews(storageDir);
  ensureDir(path.dirname(outputPath));
  if (outputPath.endsWith('.json')) {
    fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
  } else {
    fs.writeFileSync(outputPath, renderMarkdownReport(summary));
  }
  return summary;
}

module.exports = {
  REQUIRED_FIELDS,
  sanitizeId,
  hashRef,
  redact,
  normalizeInterview,
  recordInterview,
  listInterviews,
  summarizeInterviews,
  renderMarkdownReport,
  exportInterviewReport,
  scoreInterview,
};

if (require.main === module) {
  const [,, command, storageDir = './market-validation-interviews', outputPath] = process.argv;
  if (command === 'report') {
    const summary = outputPath ? exportInterviewReport(storageDir, outputPath) : summarizeInterviews(storageDir);
    if (!outputPath) console.log(JSON.stringify(summary, null, 2));
  } else {
    console.error('Usage: node market-validation/interviews.js report <storageDir> [output.md|output.json]');
    process.exit(1);
  }
}
