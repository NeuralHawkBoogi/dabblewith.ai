'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  buildCampaignReport,
  computeLaunchDecision,
  inferSourceTags,
  inferSlotVotes,
  inferTopics,
  isCampaignText,
  isExcludedLast4,
  normalizeLast4List,
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
  assert.deepStrictEqual(normalizeLast4List('2585, 0001'), ['2585', '0001']);
  assert.strictEqual(isExcludedLast4({ from: '+91 98403 82585' }, ['2585']), true);
  assert.strictEqual(isExcludedLast4({ from: '+91 98403 82585' }, ['0001']), false);
  assert.strictEqual(isCampaignText('Casagrand First City - I want to join AI by Doing'), true);
  assert.strictEqual(isCampaignText('random message'), false);
  assert.deepStrictEqual(inferTopics('I need resume and interview prep', 'community_signal'), ['job_search']);
  assert.deepStrictEqual(inferSourceTags('Casagrand First City tester - career. My role is:'), ['tester_career']);
  assert.deepStrictEqual(inferSourceTags('Casagrand workflow help — automate reports'), ['tester_workflow']);
  assert.deepStrictEqual(inferSourceTags('Casagrand community bot demo for residents'), ['tester_community_bot']);
  assert.deepStrictEqual(inferSourceTags('Casagrand date poll - weekend morning. My topic vote is: job search'), ['casagrand_date_poll']);
  assert.deepStrictEqual(inferSourceTags('Casagrand office hours - automate weekly reports'), ['casagrand_office_hours']);
  assert.deepStrictEqual(inferSourceTags('Casagrand champion - I can help seed the AI by Doing pilot'), ['casagrand_champion']);
  assert.deepStrictEqual(inferSourceTags('Casagrand bot readiness audit - I run a WhatsApp group'), ['casagrand_bot_readiness']);
  assert.deepStrictEqual(inferSourceTags('Casagrand bot design call - I run a WhatsApp group'), ['casagrand_bot_design_call']);
  assert.deepStrictEqual(inferSourceTags('Casagrand reboot career - I want help with interview prep'), ['casagrand_reboot_career']);
  assert.deepStrictEqual(inferSourceTags('Casagrand reboot workflow - my repetitive task is reports'), ['casagrand_reboot_workflow']);
  assert.deepStrictEqual(inferSourceTags('Casagrand reboot community bot - I run a group'), ['casagrand_reboot_community_bot']);
  assert.deepStrictEqual(inferSlotVotes('Casagrand date poll - weekend morning. My topic vote is: job search'), ['weekend_morning']);
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
      received_at: '2026-05-20T02:00:30.000Z',
      source: 'whatsapp_business',
      community: 'dabblewith.ai',
      intent: 'event_interest',
      from: '919840380001',
      display_name: 'Resident Two',
      text: 'Casagrand date poll - weekend morning. My topic vote is: office productivity',
      message_id: 'wamid.real.two',
    },
    {
      received_at: '2026-05-20T02:01:00.000Z',
      source: 'whatsapp_business',
      community: 'dabblewith.ai',
      intent: 'community_signal',
      from: '919840380002',
      display_name: 'Resident Three',
      text: 'Casagrand office hours - I want help to automate weekly reports',
      message_id: 'wamid.real.three',
    },
    {
      received_at: '2026-05-20T02:01:30.000Z',
      source: 'whatsapp_business',
      community: 'dabblewith.ai',
      intent: 'community_signal',
      from: '919840380003',
      display_name: 'Resident Four',
      text: 'Casagrand champion - I can help seed the AI by Doing pilot. My track is community bot.',
      message_id: 'wamid.real.four',
    },

    {
      received_at: '2026-05-20T02:01:45.000Z',
      source: 'whatsapp_business',
      community: 'dabblewith.ai',
      intent: 'community_signal',
      from: '919840380004',
      display_name: 'Resident Five',
      text: 'Casagrand bot readiness audit - I run a WhatsApp group for a weekend class with repeated FAQ bot needs.',
      message_id: 'wamid.real.five',
    },
    {
      received_at: '2026-05-20T02:01:50.000Z',
      source: 'whatsapp_business',
      community: 'dabblewith.ai',
      intent: 'community_signal',
      from: '919840380005',
      display_name: 'Resident Six',
      text: 'Casagrand bot design call - I run a WhatsApp group and want a demo for repeated FAQ help',
      message_id: 'wamid.real.eight',
    },
    {
      received_at: '2026-05-20T02:01:52.000Z',
      source: 'whatsapp_business',
      community: 'dabblewith.ai',
      intent: 'community_signal',
      from: '919840380007',
      display_name: 'Resident Eight',
      text: 'Casagrand reboot workflow - my repetitive task is weekly status reports',
      message_id: 'wamid.real.six',
    },
    {
      received_at: '2026-05-20T02:01:55.000Z',
      source: 'whatsapp_business',
      community: 'dabblewith.ai',
      intent: 'community_signal',
      from: '919840380006',
      display_name: 'Resident Seven',
      text: 'Casagrand reboot community bot - I run a group and want FAQ help',
      message_id: 'wamid.real.seven',
    },
    {
      received_at: '2026-05-20T02:02:00.000Z',
      source: 'whatsapp_business',
      community: 'dabblewith.ai',
      intent: 'community_signal',
      from: '100000000001',
      display_name: 'Synthetic User',
      text: 'Casagrand First City synthetic test',
      message_id: 'wamid.synthetic.llmtest',
    },
    {
      received_at: '2026-05-20T02:02:30.000Z',
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
  assert.strictEqual(report.totals.campaignSignals, 8);
  assert.strictEqual(report.totals.uniqueUsers, 8);
  assert.strictEqual(report.totals.syntheticOrExcludedSignals, 1);
  assert.strictEqual(report.totals.ownerOrTestExcludedSignals, 0);
  assert.strictEqual(report.totals.syntheticSignals, 1);
  assert.strictEqual(report.intents.event_interest, 2);
  assert.strictEqual(report.intents.community_signal, 6);
  assert.strictEqual(report.topics.job_search, 1);
  assert.strictEqual(report.topics.office_productivity, 3);
  assert.strictEqual(report.topics.community_bot, 4);
  assert.strictEqual(report.sourceTags.tester_career, 1);
  assert.strictEqual(report.sourceTags.casagrand_date_poll, 1);
  assert.strictEqual(report.sourceTags.casagrand_office_hours, 1);
  assert.strictEqual(report.sourceTags.casagrand_champion, 1);
  assert.strictEqual(report.sourceTags.casagrand_bot_readiness, 1);
  assert.strictEqual(report.sourceTags.casagrand_bot_design_call, 1);
  assert.strictEqual(report.sourceTags.casagrand_reboot_workflow, 1);
  assert.strictEqual(report.sourceTags.casagrand_reboot_community_bot, 1);
  assert.strictEqual(report.trackCounts.career, 1);
  assert.strictEqual(report.trackCounts.community_bot, 3);
  assert.strictEqual(report.slotVotes.weekend_morning, 1);
  assert.deepStrictEqual(report.recentSignals[0].sourceTags, ['casagrand_reboot_community_bot']);
  assert.deepStrictEqual(report.recentSignals[0].tracks, ['community_bot']);
  assert.deepStrictEqual(report.recentSignals[1].sourceTags, ['casagrand_reboot_workflow']);
  assert.deepStrictEqual(report.recentSignals[1].tracks, ['workflow']);
  assert.deepStrictEqual(report.recentSignals[2].sourceTags, ['casagrand_bot_design_call']);
  assert.deepStrictEqual(report.recentSignals[2].tracks, ['community_bot']);
  assert.deepStrictEqual(report.recentSignals[3].sourceTags, ['casagrand_bot_readiness']);
  assert.deepStrictEqual(report.recentSignals[4].sourceTags, ['casagrand_champion']);
  assert.deepStrictEqual(report.recentSignals[5].sourceTags, ['casagrand_office_hours']);
  assert.deepStrictEqual(report.recentSignals[6].sourceTags, ['casagrand_date_poll']);
  assert.deepStrictEqual(report.recentSignals[6].slotVotes, ['weekend_morning']);
  assert.deepStrictEqual(report.recentSignals[7].sourceTags, ['tester_career']);
  assert.deepStrictEqual(report.recentSignals[7].tracks, ['career']);
  assert.strictEqual(report.deliveryStatuses.delivered, 1);
  assert.strictEqual(report.recentSignals[7].from.endsWith('2585'), true);
  assert(report.decision, 'decision missing from report');
  assert.strictEqual(report.decision.stage, 'design_partner_calls');
  assert.strictEqual(report.decision.confidence, 'medium');
  assert.strictEqual(typeof report.decision.route, 'string');
  assert.strictEqual(typeof report.decision.nextAction, 'string');
  assert(Array.isArray(report.decision.rationale) && report.decision.rationale.length > 0);
  assert.strictEqual(report.decision.thresholds.length, 4);
  assert(report.decision.rationale.some((r) => r.includes('Top source tag:')));
  // The bottom-of-report next action must match the launch decision's next action
  // so the markdown does not present two contradictory next steps.
  assert.strictEqual(report.nextAction, report.decision.nextAction);

  const ownerExcludedReport = buildCampaignReport(runtimeDir, { excludeLast4: ['2585'] });
  assert.strictEqual(ownerExcludedReport.totals.campaignSignals, 7);
  assert.strictEqual(ownerExcludedReport.totals.uniqueUsers, 7);
  assert.strictEqual(ownerExcludedReport.totals.ownerOrTestExcludedSignals, 1);
  assert.strictEqual(ownerExcludedReport.totals.syntheticOrExcludedSignals, 2);
  assert(!JSON.stringify(ownerExcludedReport.recentSignals).includes('2585'));

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
  assert(markdown.includes('Stage: design_partner_calls'));
  assert(markdown.includes('Confidence: medium'));
  assert(markdown.includes('design_partner_calls: >=2 community_bot signals/tracks'));
  assert(markdown.includes('## Source tag counts'));
  assert(markdown.includes('tester_career: 1'));
  assert(markdown.includes('casagrand_office_hours: 1'));
  assert(markdown.includes('casagrand_champion: 1'));
  assert(markdown.includes('casagrand_bot_readiness: 1'));
  assert(markdown.includes('casagrand_bot_design_call: 1'));
  assert(markdown.includes('casagrand_reboot_workflow: 1'));
  assert(markdown.includes('casagrand_reboot_community_bot: 1'));
  assert(markdown.includes('## Tester track counts'));
  assert(markdown.includes('career: 1'));
  assert(markdown.includes('## Date/slot poll counts'));
  assert(markdown.includes('weekend_morning: 1'));
  // Bottom "## Next action" must render the same text as the launch decision card.
  assert(markdown.includes(`- Next action: ${report.decision.nextAction}`));
  assert(markdown.includes(`## Next action\n- ${report.decision.nextAction}\n`));

  const excludedOutputDir = tmpDir();
  const excluded = writeCampaignReport({ runtimeDir, outputDir: excludedOutputDir, date: '2026-05-20', excludeLast4: ['2585'] });
  const excludedMarkdown = fs.readFileSync(excluded.mdPath, 'utf8');
  assert(excludedMarkdown.includes('Owner/test signals excluded: 1'));
  assert(!excludedMarkdown.includes('********2585'), 'excluded owner/test signal rendered');
  console.log('casagrand-campaign-report smoke passed');
})();
