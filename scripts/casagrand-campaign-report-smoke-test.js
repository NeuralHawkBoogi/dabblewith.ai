'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  buildCampaignReport,
  buildFirstResponderFollowUp,
  buildReferralSprintFollowUp,
  buildNoReplyNudgeFollowUp,
  buildNarrowDiscoveryFollowUp,
  buildFollowUpCadence,
  computeLaunchDecision,
  inferSourceTags,
  inferSlotVotes,
  inferTopics,
  isCampaignText,
  manualTrackerTemplate,
  referralSprintTrackerTemplate,
  noReplyNudgeTrackerTemplate,
  narrowDiscoveryTrackerTemplate,
  isExcludedLast4,
  normalizeLast4List,
  redactPhone,
  parseArgs,
  summarizeManualTracker,
  writeCampaignReport,
  writeManualTrackerTemplate,
  writeReferralSprintTrackerTemplate,
  writeNoReplyNudgeTrackerTemplate,
  writeNarrowDiscoveryTrackerTemplate,
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
  assert.deepStrictEqual(inferSourceTags('Casagrand referral — I want help with QA workflow'), ['casagrand_referral_sprint']);
  assert.deepStrictEqual(inferSourceTags('first_responder_referral_sprint: QA intro'), ['casagrand_referral_sprint']);
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

  const template = manualTrackerTemplate();
  assert.strictEqual(template.meta.sprintStartedAt, '');
  assert.strictEqual(template.meta.reportRerunDueAt, '');
  assert.strictEqual(template.rows.length, 5);
  assert.deepStrictEqual(template.rows.map((row) => row.segment), ['career', 'career', 'workflow', 'workflow', 'admin']);
  assert(template.rows.every((row) => /^\d{4}$/.test(row.last4)), 'template must use last4 placeholders only');
  assert(template.rows.every((row) => row.route === 'no_reply'), 'template routes must use allowed no_reply default');
  assert(!JSON.stringify(template).match(/phone|message|raw|name|wamid|\+91/i), 'template leaked disallowed fields');
  assert.strictEqual(parseArgs(['--write-manual-tracker-template', 'out.json']).writeManualTrackerTemplate, 'out.json');
  assert.strictEqual(parseArgs(['--write-referral-sprint-template', 'referrals.json']).writeReferralSprintTemplate, 'referrals.json');
  assert.strictEqual(parseArgs(['--write-no-reply-nudge-template', 'nudge.json']).writeNoReplyNudgeTemplate, 'nudge.json');
  assert.strictEqual(parseArgs(['--write-narrow-discovery-template', 'narrow.json']).writeNarrowDiscoveryTemplate, 'narrow.json');

  const referralTemplate = referralSprintTrackerTemplate();
  assert.strictEqual(referralTemplate.meta.route, 'first_responder_referral_sprint');
  assert.strictEqual(referralTemplate.rows.length, 3);
  assert.deepStrictEqual(referralTemplate.rows.map((row) => row.segment), ['qa_dev_student', 'qa_dev_student', 'group_owner']);
  assert(referralTemplate.rows.every((row) => /^\d{4}$/.test(row.last4)), 'referral template must use last4 placeholders only');
  assert(referralTemplate.rows.every((row) => row.route === 'first_responder_referral_sprint'), 'referral template routes must use referral sprint route');
  assert(!JSON.stringify(referralTemplate).match(/phone|message|raw|name|wamid|\+91/i), 'referral template leaked disallowed fields');

  const referralTemplatePath = path.join(tmpDir(), 'nested', 'referral-sprint-template.json');
  const writtenReferralTemplatePath = writeReferralSprintTrackerTemplate(referralTemplatePath);
  assert.strictEqual(writtenReferralTemplatePath, path.resolve(referralTemplatePath));
  const writtenReferralTemplate = JSON.parse(fs.readFileSync(referralTemplatePath, 'utf8'));
  assert.deepStrictEqual(writtenReferralTemplate, referralTemplate);
  const writtenReferralSummary = summarizeManualTracker(writtenReferralTemplate);
  assert.strictEqual(writtenReferralSummary.rows, 3);
  assert.strictEqual(writtenReferralSummary.referrals, 3);
  assert.strictEqual(buildReferralSprintFollowUp(writtenReferralSummary).hasGroupOwner, true);

  const nudgeTemplate = noReplyNudgeTrackerTemplate();
  assert.strictEqual(nudgeTemplate.meta.route, 'no_reply_nudge');
  assert.strictEqual(nudgeTemplate.rows.length, 4);
  assert(nudgeTemplate.rows.every((row) => row.route === 'no_reply'), 'nudge template should not pre-count positive outcomes');
  assert(nudgeTemplate.rows.every((row) => /^\d{4}$/.test(row.last4)), 'nudge template must use last4 placeholders only');
  assert(!JSON.stringify(nudgeTemplate).match(/phone|message|raw|name|wamid|\+91/i), 'nudge template leaked disallowed fields');
  const nudgeTemplatePath = path.join(tmpDir(), 'nested', 'no-reply-nudge-template.json');
  const writtenNudgeTemplatePath = writeNoReplyNudgeTrackerTemplate(nudgeTemplatePath);
  assert.strictEqual(writtenNudgeTemplatePath, path.resolve(nudgeTemplatePath));
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(nudgeTemplatePath, 'utf8')), nudgeTemplate);
  const writtenNudgeSummary = summarizeManualTracker(JSON.parse(fs.readFileSync(nudgeTemplatePath, 'utf8')));
  assert.strictEqual(writtenNudgeSummary.metaRoute, 'no_reply_nudge');
  const emptyNudgeFollowUp = buildNoReplyNudgeFollowUp(writtenNudgeSummary);
  assert(emptyNudgeFollowUp.nextSteps.some((s) => s.includes('stop chasing this responder')));
  const filledNudgeFollowUp = buildNoReplyNudgeFollowUp(summarizeManualTracker({
    meta: { route: 'no_reply_nudge' },
    rows: [
      { segment: 'qa_dev_student', last4: '2002', route: 'problem', problem: 'QA test-plan sample' },
      { segment: 'qa_dev_student', last4: '2003', route: 'topic_vote', problem: 'weekend evening' },
      { segment: 'group_owner', last4: '2004', route: 'bot_readiness', problem: 'runs residents group' },
    ],
  }));
  assert(filledNudgeFollowUp.nextSteps.some((s) => s.includes('/casagrand-firstcity/qa-walkthrough/')));
  assert(filledNudgeFollowUp.nextSteps.some((s) => s.includes('/casagrand-firstcity/bot-readiness/')));
  assert(!JSON.stringify(filledNudgeFollowUp).match(/\d{5,}/), 'nudge follow-up leaked a long number');

  const narrowTemplate = narrowDiscoveryTrackerTemplate();
  assert.strictEqual(narrowTemplate.meta.route, 'narrow_discovery');
  assert.strictEqual(narrowTemplate.rows.length, 5);
  assert.deepStrictEqual(narrowTemplate.rows.map((row) => row.segment), ['qa_dev_student', 'qa_dev_student', 'excel_workflow', 'excel_workflow', 'group_owner']);
  assert(narrowTemplate.rows.every((row) => row.route === 'no_reply'), 'narrow template should not pre-count positive outcomes');
  assert(narrowTemplate.rows.every((row) => /^\d{4}$/.test(row.last4)), 'narrow template must use last4 placeholders only');
  assert(!JSON.stringify(narrowTemplate).match(/phone|message|raw|name|wamid|\+91/i), 'narrow template leaked disallowed fields');
  const narrowTemplatePath = path.join(tmpDir(), 'nested', 'narrow-discovery-template.json');
  const writtenNarrowTemplatePath = writeNarrowDiscoveryTrackerTemplate(narrowTemplatePath);
  assert.strictEqual(writtenNarrowTemplatePath, path.resolve(narrowTemplatePath));
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(narrowTemplatePath, 'utf8')), narrowTemplate);
  const emptyNarrowSummary = summarizeManualTracker(narrowTemplate);
  assert.strictEqual(emptyNarrowSummary.metaRoute, 'narrow_discovery');
  assert.strictEqual(emptyNarrowSummary.rows, 5);
  const emptyNarrowFollowUp = buildNarrowDiscoveryFollowUp(emptyNarrowSummary);
  assert(emptyNarrowFollowUp.nextSteps.some((s) => s.includes('do not broad-post yet')));
  const filledNarrowFollowUp = buildNarrowDiscoveryFollowUp(summarizeManualTracker({
    meta: { route: 'narrow_discovery' },
    rows: [
      { segment: 'qa_dev_student', last4: '3001', route: 'problem', problem: 'QA checklist helper' },
      { segment: 'excel_workflow', last4: '3003', route: 'narrow_discovery', problem: 'Excel cleanup report' },
      { segment: 'group_owner', last4: '3005', route: 'bot_readiness', problem: 'runs residents group' },
    ],
  }));
  assert.strictEqual(filledNarrowFollowUp.qaSignals, 1);
  assert.strictEqual(filledNarrowFollowUp.excelSignals, 1);
  assert.strictEqual(filledNarrowFollowUp.groupOwnerSignals, 1);
  assert(filledNarrowFollowUp.nextSteps.some((s) => s.includes('/casagrand-firstcity/qa-walkthrough/')));
  assert(filledNarrowFollowUp.nextSteps.some((s) => s.includes('/casagrand-firstcity/excel-walkthrough/')));
  assert(filledNarrowFollowUp.nextSteps.some((s) => s.includes('/casagrand-firstcity/bot-readiness/')));
  assert(filledNarrowFollowUp.nextSteps.some((s) => s.includes('/casagrand-firstcity/date-lock/')));
  assert(!JSON.stringify(filledNarrowFollowUp).match(/\d{5,}/), 'narrow follow-up leaked a long number');

  const templatePath = path.join(tmpDir(), 'nested', 'manual-5dm-template.json');
  const writtenTemplatePath = writeManualTrackerTemplate(templatePath);
  assert.strictEqual(writtenTemplatePath, path.resolve(templatePath));
  const writtenTemplate = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  assert.deepStrictEqual(writtenTemplate, template);
  assert.strictEqual(summarizeManualTracker(writtenTemplate).rows, 5);
  const timedSummary = summarizeManualTracker({ meta: { sprintStartedAt: '2026-05-25T04:00:00Z', reportRerunDueAt: '2000-01-01T00:00:00Z' }, rows: writtenTemplate.rows });
  assert.strictEqual(timedSummary.sprintStartedAt, '2026-05-25T04:00:00.000Z');
  assert.strictEqual(timedSummary.reportRerunDueAt, '2000-01-01T00:00:00.000Z');
  assert.strictEqual(timedSummary.reportRerunDue, true);

  const manualSummary = summarizeManualTracker({
    rows: [
      { segment: 'career', last4: '1234', route: 'problem', problem: 'resume rewrite for product manager transition needs long trim', followUpSent: true, nextAction: 'ask date vote' },
      { segment: 'admin', phoneLast4: '9876', route: 'bot_readiness', problem8Words: 'FAQ repeats in residents group', next: 'send readiness link' },
      { segment: 'admin', last4: '9999', route: 'bot_readiness', problem: 'registrations and reminders repeat weekly' },
      { segment: 'workflow', last4: '1111', route: 'topic_vote', problem: 'meeting summaries' },
      { segment: 'qa_dev_student', last4: '2222', route: 'first_responder_referral_sprint', problem: 'QA workflow sample', nextAction: 'send warm intro' },
      { segment: 'workflow', last4: 'bad-full-number', route: 'problem', problem: 'should reject' },
    ],
  });
  assert.strictEqual(manualSummary.rows, 5);
  assert.strictEqual(manualSummary.rejectedRows, 1);
  assert.strictEqual(manualSummary.concreteReplies, 5);
  assert.strictEqual(manualSummary.referrals, 1);
  assert.strictEqual(manualSummary.botReadiness, 2);
  assert.strictEqual(manualSummary.sanitizedRows[0].last4, '****1234');
  assert.strictEqual(manualSummary.sanitizedRows[0].problem, 'resume rewrite for product manager transition needs long');
  assert(manualSummary.nextAction.includes('Community Bot validation'));
  const referralSprintSummary = summarizeManualTracker({
    rows: [
      { segment: 'qa_dev_student', last4: '2222', route: 'first_responder_referral_sprint', problem: 'QA workflow sample' },
      { segment: 'qa_dev_student', last4: '3333', route: 'first_responder_referral_sprint', problem: 'coding assistant intro' },
    ],
  });
  assert.strictEqual(referralSprintSummary.rows, 2);
  assert.strictEqual(referralSprintSummary.referrals, 2);
  assert(referralSprintSummary.nextAction.includes('referred-neighbor warm intro path'));
  assert(referralSprintSummary.nextAction.includes('date/topic poll'));
  assert(!JSON.stringify(manualSummary).includes('99999'), 'manual tracker leaked full phone');

  // Manual tracker referral-sprint rows drive a copy-ready, privacy-safe
  // "Referral sprint follow-up" section built only from sanitized rows/aggregates.
  assert.strictEqual(
    buildReferralSprintFollowUp(summarizeManualTracker({
      rows: [{ segment: 'career', last4: '1234', route: 'problem', problem: 'resume help' }],
    })),
    null,
    'referral sprint follow-up built without any referral-sprint rows',
  );
  assert.strictEqual(buildReferralSprintFollowUp(null), null, 'referral sprint follow-up built from null tracker');

  const referralSprintFollowUp = buildReferralSprintFollowUp(referralSprintSummary);
  assert(referralSprintFollowUp, 'referral sprint follow-up missing for referral-sprint rows');
  assert.strictEqual(referralSprintFollowUp.referralSprintRows, 2);
  assert.strictEqual(referralSprintFollowUp.totalReferrals, 2);
  assert.strictEqual(referralSprintFollowUp.hasGroupOwner, false);
  assert(referralSprintFollowUp.nextSteps.some((s) => s.includes('referred-neighbor warm intro')));
  assert(referralSprintFollowUp.nextSteps.some((s) => s.includes('/casagrand-firstcity/date-poll/')));
  assert(referralSprintFollowUp.nextSteps.some((s) => s.includes('3 total resident signals')));
  assert(!referralSprintFollowUp.nextSteps.some((s) => s.includes('/casagrand-firstcity/bot-readiness/')), 'bot-readiness step without a group_owner segment');
  assert.strictEqual(referralSprintFollowUp.rows.length, 2);
  assert.strictEqual(referralSprintFollowUp.rows[0].last4, '****2222');
  assert(referralSprintFollowUp.rows.every((row) => /^\*{4}\d{4}$/.test(row.last4)), 'referral sprint rows must mask all but last4');
  assert(!JSON.stringify(referralSprintFollowUp).match(/\d{5,}/), 'referral sprint follow-up leaked a long number');

  // A single group-owner referral routes to bot-readiness but does not yet
  // recommend the date/topic poll (needs >=2 total referrals first).
  const groupOwnerFollowUp = buildReferralSprintFollowUp(summarizeManualTracker({
    rows: [{ segment: 'group_owner', last4: '4444', route: 'first_responder_referral_sprint', problem: 'runs residents WhatsApp group' }],
  }));
  assert(groupOwnerFollowUp, 'referral sprint follow-up missing for group-owner referral row');
  assert.strictEqual(groupOwnerFollowUp.totalReferrals, 1);
  assert.strictEqual(groupOwnerFollowUp.hasGroupOwner, true);
  assert(groupOwnerFollowUp.nextSteps.some((s) => s.includes('/casagrand-firstcity/bot-readiness/')));
  assert(!groupOwnerFollowUp.nextSteps.some((s) => s.includes('referred-neighbor warm intro')), 'warm intro recommended before 2 referrals');
  assert(groupOwnerFollowUp.nextSteps.some((s) => s.includes('(<2)')), 'sub-threshold referral step missing for single referral');

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
  assert.strictEqual(clubhouse.thresholds.length, 5);
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

  const firstResponder = computeLaunchDecision({
    totals: { uniqueUsers: 1, campaignSignals: 1 },
    topics: { coding_assistant: 1, student_projects: 1, event_interest: 1 },
    sourceTags: { untagged_casagrand: 1 },
    trackCounts: {},
  });
  assert.strictEqual(firstResponder.stage, 'single_responder_conversion');
  assert.strictEqual(firstResponder.route, 'Convert first responder');
  assert.strictEqual(firstResponder.confidence, 'low');
  assert(firstResponder.nextAction.includes('/casagrand-firstcity/referral-sprint/'));
  assert(firstResponder.nextAction.includes('/casagrand-firstcity/bot-readiness/'));
  assert(firstResponder.nextAction.includes('before any broad post'));
  assert(firstResponder.thresholds.some((t) => t.name === 'single_responder_conversion' && t.met === true));

  const reposition = computeLaunchDecision({
    totals: { uniqueUsers: 2, campaignSignals: 2 },
    topics: { unclassified: 2 },
    sourceTags: {},
    trackCounts: {},
  });
  assert.strictEqual(reposition.stage, 'first10_tester_dms');
  assert.strictEqual(reposition.confidence, 'low');
  assert(reposition.nextAction.includes('5 narrow reboot DMs'));
  assert(reposition.nextAction.includes('before any broad post'));
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
  assert.strictEqual(report.decision.thresholds.length, 5);
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

  const manualTrackerPath = path.join(tmpDir(), 'manual-5dm.json');
  fs.writeFileSync(manualTrackerPath, JSON.stringify({ meta: { sprintStartedAt: '2026-05-20T02:00:00Z', reportRerunDueAt: '2000-01-01T00:00:00Z' }, rows: [
    { segment: 'career', last4: '1234', route: 'problem', problem: 'interview prep for AI role', followUpSent: true },
    { segment: 'admin', last4: '9876', route: 'bot_readiness', problem: 'FAQ repeats in group', nextAction: 'send design call' },
    { segment: 'admin', last4: '9877', route: 'bot_readiness', problem: 'registration reminders repeat' },
  ] }));

  const outputDir = tmpDir();
  const result = writeCampaignReport({ runtimeDir, outputDir, date: '2026-05-20', manualTracker: manualTrackerPath });
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
  assert(markdown.includes('## Manual 5-DM tracker outcomes'));
  assert(markdown.includes('Rows accepted: 3'));
  assert(markdown.includes('Sprint started: 2026-05-20T02:00:00.000Z'));
  assert(markdown.includes('Report rerun due: 2000-01-01T00:00:00.000Z (due now)'));
  assert(markdown.includes('Bot readiness: 2'));
  assert(markdown.includes('Prioritize Get a Community Bot validation'));
  assert(markdown.includes('****1234'));
  assert(!markdown.includes('919840382585'), 'raw phone leaked into markdown');
  // Bottom "## Next action" must prefer the manual tracker when supplied.
  assert(markdown.includes(`- Next action: ${report.decision.nextAction}`));
  assert(markdown.includes('## Next action\n- Prioritize Get a Community Bot validation'));
  // A manual tracker with no referral-sprint rows must not render the section.
  assert(!markdown.includes('## Referral sprint follow-up'), 'referral sprint section leaked into a non-referral manual tracker report');

  const excludedOutputDir = tmpDir();
  const excluded = writeCampaignReport({ runtimeDir, outputDir: excludedOutputDir, date: '2026-05-20', excludeLast4: ['2585'] });
  const excludedMarkdown = fs.readFileSync(excluded.mdPath, 'utf8');
  assert(excludedMarkdown.includes('Owner/test signals excluded: 1'));
  assert(!excludedMarkdown.includes('********2585'), 'excluded owner/test signal rendered');

  // The first-responder follow-up section must only appear for the
  // single_responder_conversion stage; the design-partner report above must not.
  assert(!buildFirstResponderFollowUp(report), 'follow-up built for non-single-responder stage');
  assert(!markdown.includes('## First responder follow-up'), 'first responder section leaked into design-partner report');

  // A single QA/coding responder lands on single_responder_conversion and must
  // get the copy-ready, privacy-safe follow-up section (last4 only, no leaks).
  const qaRuntimeDir = tmpDir();
  appendJsonl(path.join(qaRuntimeDir, 'community-signals.jsonl'), [
    {
      received_at: '2026-05-22T03:00:00.000Z',
      source: 'whatsapp_business',
      community: 'dabblewith.ai',
      intent: 'community_signal',
      from: '919840385678',
      display_name: 'QA Resident',
      text: 'Casagrand First City - I want a coding assistant to review pull requests and fix flaky tests in my QA workflow',
      message_id: 'wamid.qa.coding.one',
    },
  ]);

  const qaReport = buildCampaignReport(qaRuntimeDir);
  assert.strictEqual(qaReport.totals.uniqueUsers, 1);
  assert.strictEqual(qaReport.decision.stage, 'single_responder_conversion');
  assert(qaReport.followUpCadence, 'follow-up cadence missing from QA report');
  assert.strictEqual(qaReport.followUpCadence.state, 'single_responder_stale_24h');
  assert.strictEqual(qaReport.followUpCadence.latestSignalAt, '2026-05-22T03:00:00.000Z');
  assert(qaReport.followUpCadence.ageHours >= 24, 'stale single-responder age not detected');
  assert(qaReport.followUpCadence.nextActionOverride.includes('/casagrand-firstcity/no-reply-nudge/'));
  assert.strictEqual(qaReport.nextAction, qaReport.followUpCadence.nextActionOverride);
  assert(!JSON.stringify(qaReport.followUpCadence).includes('919840385678'), 'cadence leaked full phone');
  assert(!JSON.stringify(qaReport.followUpCadence).includes('wamid.qa.coding.one'), 'cadence leaked message id');

  const freshCadence = buildFollowUpCadence({
    generatedAt: '2026-05-22T10:00:00.000Z',
    decision: { stage: 'single_responder_conversion' },
    manualTracker: null,
    recentSignals: [{ receivedAt: '2026-05-22T03:00:00.000Z' }],
  });
  assert.strictEqual(freshCadence.state, 'single_responder_fresh');
  assert.strictEqual(freshCadence.nextActionOverride, null);

  const referralLoggedCadence = buildFollowUpCadence({
    generatedAt: '2026-05-23T10:00:00.000Z',
    decision: { stage: 'single_responder_conversion' },
    manualTracker: { rows: 1, referrals: 1 },
    recentSignals: [{ receivedAt: '2026-05-22T03:00:00.000Z' }],
  });
  assert.strictEqual(referralLoggedCadence.state, 'referral_sprint_logged');
  assert.strictEqual(referralLoggedCadence.nextActionOverride, null);

  const qaFollowUp = buildFirstResponderFollowUp(qaReport);
  assert(qaFollowUp, 'first responder follow-up missing for single QA/coding responder');
  assert.strictEqual(qaFollowUp.topic, 'coding_assistant');
  assert.strictEqual(qaFollowUp.last4, '5678');
  assert(/QA or coding/i.test(qaFollowUp.workflowSampleAsk), 'workflow ask not tailored to QA/coding');
  assert.strictEqual(qaFollowUp.referralSprintLink, 'https://dabblewith.ai/casagrand-firstcity/referral-sprint/');
  assert(qaFollowUp.communityBotGate.includes('/casagrand-firstcity/bot-readiness/'));
  assert(qaFollowUp.trackerNote.includes('last4=5678'));
  assert(qaFollowUp.trackerNote.includes('route=first_responder_referral_sprint'));
  assert(!JSON.stringify(qaFollowUp).includes('919840385678'), 'follow-up leaked full phone');
  assert(!JSON.stringify(qaFollowUp).includes('wamid.qa.coding.one'), 'follow-up leaked message id');

  const qaOutputDir = tmpDir();
  const qaResult = writeCampaignReport({ runtimeDir: qaRuntimeDir, outputDir: qaOutputDir, date: '2026-05-22' });
  const qaMarkdown = fs.readFileSync(qaResult.mdPath, 'utf8');
  assert(qaMarkdown.includes('## First responder follow-up'), 'first responder section missing from markdown');
  assert(qaMarkdown.includes('## Follow-up cadence'), 'follow-up cadence section missing from markdown');
  assert(qaMarkdown.includes('Cadence state: single_responder_stale_24h'), 'stale cadence state missing from markdown');
  assert(qaMarkdown.includes('/casagrand-firstcity/no-reply-nudge/'), 'no-reply nudge route missing from cadence markdown');
  assert(qaMarkdown.includes('Workflow sample ask:'));
  assert(qaMarkdown.includes('Slot/topic vote ask:'));
  assert(qaMarkdown.includes('Referral ask:'));
  assert(qaMarkdown.includes('Referral sprint link: https://dabblewith.ai/casagrand-firstcity/referral-sprint/'));
  assert(qaMarkdown.includes('Community-bot gate: Only send /casagrand-firstcity/bot-readiness/'));
  assert(qaMarkdown.includes('Tracker note:'));
  assert(qaMarkdown.includes('route=first_responder_referral_sprint'));
  assert(/Workflow sample ask:.*QA or coding/.test(qaMarkdown), 'markdown workflow ask not tailored to QA/coding');
  assert(qaMarkdown.includes('last4=5678'));
  assert(!qaMarkdown.includes('919840385678'), 'raw phone leaked into first responder markdown');
  assert(!qaMarkdown.includes('wamid.qa.coding.one'), 'raw message id leaked into first responder markdown');

  // A manual tracker with referral-sprint rows must render a copy-ready,
  // privacy-safe "Referral sprint follow-up" section using only sanitized
  // rows/aggregates, with last4-only bullets and no raw phone/message leak.
  const referralTrackerPath = path.join(tmpDir(), 'referral-sprint.json');
  fs.writeFileSync(referralTrackerPath, JSON.stringify({ rows: [
    { segment: 'qa_dev_student', last4: '2222', route: 'first_responder_referral_sprint', problem: 'QA workflow sample', nextAction: 'send warm intro' },
    { segment: 'qa_dev_student', last4: '3333', route: 'first_responder_referral_sprint', problem: 'coding assistant intro', followUpSent: true },
    { segment: 'group_owner', last4: '4444', route: 'first_responder_referral_sprint', problem: 'runs residents WhatsApp group' },
    { segment: 'other', last4: '919840385555', route: 'first_responder_referral_sprint', problem: 'full number must be rejected' },
  ] }));
  const referralOutputDir = tmpDir();
  const referralResult = writeCampaignReport({ runtimeDir: qaRuntimeDir, outputDir: referralOutputDir, date: '2026-05-26', manualTracker: referralTrackerPath });
  const referralMarkdown = fs.readFileSync(referralResult.mdPath, 'utf8');
  assert(referralMarkdown.includes('## Referral sprint follow-up'), 'referral sprint section missing from markdown');
  assert(referralMarkdown.includes('Referral-sprint rows logged: 3'), 'referral sprint row count missing (rejected full-number row should not count)');
  assert(referralMarkdown.includes('Total referrals: 3'));
  assert(referralMarkdown.includes('Group-owner segment present: yes'));
  assert(referralMarkdown.includes('referred-neighbor warm intro'));
  assert(referralMarkdown.includes('/casagrand-firstcity/date-poll/'));
  assert(referralMarkdown.includes('3 total resident signals'));
  assert(referralMarkdown.includes('/casagrand-firstcity/bot-readiness/'));
  assert(referralMarkdown.includes('- Referral-sprint rows (last4 only):'));
  assert(referralMarkdown.includes('****2222'));
  assert(referralMarkdown.includes('group_owner · ****4444'));
  assert(!referralMarkdown.includes('919840385555'), 'rejected full-number row leaked into referral sprint markdown');
  assert(!referralMarkdown.includes('919840385678'), 'raw phone leaked into referral sprint markdown');

  const nudgeTrackerPath = path.join(tmpDir(), 'no-reply-nudge.json');
  fs.writeFileSync(nudgeTrackerPath, JSON.stringify({ meta: { route: 'no_reply_nudge' }, rows: [
    { segment: 'qa_dev_student', last4: '2002', route: 'problem', problem: 'QA sample' },
    { segment: 'qa_dev_student', last4: '2003', route: 'topic_vote', problem: 'weekend evening' },
    { segment: 'group_owner', last4: '2004', route: 'bot_readiness', problem: 'runs residents group' },
    { segment: 'other', last4: '919840385555', route: 'problem', problem: 'full number must be rejected' },
  ] }));
  const nudgeOutputDir = tmpDir();
  const nudgeResult = writeCampaignReport({ runtimeDir: qaRuntimeDir, outputDir: nudgeOutputDir, date: '2026-05-26', manualTracker: nudgeTrackerPath });
  const nudgeMarkdown = fs.readFileSync(nudgeResult.mdPath, 'utf8');
  assert(nudgeMarkdown.includes('## No-reply nudge follow-up'), 'no-reply nudge section missing from markdown');
  assert(nudgeMarkdown.includes('/casagrand-firstcity/qa-walkthrough/'));
  assert(nudgeMarkdown.includes('/casagrand-firstcity/bot-readiness/'));
  assert(nudgeMarkdown.includes('****2002'));
  assert(!nudgeMarkdown.includes('919840385555'), 'rejected full-number row leaked into no-reply nudge markdown');
  assert(!nudgeMarkdown.includes('919840385678'), 'raw phone leaked into no-reply nudge markdown');

  console.log('casagrand-campaign-report smoke passed');
})();
