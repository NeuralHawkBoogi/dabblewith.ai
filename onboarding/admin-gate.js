'use strict';

const fs = require('fs');
const path = require('path');
const { loadSession, saveSession, generateProfile } = require('./state-machine');

const EDITABLE_FIELDS = new Set([
  'communityName',
  'description',
  'audience',
  'tone',
  'topics',
  'rules',
  'linksEvents',
  'registrationFields',
  'whatsappNumber',
]);

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


function editPending(storageDir, ownerId, communityId, reviewedBy, updates, note = '') {
  const session = _loadPending(storageDir, ownerId, communityId);
  const entries = Object.entries(updates || {})
    .map(([field, value]) => [String(field || '').trim(), String(value || '').trim()])
    .filter(([field, value]) => field && value);

  if (entries.length === 0) throw new Error('At least one non-empty field=value update is required');

  const invalid = entries.filter(([field]) => !EDITABLE_FIELDS.has(field)).map(([field]) => field);
  if (invalid.length) throw new Error(`Unsupported onboarding field(s): ${invalid.join(', ')}`);

  const now = new Date().toISOString();
  if (!Array.isArray(session.history)) session.history = [];
  for (const [field, value] of entries) {
    session.answers[field] = value;
  }
  session.version = (session.version || 1) + 1;
  session.adminEditedAt = now;
  session.adminEditedBy = reviewedBy;
  if (note) session.adminEditNote = note;
  if (!Array.isArray(session.adminEdits)) session.adminEdits = [];
  session.adminEdits.push({
    editedAt: now,
    editedBy: reviewedBy,
    fields: entries.map(([field]) => field),
    note,
    version: session.version,
  });
  session.history.push(generateProfile(session));
  saveSession(storageDir, session);
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
  } else if (cmd === 'edit') {
    const [ownerId, communityId, reviewedBy, ...updateArgs] = args;
    if (!ownerId || !communityId || !reviewedBy || updateArgs.length === 0) {
      console.error('Usage: admin-gate.js edit <ownerId> <communityId> <reviewedBy> <field=value> [field=value...] [--note=note]');
      process.exit(1);
    }
    const updates = {};
    let note = '';
    for (const arg of updateArgs) {
      if (arg.startsWith('--note=')) {
        note = arg.slice('--note='.length);
        continue;
      }
      const eq = arg.indexOf('=');
      if (eq <= 0) {
        console.error(`Invalid update "${arg}". Expected field=value.`);
        process.exit(1);
      }
      updates[arg.slice(0, eq)] = arg.slice(eq + 1);
    }
    const s = editPending(storageDir, ownerId, communityId, reviewedBy, updates, note);
    console.log(`Edited: ${ownerId}/${communityId}  fields=${Object.keys(updates).join(',')}  v${s.version}`);
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
    console.log('Commands: list | edit <ownerId> <communityId> <reviewedBy> <field=value>... | approve <ownerId> <communityId> <reviewedBy> | reject <ownerId> <communityId> <reviewedBy> [reason]');
    console.log('Set ONBOARDING_DIR env var to point at the storage directory (default: onboarding-data)');
    process.exit(1);
  }
}

module.exports = { listPending, editPending, approve, reject };
