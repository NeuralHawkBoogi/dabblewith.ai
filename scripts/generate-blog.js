const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const postsPath = path.join(root, 'data', 'blog-posts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
const published = posts
  .filter(p => p.status === 'published' && p.publishedAt)
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

const GA_TAG = `  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-7473LZQGX2"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-7473LZQGX2');
    document.addEventListener('click', function(event) {
      var link = event.target && event.target.closest ? event.target.closest('a') : null;
      if (!link || typeof gtag !== 'function') return;
      var href = link.getAttribute('href') || '';
      var text = (link.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 80);
      var isCta = /wa\\.me|whatsapp|#join|\\/community-bot\\/?|\\/casagrand-firstcity\\/rsvp\\/?|utm_/.test(href) || /join|rsvp|start|signal|community bot|whatsapp/i.test(text);
      if (!isCta) return;
      gtag('event', 'cta_click', {
        link_url: link.href || href,
        link_text: text,
        cta_id: link.getAttribute('data-cta') || '',
        cta_source: link.getAttribute('data-source') || location.pathname,
        page_path: location.pathname
      });
    });
  </script>`;

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function slugUrl(post) { return `https://dabblewith.ai/blog/${post.slug}/`; }
function page({ title, description, canonical, body, jsonLd = '' }) {
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
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  ${jsonLd}
${GA_TAG}
  <style>
    :root{--bg:#060912;--panel:rgba(16,27,48,.9);--line:rgba(116,255,219,.26);--text:#f2fbff;--muted:#9eb0c2;--green:#74ff7b;--cyan:#74ffdb;--blue:#58a6ff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}*{box-sizing:border-box}body{margin:0;color:var(--text);background:radial-gradient(circle at 20% 0%,rgba(88,166,255,.22),transparent 28rem),radial-gradient(circle at 90% 10%,rgba(116,255,123,.16),transparent 25rem),var(--bg)}a{color:inherit}.shell{width:min(980px,calc(100% - 30px));margin:0 auto}nav{display:flex;justify-content:space-between;align-items:center;padding:24px 0}.logo{text-decoration:none;font-size:28px;font-weight:900;letter-spacing:-.05em}.nav{display:flex;gap:10px;flex-wrap:wrap}.nav a{border:1px solid var(--line);border-radius:999px;padding:9px 12px;text-decoration:none;color:var(--muted)}.hero,.card,article{border:1px solid var(--line);background:linear-gradient(180deg,rgba(16,27,48,.94),rgba(8,13,25,.92));border-radius:24px;box-shadow:0 24px 90px rgba(0,0,0,.45)}.hero{padding:36px;margin:18px auto 28px}h1{font-size:clamp(42px,7vw,78px);line-height:.95;letter-spacing:-.06em;margin:12px 0 16px}h2{font-size:32px;letter-spacing:-.04em;margin-top:34px}.eyebrow{color:var(--cyan);font:12px/1 ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.08em}.lead{font-size:20px;color:#d7e9f7;line-height:1.5}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.card{padding:22px;text-decoration:none}.card h2{font-size:26px;margin:0 0 10px}.card p,article p{color:var(--muted);line-height:1.7}.meta{color:var(--green);font:13px/1.5 ui-monospace,Menlo,monospace}.content{padding:34px;margin-bottom:30px}.content p{font-size:18px}.tags{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}.tag{border:1px solid rgba(116,255,123,.45);color:var(--green);border-radius:999px;padding:6px 9px;font-size:13px}.blog-cta{margin:24px 0 0;padding:22px;border:1px solid rgba(116,255,123,.42);border-radius:22px;background:rgba(116,255,123,.07)}.blog-cta p{margin:8px 0 16px}.btn{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--green);border-radius:14px;padding:13px 16px;background:var(--green);color:#04120e;text-decoration:none;font-weight:800}footer{border-top:1px solid var(--line);color:var(--muted);padding:26px 0 34px;margin-top:36px}@media(max-width:760px){.grid{grid-template-columns:1fr}.hero{padding:24px}.nav{display:none}}
  </style>
</head>
<body>
  <nav class="shell"><a class="logo" href="/">dabblewith.ai</a><div class="nav"><a href="/community-bot/">Community bot</a><a href="/blog/">Blog</a><a href="/#join">Join</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/sitemap.xml">Sitemap</a></div></nav>
  ${body}
  <footer><div class="shell">AI-operated · human-guided · <a href="/">dabblewith.ai</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></div></footer>
</body>
</html>`;
}

function write(file, content) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); }

const blogIndexBody = `<main class="shell">
  <section class="hero">
    <div class="eyebrow">dabblewith.ai blog</div>
    <h1>Practical AI workflows, workshops, and community operations.</h1>
    <p class="lead">Daily notes on learning AI by doing: agent workflows, human review, automation patterns, and hands-on demos.</p>
    <div class="blog-cta">
      <div class="eyebrow">from reading to doing</div>
      <p>Got a workflow you want to turn into a practical AI demo? Send the use case and we will suggest a hands-on build path.</p>
      <a class="btn" data-cta="blog_index_workflow_signal" data-source="blog_index_hero" href="https://wa.me/919566112518?text=I%20read%20the%20dabblewith.ai%20blog%20and%20want%20to%20turn%20a%20workflow%20into%20a%20hands-on%20AI%20demo%20%28source%3A%20blog%20index%29" target="_blank" rel="noreferrer">Send a workflow idea</a>
    </div>
  </section>
  <section class="grid">
    ${published.map(post => `<a class="card" href="/blog/${esc(post.slug)}/"><div class="meta">${esc(post.publishedAt)}</div><h2>${esc(post.title)}</h2><p>${esc(post.excerpt || post.description)}</p><div class="tags">${(post.keywords||[]).slice(0,3).map(k=>`<span class="tag">${esc(k)}</span>`).join('')}</div></a>`).join('\n    ')}
  </section>
</main>`;
write(path.join(root, 'blog', 'index.html'), page({
  title: 'dabblewith.ai Blog — Practical AI Workflows & Workshops',
  description: 'Daily articles from dabblewith.ai on hands-on AI workshops, agent workflows, AI automation, and human-guided community operations.',
  canonical: 'https://dabblewith.ai/blog/',
  body: blogIndexBody,
  jsonLd: `<script type="application/ld+json">${JSON.stringify({ '@context':'https://schema.org', '@type':'Blog', name:'dabblewith.ai Blog', url:'https://dabblewith.ai/blog/' })}</script>`
}));

for (const post of published) {
  const articleBody = `<main class="shell">
  <article class="content">
    <div class="eyebrow">AI community playbook</div>
    <h1>${esc(post.title)}</h1>
    <div class="meta">Published ${esc(post.publishedAt)} · dabblewith.ai</div>
    <p class="lead">${esc(post.excerpt || post.description)}</p>
    ${(post.sections||[]).map(([h, p]) => `<h2>${esc(h)}</h2><p>${esc(p)}</p>`).join('\n    ')}
    <div class="tags">${(post.keywords||[]).map(k=>`<span class="tag">${esc(k)}</span>`).join('')}</div>
    <div class="blog-cta">
      <div class="eyebrow">try it with your workflow</div>
      <p>Want to convert this idea into a working AI workflow or workshop exercise? Send a short use case on WhatsApp.</p>
      <a class="btn" data-cta="blog_article_workflow_signal" data-source="blog_article_${esc(post.slug)}" href="https://wa.me/919566112518?text=I%20read%20${encodeURIComponent(post.title)}%20and%20want%20to%20try%20a%20hands-on%20AI%20workflow%20%28source%3A%20blog%20article%29" target="_blank" rel="noreferrer">Discuss this workflow</a>
    </div>
  </article>
</main>`;
  const jsonLd = `<script type="application/ld+json">${JSON.stringify({
    '@context':'https://schema.org', '@type':'Article', headline:post.title, description:post.description,
    datePublished:post.publishedAt, dateModified:post.publishedAt, author:{'@type':'Organization', name:'dabblewith.ai'},
    publisher:{'@type':'Organization', name:'dabblewith.ai'}, mainEntityOfPage: slugUrl(post), keywords:(post.keywords||[]).join(', ')
  })}</script>`;
  write(path.join(root, 'blog', post.slug, 'index.html'), page({ title: `${post.title} | dabblewith.ai`, description: post.description, canonical: slugUrl(post), body: articleBody, jsonLd }));
}

const urls = [
  ['https://dabblewith.ai/', 'weekly', '1.0'],
  ['https://dabblewith.ai/autopilot/', 'daily', '0.9'],
  ['https://dabblewith.ai/sessions/', 'daily', '0.9'],
  ['https://dabblewith.ai/blog/', 'daily', '0.9'],
  ['https://dabblewith.ai/casagrand-firstcity/', 'weekly', '0.9'],
  ['https://dabblewith.ai/casagrand-firstcity/rsvp/', 'weekly', '0.8'],
  ['https://dabblewith.ai/casagrand-firstcity/community-bot/', 'weekly', '0.8'],
  ['https://dabblewith.ai/casagrand-firstcity/flyer/', 'weekly', '0.7'],
  ['https://dabblewith.ai/community-bot/', 'weekly', '0.9'],
  ['https://dabblewith.ai/privacy/', 'monthly', '0.5'],
  ['https://dabblewith.ai/terms/', 'monthly', '0.5'],
  ...published.map(p => [slugUrl(p), 'monthly', '0.8', p.publishedAt])
];
const today = new Date().toISOString().slice(0,10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([loc, freq, pri, lastmod]) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod || today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`).join('\n')}\n</urlset>\n`;
write(path.join(root, 'sitemap.xml'), sitemap);
console.log(`Generated ${published.length} published blog post(s).`);
