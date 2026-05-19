'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  normalizeLead,
  recordLead,
  listLeads,
  buildValidationReport,
  exportReport,
} = require('./leads');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dabble-market-validation-'));

assert.throws(() => normalizeLead({ communityName: 'Only name' }), /Missing required lead fields/);

const hot = recordLead(dir, {
  communityName: 'AI Builders Chennai',
  ownerName: 'Ravi Kumar',
  audienceSize: '1200 members',
  whatsappUsage: 'Very active WhatsApp group with daily questions',
  painPoints: ['manual registrations', 'missed FAQs', 'volunteer follow-up chaos'],
  eventCadence: 'Two workshops every month',
  budgetRange: 'Growth ₹14,999/month works if it saves admin time',
  urgency: 'Launching next event this week, urgent',
  source: '/community-bot/ WhatsApp CTA',
  externalRef: '+91 98765 43210',
  notes: 'email ravi@example.com token=super-secret',
});

const warm = recordLead(dir, {
  communityName: 'Apartment Residents Forum',
  ownerName: 'Meena',
  audienceSize: '600 homes',
  whatsappUsage: 'Announcements and complaint follow-ups',
  painPoints: 'manual FAQ replies and event registrations',
  eventCadence: 'Monthly resident meetings',
  budgetRange: 'Starter 4999 per month',
  urgency: 'Pilot this quarter',
  source: 'manual admin note',
  phone: '+1 (555) 123-4567',
});

const cold = recordLead(dir, {
  communityName: 'Casual Book Club',
  ownerName: 'Anu',
  audienceSize: '45',
  whatsappUsage: 'Quiet group',
  painPoints: 'none yet',
  eventCadence: 'Quarterly',
  budgetRange: 'free trial only',
  urgency: 'maybe later',
  source: 'blog CTA',
});

assert.strictEqual(hot.fields.notes.includes('ravi@example.com'), false);
assert.strictEqual(hot.fields.notes.includes('super-secret'), false);
assert.ok(hot.score.qualified);
assert.ok(!cold.score.qualified);

const persisted = fs.readFileSync(path.join(dir, `${hot.id}.json`), 'utf8');
assert.strictEqual(persisted.includes('+91 98765'), false);
assert.strictEqual(persisted.includes('ravi@example.com'), false);
assert.strictEqual(persisted.includes('super-secret'), false);
assert.ok(persisted.includes('externalRefHash'));

const leads = listLeads(dir);
assert.strictEqual(leads.length, 3);
assert.strictEqual(leads[0].id, hot.id);
assert.ok(leads.some((lead) => lead.id === warm.id));

const report = buildValidationReport(dir);
assert.strictEqual(report.totals.leads, 3);
assert.strictEqual(report.totals.qualified, 1);
assert.strictEqual(report.totals.needsMoreInterviews, 9);
assert.strictEqual(report.totals.decision, 'keep_interviewing');
assert.ok(report.rankedSegments.length >= 2);
assert.strictEqual(report.topLeads[0].communityId, hot.communityId);
assert.strictEqual(JSON.stringify(report).includes('+1 (555)'), false);

const mdPath = path.join(dir, 'report.md');
const jsonPath = path.join(dir, 'report.json');
exportReport(dir, mdPath);
exportReport(dir, jsonPath);
const md = fs.readFileSync(mdPath, 'utf8');
const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
assert.ok(md.includes('Community Bot Market Validation Report'));
assert.ok(md.includes('AI Builders Chennai') === false, 'report should use sanitized community ids, not raw display names');
assert.strictEqual(json.totals.leads, 3);

console.log('market-validation smoke test passed');
