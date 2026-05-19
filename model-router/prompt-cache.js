'use strict';

const crypto = require('crypto');

const PROVIDER_CACHE_POLICIES = {
  openai: {
    supported: true,
    strategy: 'prompt_cache_key',
    ttlSeconds: 24 * 60 * 60,
  },
  anthropic: {
    supported: true,
    strategy: 'cache_control_ephemeral',
    ttlSeconds: 5 * 60,
  },
  google: {
    supported: true,
    strategy: 'cached_content_key',
    ttlSeconds: 60 * 60,
  },
  local: {
    supported: false,
    strategy: 'none',
    ttlSeconds: 0,
  },
};

function normalizeProvider(value) {
  const provider = String(value || '').trim().toLowerCase();
  if (/openai|gpt/.test(provider)) return 'openai';
  if (/anthropic|claude/.test(provider)) return 'anthropic';
  if (/google|gemini|vertex/.test(provider)) return 'google';
  if (/local|rules|slm/.test(provider)) return 'local';
  return provider || 'unknown';
}

function stableHash(value, length = 20) {
  const text = String(value || '');
  if (!text) return null;
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, length);
}

function buildStaticCacheSeed(input = {}) {
  return [
    `community:${input.communityId || 'default'}`,
    `profile:${input.communityProfileVersion || input.profileVersion || 'v1'}`,
    `system:${input.systemPromptVersion || 'v1'}`,
    `task:${input.taskClass || 'auto'}`,
    `context:${stableHash(input.context || '', 32) || 'empty'}`,
  ].join('|');
}

function buildPromptCacheMetadata(input = {}) {
  const provider = normalizeProvider(input.provider || input.modelProvider || input.modelTier);
  const policy = PROVIDER_CACHE_POLICIES[provider] || {
    supported: false,
    strategy: 'none',
    ttlSeconds: 0,
  };
  const staticContextHash = stableHash(input.context || '', 16);
  const seed = buildStaticCacheSeed(input);
  const cacheKey = policy.supported ? `dw:${stableHash(seed, 24)}` : null;

  return {
    provider,
    supported: policy.supported,
    strategy: policy.strategy,
    ttlSeconds: policy.ttlSeconds,
    cacheKey,
    staticContextHash,
  };
}

module.exports = {
  PROVIDER_CACHE_POLICIES,
  normalizeProvider,
  stableHash,
  buildStaticCacheSeed,
  buildPromptCacheMetadata,
};
