#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URLSearchParams } = require('url');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8121);
const HOST = process.env.HOST || '127.0.0.1';
const REDIRECT_URI = process.env.DABBLE_GOOGLE_REDIRECT_URI || 'https://dabblewith.ai/oauth/callback/';
const CLIENT_PATH = process.env.DABBLE_GA_CLIENT_PATH || '/home/clawdbot/.openclaw/workspace/dabblewith-ai-site/creds/client_secret_686953856069-4brfrho735gstt484q4rkuuou16j25o7.apps.googleusercontent.com.json';
const TOKENS_PATH = process.env.DABBLE_GA_TOKENS_PATH || path.join(ROOT, 'credentials', 'google-ga-tokens.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

function clientCreds() {
  const raw = JSON.parse(fs.readFileSync(CLIENT_PATH, 'utf8'));
  const c = raw.web || raw.installed || raw;
  if (!c.client_id || !c.client_secret) throw new Error('OAuth client_id/client_secret missing');
  return { client_id: c.client_id, client_secret: c.client_secret };
}

function readExistingTokens() {
  try {
    return JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
  } catch (_) {
    return null;
  }
}

function saveTokens(tokenResponse) {
  const existing = readExistingTokens();
  const expiresIn = Number(tokenResponse.expires_in || 0);
  const out = {
    ...existing,
    ...tokenResponse,
    refresh_token: tokenResponse.refresh_token || existing?.refresh_token,
    token_type: tokenResponse.token_type || existing?.token_type || 'Bearer',
    saved_at: new Date().toISOString(),
    expires_at: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : tokenResponse.expires_at || existing?.expires_at,
    source: 'dabblewith.ai/oauth/callback',
  };
  fs.mkdirSync(path.dirname(TOKENS_PATH), { recursive: true });
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(out, null, 2), { mode: 0o600 });
  try { fs.chmodSync(TOKENS_PATH, 0o600); } catch (_) {}
  return out;
}

async function exchangeCode(code) {
  const client = clientCreds();
  const params = new URLSearchParams({
    code,
    client_id: client.client_id,
    client_secret: client.client_secret,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  });
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error_description || body.error || `token exchange failed: ${res.status}`);
    err.response = body;
    err.statusCode = res.status;
    throw err;
  }
  if (!body.refresh_token && !readExistingTokens()?.refresh_token) {
    throw new Error('Google did not return a refresh_token. Re-login with consent prompt.');
  }
  return saveTokens(body);
}

function page(title, heading, message, tone = 'ok') {
  const color = tone === 'err' ? '#ff8b8b' : '#74ff7b';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)}</title><style>:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f2fbff;background:#060912}body{margin:0;background:radial-gradient(circle at 20% 0%,rgba(88,166,255,.22),transparent 28rem),radial-gradient(circle at 90% 10%,rgba(116,255,123,.16),transparent 25rem),#060912}.shell{width:min(860px,calc(100% - 30px));margin:0 auto;padding:48px 0}.logo{color:#f2fbff;text-decoration:none;font-size:28px;font-weight:900;letter-spacing:-.05em}.card{margin-top:34px;border:1px solid rgba(116,255,219,.26);background:linear-gradient(180deg,rgba(16,27,48,.95),rgba(8,13,25,.93));border-radius:24px;box-shadow:0 24px 90px rgba(0,0,0,.45);padding:clamp(24px,5vw,48px)}.eyebrow{color:#74ffdb;font:12px/1 ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.08em}h1{font-size:clamp(42px,7vw,72px);line-height:.95;letter-spacing:-.06em;margin:14px 0 12px}.status{color:${color};font-weight:900}p{color:#b9c9d8;line-height:1.75;font-size:18px}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}a.button{border:1px solid #74ffdb;background:linear-gradient(135deg,rgba(116,255,219,.18),rgba(116,255,123,.15));color:#f2fbff;border-radius:999px;padding:12px 16px;text-decoration:none;font-weight:800}</style></head><body><main class="shell"><a class="logo" href="/">dabblewith.ai</a><section class="card"><div class="eyebrow">google analytics</div><h1>${escapeHtml(heading)}</h1><p class="status">${tone === 'err' ? 'Connection failed' : 'Account connected'}</p><p>${escapeHtml(message)}</p><p>No authorization code or token is displayed in the browser. Tokens are stored server-side for future analytics pulls.</p><div class="actions"><a class="button" href="/oauth/login/">Reconnect</a><a class="button" href="/">Back to site</a></div></section></main><script>try{history.replaceState({},'', '/oauth/callback/connected');}catch(e){}</script></body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function send(res, status, body, type = 'text/html; charset=utf-8') {
  res.writeHead(status, {
    'content-type': type,
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  res.end(body);
}

function serveStatic(req, res, pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch (_) { return send(res, 400, 'Bad request', 'text/plain; charset=utf-8'); }
  let file = path.normalize(path.join(ROOT, decoded));
  if (!file.startsWith(ROOT)) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, {
    'content-type': type,
    'cache-control': type.startsWith('text/html') ? 'no-store' : 'public, max-age=300',
    'x-content-type-options': 'nosniff',
  });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && url.pathname === '/healthz') {
    return send(res, 200, JSON.stringify({ ok: true, service: 'dabblewith-ai', at: new Date().toISOString() }), 'application/json; charset=utf-8');
  }
  if (req.method === 'GET' && url.pathname === '/oauth/callback/' && url.searchParams.get('code')) {
    try {
      await exchangeCode(url.searchParams.get('code'));
      return send(res, 200, page('Account connected | dabblewith.ai', 'Google Analytics connected', 'Dabblewith.ai can now fetch Google Analytics data programmatically.'));
    } catch (err) {
      console.error('oauth_exchange_failed', err.message, err.response || '');
      return send(res, 500, page('Connection failed | dabblewith.ai', 'Could not connect Google Analytics', err.message || 'OAuth token exchange failed.', 'err'));
    }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', 'text/plain; charset=utf-8');
  serveStatic(req, res, url.pathname);
});

server.listen(PORT, HOST, () => {
  console.log(JSON.stringify({ service: 'dabblewith-ai', listening: `${HOST}:${PORT}` }));
});
