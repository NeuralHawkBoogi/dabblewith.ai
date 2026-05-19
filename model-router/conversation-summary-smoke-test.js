'use strict';

const assert = require('assert');
const {
  redactSensitive,
  summarizeConversation,
  buildRoutingContext
} = require('./conversation-summary');
const { routeMessage } = require('./router');

assert.equal(redactSensitive('Email boogi@example.com and call +91 98403 82585'), 'Email [email] and call [phone]');
assert.equal(redactSensitive('token sk-testtesttesttesttest'), 'token [secret]');

const conversation = [
  { role: 'user', text: 'My email is founder@example.com and community name is Chennai AI Builders' },
  { role: 'assistant', text: 'Nice. Who is it for?' },
  { role: 'user', text: 'Founders and builders in Chennai' },
  { role: 'assistant', text: 'What tone should I use?' },
  { role: 'user', text: 'Practical, warm, no hype' },
  { role: 'assistant', text: 'What are the rules?' },
  { role: 'user', text: 'No spam, no credential sharing, help each other' },
  { role: 'assistant', text: 'Any links?' },
  { role: 'user', text: 'Website is https://dabblewith.ai and phone +919840382585' }
];

const summary = summarizeConversation(conversation, { maxRecentMessages: 3, maxSummaryChars: 80 });
assert.equal(summary.messageCount, 9);
assert.equal(summary.olderMessageCount, 6);
assert.equal(summary.recentMessageCount, 3);
assert.ok(summary.summaryHash);
assert.equal(summary.truncated, true);
assert.equal(summary.summaryText.includes('founder@example.com'), false, 'summary must redact emails');
assert.equal(summary.summaryText.includes('+919840382585'), false, 'summary must redact phones');
assert.ok(summary.summaryText.includes('Recent messages:'));

const routed = routeMessage({
  message: 'Please summarize the onboarding so far',
  context: 'Community FAQ: Saturdays at 10:30 IST.',
  conversation,
  summaryOptions: { maxRecentMessages: 3, maxSummaryChars: 80 }
});
assert.equal(routed.taskClass, 'summary');
assert.equal(routed.allowModelCall, true);
assert.ok(routed.log.contextHash, 'effective context should be hashed for prompt-cache/log correlation');
assert.equal(routed.log.conversationSummary.messageCount, 9);
assert.equal(routed.log.conversationSummary.olderMessageCount, 6);
assert.equal(routed.log.conversationSummary.recentMessageCount, 3);
assert.equal(routed.log.conversationSummary.summaryHash, summary.summaryHash);

const context = buildRoutingContext({ context: 'Static context', conversation }, { maxRecentMessages: 2 });
assert.ok(context.context.includes('Community context:'));
assert.ok(context.context.includes('Conversation summary:'));
assert.equal(context.context.includes('founder@example.com'), false);

console.log('model-router conversation-summary smoke test passed');
