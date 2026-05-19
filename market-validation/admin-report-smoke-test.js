'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { recordLead } = require('./leads');
const { parseArgs, writeAdminReport } = require('./admin-report');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dabble-market-admin-report-'));
const storageDir = path.join(root, 'leads');
const outputDir = path.join(root, 'reports');

assert.deepStrictEqual(parseArgs(['--storage-dir', storageDir, '--output-dir', outputDir, '--date', '2026-05-19']), {
  storageDir,
  outputDir,
  date: '2026-05-19',
});
assert.throws(() => parseArgs(['--date', '19-05-2026']), /YYYY-MM-DD/);

recordLead(storageDir, {
  communityName: 'Robotics Builders Chennai',
  ownerName: 'Priya Owner',
  audienceSize: '900 members',
  whatsappUsage: 'Daily WhatsApp questions and workshop reminders',
  painPoints: ['manual registrations', 'missed FAQs', 'follow-up chaos'],
  eventCadence: 'Monthly workshops',
  budgetRange: 'Growth 14999 per month is fine',
  urgency: 'Need this for next event this week',
  source: '/community-bot/ WhatsApp CTA',
  externalRef: '+91 98765 43210',
  notes: 'email priya@example.com token=do-not-store',
});

recordLead(storageDir, {
  communityName: 'Quiet Reading Circle',
  ownerName: 'Arun',
  audienceSize: '40 members',
  whatsappUsage: 'Low-volume WhatsApp group',
  painPoints: 'not much yet',
  eventCadence: 'Quarterly',
  budgetRange: 'free trial only',
  urgency: 'maybe later',
  source: 'manual admin note',
  phone: '+1 555 123 4567',
});

const result = writeAdminReport({ storageDir, outputDir, date: '2026-05-19' });
assert.ok(fs.existsSync(result.mdPath));
assert.ok(fs.existsSync(result.jsonPath));
assert.strictEqual(path.basename(result.mdPath), 'community-bot-market-validation-2026-05-19.md');
assert.strictEqual(path.basename(result.jsonPath), 'community-bot-market-validation-2026-05-19.json');
assert.strictEqual(result.report.totals.leads, 2);
assert.strictEqual(result.report.totals.qualified, 1);
assert.strictEqual(result.report.adminSummary.status, 'lead_collection_in_progress');
assert.ok(result.report.adminSummary.nextAction.includes('9 more'));

const md = fs.readFileSync(result.mdPath, 'utf8');
const json = fs.readFileSync(result.jsonPath, 'utf8');
assert.ok(md.includes('Admin next action'));
assert.ok(md.includes('lead_collection_in_progress'));
assert.ok(json.includes('adminSummary'));

for (const content of [md, json]) {
  assert.strictEqual(content.includes('+91 98765'), false);
  assert.strictEqual(content.includes('+1 555'), false);
  assert.strictEqual(content.includes('priya@example.com'), false);
  assert.strictEqual(content.includes('do-not-store'), false);
  assert.strictEqual(content.includes('Robotics Builders Chennai'), false, 'reports should use sanitized IDs, not raw display names');
}

const emptyOutputDir = path.join(root, 'empty-reports');
const empty = writeAdminReport({ storageDir: path.join(root, 'empty-leads'), outputDir: emptyOutputDir, date: '2026-05-20' });
assert.strictEqual(empty.report.totals.leads, 0);
assert.strictEqual(empty.report.totals.qualified, 0);
assert.ok(fs.readFileSync(empty.mdPath, 'utf8').includes('Leads captured: 0'));
assert.ok(fs.existsSync(empty.jsonPath));

console.log('market-validation admin report smoke test passed');
