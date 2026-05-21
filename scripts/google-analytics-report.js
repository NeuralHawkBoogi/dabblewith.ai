#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'reports', 'analytics');
const propertyEnv = process.env.DABBLE_GA_PROPERTY_ID || process.env.GA_PROPERTY_ID;
const measurementId = process.env.DABBLE_GA_MEASUREMENT_ID || 'G-7473LZQGX2';
const defaultTokensPath = path.join(root, 'credentials', 'google-ga-tokens.json');
const defaultClientPath = '/home/clawdbot/.openclaw/workspace/dabblewith-ai-site/creds/client_secret_686953856069-4brfrho735gstt484q4rkuuou16j25o7.apps.googleusercontent.com.json';
const tokensPath = process.env.DABBLE_GA_TOKENS_PATH || process.env.GA_TOKENS_PATH || defaultTokensPath;
const clientPath = process.env.DABBLE_GA_CLIENT_PATH || process.env.GA_CLIENT_PATH || defaultClientPath;
const days = Number(process.env.DABBLE_GA_LOOKBACK_DAYS || 7);

function die(msg) { console.error(msg); process.exit(1); }
function readJson(file, label) {
  if (!file) die(`${label} path is required. Set ${label === 'tokens' ? 'DABBLE_GA_TOKENS_PATH' : 'DABBLE_GA_CLIENT_PATH'}.`);
  if (!fs.existsSync(file)) die(`${label} file not found: ${file}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function postJson(url, body, headers = {}) {
  return request('POST', url, JSON.stringify(body), { 'content-type': 'application/json', ...headers });
}
function request(method, rawUrl, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(rawUrl);
    const req = https.request({ method, hostname: u.hostname, path: u.pathname + u.search, headers }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let parsed = data;
        try { parsed = data ? JSON.parse(data) : null; } catch (_) {}
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const err = new Error(`${method} ${rawUrl} failed: ${res.statusCode}`);
          err.response = parsed;
          reject(err);
        } else resolve(parsed);
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}
function clientCreds(config) {
  const c = config.installed || config.web || config;
  return { client_id: c.client_id, client_secret: c.client_secret };
}
async function refreshToken() {
  const tokens = readJson(tokensPath, 'tokens');
  const client = clientCreds(readJson(clientPath, 'client'));
  const params = new URLSearchParams({
    client_id: client.client_id,
    client_secret: client.client_secret,
    refresh_token: tokens.refresh_token,
    grant_type: 'refresh_token'
  }).toString();
  const res = await request('POST', 'https://oauth2.googleapis.com/token', params, { 'content-type': 'application/x-www-form-urlencoded' });
  return res.access_token;
}
async function googleGet(url, accessToken) {
  return request('GET', url, null, { authorization: `Bearer ${accessToken}` });
}
async function runReport(propertyId, accessToken, body) {
  return postJson(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, body, { authorization: `Bearer ${accessToken}` });
}
function rowObjects(report) {
  const dims = (report.dimensionHeaders || []).map(h => h.name);
  const mets = (report.metricHeaders || []).map(h => h.name);
  return (report.rows || []).map(r => {
    const o = {};
    dims.forEach((d, i) => o[d] = r.dimensionValues[i]?.value || '');
    mets.forEach((m, i) => o[m] = Number(r.metricValues[i]?.value || 0));
    return o;
  });
}
async function discoverProperty(accessToken) {
  if (propertyEnv) return String(propertyEnv).replace(/^properties\//, '');
  const summaries = await googleGet('https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200', accessToken);
  const props = [];
  for (const account of summaries.accountSummaries || []) {
    for (const p of account.propertySummaries || []) props.push({ account: account.displayName, property: p.property, displayName: p.displayName });
  }
  const likely = props.find(p => /dabblewith|7473LZQGX2/i.test(`${p.displayName} ${p.property}`));
  if (!likely && props.length !== 1) {
    const report = { generatedAt: new Date().toISOString(), measurementId, status: 'blocked_property_selection', availableProperties: props };
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'latest.json'), JSON.stringify(report, null, 2));
    die(`Could not infer GA4 property. Set DABBLE_GA_PROPERTY_ID. Found ${props.length} accessible properties.`);
  }
  return (likely || props[0]).property.replace('properties/', '');
}
function pct(x) { return `${(x * 100).toFixed(1)}%`; }
function mdTable(headers, rows) {
  return `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n` + rows.map(r => `| ${r.map(v => String(v).replace(/\|/g, '\\|')).join(' | ')} |`).join('\n');
}
async function main() {
  const accessToken = await refreshToken();
  const propertyId = await discoverProperty(accessToken);
  const dateRanges = [{ startDate: `${days}daysAgo`, endDate: 'today' }];
  const [pagesRaw, channelsRaw, eventsRaw, daysRaw] = await Promise.all([
    runReport(propertyId, accessToken, { dateRanges, dimensions: [{ name: 'pagePathPlusQueryString' }, { name: 'pageTitle' }], metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }, { name: 'activeUsers' }, { name: 'engagementRate' }, { name: 'averageSessionDuration' }], orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 25 }),
    runReport(propertyId, accessToken, { dateRanges, dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'engagementRate' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 20 }),
    runReport(propertyId, accessToken, { dateRanges, dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }, { name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }], limit: 30 }),
    runReport(propertyId, accessToken, { dateRanges, dimensions: [{ name: 'date' }], metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }, { name: 'activeUsers' }], orderBys: [{ dimension: { dimensionName: 'date' } }], limit: 30 })
  ]);
  const pages = rowObjects(pagesRaw);
  const channels = rowObjects(channelsRaw);
  const events = rowObjects(eventsRaw);
  const daily = rowObjects(daysRaw);
  const lowEngagementPages = pages.filter(p => p.sessions >= 2 && p.engagementRate < 0.45).slice(0, 8);
  const missingCtaCandidates = pages.filter(p => /\/blog\//.test(p.pagePathPlusQueryString) && p.screenPageViews > 0).slice(0, 8);
  const recommendations = [];
  if (missingCtaCandidates.length) recommendations.push('Add stronger contextual CTAs from high-traffic blog posts into community-bot, Casagrand RSVP, or WhatsApp join flows.');
  if (lowEngagementPages.length) recommendations.push('Improve low-engagement pages above the fold: sharper promise, clearer CTA, internal links, and practical artifact previews.');
  if (!events.some(e => /join|rsvp|cta|signup|lead/i.test(e.eventName))) recommendations.push('Add explicit GA events for primary CTAs so traffic can be tied to community growth, not only pageviews.');
  if (channels.length && channels[0].sessionDefaultChannelGroup === 'Direct') recommendations.push('Add UTM-tagged links to WhatsApp/community nudges so source attribution is not lost as Direct traffic.');
  const generatedAt = new Date().toISOString();
  const report = { generatedAt, propertyId, measurementId, lookbackDays: days, pages, channels, events, daily, lowEngagementPages, recommendations };
  fs.mkdirSync(outDir, { recursive: true });
  const date = generatedAt.slice(0, 10);
  fs.writeFileSync(path.join(outDir, `ga-report-${date}.json`), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(outDir, 'latest.json'), JSON.stringify(report, null, 2));
  const md = `# dabblewith.ai Google Analytics Report — ${date}\n\nGenerated: ${generatedAt}\nProperty: ${propertyId}\nLookback: ${days} days\n\n## Top pages\n\n${mdTable(['Page', 'Views', 'Sessions', 'Users', 'Engagement', 'Avg sec'], pages.slice(0, 10).map(p => [p.pagePathPlusQueryString, p.screenPageViews, p.sessions, p.activeUsers, pct(p.engagementRate || 0), Math.round(p.averageSessionDuration || 0)]))}\n\n## Channels\n\n${mdTable(['Channel', 'Sessions', 'Users', 'Engagement'], channels.map(c => [c.sessionDefaultChannelGroup, c.sessions, c.activeUsers, pct(c.engagementRate || 0)]))}\n\n## Top events\n\n${mdTable(['Event', 'Count', 'Users'], events.slice(0, 12).map(e => [e.eventName, e.eventCount, e.activeUsers]))}\n\n## Recommendations\n\n${recommendations.map(r => `- ${r}`).join('\n') || '- No obvious action from current data. Keep monitoring.'}\n`;
  fs.writeFileSync(path.join(outDir, `ga-report-${date}.md`), md);
  fs.writeFileSync(path.join(outDir, 'latest.md'), md);
  console.log(md);
}
main().catch(err => {
  console.error(err.message);
  if (err.response) console.error(JSON.stringify(err.response, null, 2));
  process.exit(1);
});
