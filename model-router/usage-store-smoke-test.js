'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  loadUsage,
  routeAndRecord,
  safeCommunityId,
  usagePath
} = require('./usage-store');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dabble-router-usage-'));
const communityId = 'Chennai AI Builders / Main';
const dayOne = new Date('2026-05-19T10:00:00.000Z');

assert.equal(safeCommunityId(communityId), 'chennai-ai-builders-main');

const first = routeAndRecord(dir, {
  communityId,
  plan: 'free',
  budget: { dailyTokens: 1234 },
  message: 'When is the next session?',
  context: 'Sessions happen Saturday mornings.'
}, { now: dayOne });

assert.equal(first.routed.taskClass, 'faq');
assert.equal(first.usage.communityId, 'chennai-ai-builders-main');
assert.equal(first.usage.plan, 'free');
assert.equal(first.usage.logs.length, 1);
assert.equal(first.usage.budget.dailyTokens, 1234);
assert.ok(first.usage.usedDailyTokens > 0);
assert.ok(first.usage.usedMonthlyTokens > 0);
assert.ok(first.logEntry.contextHash);
assert.equal(first.logEntry.fallbackReason, null);

const persisted = JSON.parse(fs.readFileSync(usagePath(dir, communityId), 'utf8'));
assert.equal(persisted.logs.length, 1);
assert.equal(JSON.stringify(persisted).includes('When is the next session?'), false, 'raw user messages must not be persisted in router logs');
assert.equal(JSON.stringify(persisted).includes('Sessions happen'), false, 'raw context must not be persisted in router logs');

persisted.budget.dailyTokens = persisted.usedDailyTokens + 1;
fs.writeFileSync(usagePath(dir, communityId), `${JSON.stringify(persisted, null, 2)}\n`);

const budgeted = routeAndRecord(dir, {
  communityId,
  message: 'Please summarize the whole community discussion today',
  estimatedOutputTokens: 200
}, { now: dayOne });
assert.equal(budgeted.routed.modelTier, 'local_rules');
assert.equal(budgeted.routed.allowModelCall, false);
assert.equal(budgeted.routed.log.fallbackReason, 'daily_budget_exceeded');
assert.equal(budgeted.usage.logs.length, 2);

const nextDay = loadUsage(dir, communityId, { now: new Date('2026-05-20T01:00:00.000Z') });
assert.equal(nextDay.usedDailyTokens, 0);
assert.ok(nextDay.usedMonthlyTokens > 0);
assert.equal(nextDay.logs.length, 2);

const nextMonth = loadUsage(dir, communityId, { now: new Date('2026-06-01T01:00:00.000Z') });
assert.equal(nextMonth.usedDailyTokens, 0);
assert.equal(nextMonth.usedMonthlyTokens, 0);

fs.rmSync(dir, { recursive: true, force: true });
console.log('model-router usage-store smoke test passed');
