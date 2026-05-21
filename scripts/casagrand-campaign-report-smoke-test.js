'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  buildCampaignReport,
  computeLaunchDecision,
  inferSourceTags,
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
  assert.deepStrictEqual(inferSourceTags('Casagrand First City tester - career. My role is:'), ['tester_career']);
  assert.deepStrictEqual(inferSourceTags('Casagrand workflow help — automate reports'), ['tester_workflow']);
  assert.deepStrictEqual(inferSourceTags('Casagrand community bot demo for residents'), ['tester_community_bot']);
  assert.deepStrictEqual(inferSourceTags('Casagrand First City - I want to join AI by Doing'), ['casagrand_first_city']);
  assert.deepStrictEqual(inferSourceTags('Casagrand + AI agents'), ['untagged_casagrand']);

  // Launch decision branches mirror the 24-hour launch brief thresholds.
  const clubhouse = computeLaunchDecision({
    totals: { uniqueUsers: 30, campaignSignals: 40 },
    topics: { job_search: 20 },
    sourceTags: { tester_career: 15 },
    trackCounts: { career: 15 },
  });
  assert.strictEqual(clubhouse.stage, 'clubhouse_intro');
  assert.strictEqual(clubhouse.confidence, 'high');
  assert.strictEqual(typeof clubhouse.route, 'string');
  assert.strictEqual(typeof clubhouse.nextAction, 'string');
  assert(Array.isArray(clubhouse.rationale) && clubhouse.rationale.length > 0);
  assert.strictEqual(clubhouse.thresholds.length, 4);
  assert(clubhouse.thresholds.some((t) => t.name === 'clubhouse_intro' && t.met === true));
  assert(clubhouse.rationale.some((r) => r.includes('Top topic cluster: job_search')));
  assert(clubhouse.rationale.some((r) => r.includes('Top source tag: tester_career')));

  const sprint = computeLaunchDecision({
    totals: { uniqueUsers: 12, campaignSignals: 15 },
    topics: { office_productivity: 8 },
    sourceTags: { tester_workflow: 6 },
    trackCounts: { workflow: 6 },
  });
  assert.strictEqual(sprint.stage, 'build_sprint');
  assert.strictEqual(sprint.confidence, 'medium');
  assert(sprint.thresholds.some((t) => t.name === 'build_sprint' && t.met === true));

  const designPartner = computeLaunchDecision({
    totals: { uniqueUsers: 5, campaignSignals: 6 },
    topics: { community_bot: 3 },
    sourceTags: { tester_community_bot: 3 },
    trackCounts: { community_bot: 3 },
  });
  assert.strictEqual(designPartner.stage, 'design_partner_calls');
  assert(designPartner.thresholds.some((t) => t.name === 'design_partner_calls' && t.met === true && t.value === 3));

  const reposition = computeLaunchDecision({
    totals: { uniqueUsers: 2, campaignSignals: 2 },
    topics: { unclassified: 2 },
    sourceTags: {},
    trackCounts: {},
  });
  assert.strictEqual(reposition.stage, 'first10_tester_dms');
  assert.strictEqual(reposition.confidence, 'low');
  assert(reposition.thresholds.some((t) => t.name === 'first10_tester_dms' && t.met === true));

  const runtimeDir = tmpDir();
  appendJsonl(path.join(runtimeDir, 'community-signals.jsonl'), [
    {
      received_at: '2026-05-20T02:00:00.000Z',
      source: 'whatsapp_business',
      community: 'dabblewith.ai',
      intent: 'event_interest',
      from: '919840382585',
      display_name: 'Resident One',
      text: 'Casagrand First City tester - career. I want to join AI by Doing. My interest is job search and interviews.',
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
  assert.strictEqual(report.sourceTags.tester_career, 1);
  assert.strictEqual(report.trackCounts.career, 1);
  assert.deepStrictEqual(report.recentSignals[0].sourceTags, ['tester_career']);
  assert.deepStrictEqual(report.recentSignals[0].tracks, ['career']);
  assert.strictEqual(report.deliveryStatuses.delivered, 1);
  assert.strictEqual(report.recentSignals[0].from.endsWith('2585'), true);
  assert(report.decision, 'decision missing from report');
  assert.strictEqual(report.decision.stage, 'first10_tester_dms');
  assert.strictEqual(report.decision.confidence, 'low');
  assert.strictEqual(typeof report.decision.route, 'string');
  assert.strictEqual(typeof report.decision.nextAction, 'string');
  assert(Array.isArray(report.decision.rationale) && report.decision.rationale.length > 0);
  assert.strictEqual(report.decision.thresholds.length, 4);
  assert(report.decision.rationale.some((r) => r.includes('Top source tag: tester_career')));
  const serialized = JSON.stringify(report);
  assert(!serialized.includes('919840382585'), 'raw phone leaked');
  assert(!serialized.includes('wamid.real.one'), 'raw message id leaked');

  const outputDir = tmpDir();
  const result = writeCampaignReport({ runtimeDir, outputDir, date: '2026-05-20' });
  assert(fs.existsSync(result.mdPath));
  assert(fs.existsSync(result.jsonPath));
  const markdown = fs.readFileSync(result.mdPath, 'utf8');
  assert(markdown.includes('Casagrand First City Campaign Report'));
  assert(markdown.includes('## Launch decision'));
  assert(markdown.includes('Stage: first10_tester_dms'));
  assert(markdown.includes('Confidence: low'));
  assert(markdown.includes('first10_tester_dms: <10 weak/no signals'));
  assert(markdown.includes('## Source tag counts'));
  assert(markdown.includes('tester_career: 1'));
  assert(markdown.includes('## Tester track counts'));
  assert(markdown.includes('career: 1'));
  console.log('casagrand-campaign-report smoke passed');
})();
