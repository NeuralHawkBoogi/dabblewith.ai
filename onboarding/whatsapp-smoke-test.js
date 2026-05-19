'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { handleInboundMessage, ownerIdFromPhone, maskPhone, sanitizeCommunityId } = require('./whatsapp-adapter');
const { loadSession } = require('./state-machine');

const storageDir = path.join(os.tmpdir(), 'dabblewith-whatsapp-onboarding-smoke');

function assert(condition, message) {
  if (!condition) {
    console.error(`\nSMOKE TEST FAILED: ${message}`);
    process.exit(1);
  }
}

function send(from, body, communityId) {
  const result = handleInboundMessage(storageDir, { from, body, communityId });
  console.log(`USER ${maskPhone(from)}: ${body}`);
  console.log(`BOT: ${result.reply}\n`);
  return result;
}

function sessionFile(ownerId, communityId) {
  return path.join(storageDir, `${ownerId}_${communityId}.json`);
}

function run() {
  if (fs.existsSync(storageDir)) fs.rmSync(storageDir, { recursive: true });

  console.log('\n=== WhatsApp Adapter Smoke Test ===\n');

  const ownerA = '+91 98765 43210';
  const ownerB = '+1 (415) 555-0100';
  const ownerAId = ownerIdFromPhone(ownerA);
  const ownerBId = ownerIdFromPhone(ownerB);
  const communityId = sanitizeCommunityId('Founder Circle');

  const first = send(ownerA, 'hello', communityId);
  assert(first.isNew === true, 'first message should create a session');
  assert(first.state === 'start', 'new session should remain at start and return the opening prompt');
  assert(first.reply.includes("What's your community called"), 'first reply should be onboarding start prompt');

  const second = send(ownerA, 'Founder Circle', communityId);
  assert(second.isNew === false, 'second message should resume existing session');
  assert(second.state === 'community_basics', 'second message should advance to community_basics');

  send(ownerB, 'AI Operators Chennai', communityId);
  assert(ownerAId !== ownerBId, 'distinct owners should have distinct opaque ids');
  assert(fs.existsSync(sessionFile(ownerAId, communityId)), 'owner A session file should exist');
  assert(fs.existsSync(sessionFile(ownerBId, communityId)), 'owner B session file should exist');

  const script = [
    'A private builder circle for practical founders',
    'Founders and operators using AI in real work',
    'warm, direct, useful',
    'AI workflows, launches, customer research',
    'No spam. Share useful specifics. Be kind.',
    'https://dabblewith.ai/sessions/ | monthly build night',
    'name, city, role, current project',
    '+91 95660 00000',
    'revise registration fields',
    'name, city, role, current project, biggest AI bottleneck',
    'YES',
  ];

  let result;
  for (const body of script) result = send(ownerA, body, communityId);

  assert(result.done === true, 'final YES should submit for admin review');
  assert(result.state === 'pending_admin', 'final state should be pending_admin');

  const session = loadSession(storageDir, ownerAId, communityId);
  assert(session.state === 'pending_admin', 'persisted session should be pending_admin');
  assert(session.answers.communityName === 'Founder Circle', 'community name should persist from resumed conversation');
  assert(session.answers.registrationFields.includes('biggest AI bottleneck'), 'revised registration fields should persist');
  assert(session.version === 2, 'one review revision should bump version to 2');
  assert(session.owner.maskedPhone === '****3210', 'session should persist only masked sender phone');

  const persisted = fs.readFileSync(sessionFile(ownerAId, communityId), 'utf8');
  assert(!persisted.includes('98765') && !persisted.includes('43210'), 'raw owner phone should not appear in persisted session');
  assert(!persisted.includes(ownerA), 'formatted owner phone should not appear in persisted session');

  const terminal = send(ownerA, 'anything after submit', communityId);
  assert(terminal.done === true && terminal.state === 'pending_admin', 'terminal pending_admin session should remain done');

  console.log('=== WHATSAPP ADAPTER SMOKE TEST PASSED ===');
  console.log(`Storage: ${storageDir}`);
}

run();
