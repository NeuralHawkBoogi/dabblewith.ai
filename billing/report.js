'use strict';

const fs = require('fs');
const path = require('path');
const { readLedger, sanitizeId, summarizeLedger } = require('./meter');

function listLedgerFiles(storageDir, month) {
  if (!fs.existsSync(storageDir)) return [];
  return fs
    .readdirSync(storageDir)
    .filter((name) => name.endsWith(`--${month}.json`))
    .sort()
    .map((name) => path.join(storageDir, name));
}

function loadMonthlyLedgers(storageDir, month) {
  return listLedgerFiles(storageDir, month).map((file) => {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return readLedger(storageDir, parsed.communityId, month, parsed.planId, parsed.planOverrides || {});
  });
}

function buildMonthlyReport(storageDir, month, options = {}) {
  const ledgers = loadMonthlyLedgers(storageDir, month);
  const communities = ledgers.map((ledger) => ({
    summary: summarizeLedger(ledger),
    recentRecords: summarizeRecentRecords(ledger.records || [], options.recentLimit || 5),
  }));

  const totals = communities.reduce(
    (acc, item) => {
      const summary = item.summary;
      acc.communities += 1;
      acc.billableAiConversations += summary.counters.billableAiConversations || 0;
      acc.overageAiConversations += summary.overageAiConversations || 0;
      acc.revenueInr += summary.revenueInr.monthlyFee + summary.revenueInr.overage + summary.revenueInr.whatsappPassThrough;
      acc.costsInr += summary.costsInr.model + summary.costsInr.whatsapp + summary.costsInr.platform;
      if (summary.marginStatus !== 'healthy') acc.watchCommunities += 1;
      return acc;
    },
    { communities: 0, billableAiConversations: 0, overageAiConversations: 0, revenueInr: 0, costsInr: 0, watchCommunities: 0 },
  );
  totals.grossMarginInr = totals.revenueInr - totals.costsInr;
  totals.grossMarginPct = totals.revenueInr > 0 ? (totals.grossMarginInr / totals.revenueInr) * 100 : 0;

  return {
    month,
    generatedAt: new Date().toISOString(),
    totals: roundTotals(totals),
    communities,
  };
}

function summarizeRecentRecords(records, limit) {
  return records
    .slice(-limit)
    .reverse()
    .map((record) => ({
      occurredAt: record.occurredAt,
      unit: record.unit,
      billable: Boolean(record.billable),
      direction: record.direction || 'unknown',
      modelTier: record.modelTier || null,
      taskClass: record.taskClass || null,
      estimatedTokens: Number(record.estimatedTokens || 0),
      costsInr: record.costsInr || { model: 0, whatsapp: 0, platform: 0 },
      whatsappCategory: record.whatsappCategory || null,
      externalRefHash: record.externalRefHash || null,
    }));
}

function roundTotals(totals) {
  return {
    ...totals,
    revenueInr: Number(totals.revenueInr.toFixed(4)),
    costsInr: Number(totals.costsInr.toFixed(4)),
    grossMarginInr: Number(totals.grossMarginInr.toFixed(4)),
    grossMarginPct: Number(totals.grossMarginPct.toFixed(2)),
  };
}

function formatInr(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function renderMonthlyReportMarkdown(report) {
  const lines = [];
  lines.push(`# Community Bot Billing Report — ${report.month}`);
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Portfolio Summary');
  lines.push(`- Communities: ${report.totals.communities}`);
  lines.push(`- Billable AI conversations: ${report.totals.billableAiConversations}`);
  lines.push(`- Overage AI conversations: ${report.totals.overageAiConversations}`);
  lines.push(`- Estimated recurring revenue: ${formatInr(report.totals.revenueInr)}`);
  lines.push(`- Estimated costs: ${formatInr(report.totals.costsInr)}`);
  lines.push(`- Estimated gross margin: ${formatInr(report.totals.grossMarginInr)} (${report.totals.grossMarginPct}%)`);
  lines.push(`- Communities needing margin review: ${report.totals.watchCommunities}`);
  lines.push('');

  if (report.communities.length === 0) {
    lines.push('No billing usage ledgers found for this month.');
    return `${lines.join('\n')}\n`;
  }

  for (const item of report.communities) {
    const summary = item.summary;
    const recurringRevenue = summary.revenueInr.monthlyFee + summary.revenueInr.overage + summary.revenueInr.whatsappPassThrough;
    const totalCost = summary.costsInr.model + summary.costsInr.whatsapp + summary.costsInr.platform;
    lines.push(`## ${summary.communityId}`);
    lines.push(`- Plan: ${summary.plan.id} (${formatInr(summary.plan.monthlyFeeInr)}/mo, ${summary.plan.includedAiConversations} included AI conversations)`);
    lines.push(`- AI conversations: ${summary.counters.billableAiConversations} billable / ${summary.overageAiConversations} overage`);
    lines.push(`- Revenue estimate: ${formatInr(recurringRevenue)} (monthly ${formatInr(summary.revenueInr.monthlyFee)}, overage ${formatInr(summary.revenueInr.overage)}, WhatsApp pass-through ${formatInr(summary.revenueInr.whatsappPassThrough)})`);
    lines.push(`- Cost estimate: ${formatInr(totalCost)} (model ${formatInr(summary.costsInr.model)}, WhatsApp ${formatInr(summary.costsInr.whatsapp)}, platform ${formatInr(summary.costsInr.platform)})`);
    lines.push(`- Gross margin: ${formatInr(summary.grossMarginInr)} (${summary.grossMarginPct}%) — ${summary.marginStatus}`);
    lines.push(`- Non-billable events: ${summary.counters.nonBillableEvents}`);
    if (item.recentRecords.length > 0) {
      lines.push('- Recent metered events:');
      for (const record of item.recentRecords) {
        lines.push(`  - ${record.occurredAt}: ${record.unit} ${record.billable ? 'billable' : 'non-billable'} ${record.direction}, tier=${record.modelTier || 'n/a'}, task=${record.taskClass || 'n/a'}, ref=${record.externalRefHash || 'n/a'}`);
      }
    }
    lines.push('');
  }

  lines.push('Notes: external message IDs are hashed; raw WhatsApp text, phone numbers, and tokens are intentionally excluded.');
  return `${lines.join('\n')}\n`;
}

function writeMonthlyReport(storageDir, month, outputPath, options = {}) {
  const report = buildMonthlyReport(storageDir, month, options);
  const format = options.format || (outputPath.endsWith('.json') ? 'json' : 'md');
  const content = format === 'json' ? `${JSON.stringify(report, null, 2)}\n` : renderMonthlyReportMarkdown(report);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true, mode: 0o700 });
  fs.writeFileSync(outputPath, content, { mode: 0o600 });
  return { report, outputPath, format };
}

if (require.main === module) {
  const [, , storageDir, month, outputPath] = process.argv;
  if (!storageDir || !month || !outputPath) {
    console.error('Usage: node billing/report.js <storageDir> <YYYY-MM> <output.md|output.json>');
    process.exit(1);
  }
  const result = writeMonthlyReport(storageDir, sanitizeId(month), outputPath);
  console.log(`billing report written: ${result.outputPath}`);
}

module.exports = {
  buildMonthlyReport,
  listLedgerFiles,
  loadMonthlyLedgers,
  renderMonthlyReportMarkdown,
  writeMonthlyReport,
};
