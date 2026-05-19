'use strict';

const DEFAULT_PLANS = Object.freeze({
  pilot: Object.freeze({
    id: 'pilot',
    name: 'Pilot setup',
    setupFeeInr: 15000,
    monthlyFeeInr: 0,
    includedAiConversations: 100,
    overagePerAiConversationInr: 12,
    whatsappPassThrough: true,
    targetGrossMarginPct: 60,
  }),
  starter: Object.freeze({
    id: 'starter',
    name: 'Starter',
    setupFeeInr: 25000,
    monthlyFeeInr: 4999,
    includedAiConversations: 500,
    overagePerAiConversationInr: 10,
    whatsappPassThrough: true,
    targetGrossMarginPct: 65,
  }),
  growth: Object.freeze({
    id: 'growth',
    name: 'Growth',
    setupFeeInr: 50000,
    monthlyFeeInr: 14999,
    includedAiConversations: 2500,
    overagePerAiConversationInr: 8,
    whatsappPassThrough: true,
    targetGrossMarginPct: 70,
  }),
  pro: Object.freeze({
    id: 'pro',
    name: 'Pro',
    setupFeeInr: 100000,
    monthlyFeeInr: 39999,
    includedAiConversations: 10000,
    overagePerAiConversationInr: 6,
    whatsappPassThrough: true,
    targetGrossMarginPct: 75,
  }),
});

const USAGE_UNITS = Object.freeze({
  ai_conversation: Object.freeze({ billable: true, counter: 'aiConversations' }),
  admin_report: Object.freeze({ billable: false, counter: 'adminReports' }),
  broadcast: Object.freeze({ billable: true, counter: 'broadcasts' }),
  onboarding_workflow: Object.freeze({ billable: false, counter: 'onboardingWorkflows' }),
  whatsapp_pass_through: Object.freeze({ billable: true, counter: 'whatsappPassThroughEvents' }),
});

function getPlan(planId = 'starter', overrides = {}) {
  const base = DEFAULT_PLANS[planId] || DEFAULT_PLANS.starter;
  return Object.freeze({ ...base, ...overrides, id: overrides.id || base.id });
}

function listPlans() {
  return Object.values(DEFAULT_PLANS).map((plan) => ({ ...plan }));
}

function usageUnit(unit) {
  return USAGE_UNITS[unit] || null;
}

module.exports = { DEFAULT_PLANS, USAGE_UNITS, getPlan, listPlans, usageUnit };
