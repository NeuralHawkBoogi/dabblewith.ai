'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { readLedger, sanitizeId, summarizeLedger } = require('./meter');

const DEFAULT_USD_TO_INR = 85;
const CATEGORY_ALIASES = Object.freeze({
  service: 'service',
  services: 'service',
  utility: 'utility',
  utilities: 'utility',
  marketing: 'marketing',
  authentication: 'authentication',
  auth: 'authentication',
  unknown: 'unknown',
});

function hashText(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16);
}

function normalizeCategory(value) {
  const key = String(value || 'unknown').toLowerCase().trim().replace(/[^a-z]+/g, '_').replace(/^_+|_+$/g, '');
  return CATEGORY_ALIASES[key] || CATEGORY_ALIASES[key.replace(/_/g, '')] || 'unknown';
}

function parseCsv(content) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      if (row.some((value) => value.trim() !== '')) rows.push(row);
      row = [];
      cell = '';
    } else if (char !== '\r') {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim() !== '')) rows.push(row);
  if (rows.length === 0) return [];
  const headers = rows[0].map((value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''));
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

function loadExportRows(exportPath) {
  const content = fs.readFileSync(exportPath, 'utf8');
  if (exportPath.endsWith('.json')) {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : parsed.rows || parsed.data || [];
  }
  return parseCsv(content);
}

function firstPresent(row, names) {
  for (const name of names) {
    if (row[name] !== undefined && row[name] !== null && String(row[name]).trim() !== '') return row[name];
  }
  return null;
}

function amountInInr(row, options = {}) {
  const explicitInr = firstPresent(row, ['amount_inr', 'cost_inr', 'charge_inr', 'price_inr', 'whatsapp_cost_inr']);
  if (explicitInr !== null) return Number(explicitInr) || 0;
  const amount = Number(firstPresent(row, ['amount', 'cost', 'charge', 'price']) || 0);
  const currency = String(firstPresent(row, ['currency', 'billing_currency']) || 'INR').toUpperCase();
  if (currency === 'INR') return amount;
  if (currency === 'USD') return amount * Number(options.usdToInr || DEFAULT_USD_TO_INR);
  return amount;
}

function normalizeExportRow(row, options = {}) {
  const communityRaw = firstPresent(row, ['community_id', 'community', 'customer_id', 'business_id', 'phone_number_id']) || 'unknown-community';
  const occurredRaw = firstPresent(row, ['occurred_at', 'timestamp', 'date', 'conversation_start', 'start_time']);
  const categoryRaw = firstPresent(row, ['conversation_category', 'category', 'pricing_category', 'type']);
  const externalRaw = firstPresent(row, ['conversation_id', 'message_id', 'wamid', 'external_ref', 'id']);
  return {
    communityId: sanitizeId(communityRaw, 'community'),
    occurredAt: occurredRaw ? new Date(occurredRaw).toISOString() : null,
    category: normalizeCategory(categoryRaw),
    amountInr: amountInInr(row, options),
    externalRefHash: externalRaw ? hashText(externalRaw) : null,
  };
}

function aggregateRows(rows) {
  return rows.reduce(
    (acc, row) => {
      acc.count += 1;
      acc.amountInr += Number(row.amountInr || 0);
      acc.categories[row.category] = acc.categories[row.category] || { count: 0, amountInr: 0 };
      acc.categories[row.category].count += 1;
      acc.categories[row.category].amountInr += Number(row.amountInr || 0);
      return acc;
    },
    { count: 0, amountInr: 0, categories: {} },
  );
}

function aggregateLedgerWhatsapp(ledger) {
  return (ledger.records || []).reduce(
    (acc, record) => {
      if (!record.whatsappCategory && !(record.costsInr && record.costsInr.whatsapp)) return acc;
      const category = normalizeCategory(record.whatsappCategory);
      const amount = Number(record.costsInr?.whatsapp || 0);
      acc.count += 1;
      acc.amountInr += amount;
      acc.categories[category] = acc.categories[category] || { count: 0, amountInr: 0 };
      acc.categories[category].count += 1;
      acc.categories[category].amountInr += amount;
      return acc;
    },
    { count: 0, amountInr: 0, categories: {} },
  );
}

function round(value) {
  return Number(Number(value || 0).toFixed(4));
}

function roundCategories(categories) {
  return Object.fromEntries(Object.entries(categories).sort().map(([category, value]) => [category, { count: value.count, amountInr: round(value.amountInr) }]));
}

function reconcileMetaExport(storageDir, exportPath, month, options = {}) {
  const rows = loadExportRows(exportPath).map((row) => normalizeExportRow(row, options));
  const byCommunity = new Map();
  for (const row of rows) {
    if (!byCommunity.has(row.communityId)) byCommunity.set(row.communityId, []);
    byCommunity.get(row.communityId).push(row);
  }

  const communities = Array.from(byCommunity.entries()).sort().map(([communityId, exportRows]) => {
    const ledger = readLedger(storageDir, communityId, month);
    const meter = aggregateLedgerWhatsapp(ledger);
    const actual = aggregateRows(exportRows);
    const varianceInr = actual.amountInr - meter.amountInr;
    const variancePct = meter.amountInr > 0 ? (varianceInr / meter.amountInr) * 100 : (actual.amountInr > 0 ? 100 : 0);
    return {
      communityId,
      month,
      planId: ledger.planId,
      meter: { count: meter.count, amountInr: round(meter.amountInr), categories: roundCategories(meter.categories) },
      metaExport: { count: actual.count, amountInr: round(actual.amountInr), categories: roundCategories(actual.categories) },
      varianceInr: round(varianceInr),
      variancePct: Number(variancePct.toFixed(2)),
      status: Math.abs(varianceInr) <= Number(options.toleranceInr || 1) ? 'matched' : 'review',
      marginAfterActualWhatsapp: summarizeWithActualWhatsapp(ledger, actual.amountInr),
      sampleExternalRefHashes: exportRows.map((row) => row.externalRefHash).filter(Boolean).slice(0, 5),
    };
  });

  const totals = communities.reduce(
    (acc, item) => {
      acc.communities += 1;
      acc.meterAmountInr += item.meter.amountInr;
      acc.metaAmountInr += item.metaExport.amountInr;
      if (item.status !== 'matched') acc.reviewCommunities += 1;
      return acc;
    },
    { communities: 0, meterAmountInr: 0, metaAmountInr: 0, reviewCommunities: 0 },
  );
  totals.varianceInr = totals.metaAmountInr - totals.meterAmountInr;
  return {
    month,
    generatedAt: new Date().toISOString(),
    sourceFile: path.basename(exportPath),
    totals: {
      ...totals,
      meterAmountInr: round(totals.meterAmountInr),
      metaAmountInr: round(totals.metaAmountInr),
      varianceInr: round(totals.varianceInr),
    },
    communities,
    privacy: 'Raw WhatsApp phone numbers, message text, and Meta IDs are not emitted; external refs are hashed.',
  };
}

function summarizeWithActualWhatsapp(ledger, actualWhatsappInr) {
  const adjusted = JSON.parse(JSON.stringify(ledger));
  adjusted.costsInr.whatsapp = Number(actualWhatsappInr || 0);
  const summary = summarizeLedger(adjusted);
  return {
    revenueInr: summary.revenueInr,
    costsInr: summary.costsInr,
    grossMarginInr: summary.grossMarginInr,
    grossMarginPct: summary.grossMarginPct,
    marginStatus: summary.marginStatus,
  };
}

function renderReconciliationMarkdown(report) {
  const lines = [];
  lines.push(`# Meta WhatsApp Billing Reconciliation — ${report.month}`);
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Source file: ${report.sourceFile}`);
  lines.push('');
  lines.push('## Summary');
  lines.push(`- Communities in export: ${report.totals.communities}`);
  lines.push(`- Metered WhatsApp estimate: ₹${report.totals.meterAmountInr}`);
  lines.push(`- Meta export actual: ₹${report.totals.metaAmountInr}`);
  lines.push(`- Variance: ₹${report.totals.varianceInr}`);
  lines.push(`- Communities needing review: ${report.totals.reviewCommunities}`);
  lines.push('');
  for (const item of report.communities) {
    lines.push(`## ${item.communityId}`);
    lines.push(`- Status: ${item.status}`);
    lines.push(`- Meter: ${item.meter.count} events / ₹${item.meter.amountInr}`);
    lines.push(`- Meta export: ${item.metaExport.count} conversations / ₹${item.metaExport.amountInr}`);
    lines.push(`- Variance: ₹${item.varianceInr} (${item.variancePct}%)`);
    lines.push(`- Gross margin after actual WhatsApp cost: ₹${item.marginAfterActualWhatsapp.grossMarginInr} (${item.marginAfterActualWhatsapp.grossMarginPct}%) — ${item.marginAfterActualWhatsapp.marginStatus}`);
    lines.push('');
  }
  lines.push(`Privacy: ${report.privacy}`);
  return `${lines.join('\n')}\n`;
}

function writeReconciliationReport(storageDir, exportPath, month, outputPath, options = {}) {
  const report = reconcileMetaExport(storageDir, exportPath, month, options);
  const format = options.format || (outputPath.endsWith('.json') ? 'json' : 'md');
  const content = format === 'json' ? `${JSON.stringify(report, null, 2)}\n` : renderReconciliationMarkdown(report);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true, mode: 0o700 });
  fs.writeFileSync(outputPath, content, { mode: 0o600 });
  return { report, outputPath, format };
}

if (require.main === module) {
  const [, , storageDir, exportPath, month, outputPath] = process.argv;
  if (!storageDir || !exportPath || !month || !outputPath) {
    console.error('Usage: node billing/meta-reconcile.js <ledgerStorageDir> <meta-export.csv|json> <YYYY-MM> <output.md|output.json>');
    process.exit(1);
  }
  const result = writeReconciliationReport(storageDir, exportPath, sanitizeId(month), outputPath);
  console.log(`Meta billing reconciliation written: ${result.outputPath}`);
}

module.exports = {
  normalizeCategory,
  normalizeExportRow,
  parseCsv,
  reconcileMetaExport,
  renderReconciliationMarkdown,
  writeReconciliationReport,
};
