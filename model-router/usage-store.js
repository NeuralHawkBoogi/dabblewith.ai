'use strict';

const fs = require('fs');
const path = require('path');
const { routeMessage } = require('./router');

const DEFAULT_PLAN_BUDGETS = {
  free: { dailyTokens: 5_000, monthlyTokens: 75_000 },
  starter: { dailyTokens: 25_000, monthlyTokens: 500_000 },
  growth: { dailyTokens: 100_000, monthlyTokens: 2_500_000 }
};

function safeCommunityId(value) {
  return String(value || 'default')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'default';
}

function ymd(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function ym(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

function usagePath(storageDir, communityId) {
  return path.join(storageDir, `${safeCommunityId(communityId)}.json`);
}

function defaultUsage(communityId, plan = 'starter', now = new Date()) {
  const budget = DEFAULT_PLAN_BUDGETS[plan] || DEFAULT_PLAN_BUDGETS.starter;
  return {
    communityId: safeCommunityId(communityId),
    plan,
    budget: { ...budget },
    currentDay: ymd(now),
    currentMonth: ym(now),
    usedDailyTokens: 0,
    usedMonthlyTokens: 0,
    usedDailyCostUsd: 0,
    usedMonthlyCostUsd: 0,
    logs: []
  };
}

function loadUsage(storageDir, communityId, opts = {}) {
  const now = opts.now || new Date();
  const plan = opts.plan || 'starter';
  const file = usagePath(storageDir, communityId);
  let usage = defaultUsage(communityId, plan, now);

  if (fs.existsSync(file)) {
    usage = { ...usage, ...JSON.parse(fs.readFileSync(file, 'utf8')) };
    usage.communityId = safeCommunityId(usage.communityId || communityId);
    usage.budget = { ...(DEFAULT_PLAN_BUDGETS[usage.plan] || DEFAULT_PLAN_BUDGETS.starter), ...(usage.budget || {}) };
    usage.logs = Array.isArray(usage.logs) ? usage.logs : [];
  }

  if (usage.currentDay !== ymd(now)) {
    usage.currentDay = ymd(now);
    usage.usedDailyTokens = 0;
    usage.usedDailyCostUsd = 0;
  }

  if (usage.currentMonth !== ym(now)) {
    usage.currentMonth = ym(now);
    usage.usedMonthlyTokens = 0;
    usage.usedMonthlyCostUsd = 0;
  }

  return usage;
}

function saveUsage(storageDir, usage) {
  fs.mkdirSync(storageDir, { recursive: true });
  fs.writeFileSync(usagePath(storageDir, usage.communityId), `${JSON.stringify(usage, null, 2)}\n`);
  return usage;
}

function budgetForRouting(usage) {
  return {
    dailyTokens: usage.budget.dailyTokens,
    monthlyTokens: usage.budget.monthlyTokens,
    usedDailyTokens: usage.usedDailyTokens,
    usedMonthlyTokens: usage.usedMonthlyTokens
  };
}

function appendRoutingLog(usage, routed, opts = {}) {
  const now = opts.now || new Date();
  const log = {
    at: now.toISOString(),
    taskClass: routed.log.taskClass,
    modelTier: routed.log.modelTier,
    estimatedTokens: routed.log.estimatedTokens,
    estimatedCostUsd: routed.log.estimatedCostUsd,
    fallbackReason: routed.log.fallbackReason,
    contextHash: routed.log.contextHash,
    budgetStatus: routed.log.budgetStatus
  };

  usage.usedDailyTokens += routed.log.estimatedTokens.total;
  usage.usedMonthlyTokens += routed.log.estimatedTokens.total;
  usage.usedDailyCostUsd = Number((usage.usedDailyCostUsd + routed.log.estimatedCostUsd).toFixed(8));
  usage.usedMonthlyCostUsd = Number((usage.usedMonthlyCostUsd + routed.log.estimatedCostUsd).toFixed(8));
  usage.logs.push(log);

  const maxLogs = opts.maxLogs || 500;
  if (usage.logs.length > maxLogs) usage.logs = usage.logs.slice(-maxLogs);
  return log;
}

function routeAndRecord(storageDir, input = {}, opts = {}) {
  const now = opts.now || new Date();
  const communityId = safeCommunityId(input.communityId || 'default');
  const usage = loadUsage(storageDir, communityId, { now, plan: input.plan });
  if (input.budget) usage.budget = { ...usage.budget, ...input.budget };
  const routed = routeMessage({ ...input, budget: budgetForRouting(usage) });
  const logEntry = appendRoutingLog(usage, routed, { now, maxLogs: opts.maxLogs });
  saveUsage(storageDir, usage);
  return { routed, usage, logEntry };
}

module.exports = {
  DEFAULT_PLAN_BUDGETS,
  safeCommunityId,
  usagePath,
  loadUsage,
  saveUsage,
  routeAndRecord
};
