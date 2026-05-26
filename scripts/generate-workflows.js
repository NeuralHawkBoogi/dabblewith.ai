#!/usr/bin/env node
/*
 * Generates static HTML for the Workflow Exchange:
 *  - /workflows/index.html
 *  - /workflows/<category-slug>/index.html for each category
 *  - /workflows/<workflow-slug>/index.html for each workflow
 *
 * Source: data/workflows.json
 *
 * Privacy rules (must hold):
 *  - No PII or raw user data in generated pages, JSON-LD, or analytics events.
 *  - CTA hrefs may include UTM/intent fields; never include emails, phones,
 *    tokens, or private content in event payloads.
 *  - Schema.org JSON-LD must only reference workflow content from the JSON
 *    source file. No external user data.
 *
 * Usage: node scripts/generate-workflows.js [--check]
 *   --check : exit non-zero if generated output would differ from disk.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'workflows.json');
const OUT_DIR = path.join(ROOT, 'workflows');
const SITE = 'https://dabblewith.ai';

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const categories = data.categories || [];
const workflows = data.workflows || [];
const categoryBySlug = Object.fromEntries(categories.map(c => [c.slug, c]));
const workflowBySlug = Object.fromEntries(workflows.map(w => [w.slug, w]));

function escape(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function htmlAttr(str) {
  return escape(str);
}

function jsonLdEscape(str) {
  return String(str == null ? '' : str).replace(/</g, '\\u003c');
}

const BASE_STYLE = `
:root{--bg:#060912;--panel:rgba(16,27,48,.92);--line:rgba(116,255,219,.26);--line-hard:#74ffdb;--text:#f2fbff;--muted:#9eb0c2;--green:#74ff7b;--cyan:#74ffdb;--blue:#58a6ff;--amber:#ffcc66;--violet:#a78bfa;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;color:var(--text);background:linear-gradient(rgba(116,255,219,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(116,255,219,.055) 1px,transparent 1px),radial-gradient(circle at 20% 0%,rgba(88,166,255,.22),transparent 28rem),radial-gradient(circle at 90% 10%,rgba(116,255,123,.16),transparent 25rem),radial-gradient(circle at 50% 100%,rgba(167,139,250,.15),transparent 34rem),var(--bg);background-size:42px 42px,42px 42px,auto,auto,auto,auto;overflow-x:hidden}
a{color:inherit}
.shell{width:min(1120px,calc(100% - 30px));margin:0 auto}
nav.top{display:flex;justify-content:space-between;align-items:center;padding:24px 0;gap:18px;flex-wrap:wrap}
.logo{text-decoration:none;font-size:30px;font-weight:900;letter-spacing:-.055em}
.nav{display:flex;gap:10px;flex-wrap:wrap}
.nav a{border:1px solid var(--line);border-radius:999px;padding:9px 12px;text-decoration:none;color:var(--muted);background:rgba(255,255,255,.03);font-size:14px}
.hero,.card,.panel,.step{border:1px solid var(--line);background:linear-gradient(180deg,rgba(16,27,48,.94),rgba(8,13,25,.92));border-radius:24px;box-shadow:0 24px 90px rgba(0,0,0,.45)}
.hero{padding:clamp(28px,5vw,56px);margin:18px auto 28px}
.eyebrow{width:fit-content;color:var(--cyan);border:1px solid var(--line-hard);background:rgba(116,255,219,.08);border-radius:999px;padding:9px 12px;font:12px/1 ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.08em}
h1{font-size:clamp(36px,6vw,72px);line-height:.95;letter-spacing:-.055em;margin:18px 0 14px;max-width:920px}
h2{font-size:clamp(24px,3.6vw,40px);line-height:1;letter-spacing:-.04em;margin:0 0 14px}
h3{font-size:20px;margin:0 0 10px;letter-spacing:-.02em}
.lead{font-size:clamp(17px,2vw,21px);color:#d7e9f7;line-height:1.55;max-width:860px}
.actions{display:flex;gap:13px;flex-wrap:wrap;margin-top:24px}
.btn{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line-hard);color:var(--cyan);background:rgba(116,255,219,.07);border-radius:14px;padding:12px 18px;text-decoration:none;font-weight:800;font-size:14px}
.btn.primary{color:#04120e;background:var(--green);border-color:var(--green);box-shadow:0 0 30px rgba(116,255,123,.30)}
section{padding:26px 0}
.section-head{display:grid;grid-template-columns:.85fr 1fr;gap:22px;align-items:end;margin-bottom:24px}
.section-head p,.card p,.step p,.panel p,.body p,.body li{color:var(--muted);line-height:1.65}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.two{grid-template-columns:repeat(2,1fr)}
.card{padding:22px;text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:8px}
.card .meta{color:var(--cyan);font:12px/1 ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.08em}
.card strong{font-size:18px;letter-spacing:-.015em}
.card:hover{border-color:var(--line-hard)}
.badge{display:inline-flex;border:1px solid rgba(116,255,123,.45);color:var(--green);background:rgba(116,255,123,.08);padding:6px 9px;border-radius:999px;font:12px/1.2 ui-monospace,Menlo,monospace;margin-bottom:14px}
.badge.blue{color:var(--blue);border-color:rgba(88,166,255,.45);background:rgba(88,166,255,.08)}
.badge.warn{color:var(--amber);border-color:rgba(255,204,102,.45);background:rgba(255,204,102,.08)}
.body{max-width:780px;line-height:1.65;color:#d7e9f7}
.body h2{margin-top:30px}
.body ol,.body ul{padding-left:20px}
.kv{display:grid;grid-template-columns:160px 1fr;gap:12px;margin:14px 0}
.kv .k{color:var(--muted);font:12px/1.6 ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.08em}
.kv .v{color:#f2fbff}
.callout{border:1px solid rgba(255,204,102,.4);background:rgba(255,204,102,.06);border-radius:16px;padding:16px;margin:18px 0;color:#ffd9a0}
.privacy{border:1px solid rgba(167,139,250,.4);background:rgba(167,139,250,.06);border-radius:16px;padding:16px;margin:18px 0;color:#d6caff}
footer{border-top:1px solid var(--line);color:var(--muted);padding:26px 0 34px;margin-top:36px;font:13px/1.5 ui-monospace,Menlo,monospace}
@media(max-width:860px){.grid,.two,.section-head{grid-template-columns:1fr}.nav{justify-content:flex-start}.kv{grid-template-columns:1fr}}
`;

const ANALYTICS_HEAD = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-7473LZQGX2"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-7473LZQGX2',{page_path:location.pathname});</script>
<script src="/scripts/web/dabblewith-tracking.js" defer></script>`;

const NAV = `<nav class="top shell">
  <a class="logo" href="/">dabblewith.ai</a>
  <div class="nav">
    <a href="/workflows/" data-cta="nav_workflows" data-event="workflow_explore_click">Workflows</a>
    <a href="/submit-workflow/" data-cta="nav_submit" data-event="workflow_submit_start">Submit</a>
    <a href="/newsletter/" data-cta="nav_newsletter" data-event="newsletter_signup_click">Newsletter</a>
    <a href="/challenges/" data-cta="nav_challenges" data-event="challenge_join_click">Challenges</a>
    <a href="/build-in-public/" data-cta="nav_build_public" data-event="build_public_metrics_view">Build in public</a>
    <a href="/community-bot/" data-cta="nav_community_bot" data-event="community_bot_setup_click">Community bot</a>
    <a href="/blog/" data-cta="nav_blog">Blog</a>
  </div>
</nav>`;

function footer(canonicalPath) {
  return `<footer class="shell">
  <span>AI-drafted · human-reviewed · privacy-aware · <a href="/workflows/" data-cta="footer_workflows" data-event="workflow_explore_click">Workflows</a> · <a href="/submit-workflow/" data-cta="footer_submit" data-event="workflow_submit_start">Submit</a> · <a href="/newsletter/" data-cta="footer_newsletter" data-event="newsletter_signup_click">Newsletter</a> · <a href="/challenges/" data-cta="footer_challenges" data-event="challenge_join_click">Challenges</a> · <a href="/build-in-public/" data-cta="footer_build_public" data-event="build_public_metrics_view">Build in public</a> · <a href="/community-policy/" data-cta="footer_policy">Community policy</a> · <a href="/community-bot/" data-cta="footer_community_bot" data-event="community_bot_setup_click">Community bot</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></span>
  <div style="margin-top:10px;color:var(--muted);font-size:12px">Canonical: ${escape(SITE + canonicalPath)}</div>
</footer>`;
}

function pageShell({ title, description, canonicalPath, jsonLd, body }) {
  const canonical = SITE + canonicalPath;
  const ldBlocks = (jsonLd || []).map(obj =>
    `<script type="application/ld+json">${jsonLdEscape(JSON.stringify(obj))}</script>`
  ).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<meta name="theme-color" content="#060912" />
<meta property="og:image" content="https://dabblewith.ai/app-icon-1024.png" />
<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${escape(canonical)}" />
<meta property="og:site_name" content="dabblewith.ai" />
<meta property="og:title" content="${escape(title)}" />
<meta property="og:description" content="${escape(description)}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${escape(canonical)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escape(title)}" />
<meta name="twitter:description" content="${escape(description)}" />
${ANALYTICS_HEAD}
${ldBlocks}
<style>${BASE_STYLE}</style>
</head>
<body>
${NAV}
<main>
${body}
</main>
${footer(canonicalPath)}
</body>
</html>
`;
}

function workflowCard(workflow) {
  const category = categoryBySlug[workflow.category] || { title: 'Workflow' };
  return `<a class="card" href="/workflows/${escape(workflow.slug)}/" data-cta="workflow_card_${escape(workflow.slug)}" data-event="workflow_view" data-audience="${htmlAttr(workflow.audience_segment || '')}" data-workflow-category="${htmlAttr(workflow.category || '')}">
  <span class="meta">${escape(category.title)} · ${escape(workflow.difficulty || '')}</span>
  <strong>${escape(workflow.title)}</strong>
  <p>${escape(workflow.problem)}</p>
</a>`;
}

function renderIndexPage() {
  const body = `
<section class="hero shell">
  <div class="eyebrow">workflow exchange</div>
  <h1>Practical AI workflows you can fork.</h1>
  <p class="lead">Every workflow on Dabblewith.ai is a mini-tutorial with the real problem, the tools used, the human-review point, and what to never automate. Browse a category, fork what fits, then submit your own.</p>
  <div class="actions">
    <a class="btn primary" href="/submit-workflow/" data-cta="workflows_index_submit" data-event="workflow_submit_start">Submit a workflow</a>
    <a class="btn" href="/newsletter/" data-cta="workflows_index_newsletter" data-event="newsletter_signup_click">Get the weekly issue</a>
    <a class="btn" href="/challenges/" data-cta="workflows_index_challenge" data-event="challenge_join_click">Join the 4-week challenge</a>
  </div>
</section>

<section class="shell">
  <div class="section-head">
    <div><div class="eyebrow">browse by audience</div><h2>Pick the path that fits your work.</h2></div>
    <p>Five categories. Each one is small on purpose — these are workflows you can ship this week, not feature lists.</p>
  </div>
  <div class="grid">
    ${categories.map(cat => `<a class="card" href="/workflows/${escape(cat.slug)}/" data-cta="category_card_${escape(cat.slug)}" data-event="workflow_explore_click" data-audience="${htmlAttr(cat.audience_segment)}" data-workflow-category="${htmlAttr(cat.slug)}">
      <span class="meta">${escape(cat.audience_segment)}</span>
      <strong>${escape(cat.title)}</strong>
      <p>${escape(cat.summary)}</p>
    </a>`).join('\n')}
  </div>
</section>

<section class="shell">
  <div class="section-head">
    <div><div class="eyebrow">all workflows</div><h2>${workflows.length} published workflows.</h2></div>
    <p>Every workflow says what's reversible, what's not, and where a human must approve.</p>
  </div>
  <div class="grid">
    ${workflows.map(workflowCard).join('\n')}
  </div>
</section>
`;
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Dabblewith.ai workflow exchange",
    "url": SITE + "/workflows/",
    "numberOfItems": workflows.length,
    "itemListElement": workflows.map((w, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": SITE + "/workflows/" + w.slug + "/",
      "name": w.title
    }))
  };
  return pageShell({
    title: "AI workflow exchange — Dabblewith.ai",
    description: "Practical AI workflows founders, creators, researchers, healthcare ops teams, and no-code builders actually use. Fork one, adapt it, or submit your own.",
    canonicalPath: "/workflows/",
    jsonLd: [itemList],
    body
  });
}

function renderCategoryPage(category) {
  const items = workflows.filter(w => w.category === category.slug);
  const body = `
<section class="hero shell">
  <div class="eyebrow">${escape(category.audience_segment)}</div>
  <h1>${escape(category.title)}</h1>
  <p class="lead">${escape(category.summary)}</p>
  <div class="actions">
    <a class="btn primary" href="/submit-workflow/?intent=submit-workflow&utm_source=workflows&utm_medium=category-page&utm_campaign=workflow_exchange&utm_content=${escape(category.slug)}" data-cta="category_submit_${escape(category.slug)}" data-event="workflow_submit_start">Submit a workflow in this category</a>
    <a class="btn" href="/newsletter/" data-cta="category_newsletter_${escape(category.slug)}" data-event="newsletter_signup_click">Get the weekly issue</a>
  </div>
</section>

<section class="shell">
  <div class="section-head">
    <div><div class="eyebrow">workflows in this category</div><h2>${items.length} workflow${items.length === 1 ? '' : 's'}.</h2></div>
    <p>Each workflow lists the exact problem, the tools, the human-review point, and what to never automate.</p>
  </div>
  <div class="grid">
    ${items.map(workflowCard).join('\n')}
  </div>
</section>
`;
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": category.title,
    "url": SITE + "/workflows/" + category.slug + "/",
    "numberOfItems": items.length,
    "itemListElement": items.map((w, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": SITE + "/workflows/" + w.slug + "/",
      "name": w.title
    }))
  };
  return pageShell({
    title: category.title + " — Dabblewith.ai",
    description: category.summary,
    canonicalPath: "/workflows/" + category.slug + "/",
    jsonLd: [itemList],
    body
  });
}

function renderWorkflowPage(workflow) {
  const category = categoryBySlug[workflow.category] || { title: 'Workflow', slug: '' };
  const related = (workflow.related || [])
    .map(slug => workflowBySlug[slug])
    .filter(Boolean);
  const stepHtml = workflow.steps.map(s => `<li>${escape(s)}</li>`).join('\n');
  const forkHtml = (workflow.fork_ideas || []).map(s => `<li>${escape(s)}</li>`).join('\n');
  const toolsHtml = (workflow.tools || []).map(t => `<li>${escape(t)}</li>`).join('\n');
  const primaryCta = workflow.primary_cta || null;

  const body = `
<section class="hero shell">
  <div class="eyebrow">${escape(category.title)}</div>
  <h1>${escape(workflow.title)}</h1>
  <p class="lead">${escape(workflow.problem)}</p>
  <div class="actions">
    ${primaryCta ? `<a class="btn primary" href="${escape(primaryCta.href)}" data-cta="workflow_${escape(workflow.slug)}_primary" data-event="${escape(primaryCta.event)}" data-audience="${htmlAttr(workflow.audience_segment || '')}" data-workflow-category="${htmlAttr(workflow.category || '')}">${escape(primaryCta.label)}</a>` : ''}
    <a class="btn" href="/submit-workflow/?intent=submit-workflow&utm_source=workflow&utm_medium=workflow-page&utm_campaign=workflow_exchange&utm_content=${escape(workflow.slug)}" data-cta="workflow_${escape(workflow.slug)}_submit" data-event="workflow_submit_start" data-audience="${htmlAttr(workflow.audience_segment || '')}" data-workflow-category="${htmlAttr(workflow.category || '')}">Submit your version</a>
    <a class="btn" href="/newsletter/" data-cta="workflow_${escape(workflow.slug)}_newsletter" data-event="newsletter_signup_click">Subscribe</a>
  </div>
</section>

<section class="shell">
  <div class="body">
    <div class="kv">
      <div class="k">Audience</div><div class="v">${escape(category.title)}</div>
      <div class="k">Problem</div><div class="v">${escape(workflow.problem)}</div>
      <div class="k">Outcome</div><div class="v">${escape(workflow.outcome)}</div>
      <div class="k">Tools used</div><div class="v"><ul>${toolsHtml}</ul></div>
      <div class="k">Time required</div><div class="v">${escape(workflow.time)}</div>
      <div class="k">Difficulty</div><div class="v">${escape(workflow.difficulty)}</div>
    </div>

    <h2>Steps</h2>
    <ol>${stepHtml}</ol>

    <h2>Example output</h2>
    <p>${escape(workflow.example_output)}</p>

    <div class="callout"><strong>Human-review point.</strong> ${escape(workflow.human_review)}</div>
    <div class="privacy"><strong>Privacy notes.</strong> ${escape(workflow.privacy_notes)}</div>

    <h2>Fork and remix ideas</h2>
    <ul>${forkHtml}</ul>
  </div>
</section>

${related.length ? `<section class="shell">
  <div class="section-head"><div><div class="eyebrow">related workflows</div><h2>Keep going.</h2></div><p>These pair well with this workflow.</p></div>
  <div class="grid">${related.map(workflowCard).join('\n')}</div>
</section>` : ''}

<section class="shell">
  <div class="hero">
    <div class="eyebrow">submit yours</div>
    <h2>Have a better version of this workflow?</h2>
    <p class="lead">Send the audience, the problem, the steps, and what you'd never automate. We review every submission with a human before publishing.</p>
    <div class="actions">
      <a class="btn primary" href="/submit-workflow/?intent=submit-workflow&utm_source=workflow&utm_medium=workflow-page&utm_campaign=workflow_exchange&utm_content=${escape(workflow.slug)}_footer" data-cta="workflow_${escape(workflow.slug)}_submit_footer" data-event="workflow_submit_start" data-audience="${htmlAttr(workflow.audience_segment || '')}" data-workflow-category="${htmlAttr(workflow.category || '')}">Submit a workflow</a>
      <a class="btn" href="/challenges/build-in-public-4-weeks/" data-cta="workflow_${escape(workflow.slug)}_challenge" data-event="challenge_join_click">Join the 4-week challenge</a>
    </div>
  </div>
</section>
`;

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": workflow.title,
    "description": workflow.outcome,
    "url": SITE + "/workflows/" + workflow.slug + "/",
    "audience": { "@type": "Audience", "audienceType": category.title },
    "totalTime": workflow.time,
    "tool": (workflow.tools || []).map(t => ({ "@type": "HowToTool", "name": t })),
    "step": workflow.steps.map((text, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": "Step " + (i + 1),
      "text": text
    })),
    "datePublished": workflow.published || "2026-05-26"
  };
  const learningResource = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": workflow.title,
    "description": workflow.problem,
    "learningResourceType": "Workflow tutorial",
    "audience": { "@type": "Audience", "audienceType": category.title },
    "url": SITE + "/workflows/" + workflow.slug + "/",
    "educationalUse": "professional development",
    "datePublished": workflow.published || "2026-05-26",
    "publisher": { "@type": "Organization", "name": "dabblewith.ai", "url": SITE + "/" }
  };

  return pageShell({
    title: workflow.title + " — Dabblewith.ai workflow exchange",
    description: workflow.problem + " — outcome: " + workflow.outcome,
    canonicalPath: "/workflows/" + workflow.slug + "/",
    jsonLd: [howTo, learningResource],
    body
  });
}

function writeFile(file, contents) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(file)) {
      console.error('[check] missing: ' + path.relative(ROOT, file));
      process.exitCode = 1;
      return;
    }
    const onDisk = fs.readFileSync(file, 'utf8');
    if (onDisk !== contents) {
      console.error('[check] diff: ' + path.relative(ROOT, file));
      process.exitCode = 1;
    }
    return;
  }
  fs.writeFileSync(file, contents);
}

function run() {
  // Index
  writeFile(path.join(OUT_DIR, 'index.html'), renderIndexPage());
  // Categories
  for (const cat of categories) {
    writeFile(path.join(OUT_DIR, cat.slug, 'index.html'), renderCategoryPage(cat));
  }
  // Workflows
  for (const w of workflows) {
    writeFile(path.join(OUT_DIR, w.slug, 'index.html'), renderWorkflowPage(w));
  }
  if (!process.argv.includes('--check')) {
    console.log('Generated ' + (1 + categories.length + workflows.length) + ' workflow pages.');
  }
}

run();
