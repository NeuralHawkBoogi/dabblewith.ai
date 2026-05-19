'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildValidationReport,
  renderMarkdownReport,
} = require('./leads');

const DEFAULT_STORAGE_DIR = process.env.DABBLE_MARKET_VALIDATION_DIR || '/home/clawdbot/dabblewith-whatsapp/data/market-validation-leads';
const DEFAULT_OUTPUT_DIR = process.env.DABBLE_MARKET_VALIDATION_REPORT_DIR || path.join(process.cwd(), 'reports', 'market-validation');

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    storageDir: DEFAULT_STORAGE_DIR,
    outputDir: DEFAULT_OUTPUT_DIR,
    date: currentDate(),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--storage-dir') {
      options.storageDir = argv[++i];
    } else if (arg === '--output-dir') {
      options.outputDir = argv[++i];
    } else if (arg === '--date') {
      options.date = argv[++i];
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.date || !/^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
    throw new Error('--date must be YYYY-MM-DD');
  }
  return options;
}

function ensurePrivateDir(dir) {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
}

function buildAdminReport(storageDir) {
  const report = buildValidationReport(storageDir);
  return {
    ...report,
    adminSummary: {
      status: report.totals.qualified >= 10 ? 'decision_gate_ready' : 'lead_collection_in_progress',
      nextAction: report.totals.qualified >= 10
        ? 'Review ranked segments and decide continue/pivot/pause.'
        : `Collect ${report.totals.needsMoreInterviews} more qualified community-owner interviews.`,
      privacy: 'Raw WhatsApp text, phone numbers, emails, and token-like strings are intentionally excluded.',
    },
  };
}

function renderAdminMarkdown(report) {
  const base = renderMarkdownReport(report).trimEnd();
  return `${base}\n\n## Admin next action\n- Status: ${report.adminSummary.status}\n- Next: ${report.adminSummary.nextAction}\n- Privacy: ${report.adminSummary.privacy}\n`;
}

function writeAdminReport(options = {}) {
  const storageDir = options.storageDir || DEFAULT_STORAGE_DIR;
  const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
  const date = options.date || currentDate();
  const report = buildAdminReport(storageDir);
  ensurePrivateDir(outputDir);

  const baseName = `community-bot-market-validation-${date}`;
  const mdPath = path.join(outputDir, `${baseName}.md`);
  const jsonPath = path.join(outputDir, `${baseName}.json`);

  fs.writeFileSync(mdPath, renderAdminMarkdown(report), { mode: 0o600 });
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });

  return { report, mdPath, jsonPath };
}

function usage() {
  return [
    'Usage: node market-validation/admin-report.js [--storage-dir DIR] [--output-dir DIR] [--date YYYY-MM-DD]',
    '',
    `Default storage dir: ${DEFAULT_STORAGE_DIR}`,
    `Default output dir: ${DEFAULT_OUTPUT_DIR}`,
  ].join('\n');
}

if (require.main === module) {
  try {
    const options = parseArgs();
    if (options.help) {
      console.log(usage());
      process.exit(0);
    }
    const result = writeAdminReport(options);
    console.log(`market validation admin report written: ${result.mdPath}`);
    console.log(`market validation admin report written: ${result.jsonPath}`);
  } catch (err) {
    console.error(err.message || err);
    console.error(usage());
    process.exit(1);
  }
}

module.exports = {
  DEFAULT_STORAGE_DIR,
  DEFAULT_OUTPUT_DIR,
  parseArgs,
  buildAdminReport,
  renderAdminMarkdown,
  writeAdminReport,
};
