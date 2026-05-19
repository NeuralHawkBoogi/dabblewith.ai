const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const file = path.join(root, 'data', 'community-os.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const now = new Date();
const today = now.toISOString().slice(0, 10);

data.updatedAt = now.toISOString();

// Small deterministic autonomy loop: promote a ready session if one exists,
// rotate agent statuses, and log public state. This avoids fake member counts
// while keeping the operating system alive and inspectable.
const ready = data.sessionQueue.find(s => s.stage === 'ready_for_host_review');
if (ready && !data.publicChangelog.some(c => c.date === today && c.title.includes(ready.id))) {
  data.publicChangelog.unshift({
    date: today,
    title: `${ready.id} promoted for host review`,
    body: `Autopilot selected “${ready.title}” as the strongest next session candidate. Human approval is still required before announcement.`
  });
}

for (const agent of data.agents) {
  if (agent.id === 'recap_agent') agent.status = 'standby';
  if (agent.id === 'content_agent') agent.status = 'active';
}

data.publicChangelog = data.publicChangelog.slice(0, 12);
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
execFileSync(process.execPath, [path.join(root, 'scripts', 'generate-community-os.js')], { cwd: root, stdio: 'inherit' });
execFileSync(process.execPath, [path.join(root, 'scripts', 'generate-blog.js')], { cwd: root, stdio: 'inherit' });
console.log('Community autopilot completed.');
