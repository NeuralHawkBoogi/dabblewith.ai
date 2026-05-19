'use strict';

const assert = require('assert');
const os = require('os');
const fs = require('fs');
const path = require('path');
const {
  normalizeProvider,
  buildPromptCacheMetadata,
} = require('./prompt-cache');
const { routeMessage } = require('./router');
const { routeAndRecord } = require('./usage-store');

assert.strictEqual(normalizeProvider('gpt-4.1-mini'), 'openai');
assert.strictEqual(normalizeProvider('Claude Haiku'), 'anthropic');
assert.strictEqual(normalizeProvider('gemini-flash'), 'google');
assert.strictEqual(normalizeProvider('local_rules'), 'local');

const context = 'Community: Dabblewith.ai\nRules: be practical, kind, and concise.';
const openaiCache = buildPromptCacheMetadata({
  provider: 'openai',
  communityId: 'dabblewith-ai',
  communityProfileVersion: 3,
  systemPromptVersion: 'host-v2',
  taskClass: 'faq',
  context,
});
assert.strictEqual(openaiCache.supported, true);
assert.strictEqual(openaiCache.strategy, 'prompt_cache_key');
assert.ok(/^dw:[a-f0-9]{24}$/.test(openaiCache.cacheKey));
assert.ok(!openaiCache.cacheKey.includes('Dabblewith'));
assert.ok(openaiCache.staticContextHash);

const openaiCacheAgain = buildPromptCacheMetadata({
  provider: 'gpt-4.1-mini',
  communityId: 'dabblewith-ai',
  communityProfileVersion: 3,
  systemPromptVersion: 'host-v2',
  taskClass: 'faq',
  context,
});
assert.strictEqual(openaiCache.cacheKey, openaiCacheAgain.cacheKey, 'same static inputs should produce stable cache key');

const changedProfile = buildPromptCacheMetadata({
  provider: 'openai',
  communityId: 'dabblewith-ai',
  communityProfileVersion: 4,
  systemPromptVersion: 'host-v2',
  taskClass: 'faq',
  context,
});
assert.notStrictEqual(openaiCache.cacheKey, changedProfile.cacheKey, 'profile revisions must bust cache key');

const anthropicCache = buildPromptCacheMetadata({ provider: 'anthropic', context });
assert.strictEqual(anthropicCache.strategy, 'cache_control_ephemeral');
assert.strictEqual(anthropicCache.ttlSeconds, 300);

const localCache = buildPromptCacheMetadata({ provider: 'local', context });
assert.strictEqual(localCache.supported, false);
assert.strictEqual(localCache.cacheKey, null);

const routed = routeMessage({
  communityId: 'dabblewith-ai',
  provider: 'openai',
  message: 'What is the next community session?',
  context,
});
assert.strictEqual(routed.log.promptCache.provider, 'openai');
assert.strictEqual(routed.log.promptCache.supported, true);
assert.ok(routed.log.promptCache.cacheKey);
assert.ok(!JSON.stringify(routed.log.promptCache).includes('Rules:'));

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-router-cache-'));
const recorded = routeAndRecord(dir, {
  communityId: 'dabblewith-ai',
  provider: 'google',
  message: 'How do I join?',
  context,
});
assert.strictEqual(recorded.logEntry.promptCache.provider, 'google');
assert.strictEqual(recorded.logEntry.promptCache.strategy, 'cached_content_key');
assert.ok(recorded.logEntry.promptCache.cacheKey);
assert.ok(!JSON.stringify(recorded.usage.logs).includes('be practical'));

console.log('prompt-cache smoke test passed');
