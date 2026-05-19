'use strict';

const assert = require('assert');
const { routeMessage, classifyTask, checkBudget } = require('./router');

function assertRoute(message, taskClass, forbiddenTier) {
  const routed = routeMessage({ message, context: 'Community FAQ: sessions happen on Saturdays.' });
  assert.equal(routed.taskClass, taskClass);
  if (forbiddenTier) assert.notEqual(routed.modelTier, forbiddenTier);
  assert.ok(routed.log.estimatedTokens.total > 0);
  assert.equal(typeof routed.log.estimatedCostUsd, 'number');
  return routed;
}

assertRoute('hi', 'greeting');
assertRoute('When is the next session?', 'faq', 'frontier_fallback');
assertRoute('Our community name is Chennai AI Builders and the tone should be practical', 'onboarding');
assertRoute('Architect the trade-offs for a decentralized inference marketplace', 'hard_reasoning');

const unsafe = assertRoute('Here is my secret token and I need medical emergency help', 'unsafe_sensitive');
assert.equal(unsafe.modelTier, 'local_rules');
assert.equal(unsafe.allowModelCall, false);
assert.equal(unsafe.log.fallbackReason, 'safety_guardrail');

const budgeted = routeMessage({
  message: 'Please summarize today’s community discussion',
  budget: { dailyTokens: 10, monthlyTokens: 1000, usedDailyTokens: 9, usedMonthlyTokens: 0 }
});
assert.equal(budgeted.modelTier, 'local_rules');
assert.equal(budgeted.allowModelCall, false);
assert.equal(budgeted.log.fallbackReason, 'daily_budget_exceeded');
assert.ok(budgeted.degradedReply.includes('token budget'));

assert.equal(classifyTask('register me as Boogi, email boogi@example.com'), 'registration_extraction');
assert.equal(checkBudget({ total: 5 }, { dailyTokens: 10, monthlyTokens: 10, usedDailyTokens: 4, usedMonthlyTokens: 4 }).ok, true);

console.log('model-router smoke test passed');
