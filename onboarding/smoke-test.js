'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs');
const sm = require('./state-machine');

const storageDir = path.join(os.tmpdir(), 'dabblewith-onboarding-smoke');

// Scripted conversation: answers in order of states
const SCRIPT = [
  'Indie Hackers Hyderabad',                        // communityName
  'A community for indie hackers building in India', // description
  'Software developers, designers, and founders',    // audience
  'friendly and supportive',                         // tone
  'startups, SaaS, side projects, AI, bootstrapping',// topics
  'Be respectful. No spam. Share wins and learnings.',// rules
  'https://chat.whatsapp.com/example | Launch meetup June 2026', // linksEvents
  'name, profession, city',                          // registrationFields
  '+91 98765 43210',                                 // whatsappNumber
  'tone',                                            // review revision request
  'warm, concise, practical, slightly playful',      // revised tone
  'YES',                                             // review confirmation
];

function run() {
  // Clean up any leftover state from a prior run
  if (fs.existsSync(storageDir)) {
    fs.rmSync(storageDir, { recursive: true });
  }

  const ownerId = 'owner_smoke';
  const communityId = 'community_smoke';

  let session = sm.createSession(ownerId, communityId);
  sm.saveSession(storageDir, session);

  console.log('\n=== WhatsApp Onboarding Smoke Test ===\n');

  // Print initial prompt
  let prompt = sm.getPrompt(session);
  console.log(`BOT: ${prompt}`);

  let done = false;
  for (const answer of SCRIPT) {
    console.log(`\nUSER: ${answer}`);
    const result = sm.advance(session, answer);
    session = result.session;
    sm.saveSession(storageDir, session);
    console.log(`\nBOT: ${result.reply}`);

    if (answer === 'tone' && session.state !== 'tone') {
      console.error('\nSMOKE TEST FAILED: review revision request should jump to tone state');
      process.exit(1);
    }

    if (answer === 'warm, concise, practical, slightly playful') {
      if (session.state !== 'review' || !result.reply.includes('Reply YES to submit')) {
        console.error('\nSMOKE TEST FAILED: revised field should return directly to review');
        process.exit(1);
      }
      if (session.answers.tone !== answer) {
        console.error('\nSMOKE TEST FAILED: revised tone was not persisted');
        process.exit(1);
      }
    }

    if (result.done) { done = true; break; }
  }

  if (!done) {
    console.error('\nSMOKE TEST FAILED: conversation ended before reaching terminal state');
    process.exit(1);
  }

  // Verify persistence
  const loaded = sm.loadSession(storageDir, ownerId, communityId);
  if (!loaded || loaded.state !== 'pending_admin') {
    console.error('\nSMOKE TEST FAILED: persisted session in unexpected state:', loaded && loaded.state);
    process.exit(1);
  }

  // Show generated profile
  const profile = sm.generateProfile(loaded);
  console.log('\n=== Generated Community Profile ===');
  console.log(JSON.stringify(profile, null, 2));

  // Verify profile fields
  const required = ['communityName', 'description', 'audience', 'tone', 'topics', 'whatsappNumber'];
  for (const f of required) {
    if (!profile[f] || (Array.isArray(profile[f]) && profile[f].length === 0)) {
      console.error(`\nSMOKE TEST FAILED: profile missing required field "${f}"`);
      process.exit(1);
    }
  }

  // Test resume: load session and confirm it's in terminal state
  const resumed = sm.loadSession(storageDir, ownerId, communityId);
  const { reply: terminalReply, done: terminalDone } = sm.advance(resumed, 'anything');
  if (!terminalDone) {
    console.error('\nSMOKE TEST FAILED: resumed terminal session should report done');
    process.exit(1);
  }

  console.log('\n=== SMOKE TEST PASSED ===');
  console.log(`Session file: ${path.join(storageDir, 'owner_smoke_community_smoke.json')}`);
}

run();
