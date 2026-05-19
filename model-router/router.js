'use strict';

const crypto = require('crypto');

const MODEL_TIERS = {
  local_rules: { costPer1kInputUsd: 0, costPer1kOutputUsd: 0 },
  slm_local: { costPer1kInputUsd: 0.00002, costPer1kOutputUsd: 0.00004 },
  low_cost_cloud: { costPer1kInputUsd: 0.00015, costPer1kOutputUsd: 0.0006 },
  mid_tier_cloud: { costPer1kInputUsd: 0.001, costPer1kOutputUsd: 0.003 },
  frontier_fallback: { costPer1kInputUsd: 0.005, costPer1kOutputUsd: 0.015 }
};

const DEFAULT_BUDGET = {
  dailyTokens: 25_000,
  monthlyTokens: 500_000,
  usedDailyTokens: 0,
  usedMonthlyTokens: 0
};

const ROUTING_POLICY = {
  greeting: 'local_rules',
  faq: 'slm_local',
  registration_extraction: 'low_cost_cloud',
  onboarding: 'low_cost_cloud',
  summary: 'low_cost_cloud',
  escalation: 'mid_tier_cloud',
  hard_reasoning: 'mid_tier_cloud',
  unsafe_sensitive: 'local_rules'
};

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function classifyTask(message, opts = {}) {
  const text = normalizeText(message);
  const explicit = opts.taskClass && ROUTING_POLICY[opts.taskClass] ? opts.taskClass : null;
  if (explicit) return explicit;

  if (!text || /^(hi|hello|hey|gm|good morning|good evening|yo)[!.\s]*$/.test(text)) return 'greeting';
  if (/\b(suicide|self harm|harm myself|kill myself|medical emergency|legal emergency|abuse|violence|password|secret token|api key)\b/.test(text)) return 'unsafe_sensitive';
  if (/\b(escalate|human|admin|moderator|support|complaint|refund)\b/.test(text)) return 'escalation';
  if (/\b(prove|architect|strategy|complex|trade[ -]?off|deeply reason|derive|simulate|optimi[sz]e)\b/.test(text)) return 'hard_reasoning';
  if (/\b(summary|summari[sz]e|recap|digest|minutes)\b/.test(text)) return 'summary';
  if (/\b(register|signup|sign up|join|my name is|email|phone|company|linkedin)\b/.test(text)) return 'registration_extraction';
  if (/\b(onboard|community name|community is|tone|rules|topics|members|audience|whatsapp number)\b/.test(text)) return 'onboarding';
  return 'faq';
}

function estimateTokens(input = {}) {
  const message = String(input.message || '');
  const context = String(input.context || '');
  const estimatedInputTokens = Math.max(1, Math.ceil((message.length + context.length) / 4));
  const estimatedOutputTokens = input.estimatedOutputTokens || Math.min(450, Math.max(24, Math.ceil(message.length / 5)));
  return {
    input: estimatedInputTokens,
    output: estimatedOutputTokens,
    total: estimatedInputTokens + estimatedOutputTokens
  };
}

function estimateCost(modelTier, tokens) {
  const tier = MODEL_TIERS[modelTier] || MODEL_TIERS.low_cost_cloud;
  return Number((((tokens.input / 1000) * tier.costPer1kInputUsd) + ((tokens.output / 1000) * tier.costPer1kOutputUsd)).toFixed(8));
}

function checkBudget(tokens, budget = {}) {
  const merged = { ...DEFAULT_BUDGET, ...budget };
  const nextDaily = merged.usedDailyTokens + tokens.total;
  const nextMonthly = merged.usedMonthlyTokens + tokens.total;
  const dailyExceeded = nextDaily > merged.dailyTokens;
  const monthlyExceeded = nextMonthly > merged.monthlyTokens;
  return {
    ok: !dailyExceeded && !monthlyExceeded,
    dailyExceeded,
    monthlyExceeded,
    dailyRemainingTokens: Math.max(0, merged.dailyTokens - merged.usedDailyTokens),
    monthlyRemainingTokens: Math.max(0, merged.monthlyTokens - merged.usedMonthlyTokens),
    nextDailyTokens: nextDaily,
    nextMonthlyTokens: nextMonthly
  };
}

function contextHash(context) {
  if (!context) return null;
  return crypto.createHash('sha256').update(String(context)).digest('hex').slice(0, 16);
}

function routeMessage(input = {}) {
  const taskClass = classifyTask(input.message, input);
  const tokens = estimateTokens(input);
  const budgetStatus = checkBudget(tokens, input.budget);
  let modelTier = ROUTING_POLICY[taskClass] || 'low_cost_cloud';
  let fallbackReason = null;
  let degradedReply = null;

  if (!budgetStatus.ok && modelTier !== 'local_rules') {
    fallbackReason = budgetStatus.monthlyExceeded ? 'monthly_budget_exceeded' : 'daily_budget_exceeded';
    modelTier = 'local_rules';
    degradedReply = 'I can still help with basic community info, but AI replies are paused because this community has reached its token budget. Please ask an admin to raise the limit or wait for the budget reset.';
  }

  if (taskClass === 'unsafe_sensitive') {
    fallbackReason = 'safety_guardrail';
    modelTier = 'local_rules';
    degradedReply = 'I can’t handle sensitive emergencies or secrets in chat. Please contact a human admin or local emergency/support channel right away.';
  }

  return {
    taskClass,
    modelTier,
    allowModelCall: !degradedReply && modelTier !== 'local_rules',
    degradedReply,
    log: {
      taskClass,
      modelTier,
      estimatedTokens: tokens,
      estimatedCostUsd: estimateCost(modelTier, tokens),
      fallbackReason,
      budgetStatus,
      contextHash: contextHash(input.context)
    }
  };
}

module.exports = {
  MODEL_TIERS,
  ROUTING_POLICY,
  classifyTask,
  estimateTokens,
  estimateCost,
  checkBudget,
  routeMessage
};
