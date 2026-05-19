'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getPlan, usageUnit } = require('./plans');

const DEFAULT_WHATSAPP_COST_INR = Object.freeze({
  service: 0.35,
  utility: 0.75,
  marketing: 1.25,
  authentication: 0.75,
  unknown: 0.35,
});

const DEFAULT_USD_TO_INR = 85;

function sanitizeId(value, fallback = 'default') {
  const cleaned = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return cleaned || fallback;
}

function monthKey(date = new Date()) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) throw new Error('Invalid date');
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function recordPath(storageDir, communityId, month = monthKey()) {
  return path.join(storageDir, `${sanitizeId(communityId)}--${month}.json`);
}

function hashText(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
}

function blankLedger(communityId, month, planId = 'starter', planOverrides = {}) {
  return {
    communityId: sanitizeId(communityId),
    month,
    planId,
    planOverrides,
    counters: {
      aiConversations: 0,
      adminReports: 0,
      broadcasts: 0,
      onboardingWorkflows: 0,
      whatsappPassThroughEvents: 0,
      nonBillableEvents: 0,
    },
    costsInr: {
      model: 0,
      whatsapp: 0,
      platform: 0,
    },
    revenueInr: {
      monthlyFee: 0,
      overage: 0,
      whatsappPassThrough: 0,
      setupFee: 0,
    },
    records: [],
    updatedAt: null,
  };
}

function readLedger(storageDir, communityId, month = monthKey(), planId = 'starter', planOverrides = {}) {
  const file = recordPath(storageDir, communityId, month);
  if (!fs.existsSync(file)) return blankLedger(communityId, month, planId, planOverrides);
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  return {
    ...blankLedger(communityId, month, parsed.planId || planId, parsed.planOverrides || planOverrides),
    ...parsed,
    communityId: sanitizeId(parsed.communityId || communityId),
  };
}

function writeLedger(storageDir, ledger) {
  ensureDir(storageDir);
  const file = recordPath(storageDir, ledger.communityId, ledger.month);
  fs.writeFileSync(file, `${JSON.stringify(ledger, null, 2)}\n`, { mode: 0o600 });
  return file;
}

function classifyBillable(unit, explicitBillable) {
  if (typeof explicitBillable === 'boolean') return explicitBillable;
  const meta = usageUnit(unit);
  return meta ? meta.billable : false;
}

function estimateWhatsAppCostInr(category) {
  return DEFAULT_WHATSAPP_COST_INR[String(category || 'unknown').toLowerCase()] || DEFAULT_WHATSAPP_COST_INR.unknown;
}

function appendUsageRecord(storageDir, input) {
  const now = input.occurredAt ? new Date(input.occurredAt) : new Date();
  const month = input.month || monthKey(now);
  const communityId = sanitizeId(input.communityId, 'community');
  const planId = input.planId || 'starter';
  const planOverrides = input.planOverrides || {};
  const ledger = readLedger(storageDir, communityId, month, planId, planOverrides);
  ledger.planId = planId;
  ledger.planOverrides = planOverrides;

  const unit = input.unit || 'ai_conversation';
  const meta = usageUnit(unit);
  const billable = classifyBillable(unit, input.billable);
  const counter = meta ? meta.counter : 'nonBillableEvents';
  ledger.counters[counter] = (ledger.counters[counter] || 0) + 1;
  if (!billable) ledger.counters.nonBillableEvents += 1;

  const modelCostInr = estimateModelCostInr(input);
  const whatsappCategory = input.whatsappCategory || input.whatsapp?.category || null;
  const whatsappCostInr = coerceMoney(input.whatsappCostInr ?? (whatsappCategory ? estimateWhatsAppCostInr(whatsappCategory) : 0));
  const platformCostInr = coerceMoney(input.platformCostInr || 0);
  ledger.costsInr.model += modelCostInr;
  ledger.costsInr.whatsapp += whatsappCostInr;
  ledger.costsInr.platform += platformCostInr;

  const record = {
    id: `${now.toISOString()}-${hashText(`${communityId}:${unit}:${ledger.records.length}`)}`,
    occurredAt: now.toISOString(),
    unit,
    billable,
    direction: input.direction || 'unknown',
    source: input.source || 'runtime',
    modelTier: input.router?.modelTier || input.modelTier || null,
    taskClass: input.router?.taskClass || input.taskClass || null,
    estimatedTokens: estimateTokens(input),
    costsInr: { model: modelCostInr, whatsapp: whatsappCostInr, platform: platformCostInr },
    whatsappCategory,
    externalRefHash: input.externalRef ? hashText(input.externalRef) : null,
  };
  ledger.records.push(record);
  ledger.updatedAt = now.toISOString();

  recomputeRevenue(ledger);
  writeLedger(storageDir, ledger);
  return { ledger, record, summary: summarizeLedger(ledger) };
}

function estimateTokens(input) {
  const candidate = input.router?.estimatedTokens ?? input.estimatedTokens ?? 0;
  if (typeof candidate === 'number') return Number.isFinite(candidate) ? candidate : 0;
  if (candidate && typeof candidate === 'object') {
    const total = Number(candidate.total ?? 0);
    if (Number.isFinite(total)) return total;
    const inputTokens = Number(candidate.input ?? 0);
    const outputTokens = Number(candidate.output ?? 0);
    return Number.isFinite(inputTokens + outputTokens) ? inputTokens + outputTokens : 0;
  }
  const parsed = Number(candidate || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function coerceMoney(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function estimateModelCostInr(input) {
  if (input.modelCostInr !== undefined) return coerceMoney(input.modelCostInr);
  if (input.router?.costEstimateInr !== undefined) return coerceMoney(input.router.costEstimateInr);
  if (input.router?.estimatedCostInr !== undefined) return coerceMoney(input.router.estimatedCostInr);
  if (input.router?.estimatedCostUsd !== undefined) return coerceMoney(input.router.estimatedCostUsd) * DEFAULT_USD_TO_INR;
  return 0;
}

function recomputeRevenue(ledger) {
  const plan = getPlan(ledger.planId, ledger.planOverrides);
  const aiBillable = ledger.records.filter((record) => record.unit === 'ai_conversation' && record.billable).length;
  const overageCount = Math.max(0, aiBillable - plan.includedAiConversations);
  ledger.revenueInr.monthlyFee = Number(plan.monthlyFeeInr || 0);
  ledger.revenueInr.overage = overageCount * Number(plan.overagePerAiConversationInr || 0);
  ledger.revenueInr.whatsappPassThrough = plan.whatsappPassThrough ? Number(ledger.costsInr.whatsapp.toFixed(4)) : 0;
  ledger.revenueInr.setupFee = ledger.revenueInr.setupFee || 0;
  return ledger;
}

function summarizeLedger(ledger) {
  recomputeRevenue(ledger);
  const plan = getPlan(ledger.planId, ledger.planOverrides);
  const totalCost = ledger.costsInr.model + ledger.costsInr.whatsapp + ledger.costsInr.platform;
  const recurringRevenue = ledger.revenueInr.monthlyFee + ledger.revenueInr.overage + ledger.revenueInr.whatsappPassThrough;
  const grossMarginInr = recurringRevenue - totalCost;
  const grossMarginPct = recurringRevenue > 0 ? (grossMarginInr / recurringRevenue) * 100 : 0;
  const aiBillable = ledger.records.filter((record) => record.unit === 'ai_conversation' && record.billable).length;
  return {
    communityId: ledger.communityId,
    month: ledger.month,
    plan: {
      id: plan.id,
      monthlyFeeInr: plan.monthlyFeeInr,
      includedAiConversations: plan.includedAiConversations,
      overagePerAiConversationInr: plan.overagePerAiConversationInr,
      whatsappPassThrough: plan.whatsappPassThrough,
    },
    counters: { ...ledger.counters, billableAiConversations: aiBillable },
    overageAiConversations: Math.max(0, aiBillable - plan.includedAiConversations),
    costsInr: roundMoneyObject(ledger.costsInr),
    revenueInr: roundMoneyObject(ledger.revenueInr),
    grossMarginInr: Number(grossMarginInr.toFixed(4)),
    grossMarginPct: Number(grossMarginPct.toFixed(2)),
    targetGrossMarginPct: plan.targetGrossMarginPct,
    marginStatus: grossMarginPct >= plan.targetGrossMarginPct ? 'healthy' : 'watch',
  };
}

function roundMoneyObject(obj) {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, Number(Number(value || 0).toFixed(4))]));
}

function summarizeMonth(storageDir, communityId, month = monthKey()) {
  return summarizeLedger(readLedger(storageDir, communityId, month));
}

module.exports = {
  appendUsageRecord,
  estimateWhatsAppCostInr,
  monthKey,
  readLedger,
  recordPath,
  sanitizeId,
  summarizeLedger,
  summarizeMonth,
};
