'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs');
const sm = require('./state-machine');
const ag = require('./admin-gate');

const storageDir = path.join(os.tmpdir(), 'dabblewith-admin-gate-smoke');

const SCRIPT = [
  'Test Community',
  'A test community for smoke testing',
  'Developers',
  'friendly',
  'testing, automation',
  'Be respectful.',
  'none',
  'name, email',
  '+91 00000 00000',
  'YES',
];

function driveToEnd(ownerId, communityId) {
  let session = sm.createSession(ownerId, communityId);
  sm.saveSession(storageDir, session);
  for (const answer of SCRIPT) {
    const result = sm.advance(session, answer);
    session = result.session;
    sm.saveSession(storageDir, session);
    if (result.done) break;
  }
  return session;
}

function assert(condition, msg) {
  if (!condition) {
    console.error(`\nSMOKE TEST FAILED: ${msg}`);
    process.exit(1);
  }
}

function run() {
  if (fs.existsSync(storageDir)) fs.rmSync(storageDir, { recursive: true });

  console.log('\n=== Admin Gate Smoke Test ===\n');

  // 1. Create two sessions and drive both to pending_admin
  const s1 = driveToEnd('owner_a', 'community_a');
  const s2 = driveToEnd('owner_b', 'community_b');

  assert(s1.state === 'pending_admin', `owner_a should be pending_admin, got ${s1.state}`);
  assert(s2.state === 'pending_admin', `owner_b should be pending_admin, got ${s2.state}`);
  assert(s1.version === 1, `owner_a version should be 1 before admin action, got ${s1.version}`);
  console.log('Step 1 PASS: two sessions in pending_admin');

  // 2. List pending — expect 2
  const pending = ag.listPending(storageDir);
  assert(pending.length === 2, `Expected 2 pending, got ${pending.length}`);
  assert(pending.every(p => p.profile && p.profile.communityName), 'All pending should have a profile');
  console.log('Step 2 PASS: listPending returns 2 sessions with profiles');

  // 3. Admin-edit owner_a before approval
  const edited = ag.editPending(storageDir, 'owner_a', 'community_a', 'admin@dabblewith.ai', {
    tone: 'warm, practical and concise',
    whatsappNumber: '+91 99999 99999',
  }, 'Normalize owner tone and test number before activation');
  assert(edited.state === 'pending_admin', `Edited session should remain pending_admin, got ${edited.state}`);
  assert(edited.version === 2, `Expected version 2 after edit, got ${edited.version}`);
  assert(edited.answers.tone === 'warm, practical and concise', 'Admin edit should update tone');
  assert(edited.answers.whatsappNumber === '+91 99999 99999', 'Admin edit should update WhatsApp number');
  assert(edited.adminEditedBy === 'admin@dabblewith.ai', 'adminEditedBy mismatch');
  assert(Array.isArray(edited.adminEdits) && edited.adminEdits.length === 1, 'adminEdits should record one edit');
  assert(Array.isArray(edited.history) && edited.history.length === 1, 'history should include edited profile snapshot');
  assert(edited.history[0].tone === 'warm, practical and concise', 'history snapshot should include edited tone');
  console.log('Step 3 PASS: owner_a admin-edited while remaining pending_admin, version bumped to 2');

  // 4. Approve owner_a
  const approved = ag.approve(storageDir, 'owner_a', 'community_a', 'admin@dabblewith.ai');
  assert(approved.state === 'activated', `Expected activated, got ${approved.state}`);
  assert(approved.version === 3, `Expected version 3 after edit+approve, got ${approved.version}`);
  assert(typeof approved.reviewedAt === 'string', 'reviewedAt should be a string');
  assert(approved.reviewedBy === 'admin@dabblewith.ai', 'reviewedBy mismatch');
  assert(typeof approved.activatedAt === 'string', 'activatedAt should be a string');
  console.log('Step 4 PASS: owner_a approved, activatedAt stamped, version bumped to 3');

  // 5. Reject owner_b
  const rejected = ag.reject(storageDir, 'owner_b', 'community_b', 'admin@dabblewith.ai', 'Incomplete information');
  assert(rejected.state === 'rejected', `Expected rejected, got ${rejected.state}`);
  assert(rejected.version === 2, `Expected version 2 after reject, got ${rejected.version}`);
  assert(typeof rejected.rejectedAt === 'string', 'rejectedAt should be a string');
  assert(rejected.rejectionReason === 'Incomplete information', 'rejectionReason mismatch');
  assert(rejected.reviewedBy === 'admin@dabblewith.ai', 'reviewedBy mismatch');
  console.log('Step 5 PASS: owner_b rejected with reason, version bumped to 2');

  // 6. List pending — expect 0
  const pendingAfter = ag.listPending(storageDir);
  assert(pendingAfter.length === 0, `Expected 0 pending after review, got ${pendingAfter.length}`);
  console.log('Step 6 PASS: listPending returns 0 after all reviewed');

  // 7. Verify persisted state matches in-memory returns
  const loadedApproved = sm.loadSession(storageDir, 'owner_a', 'community_a');
  assert(loadedApproved.state === 'activated', 'Persisted state should be activated');
  assert(loadedApproved.activatedAt === approved.activatedAt, 'activatedAt should persist');

  const loadedRejected = sm.loadSession(storageDir, 'owner_b', 'community_b');
  assert(loadedRejected.state === 'rejected', 'Persisted state should be rejected');
  assert(loadedRejected.rejectionReason === 'Incomplete information', 'rejectionReason should persist');
  console.log('Step 7 PASS: persisted sessions match stamped values');

  // 8. advance() on activated/rejected sessions reports done
  const { done: aEnd } = sm.advance(loadedApproved, 'anything');
  assert(aEnd === true, 'advance() on activated should report done=true');
  const { done: rEnd } = sm.advance(loadedRejected, 'anything');
  assert(rEnd === true, 'advance() on rejected should report done=true');
  console.log('Step 8 PASS: advance() on terminal admin states reports done');

  // 9. Guard: approve/reject on non-pending session should throw
  let threw = false;
  try { ag.approve(storageDir, 'owner_a', 'community_a', 'x'); } catch { threw = true; }
  assert(threw, 'approve on non-pending session should throw');
  console.log('Step 9 PASS: double-approve guard throws');

  // 10. Guard: invalid admin edit fields should throw on a fresh pending session
  driveToEnd('owner_c', 'community_c');
  threw = false;
  try { ag.editPending(storageDir, 'owner_c', 'community_c', 'admin@dabblewith.ai', { rawPhone: '+91 11111 11111' }); } catch { threw = true; }
  assert(threw, 'editPending with unsupported fields should throw');
  console.log('Step 10 PASS: unsupported admin edit fields throw');

  console.log('\n=== ADMIN GATE SMOKE TEST PASSED ===');
}

run();
