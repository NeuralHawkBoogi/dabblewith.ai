'use strict';

const fs = require('fs');
const path = require('path');
const { loadSession, saveSession, generateProfile } = require('./state-machine');

function listPending(storageDir) {
  if (!fs.existsSync(storageDir)) return [];
  return fs.readdirSync(storageDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(storageDir, f), 'utf8')); }
      catch { return null; }
    })
    .filter(s => s && s.state === 'pending_admin')
    .map(s => ({
      ownerId: s.ownerId,
      communityId: s.communityId,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      version: s.version,
      profile: generateProfile(s),
    }));
}

function _loadPending(storageDir, ownerId, communityId) {
  const session = loadSession(storageDir, ownerId, communityId);
  if (!session) throw new Error(`Session not found: ${ownerId}/${communityId}`);
  if (session.state !== 'pending_admin') {
    throw new Error(`Session is in state "${session.state}", expected pending_admin`);
  }
  return session;
}

function approve(storageDir, ownerId, communityId, reviewedBy) {
  const session = _loadPending(storageDir, ownerId, communityId);
  const now = new Date().toISOString();
  session.state = 'activated';
  session.version += 1;
  session.reviewedAt = now;
  session.reviewedBy = reviewedBy;
  session.activatedAt = now;
  saveSession(storageDir, session);
  return session;
}

function reject(storageDir, ownerId, communityId, reviewedBy, rejectionReason) {
  const session = _loadPending(storageDir, ownerId, communityId);
  const now = new Date().toISOString();
  session.state = 'rejected';
  session.version += 1;
  session.reviewedAt = now;
  session.reviewedBy = reviewedBy;
  session.rejectedAt = now;
  session.rejectionReason = rejectionReason || '';
  saveSession(storageDir, session);
  return session;
}

// --- CLI ---
if (require.main === module) {
  const [,, cmd, ...args] = process.argv;
  const storageDir = process.env.ONBOARDING_DIR || 'onboarding-data';

  if (cmd === 'list') {
    const sessions = listPending(storageDir);
    if (sessions.length === 0) {
      console.log('No sessions pending admin review.');
    } else {
      console.log(`${sessions.length} session(s) pending review:\n`);
      for (const s of sessions) {
        console.log(`  owner=${s.ownerId}  community=${s.communityId}  v${s.version}  since=${s.updatedAt}`);
        console.log(`    name="${s.profile.communityName}"  number=${s.profile.whatsappNumber}`);
      }
    }
  } else if (cmd === 'approve') {
    const [ownerId, communityId, reviewedBy] = args;
    if (!ownerId || !communityId || !reviewedBy) {
      console.error('Usage: admin-gate.js approve <ownerId> <communityId> <reviewedBy>');
      process.exit(1);
    }
    const s = approve(storageDir, ownerId, communityId, reviewedBy);
    console.log(`Approved: ${ownerId}/${communityId}  activatedAt=${s.activatedAt}  v${s.version}`);
  } else if (cmd === 'reject') {
    const [ownerId, communityId, reviewedBy, ...reasonParts] = args;
    if (!ownerId || !communityId || !reviewedBy) {
      console.error('Usage: admin-gate.js reject <ownerId> <communityId> <reviewedBy> [reason]');
      process.exit(1);
    }
    const s = reject(storageDir, ownerId, communityId, reviewedBy, reasonParts.join(' '));
    console.log(`Rejected: ${ownerId}/${communityId}  rejectedAt=${s.rejectedAt}  reason="${s.rejectionReason}"  v${s.version}`);
  } else {
    console.log('Commands: list | approve <ownerId> <communityId> <reviewedBy> | reject <ownerId> <communityId> <reviewedBy> [reason]');
    console.log('Set ONBOARDING_DIR env var to point at the storage directory (default: onboarding-data)');
    process.exit(1);
  }
}

module.exports = { listPending, approve, reject };
