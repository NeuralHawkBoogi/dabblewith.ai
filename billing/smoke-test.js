'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { getPlan, listPlans } = require('./plans');
const { appendUsageRecord, readLedger, summarizeMonth } = require('./meter');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dabble-billing-'));

assert.strictEqual(listPlans().length >= 4, true, 'default plans are available');
assert.strictEqual(getPlan('starter').monthlyFeeInr, 4999, 'starter monthly fee matches initial packaging');
assert.strictEqual(getPlan('growth').includedAiConversations, 2500, 'growth bundle matches initial packaging');

const communityId = 'Fitness Moms Chennai!';
appendUsageRecord(dir, {
  communityId,
  planId: 'starter',
  unit: 'onboarding_workflow',
  direction: 'inbound',
  externalRef: '+919999999999 said my token is sk-live-secret',
  occurredAt: '2026-05-19T10:00:00.000Z',
});

for (let i = 0; i < 501; i += 1) {
  appendUsageRecord(dir, {
    communityId,
    planId: 'starter',
    unit: 'ai_conversation',
    direction: i % 2 === 0 ? 'inbound' : 'outbound',
    router: { modelTier: 'local_rules', taskClass: 'faq', estimatedTokens: 80, costEstimateInr: 0.02 },
    whatsappCategory: i % 10 === 0 ? 'marketing' : 'service',
    occurredAt: `2026-05-19T10:${String(i % 60).padStart(2, '0')}:00.000Z`,
  });
}

appendUsageRecord(dir, {
  communityId,
  planId: 'starter',
  unit: 'admin_report',
  billable: false,
  direction: 'outbound',
  platformCostInr: 0.5,
  occurredAt: '2026-05-19T12:00:00.000Z',
});

appendUsageRecord(dir, {
  communityId,
  planId: 'starter',
  unit: 'ai_conversation',
  direction: 'outbound',
  router: {
    modelTier: 'low_cost_cloud',
    taskClass: 'summary',
    estimatedTokens: { input: 120, output: 45, total: 165 },
    estimatedCostUsd: 0.001,
  },
  occurredAt: '2026-05-19T12:30:00.000Z',
});

appendUsageRecord(dir, {
  communityId,
  planId: 'starter',
  unit: 'broadcast',
  direction: 'outbound',
  whatsappCategory: 'marketing',
  occurredAt: '2026-05-19T13:00:00.000Z',
});

const ledger = readLedger(dir, communityId, '2026-05');
assert.strictEqual(ledger.communityId, 'fitness-moms-chennai', 'community id is filesystem-safe');
assert.strictEqual(ledger.counters.onboardingWorkflows, 1, 'onboarding workflow is counted');
assert.strictEqual(ledger.counters.aiConversations, 502, 'AI conversations are counted');
assert.strictEqual(ledger.counters.adminReports, 1, 'admin reports are counted');
assert.strictEqual(ledger.counters.broadcasts, 1, 'broadcasts are counted');
assert.strictEqual(ledger.counters.nonBillableEvents, 2, 'non-billable records are explicit');
assert.strictEqual(JSON.stringify(ledger).includes('+919999999999'), false, 'raw phone is not stored');
assert.strictEqual(JSON.stringify(ledger).includes('sk-live-secret'), false, 'raw external text/token is not stored');
assert.strictEqual(ledger.records[0].externalRefHash.length, 16, 'external references are hashed');

const summary = summarizeMonth(dir, communityId, '2026-05');
assert.strictEqual(summary.counters.billableAiConversations, 502, 'billable AI conversations are summarized');
assert.strictEqual(summary.overageAiConversations, 2, 'overage is estimated before invoice generation');
assert.strictEqual(summary.revenueInr.monthlyFee, 4999, 'monthly fee appears in summary');
assert.strictEqual(summary.revenueInr.overage, 20, 'starter overage rate is applied');
assert.strictEqual(summary.revenueInr.whatsappPassThrough > 0, true, 'WhatsApp pass-through revenue is estimated');
assert.strictEqual(ledger.records.some(record => record.estimatedTokens === 165), true, 'router token objects are normalized');
assert.strictEqual(summary.costsInr.model > 0, true, 'model costs are exported');
assert.strictEqual(summary.costsInr.whatsapp > 0, true, 'WhatsApp costs are exported');
assert.strictEqual(['healthy', 'watch'].includes(summary.marginStatus), true, 'gross margin status is present');
assert.strictEqual(typeof summary.grossMarginPct, 'number', 'gross margin estimate is available');

console.log('billing smoke test passed');
