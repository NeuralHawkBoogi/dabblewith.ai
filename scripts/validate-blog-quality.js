const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const postsPath = path.join(root, 'data', 'blog-posts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
const enforceAll = process.argv.includes('--all');
const minScore = 80;
let failed = false;

function words(post) {
  return [post.title, post.description, post.excerpt, ...(post.sections || []).flat()]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

function sourceCount(post) {
  return post.researchBrief && Array.isArray(post.researchBrief.sources) ? post.researchBrief.sources.length : 0;
}

function hasArtifact(post) {
  return Boolean(post.researchBrief?.artifact || post.artifact || post.checklist || post.framework);
}

function hasRisks(post) {
  const text = JSON.stringify(post).toLowerCase();
  return Boolean(post.researchBrief?.risks?.length) || /risk|tradeoff|failure|limitation|pitfall/.test(text);
}

function validate(post) {
  const issues = [];
  if (!post.researchBrief) issues.push('missing researchBrief');
  if ((post.qualityScore || 0) < minScore) issues.push(`qualityScore < ${minScore}`);
  if (sourceCount(post) < 5) issues.push('fewer than 5 sources/inputs');
  if (!hasArtifact(post)) issues.push('missing practical artifact');
  if (!hasRisks(post)) issues.push('missing risks/tradeoffs');
  if (words(post) < 900) issues.push('fewer than 900 words');
  return issues;
}

for (const post of posts) {
  const shouldCheck = enforceAll ? post.status === 'published' : ['ready_for_review', 'published_candidate'].includes(post.status);
  if (!shouldCheck) continue;
  const issues = validate(post);
  if (issues.length) {
    failed = true;
    console.error(`BLOG QUALITY FAIL: ${post.slug}`);
    for (const issue of issues) console.error(`  - ${issue}`);
  } else {
    console.log(`BLOG QUALITY OK: ${post.slug}`);
  }
}

if (failed) process.exit(1);
console.log('blog quality validation passed');
