const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const postsPath = path.join(root, 'data', 'blog-posts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
const today = new Date().toISOString().slice(0, 10);

let post = posts.find(p => p.status === 'queued' && p.publishedAt && p.publishedAt <= today)
  || posts.find(p => p.status === 'queued');

if (post) {
  post.status = 'published';
  post.publishedAt = today;
  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2) + '\n');
  console.log(`Published: ${post.slug}`);
} else {
  console.log('No queued posts. Regenerating existing blog.');
}

execFileSync(process.execPath, [path.join(root, 'scripts', 'generate-blog.js')], { cwd: root, stdio: 'inherit' });
