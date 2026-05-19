'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { appendUsageRecord } = require('./meter');
const { reconcileMetaExport, renderReconciliationMarkdown, writeReconciliationReport } = require('./meta-reconcile');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dabble-meta-reconcile-'));
const month = '2026-05';

appendUsageRecord(dir, {
  communityId: 'Fitness Moms Chennai',
  planId: 'starter',
  unit: 'ai_conversation',
  direction: 'outbound',
  whatsappCategory: 'service',
  externalRef: 'wamid.HIDDEN_PHONE_+919999999999',
  occurredAt: '2026-05-19T09:00:00.000Z',
});
appendUsageRecord(dir, {
  communityId: 'Fitness Moms Chennai',
  planId: 'starter',
  unit: 'broadcast',
  direction: 'outbound',
  whatsappCategory: 'marketing',
  externalRef: 'raw Meta id secret-token-123',
  occurredAt: '2026-05-19T10:00:00.000Z',
});

const csvPath = path.join(dir, 'meta-export.csv');
fs.writeFileSync(csvPath, [
  'community_id,conversation_category,amount_inr,currency,conversation_id,occurred_at',
  'Fitness Moms Chennai,service,0.35,INR,"wamid.HIDDEN_PHONE_+919999999999",2026-05-19T09:00:00.000Z',
  'Fitness Moms Chennai,marketing,1.50,INR,secret-token-123,2026-05-19T10:00:00.000Z',
].join('\n'));

const report = reconcileMetaExport(dir, csvPath, month, { toleranceInr: 0.01 });
assert.strictEqual(report.totals.communities, 1, 'one exported community is reconciled');
assert.strictEqual(report.communities[0].communityId, 'fitness-moms-chennai', 'community id is sanitized');
assert.strictEqual(report.communities[0].meter.count, 2, 'meter WhatsApp events are counted');
assert.strictEqual(report.communities[0].metaExport.count, 2, 'Meta rows are counted');
assert.strictEqual(report.communities[0].status, 'review', 'cost variance is surfaced for review');
assert.strictEqual(report.communities[0].metaExport.categories.marketing.amountInr, 1.5, 'category cost is aggregated');
assert.strictEqual(typeof report.communities[0].marginAfterActualWhatsapp.grossMarginPct, 'number', 'actual-cost margin is included');
assert.strictEqual(JSON.stringify(report).includes('+919999999999'), false, 'raw phone number is not emitted');
assert.strictEqual(JSON.stringify(report).includes('secret-token-123'), false, 'raw external id/token is not emitted');
assert.strictEqual(report.communities[0].sampleExternalRefHashes[0].length, 16, 'external refs are hashed');

const markdown = renderReconciliationMarkdown(report);
assert.strictEqual(markdown.includes('Meta WhatsApp Billing Reconciliation'), true, 'markdown has title');
assert.strictEqual(markdown.includes('Fitness Moms Chennai'), false, 'raw display name is not emitted');
assert.strictEqual(markdown.includes('fitness-moms-chennai'), true, 'sanitized id is emitted');
assert.strictEqual(markdown.includes('+919999999999'), false, 'markdown excludes raw phone');

const jsonPath = path.join(dir, 'reports', 'meta-reconcile.json');
const mdPath = path.join(dir, 'reports', 'meta-reconcile.md');
writeReconciliationReport(dir, csvPath, month, jsonPath);
writeReconciliationReport(dir, csvPath, month, mdPath);
assert.strictEqual(JSON.parse(fs.readFileSync(jsonPath, 'utf8')).totals.communities, 1, 'json report is parseable');
assert.strictEqual(fs.readFileSync(mdPath, 'utf8').includes('Privacy:'), true, 'markdown privacy note is included');

const jsonExportPath = path.join(dir, 'meta-export.json');
fs.writeFileSync(jsonExportPath, JSON.stringify({ rows: [{ community_id: 'AI Builders BLR', category: 'utility', amount: 0.01, currency: 'USD', id: 'meta-row-id' }] }));
const usdReport = reconcileMetaExport(dir, jsonExportPath, month, { usdToInr: 80 });
assert.strictEqual(usdReport.communities[0].metaExport.amountInr, 0.8, 'USD export rows can be converted to INR');

console.log('Meta billing reconciliation smoke test passed');
