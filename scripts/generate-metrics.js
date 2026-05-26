#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://dabblewith.ai';
const CHECK = process.argv.includes('--check');
const ALLOWED = new Set([
  'workflow_view',
  'workflow_explore_click',
  'workflow_submit_start',
  'workflow_submit_complete',
  'newsletter_signup_click',
  'community_bot_setup_click',
  'challenge_join_click',
  'partner_interest_click',
  'build_public_metrics_view',
  'audience_segment_click',
  'lead_intent_click'
]);
const KPI_ROWS = [
  ['Workflow views', 'workflow_view', 'Which workflows earn real attention?', 'page_path, cta_id, workflow_category, audience_segment'],
  ['Workflow exploration clicks', 'workflow_explore_click', 'Do readers keep browsing/forking?', 'page_path, cta_id, workflow_category, audience_segment'],
  ['Worksheet downloads / opens', 'workflow_explore_click', 'Which templates are being copied?', 'page_path, cta_id, workflow_category'],
  ['Workflow submissions started', 'workflow_submit_start', 'Are visitors becoming contributors?', 'page_path, cta_id, source, medium, campaign, content, intent'],
  ['Newsletter signup clicks', 'newsletter_signup_click', 'Does the content loop convert?', 'page_path, cta_id, source, medium, campaign, content, intent'],
  ['Community-bot setup clicks', 'community_bot_setup_click', 'Is there commercial community-bot intent?', 'page_path, cta_id, source, medium, campaign, content, intent'],
  ['Lead intent clicks', 'lead_intent_click', 'Which external lead actions happened?', 'page_path, cta_id, lead_type, source_event'],
  ['Build-in-public / roadmap views', 'build_public_metrics_view', 'Are people checking progress?', 'page_path, cta_id'],
  ['Audience segment clicks', 'audience_segment_click', 'Which audience paths pull interest?', 'page_path, cta_id, audience_segment, workflow_category'],
  ['Partner interest clicks', 'partner_interest_click', 'Are there partnership or issue-swap signals?', 'page_path, cta_id']
];

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function csvCell(s) {
  const v = String(s == null ? '' : s);
  return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
}
function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (CHECK) {
    if (!fs.existsSync(file)) { console.error('[check] missing: ' + path.relative(ROOT, file)); process.exitCode = 1; return; }
    const old = fs.readFileSync(file, 'utf8');
    if (old !== content) { console.error('[check] diff: ' + path.relative(ROOT, file)); process.exitCode = 1; }
    return;
  }
  fs.writeFileSync(file, content);
}
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}
function attrRows(html) {
  const tagRe = /<a\b([^>]*)>/gi;
  const attrRe = /([:\w-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  const rows = [];
  let m;
  while ((m = tagRe.exec(html))) {
    const row = {};
    let a;
    while ((a = attrRe.exec(m[1]))) row[a[1].toLowerCase()] = a[3] ?? a[4] ?? a[5] ?? '';
    if (row['data-event'] || row['data-cta']) rows.push(row);
  }
  return rows;
}
function inventory() {
  const htmlFiles = walk(ROOT).filter(f => !f.includes(`${path.sep}metrics${path.sep}`));
  const byKey = new Map();
  for (const file of htmlFiles) {
    const rel = path.relative(ROOT, file);
    const page_path = '/' + rel.replace(/index\.html$/, '').replace(/\\/g, '/');
    const html = fs.readFileSync(file, 'utf8');
    for (const row of attrRows(html)) {
      const event = row['data-event'] || '';
      if (!event) continue;
      const cta = row['data-cta'] || '';
      const key = `${event}|${cta}|${page_path}|${row['data-workflow-category'] || ''}|${row['data-audience'] || ''}`;
      if (!byKey.has(key)) byKey.set(key, {
        event,
        cta_id: cta,
        page_path,
        workflow_category: row['data-workflow-category'] || '',
        audience_segment: row['data-audience'] || '',
        status: ALLOWED.has(event) ? 'tracked' : 'not_allowed'
      });
    }
  }
  return Array.from(byKey.values()).sort((a, b) => (a.event + a.page_path + a.cta_id).localeCompare(b.event + b.page_path + b.cta_id));
}
function renderJson(rows) {
  const events = {};
  for (const row of rows) {
    events[row.event] = events[row.event] || { event: row.event, status: row.status, cta_count: 0, page_count: 0, pages: [] };
    events[row.event].cta_count += 1;
    if (!events[row.event].pages.includes(row.page_path)) events[row.event].pages.push(row.page_path);
    events[row.event].page_count = events[row.event].pages.length;
  }
  return JSON.stringify({
    generated_by: 'scripts/generate-metrics.js',
    privacy: 'No PII, no message bodies, no email/phone values, no raw link URLs. Only event names, CTA IDs, page paths, audience and workflow categories.',
    kpis: KPI_ROWS.map(([name, event, question, fields]) => ({ name, event, question, export_fields: fields.split(/,\s*/) })),
    events: Object.values(events).sort((a, b) => a.event.localeCompare(b.event)),
    ctas: rows
  }, null, 2) + '\n';
}
function renderCsv(rows) {
  const header = ['date', 'event_name', 'page_path', 'cta_id', 'workflow_category', 'audience_segment', 'lead_type', 'source', 'medium', 'campaign', 'content', 'intent', 'count', 'notes'];
  const examples = KPI_ROWS.map(([name, event]) => ['', event, '', '', '', '', '', '', '', '', '', '', '0', `manual export row for ${name}`]);
  return [header, ...examples].map(row => row.map(csvCell).join(',')).join('\n') + '\n';
}
function renderHtml(rows) {
  const events = [...new Set(rows.map(r => r.event))].sort();
  const counts = Object.fromEntries(events.map(event => [event, rows.filter(r => r.event === event).length]));
  const invalid = rows.filter(r => r.status !== 'tracked');
  const style = `:root{--bg:#060912;--panel:rgba(16,27,48,.94);--line:rgba(116,255,219,.26);--hard:#74ffdb;--text:#f2fbff;--muted:#9eb0c2;--green:#74ff7b;--amber:#ffcc66;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}*{box-sizing:border-box}body{margin:0;color:var(--text);background:linear-gradient(rgba(116,255,219,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(116,255,219,.055) 1px,transparent 1px),radial-gradient(circle at 20% 0%,rgba(88,166,255,.22),transparent 28rem),var(--bg);background-size:42px 42px,42px 42px,auto,auto}a{color:inherit}.shell{width:min(1120px,calc(100% - 30px));margin:0 auto}.top{display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap;padding:24px 0}.logo{text-decoration:none;font-size:30px;font-weight:900;letter-spacing:-.055em}.nav{display:flex;gap:10px;flex-wrap:wrap}.nav a,.btn{border:1px solid var(--line);border-radius:999px;padding:9px 12px;text-decoration:none;color:var(--muted);background:rgba(255,255,255,.03);font-size:14px}.hero,.card,.panel{border:1px solid var(--line);background:linear-gradient(180deg,var(--panel),rgba(8,13,25,.92));border-radius:24px;box-shadow:0 24px 90px rgba(0,0,0,.45)}.hero{padding:clamp(28px,5vw,56px);margin:18px auto 28px}.eyebrow{width:fit-content;color:var(--hard);border:1px solid var(--hard);background:rgba(116,255,219,.08);border-radius:999px;padding:9px 12px;font:12px/1 ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.08em}h1{font-size:clamp(38px,6vw,72px);line-height:.95;letter-spacing:-.06em;margin:18px 0 14px;max-width:930px}h2{font-size:clamp(26px,4vw,42px);line-height:1;letter-spacing:-.045em;margin:0 0 14px}.lead{font-size:clamp(17px,2vw,22px);color:#d7e9f7;line-height:1.55;max-width:880px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.two{grid-template-columns:repeat(2,1fr)}section{padding:28px 0}.card,.panel{padding:22px}.card p,.panel p,li{color:var(--muted);line-height:1.65}.meta{color:var(--green);font:12px/1.4 ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.08em}.btn{display:inline-flex;color:var(--hard);border-color:var(--hard);border-radius:14px;font-weight:800}.btn.primary{background:var(--green);color:#04120e;border-color:var(--green)}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}table{width:100%;border-collapse:collapse;overflow:hidden;border-radius:18px;background:rgba(5,8,17,.55)}th,td{text-align:left;border-bottom:1px solid rgba(116,255,219,.16);padding:12px;vertical-align:top}th{color:var(--hard);font:12px/1 ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.08em}td{color:#d7e9f7}code{color:var(--green);font-family:ui-monospace,Menlo,monospace}footer{border-top:1px solid var(--line);color:var(--muted);padding:26px 0 34px;margin-top:36px;font:13px/1.5 ui-monospace,Menlo,monospace}@media(max-width:860px){.grid,.two{grid-template-columns:1fr}table{display:block;overflow-x:auto}}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="icon" href="/favicon.svg" type="image/svg+xml"/><meta name="theme-color" content="#060912"/><meta property="og:image" content="${SITE}/media/og/experiments.svg"/><meta name="twitter:image" content="${SITE}/media/og/experiments.svg"/><title>Conversion dashboard and event export — Dabblewith.ai</title><meta name="description" content="Privacy-safe conversion dashboard and export schema for Dabblewith.ai workflow, template, newsletter, and community-bot events."/><meta name="robots" content="index, follow, max-image-preview:large"/><link rel="canonical" href="${SITE}/metrics/"/><meta property="og:site_name" content="dabblewith.ai"/><meta property="og:title" content="Dabblewith.ai conversion dashboard"/><meta property="og:description" content="Privacy-safe event taxonomy, export template, and KPI map for the AI Builder's Exchange."/><meta property="og:type" content="website"/><meta property="og:url" content="${SITE}/metrics/"/><meta name="twitter:card" content="summary_large_image"/><script async src="https://www.googletagmanager.com/gtag/js?id=G-7473LZQGX2"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-7473LZQGX2',{page_path:location.pathname});</script><script src="/scripts/web/dabblewith-tracking.js" defer></script><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Dataset',name:'Dabblewith.ai privacy-safe conversion event taxonomy',url:SITE + '/metrics/',distribution:{'@type':'DataDownload',encodingFormat:'application/json',contentUrl:SITE + '/data/conversion-events.json'}}).replace(/</g, '\\u003c')}</script><style>${style}</style></head><body><nav class="top shell"><a class="logo" href="/">dabblewith.ai</a><div class="nav"><a href="/workflows/" data-cta="nav_workflows" data-event="workflow_explore_click">Workflows</a><a href="/templates/" data-cta="nav_templates" data-event="workflow_explore_click">Templates</a><a href="/newsletter/" data-cta="nav_newsletter" data-event="newsletter_signup_click">Newsletter</a><a href="/experiments/" data-cta="nav_experiments" data-event="build_public_metrics_view">Experiments</a><a href="/metrics/" data-cta="nav_metrics" data-event="build_public_metrics_view">Metrics</a></div></nav><main><section class="hero shell"><div class="eyebrow">privacy-safe measurement</div><h1>Conversion dashboard and export schema.</h1><p class="lead">A lightweight operating dashboard for the AI Builder's Exchange: what we track, why it matters, and how to export it without collecting private message bodies, emails, phone numbers, or raw link URLs.</p><div class="actions"><a class="btn primary" href="/data/conversion-dashboard-template.csv" data-cta="metrics_download_csv" data-event="build_public_metrics_view">Download CSV template</a><a class="btn" href="/data/conversion-events.json" data-cta="metrics_view_json" data-event="build_public_metrics_view">View event inventory</a></div></section><section class="shell grid"><article class="card"><span class="meta">tracked CTA definitions</span><h2>${rows.length}</h2><p>CTA/event placements discovered across public HTML.</p></article><article class="card"><span class="meta">event types</span><h2>${events.length}</h2><p>Allowed privacy-safe events in the current taxonomy.</p></article><article class="card"><span class="meta">privacy violations</span><h2>${invalid.length}</h2><p>${invalid.length ? 'Review not_allowed events before scaling traffic.' : 'No unapproved event names detected in generated inventory.'}</p></article></section><section class="shell"><div class="panel"><h2>KPI map</h2><table><thead><tr><th>KPI</th><th>Event</th><th>Decision question</th><th>Export fields</th></tr></thead><tbody>${KPI_ROWS.map(([name,event,question,fields]) => `<tr><td>${esc(name)}</td><td><code>${esc(event)}</code></td><td>${esc(question)}</td><td>${esc(fields)}</td></tr>`).join('')}</tbody></table></div></section><section class="shell"><div class="panel"><h2>Current event inventory</h2><table><thead><tr><th>Event</th><th>CTA placements</th><th>Status</th></tr></thead><tbody>${events.map(event => `<tr><td><code>${esc(event)}</code></td><td>${counts[event]}</td><td>${ALLOWED.has(event) ? 'tracked' : 'not allowed'}</td></tr>`).join('')}</tbody></table></div></section><section class="shell two"><article class="panel"><span class="meta">privacy rule</span><h2>Keep exports aggregated.</h2><p>Export daily totals by event, page path, CTA id, audience segment, workflow category, UTM, and intent. Do not export WhatsApp text, email addresses, phone numbers, raw URLs, user IDs, or IP/device identifiers.</p></article><article class="panel"><span class="meta">weekly operating loop</span><h2>Ship → measure → decide.</h2><ol><li>Export GA event totals into the CSV template.</li><li>Mark the top converting surfaces and dead surfaces.</li><li>Promote what creates replies, worksheet copies, submissions, or bot setup conversations.</li><li>Archive vanity experiments that only create traffic.</li></ol></article></section></main><footer class="shell">AI-drafted · human-reviewed · privacy-aware · <a href="/experiments/">Experiments</a> · <a href="/build-in-public/">Build in public</a> · <a href="/privacy/">Privacy</a></footer></body></html>`;
}

const rows = inventory();
write(path.join(ROOT, 'data', 'conversion-events.json'), renderJson(rows));
write(path.join(ROOT, 'data', 'conversion-dashboard-template.csv'), renderCsv(rows));
write(path.join(ROOT, 'metrics', 'index.html'), renderHtml(rows));
if (!CHECK) console.log(`Generated metrics dashboard with ${rows.length} CTA/event definitions.`);
