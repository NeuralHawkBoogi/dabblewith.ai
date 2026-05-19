'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  isCommunityBotSetupIntent,
  leadInputFromWhatsApp,
  recordWhatsAppLeadIntent,
} = require('./whatsapp-intake');
const { listLeads, buildValidationReport } = require('./leads');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dabble-market-wa-intake-'));

assert.strictEqual(isCommunityBotSetupIntent('I want to setup a similar community bot'), true);
assert.strictEqual(isCommunityBotSetupIntent('Need an AI host for my founder group with 250 members'), true);
assert.strictEqual(isCommunityBotSetupIntent('What time is the next session?'), false);

const input = leadInputFromWhatsApp({
  from: '+91 98765 43210',
  profileName: 'Ravi Founder',
  body: 'I want to setup a similar community bot for Chennai AI Builders with 1200 members. We need FAQ, registrations, event reminders this week. Budget maybe growth 14999. Email ravi@example.com token=secret-value',
});
assert.strictEqual(input.communityName, 'Chennai AI Builders');
assert.ok(input.audienceSize.includes('1200'));
assert.ok(input.painPoints.includes('member FAQ load'));
assert.ok(input.painPoints.includes('registration capture'));
assert.ok(input.budgetRange.includes('growth'));
assert.ok(input.urgency.includes('immediate'));
assert.strictEqual(JSON.stringify(input).includes('+91 98765'), false);
assert.strictEqual(JSON.stringify(input).includes('ravi@example.com'), false);
assert.strictEqual(JSON.stringify(input).includes('secret-value'), false);

const skipped = recordWhatsAppLeadIntent(dir, {
  from: '+91 11111 11111',
  body: 'Tell me about the next dabble session',
});
assert.deepStrictEqual(skipped, { recorded: false, reason: 'no_setup_intent' });

const recorded = recordWhatsAppLeadIntent(dir, {
  from: '+91 98765 43210',
  profileName: 'Ravi Founder',
  body: 'I want to setup a similar community bot for Chennai AI Builders with 1200 members. We need FAQ, registrations, event reminders this week. Budget maybe growth 14999. Email ravi@example.com token=secret-value',
  source: 'WhatsApp wa.me CTA',
});
assert.strictEqual(recorded.recorded, true);
assert.ok(recorded.lead.score.qualified);

const leads = listLeads(dir);
assert.strictEqual(leads.length, 1);
assert.strictEqual(leads[0].fields.communityName, 'Chennai AI Builders');
assert.strictEqual(leads[0].source, 'WhatsApp wa.me CTA');

const persisted = fs.readFileSync(path.join(dir, `${leads[0].id}.json`), 'utf8');
assert.strictEqual(persisted.includes('+91 98765'), false);
assert.strictEqual(persisted.includes('ravi@example.com'), false);
assert.strictEqual(persisted.includes('secret-value'), false);
assert.ok(persisted.includes('externalRefHash'));

const report = buildValidationReport(dir);
assert.strictEqual(report.totals.leads, 1);
assert.strictEqual(report.totals.qualified, 1);
assert.strictEqual(JSON.stringify(report).includes('98765'), false);
assert.strictEqual(JSON.stringify(report).includes('ravi@example.com'), false);

console.log('market-validation WhatsApp intake smoke test passed');
