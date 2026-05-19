'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { appendUsageRecord } = require('./meter');
const { buildMonthlyReport, renderMonthlyReportMarkdown, writeMonthlyReport } = require('./report');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dabble-billing-report-'));
const month = '2026-05';

appendUsageRecord(dir, {
  communityId: 'Fitness Moms Chennai',
  planId: 'starter',
  unit: 'ai_conversation',
  direction: 'inbound',
  router: { modelTier: 'low_cost_cloud', taskClass: 'faq', estimatedTokens: 220, costEstimateInr: 0.44 },
  whatsappCategory: 'service',
  externalRef: 'wamid-secret-user-phone-+919999999999',
  occurredAt: '2026-05-19T09:00:00.000Z',
});
appendUsageRecord(dir, {
  communityId: 'Fitness Moms Chennai',
  planId: 'starter',
  unit: 'admin_report',
  billable: false,
  direction: 'outbound',
  platformCostInr: 0.5,
  externalRef: 'report contains sk-test-token and raw user text',
  occurredAt: '2026-05-19T10:00:00.000Z',
});
appendUsageRecord(dir, {
  communityId: 'AI Builders BLR',
  planId: 'growth',
  unit: 'broadcast',
  direction: 'outbound',
  whatsappCategory: 'marketing',
  occurredAt: '2026-05-20T10:00:00.000Z',
});

const report = buildMonthlyReport(dir, month);
assert.strictEqual(report.month, month, 'report month is preserved');
assert.strictEqual(report.totals.communities, 2, 'all community ledgers are loaded');
assert.strictEqual(report.totals.billableAiConversations, 1, 'portfolio AI conversation total is calculated');
assert.strictEqual(report.totals.revenueInr > 0, true, 'portfolio revenue estimate is present');
assert.strictEqual(report.totals.costsInr > 0, true, 'portfolio cost estimate is present');
assert.strictEqual(report.communities[0].recentRecords.length > 0, true, 'recent sanitized records are included');

const markdown = renderMonthlyReportMarkdown(report);
assert.strictEqual(markdown.includes('Community Bot Billing Report'), true, 'markdown has title');
assert.strictEqual(markdown.includes('Fitness Moms'), false, 'raw unsanitized display name is not emitted');
assert.strictEqual(markdown.includes('fitness-moms-chennai'), true, 'sanitized community id is emitted');
assert.strictEqual(markdown.includes('+919999999999'), false, 'raw phone is not emitted');
assert.strictEqual(markdown.includes('sk-test-token'), false, 'raw secret-like token is not emitted');
assert.strictEqual(markdown.includes('raw user text'), false, 'raw external text is not emitted');
assert.strictEqual(markdown.includes('external message IDs are hashed'), true, 'privacy note is included');

const mdPath = path.join(dir, 'reports', 'billing-report.md');
const jsonPath = path.join(dir, 'reports', 'billing-report.json');
writeMonthlyReport(dir, month, mdPath);
writeMonthlyReport(dir, month, jsonPath);
assert.strictEqual(fs.existsSync(mdPath), true, 'markdown report is written');
assert.strictEqual(fs.existsSync(jsonPath), true, 'json report is written');
assert.strictEqual(JSON.parse(fs.readFileSync(jsonPath, 'utf8')).totals.communities, 2, 'json report is parseable');

console.log('billing report smoke test passed');
