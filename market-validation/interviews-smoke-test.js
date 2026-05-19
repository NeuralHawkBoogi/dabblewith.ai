'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  normalizeInterview,
  recordInterview,
  listInterviews,
  summarizeInterviews,
  exportInterviewReport,
} = require('./interviews');

const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dabble-market-interviews-'));
const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dabble-market-interview-report-'));

function makeInterview(index, overrides = {}) {
  return {
    communityId: `AI Builders Chennai ${index}`,
    leadId: `lead-${index}`,
    segment: index % 2 === 0 ? 'learning_community' : 'builder_or_founder_community',
    interviewDate: `2026-05-${String(10 + index).padStart(2, '0')}`,
    interviewer: 'boogi',
    willingnessToPay: index <= 8 ? 'Growth ₹14,999/month works if it saves admin time' : 'Starter ₹4,999/month',
    urgency: index <= 10 ? 'urgent before next event this month' : 'exploring this quarter',
    painScore: index <= 10 ? 5 : 3,
    expectedMonthlyConversations: index <= 10 ? 1400 : 400,
    recommendation: index <= 10 ? 'continue' : 'pivot',
    findings: 'Manual follow-ups are painful; contact +919840382585 should be redacted.',
    objections: 'Needs proof before paying; email owner@example.com should be redacted.',
    notes: 'secret=abc123 must not leak. Interested in onboarding and event FAQ.',
    nextStep: 'Schedule pilot scoping call.',
    externalRef: `+91984038258${index}`,
    ...overrides,
  };
}

assert.throws(
  () => normalizeInterview({ communityId: 'x' }),
  /Missing required interview fields/,
  'required fields should be enforced',
);

const first = recordInterview(storageDir, makeInterview(1));
assert.strictEqual(first.communityId, 'ai-builders-chennai-1');
assert.strictEqual(first.externalRefHash.length, 16);
assert.strictEqual(first.signals.recommendation, 'continue');
assert(first.score.qualified, 'strong first interview should qualify');

const persistedFirst = fs.readFileSync(path.join(storageDir, `${first.id}.json`), 'utf8');
assert(!persistedFirst.includes('+919840382585'), 'raw phone number must not persist');
assert(!persistedFirst.includes('owner@example.com'), 'raw email must not persist');
assert(!persistedFirst.includes('abc123'), 'secret value must not persist');
assert(persistedFirst.includes('[phone]'), 'redacted phone marker should be present in findings');
assert(persistedFirst.includes('[email]'), 'redacted email marker should be present in findings');
assert(persistedFirst.includes('[secret]'), 'redacted secret marker should be present in findings');

for (let index = 2; index <= 11; index += 1) {
  recordInterview(storageDir, makeInterview(index));
}
recordInterview(storageDir, makeInterview(12, {
  communityId: 'Apartment Owners Forum',
  segment: 'resident_community',
  willingnessToPay: 'not sure, maybe free trial',
  urgency: 'maybe next quarter',
  painScore: 2,
  expectedMonthlyConversations: 100,
  recommendation: 'pause',
}));

const interviews = listInterviews(storageDir);
assert.strictEqual(interviews.length, 12);
assert(interviews[0].score.total >= interviews[interviews.length - 1].score.total, 'list should sort by score desc');

const summary = summarizeInterviews(storageDir);
assert.strictEqual(summary.totals.interviews, 12);
assert(summary.totals.qualified >= 10, '10-interview gate should be met by qualified findings');
assert.strictEqual(summary.totals.moreQualifiedInterviewsNeeded, 0);
assert.strictEqual(summary.totals.decision, 'continue');
assert(summary.totals.expectedMonthlyConversations > 0);
assert(summary.rankedSegments.length >= 3);
assert.strictEqual(summary.rankedSegments[0].qualified >= summary.rankedSegments[summary.rankedSegments.length - 1].qualified, true);
assert.strictEqual(summary.recentInterviews.length, 10, 'report should cap recent interviews');

const markdownPath = path.join(outputDir, 'interviews.md');
const jsonPath = path.join(outputDir, 'interviews.json');
exportInterviewReport(storageDir, markdownPath);
exportInterviewReport(storageDir, jsonPath);

const markdown = fs.readFileSync(markdownPath, 'utf8');
const json = fs.readFileSync(jsonPath, 'utf8');
assert(markdown.includes('Community Bot Interview Findings'));
assert(markdown.includes('Decision gate: continue'));
assert(JSON.parse(json).totals.interviews === 12);
for (const output of [markdown, json]) {
  assert(!output.includes('+919840382585'), 'report must not include raw phone');
  assert(!output.includes('owner@example.com'), 'report must not include raw email');
  assert(!output.includes('abc123'), 'report must not include raw secret');
}

console.log('market-validation interviews smoke test passed');
