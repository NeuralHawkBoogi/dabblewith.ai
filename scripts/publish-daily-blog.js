const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const postsPath = path.join(root, 'data', 'blog-posts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
const today = new Date().toISOString().slice(0, 10);

function wordCount(post) {
  return [post.title, post.description, post.excerpt, ...(post.sections || []).flat()]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

function qualityIssues(post) {
  const issues = [];
  const sources = Array.isArray(post.researchBrief?.sources) ? post.researchBrief.sources : [];
  if (!post.researchBrief) issues.push('missing researchBrief');
  if ((post.qualityScore || 0) < 80) issues.push('qualityScore below 80');
  if (sources.length < 5) issues.push('fewer than 5 research sources/inputs');
  if (!post.researchBrief?.artifact && !post.artifact && !post.checklist && !post.framework) issues.push('missing practical artifact');
  if (!Array.isArray(post.researchBrief?.risks) || post.researchBrief.risks.length === 0) issues.push('missing risks/tradeoffs');
  if (wordCount(post) < 900) issues.push('fewer than 900 words');
  return issues;
}

const candidates = posts
  .filter(p => p.status === 'ready_for_review' && (!p.publishedAt || p.publishedAt <= today))
  .sort((a, b) => String(a.publishedAt || '').localeCompare(String(b.publishedAt || '')));

let published = false;
for (const post of candidates) {
  const issues = qualityIssues(post);
  if (issues.length) {
    post.status = 'research_pending';
    post.qualityNote = `Held back by blog quality gate: ${issues.join('; ')}.`;
    console.log(`Held back: ${post.slug} — ${issues.join('; ')}`);
    continue;
  }
  post.status = 'published';
  post.publishedAt = today;
  published = true;
  console.log(`Published: ${post.slug}`);
  break;
}

if (!published && candidates.length === 0) {
  console.log('No ready_for_review posts. Regenerating existing blog only. Create a research brief before publishing new posts.');
}

fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2) + '\n');
execFileSync(process.execPath, [path.join(root, 'scripts', 'generate-blog.js')], { cwd: root, stdio: 'inherit' });
