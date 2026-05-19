'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { handleInboundMessage, ownerIdFromPhone, sanitizeCommunityId } = require('./whatsapp-adapter');
const { loadSession } = require('./state-machine');

const storageDir = path.join(os.tmpdir(), 'dabblewith-whatsapp-transcript-integration');

function assert(condition, message) {
  if (!condition) {
    console.error(`\nINTEGRATION TEST FAILED: ${message}`);
    process.exit(1);
  }
}

function send({ from, body, communityId }) {
  const result = handleInboundMessage(storageDir, { from, body, communityId });
  assert(result.reply && typeof result.reply === 'string', `expected bot reply for ${body}`);
  return result;
}

function persistedJson(ownerId, communityId) {
  return fs.readFileSync(path.join(storageDir, `${ownerId}_${communityId}.json`), 'utf8');
}

function run() {
  if (fs.existsSync(storageDir)) fs.rmSync(storageDir, { recursive: true, force: true });

  const from = '+91 91234 56789';
  const ownerId = ownerIdFromPhone(from);
  const communityId = sanitizeCommunityId('Women In AI / Chennai 2026');

  console.log('\n=== WhatsApp Onboarding Transcript Integration Test ===\n');

  const transcript = [
    ['hi, I want a community bot', 'start'],
    ['Women in AI Chennai', 'community_basics'],
    ['A practical circle for women learning, building, and shipping AI projects.', 'audience'],
    ['Students, founders, PMs, and engineers in Chennai who want hands-on AI support.', 'tone'],
  ];

  let last;
  for (const [body, expectedState] of transcript) {
    last = send({ from, body, communityId });
    assert(last.state === expectedState, `expected ${expectedState} after ${body}, got ${last.state}`);
  }

  // Simulate an interruption: a later webhook invocation must resume from disk.
  const resumedBefore = loadSession(storageDir, ownerId, communityId);
  assert(resumedBefore.state === 'tone', 'session should be paused at tone before interruption resume');

  const rest = [
    ['warm, encouraging, clear, a little playful', 'topics'],
    ['AI workflows, career growth, demos, hack nights', 'rules'],
    ['No spam. No harassment. Share sources. Help beginners.', 'links_events'],
    ['https://dabblewith.ai/sessions/ and a June meetup', 'registration_fields'],
    ['name, role, city, AI goal', 'whatsapp_number'],
    ['+91 95661 12518', 'review'],
  ];

  for (const [body, expectedState] of rest) {
    last = send({ from, body, communityId });
    assert(last.state === expectedState, `expected ${expectedState} after resume body ${body}, got ${last.state}`);
  }

  assert(last.reply.includes('Reply YES'), 'review reply should ask for YES confirmation');
  assert(last.reply.includes('Women in AI Chennai'), 'review reply should include collected community name');

  const revise = send({ from, body: 'change tone', communityId });
  assert(revise.state === 'tone', 'change tone should jump back to tone field');

  const revisedTone = send({ from, body: 'supportive, practical, founder-friendly', communityId });
  assert(revisedTone.state === 'review', 'single-field revision should return to review');
  assert(revisedTone.reply.includes('supportive, practical, founder-friendly'), 'review should reflect revised tone');

  const submitted = send({ from, body: 'YES', communityId });
  assert(submitted.done === true, 'YES should complete owner-side onboarding');
  assert(submitted.state === 'pending_admin', 'submitted onboarding should wait for admin review');

  const session = loadSession(storageDir, ownerId, communityId);
  assert(session.source === 'whatsapp', 'session should record WhatsApp source');
  assert(session.owner.maskedPhone === '****6789', 'session should store only masked owner phone');
  assert(session.answers.tone === 'supportive, practical, founder-friendly', 'revised tone should persist');
  assert(session.version === 2, 'one review revision should create profile version 2');
  assert(Array.isArray(session.history) && session.history.length === 1, 'revision should append profile history');
  assert(session.history[0].tone === 'supportive, practical, founder-friendly', 'history snapshot should include revised tone');

  const raw = persistedJson(ownerId, communityId);
  assert(!raw.includes('91234') && !raw.includes('56789') && !raw.includes(from), 'persisted transcript must not contain raw phone number');
  assert(!raw.includes('hi, I want a community bot'), 'first greeting should not be stored as an answer');

  console.log('=== WHATSAPP ONBOARDING TRANSCRIPT INTEGRATION TEST PASSED ===');
  console.log(`Storage: ${storageDir}`);
}

run();
