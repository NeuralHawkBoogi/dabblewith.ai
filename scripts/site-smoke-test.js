#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const root = path.resolve(__dirname, '..');
const siteHosts = new Set(['dabblewith.ai', 'www.dabblewith.ai']);
const issues = [];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function attrs(source, tagName) {
  const re = new RegExp(`<${tagName}\\b([^>]*)>`, 'gi');
  const attrRe = /([:\w-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  const rows = [];
  let m;
  while ((m = re.exec(source))) {
    const row = {};
    let a;
    while ((a = attrRe.exec(m[1]))) row[a[1].toLowerCase()] = a[3] ?? a[4] ?? a[5] ?? '';
    rows.push(row);
  }
  return rows;
}

function jsonLdBlocks(source) {
  const blocks = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(source))) {
    if (/type\s*=\s*['"]application\/ld\+json['"]/i.test(m[1])) blocks.push(m[2].trim());
  }
  return blocks;
}

function localTargetExists(fromFile, href) {
  if (!href || href.startsWith('#')) return true;
  let u;
  try { u = new URL(href, 'https://dabblewith.ai/'); } catch (_) { return true; }
  if (!['http:', 'https:'].includes(u.protocol)) return true;
  if (!siteHosts.has(u.hostname)) return true;
  const pathname = decodeURIComponent(u.pathname);
  let target = pathname.startsWith('/')
    ? path.join(root, pathname)
    : path.resolve(path.dirname(fromFile), pathname);
  const candidates = [target];
  if (pathname.endsWith('/') || !path.extname(target)) candidates.unshift(path.join(target, 'index.html'));
  return candidates.some((p) => fs.existsSync(p) && fs.statSync(p).isFile());
}

const htmlFiles = walk(root);
for (const file of htmlFiles) {
  const rel = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');

  if (!/<title>[^<]+<\/title>/i.test(html)) issues.push(`${rel}: missing <title>`);
  if (!/<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i.test(html)) issues.push(`${rel}: missing meta description`);

  for (const [i, block] of jsonLdBlocks(html).entries()) {
    try { JSON.parse(block); } catch (err) { issues.push(`${rel}: invalid JSON-LD block ${i + 1}: ${err.message}`); }
  }

  for (const row of [...attrs(html, 'a'), ...attrs(html, 'link'), ...attrs(html, 'script')]) {
    const href = row.href || row.src;
    if (href && !localTargetExists(file, href)) issues.push(`${rel}: broken local reference ${href}`);
  }

  const metas = attrs(html, 'meta');
  const ogImage = metas.find(row => row.property === 'og:image')?.content;
  const twitterImage = metas.find(row => row.name === 'twitter:image')?.content;
  if (ogImage && !localTargetExists(file, ogImage)) issues.push(`${rel}: broken og:image ${ogImage}`);
  if (twitterImage && !localTargetExists(file, twitterImage)) issues.push(`${rel}: broken twitter:image ${twitterImage}`);
}

const requiredPreviewImages = {
  'index.html': '/media/og/home.svg',
  'workflows/index.html': '/media/og/workflow-exchange.svg',
  'community-bot/index.html': '/media/og/community-bot.svg',
  'newsletter/issue-001/index.html': '/media/og/newsletter-issue-001.svg',
  'templates/index.html': '/media/og/templates.svg',
  'experiments/index.html': '/media/og/experiments.svg',
};

for (const [rel, expected] of Object.entries(requiredPreviewImages)) {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  const metas = attrs(html, 'meta');
  const ogImage = metas.find(row => row.property === 'og:image')?.content || '';
  const twitterImage = metas.find(row => row.name === 'twitter:image')?.content || '';
  if (!ogImage.endsWith(expected)) issues.push(`${rel}: expected og:image ${expected}`);
  if (!twitterImage.endsWith(expected)) issues.push(`${rel}: expected twitter:image ${expected}`);
}

const communityBot = fs.readFileSync(path.join(root, 'community-bot', 'index.html'), 'utf8');
if (!communityBot.includes('/scripts/web/dabblewith-tracking.js')) {
  issues.push('community-bot/index.html: missing shared privacy-safe tracker');
}

for (const file of htmlFiles) {
  const rel = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');
  if (/\blink_url\b/.test(html)) {
    issues.push(`${rel}: must not emit raw link_url`);
  }
  if (/G-7473LZQGX2/.test(html) && !html.includes('/scripts/web/dabblewith-tracking.js')) {
    issues.push(`${rel}: GA page missing shared privacy-safe tracker`);
  }
}


const newsletterIssuesPath = path.join(root, 'data', 'newsletter-issues.json');
if (fs.existsSync(newsletterIssuesPath)) {
  const newsletterIssues = JSON.parse(fs.readFileSync(newsletterIssuesPath, 'utf8'));
  const slugs = new Set();
  for (const issue of newsletterIssues) {
    if (!Number.isInteger(issue.number)) issues.push(`data/newsletter-issues.json: issue ${issue.slug || '(missing slug)'} missing integer number`);
    if (!/^issue-\d{3}$/.test(issue.slug || '')) issues.push(`data/newsletter-issues.json: invalid slug ${issue.slug || '(missing)'}`);
    if (slugs.has(issue.slug)) issues.push(`data/newsletter-issues.json: duplicate slug ${issue.slug}`);
    slugs.add(issue.slug);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(issue.publishedAt || '')) issues.push(`data/newsletter-issues.json: issue ${issue.slug} missing YYYY-MM-DD publishedAt`);
    const issueFile = path.join(root, 'newsletter', issue.slug || '', 'index.html');
    if (!fs.existsSync(issueFile)) issues.push(`newsletter/${issue.slug}/index.html: missing generated issue page`);
    const raw = JSON.stringify(issue);
    if (/\+?91\d{10}/.test(raw) || /\b\d{10,15}\b/.test(raw)) issues.push(`data/newsletter-issues.json: issue ${issue.slug} contains raw phone-like number`);
  }
  const archive = fs.readFileSync(path.join(root, 'newsletter', 'index.html'), 'utf8');
  for (const issue of newsletterIssues) {
    if (!archive.includes(`/newsletter/${issue.slug}/`)) issues.push(`newsletter/index.html: missing archive link for ${issue.slug}`);
  }
}

if (issues.length) {
  console.error(`site smoke failed (${issues.length} issue${issues.length === 1 ? '' : 's'}):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`site smoke ok: ${htmlFiles.length} html files checked`);
