const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'community-os.json'), 'utf8'));

const GA_TAG = `  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-7473LZQGX2"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-7473LZQGX2');
  </script>`;

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
function layout({ title, description, canonical, body, jsonLd }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
  <meta name="theme-color" content="#060912" />
  <meta property="og:image" content="https://dabblewith.ai/app-icon-1024.png" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="${esc(canonical)}" />
  <meta property="og:site_name" content="dabblewith.ai" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${esc(canonical)}" />
  ${jsonLd || ''}
${GA_TAG}
  <style>
    :root{--bg:#060912;--panel:rgba(16,27,48,.9);--line:rgba(116,255,219,.26);--line-hard:#74ffdb;--text:#f2fbff;--muted:#9eb0c2;--green:#74ff7b;--cyan:#74ffdb;--blue:#58a6ff;--amber:#ffcc66;--violet:#a78bfa;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}*{box-sizing:border-box}body{margin:0;color:var(--text);background:linear-gradient(rgba(116,255,219,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(116,255,219,.055) 1px,transparent 1px),radial-gradient(circle at 20% 0%,rgba(88,166,255,.22),transparent 28rem),radial-gradient(circle at 90% 10%,rgba(116,255,123,.16),transparent 25rem),var(--bg);background-size:42px 42px,42px 42px,auto,auto,auto}a{color:inherit}.shell{width:min(1120px,calc(100% - 30px));margin:0 auto}nav{display:flex;justify-content:space-between;align-items:center;padding:24px 0}.logo{text-decoration:none;font-size:30px;font-weight:900;letter-spacing:-.055em}.nav{display:flex;gap:10px;flex-wrap:wrap}.nav a{border:1px solid var(--line);border-radius:999px;padding:9px 12px;text-decoration:none;color:var(--muted);background:rgba(255,255,255,.03)}.hero,.panel,.card,.event{border:1px solid var(--line);background:linear-gradient(180deg,rgba(16,27,48,.94),rgba(8,13,25,.92));border-radius:24px;box-shadow:0 24px 90px rgba(0,0,0,.45)}.hero{padding:clamp(26px,5vw,50px);margin:18px auto 24px}.eyebrow{width:fit-content;color:var(--cyan);border:1px solid var(--line-hard);background:rgba(116,255,219,.08);border-radius:999px;padding:9px 12px;font:12px/1 ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.08em}h1{font-size:clamp(46px,8vw,88px);line-height:.9;letter-spacing:-.07em;margin:24px 0 18px}h2{font-size:clamp(30px,4.5vw,52px);line-height:.96;letter-spacing:-.055em;margin:0 0 16px}h3{font-size:22px;margin:0 0 8px}.lead{font-size:clamp(18px,2.2vw,25px);color:#d7e9f7;line-height:1.45;max-width:850px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.two{grid-template-columns:repeat(2,1fr)}.card,.panel,.event{padding:22px}.muted,p{color:var(--muted);line-height:1.65}.badge{display:inline-flex;border:1px solid rgba(116,255,123,.45);color:var(--green);background:rgba(116,255,123,.08);padding:5px 9px;border-radius:999px;font:12px/1.2 ui-monospace,Menlo,monospace}.badge.blue{color:var(--blue);border-color:rgba(88,166,255,.45);background:rgba(88,166,255,.08)}.badge.warn{color:var(--amber);border-color:rgba(255,204,102,.45);background:rgba(255,204,102,.08)}section{padding:32px 0}.metric{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid rgba(116,255,219,.12);padding:12px 0;font:13px/1.25 ui-monospace,Menlo,monospace}.metric:last-child{border-bottom:0}.score{font-size:42px;font-weight:900;color:var(--green);letter-spacing:-.05em}.timeline{display:grid;gap:14px}.event{display:grid;grid-template-columns:150px 1fr auto;gap:18px;align-items:center}.date{color:var(--green);font:800 13px/1.35 ui-monospace,Menlo,monospace;text-transform:uppercase}.btn{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line-hard);color:var(--cyan);background:rgba(116,255,219,.07);border-radius:14px;padding:12px 15px;text-decoration:none;font-weight:800}.btn.primary{color:#04120e;background:var(--green);border-color:var(--green)}footer{border-top:1px solid var(--line);color:var(--muted);padding:26px 0 34px;margin-top:36px;font:13px/1.4 ui-monospace,Menlo,monospace}@media(max-width:860px){.grid,.two{grid-template-columns:1fr}.event{grid-template-columns:1fr}.nav{display:none}}
  </style>
</head>
<body>
  <nav class="shell"><a class="logo" href="/">dabblewith.ai</a><div class="nav"><a href="/community-bot/">Community bot</a><a href="/autopilot/">Autopilot</a><a href="/sessions/">Sessions</a><a href="/blog/">Blog</a><a href="/#join">Join</a></div></nav>
  ${body}
  <footer><div class="shell">AI-operated · human-guided · updated ${esc(data.updatedAt)} · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></div></footer>
</body>
</html>`;
}

const agentCards = data.agents.map(a => `<article class="card"><span class="badge ${a.status === 'active' ? '' : a.status === 'drafting' ? 'blue' : 'warn'}">${esc(a.status)}</span><h3>${esc(a.name)}</h3><p>${esc(a.job)}</p><p><strong>Human gate:</strong> ${esc(a.humanGate)}</p></article>`).join('\n');
const metrics = data.operatingMetrics.map(m => `<div class="metric"><span>${esc(m.label)}</span><strong>${esc(m.value)}</strong></div>`).join('\n');
const topics = data.topicSignals.map(t => `<article class="card"><div class="score">${esc(t.score)}</div><h3>${esc(t.topic)}</h3><p>${esc(t.why)}</p><span class="badge blue">${esc(t.recommendedFormat)}</span></article>`).join('\n');
const sessions = data.sessionQueue.map(s => `<article class="event"><div class="date">${esc(s.id)}<br/>${esc(s.stage)}</div><div><h3>${esc(s.title)}</h3><p>${esc(s.format)} · artifact: ${esc(s.artifact)}</p></div><a class="btn" href="https://wa.me/919566112518?text=${encodeURIComponent(s.ctaText)}" target="_blank" rel="noreferrer">Signal interest</a></article>`).join('\n');
const changelog = data.publicChangelog.map(c => `<article class="card"><span class="badge">${esc(c.date)}</span><h3>${esc(c.title)}</h3><p>${esc(c.body)}</p></article>`).join('\n');
const access = data.accessPolicy || {};
const publicMode = (access.publicCommunityMode || []).map(x => `<li>${esc(x)}</li>`).join('');
const restricted = ((access.adminOnlyMode && access.adminOnlyMode.restrictedCapabilities) || []).map(x => `<li>${esc(x)}</li>`).join('');
const goals = (data.longTermGoals || []).map(g => `<article class="card"><span class="badge blue">${esc(g.status || 'goal')}</span><h3>${esc(g.title)}</h3><p>${esc(g.description)}</p><p><strong>Why:</strong> ${esc(g.why)}</p></article>`).join('');

write(path.join(root, 'autopilot', 'index.html'), layout({
  title: 'dabblewith.ai Autopilot — AI-Operated Community OS',
  description: 'The public operating system behind dabblewith.ai: AI agents, human gates, topic signals, session queue, and community automation.',
  canonical: 'https://dabblewith.ai/autopilot/',
  jsonLd: `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'WebPage',name:'dabblewith.ai Autopilot',url:'https://dabblewith.ai/autopilot/',description:'AI-operated community operating system.'})}</script>`,
  body: `<main class="shell"><section class="hero"><div class="eyebrow">community autopilot</div><h1>The AI-operated layer behind dabblewith.ai.</h1><p class="lead">${esc(data.mission)}</p><a class="btn primary" href="/sessions/">View session queue</a></section><section><h2>Operating metrics</h2><div class="grid two"><div class="panel">${metrics}</div><div class="panel"><h3>Autonomy level: ${esc(data.autonomyLevel)}</h3>${data.principles.map(p=>`<p>${esc(p)}</p>`).join('')}</div></div></section><section><h2>Agents</h2><div class="grid">${agentCards}</div></section><section><h2>Topic signals</h2><div class="grid two">${topics}</div></section><section><h2>WhatsApp access policy</h2><div class="grid two"><article class="card"><span class="badge">community mode</span><h3>Open to members</h3><p>Members can register, ask questions, vote on topics, and get public session/resource links.</p><ul>${publicMode}</ul></article><article class="card"><span class="badge warn">admin mode</span><h3>Boogi-only operations</h3><p>${esc(access.adminOnlyMode?.rule || 'Privileged operations are owner-only.')}</p><ul>${restricted}</ul></article></div></section>${goals ? `<section><h2>Long-term goals</h2><div class="grid two">${goals}</div></section>` : ''}<section><h2>Public changelog</h2><div class="grid two">${changelog}</div></section></main>`
}));

write(path.join(root, 'sessions', 'index.html'), layout({
  title: 'dabblewith.ai Sessions — AI Workshop Queue',
  description: 'Upcoming dabblewith.ai session queue: practical AI demos, workflow workshops, and human-guided AI learning events.',
  canonical: 'https://dabblewith.ai/sessions/',
  jsonLd: `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'ItemList',name:'dabblewith.ai session queue',itemListElement:data.sessionQueue.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.title}))})}</script>`,
  body: `<main class="shell"><section class="hero"><div class="eyebrow">session queue</div><h1>Workshops the community can vote into existence.</h1><p class="lead">AI drafts the queue from signals. Humans approve what is worth hosting. Members signal interest through WhatsApp.</p></section><section class="timeline">${sessions}</section></main>`
}));

console.log('Generated community OS pages: /autopilot/ and /sessions/');
