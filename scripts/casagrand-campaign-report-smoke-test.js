'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  buildCampaignReport,
  inferTopics,
  isCampaignText,
  redactPhone,
  writeCampaignReport,
} = require('./casagrand-campaign-report');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'casagrand-report-'));
}

function appendJsonl(file, rows) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, rows.map((row) => JSON.stringify(row)).join('\n') + '\n');
}

(function run() {
  assert.strictEqual(redactPhone('+91 98403 82585'), '********2585');
  assert.strictEqual(isCampaignText('Casagrand First City - I want to join AI by Doing'), true);
  assert.strictEqual(isCampaignText('random message'), false);
  assert.deepStrictEqual(inferTopics('I need resume and interview prep', 'community_signal'), ['job_search']);

  const runtimeDir = tmpDir();
  appendJsonl(path.join(runtimeDir, 'community-signals.jsonl'), [
    {
      received_at: '2026-05-20T02:00:00.000Z',
      source: 'whatsapp_business',
      community: 'dabblewith.ai',
      intent: 'event_interest',
      from: '919840382585',
      display_name: 'Resident One',
      text: 'Casagrand First City - I want to join AI by Doing. My interest is job search and interviews.',
      message_id: 'wamid.real.one',
    },
    {
      received_at: '2026-05-20T02:01:00.000Z',
      source: 'whatsapp_business',
      community: 'dabblewith.ai',
      intent: 'community_signal',
      from: '100000000001',
      display_name: 'Synthetic User',
      text: 'Casagrand First City synthetic test',
      message_id: 'wamid.synthetic.llmtest',
    },
    {
      received_at: '2026-05-20T02:02:00.000Z',
      source: 'whatsapp_business',
      community: 'dabblewith.ai',
      intent: 'community_signal',
      from: '919999999999',
      display_name: 'Other User',
      text: 'What events do you have?',
      message_id: 'wamid.other',
    },
  ]);
  appendJsonl(path.join(runtimeDir, 'webhooks.jsonl'), [
    {
      payload: {
        entry: [{ changes: [{ value: { statuses: [{ status: 'delivered' }, { status: 'read' }] } }] }],
      },
    },
  ]);

  const report = buildCampaignReport(runtimeDir);
  assert.strictEqual(report.totals.campaignSignals, 1);
  assert.strictEqual(report.totals.uniqueUsers, 1);
  assert.strictEqual(report.totals.syntheticOrExcludedSignals, 1);
  assert.strictEqual(report.intents.event_interest, 1);
  assert.strictEqual(report.topics.job_search, 1);
  assert.strictEqual(report.deliveryStatuses.delivered, 1);
  assert.strictEqual(report.recentSignals[0].from.endsWith('2585'), true);
  const serialized = JSON.stringify(report);
  assert(!serialized.includes('919840382585'), 'raw phone leaked');
  assert(!serialized.includes('wamid.real.one'), 'raw message id leaked');

  const outputDir = tmpDir();
  const result = writeCampaignReport({ runtimeDir, outputDir, date: '2026-05-20' });
  assert(fs.existsSync(result.mdPath));
  assert(fs.existsSync(result.jsonPath));
  assert(fs.readFileSync(result.mdPath, 'utf8').includes('Casagrand First City Campaign Report'));
  console.log('casagrand-campaign-report smoke passed');
})();
