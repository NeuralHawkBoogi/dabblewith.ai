'use strict';

const fs = require('fs');
const path = require('path');

const STATES = {
  start: {
    prompt: "Welcome! I'm your community bot setup assistant. What's your community called?",
    field: 'communityName',
    next: 'community_basics',
  },
  community_basics: {
    prompt: "Great! In one or two sentences, what is this community about?",
    field: 'description',
    next: 'audience',
  },
  audience: {
    prompt: "Who is this community for? Describe your ideal member.",
    field: 'audience',
    next: 'tone',
  },
  tone: {
    prompt: "How should the bot communicate? (e.g. friendly, professional, casual, supportive)",
    field: 'tone',
    next: 'topics',
  },
  topics: {
    prompt: "List the main topics or interests in your community, separated by commas.",
    field: 'topics',
    next: 'rules',
  },
  rules: {
    prompt: "What are the key rules or guidelines members must follow? (brief list is fine)",
    field: 'rules',
    next: 'links_events',
  },
  links_events: {
    prompt: "Share any important links or upcoming events you want members to know about. (or type 'none')",
    field: 'linksEvents',
    next: 'registration_fields',
  },
  registration_fields: {
    prompt: "What info should the bot collect from new members when they join? (e.g. name, profession, location)",
    field: 'registrationFields',
    next: 'whatsapp_number',
  },
  whatsapp_number: {
    prompt: "What WhatsApp number will this bot run on? Include country code (e.g. +1 415 555 0100)",
    field: 'whatsappNumber',
    next: 'review',
  },
  review: {
    prompt: null, // generated dynamically
    field: null,
    next: 'pending_admin',
  },
  pending_admin: {
    prompt: "Your setup is submitted for admin review. You'll be notified once the bot is approved and live.",
    field: null,
    next: null,
  },
  activated: {
    prompt: "Your community bot is now active! Members can start joining.",
    field: null,
    next: null,
  },
  rejected: {
    prompt: "Your onboarding submission was not approved. Please contact support for details.",
    field: null,
    next: null,
  },
};

const TERMINAL_STATES = new Set(['pending_admin', 'activated', 'rejected']);

function sessionPath(storageDir, ownerId, communityId) {
  return path.join(storageDir, `${ownerId}_${communityId}.json`);
}

function createSession(ownerId, communityId) {
  return {
    ownerId,
    communityId,
    state: 'start',
    answers: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
}

function loadSession(storageDir, ownerId, communityId) {
  const p = sessionPath(storageDir, ownerId, communityId);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveSession(storageDir, session) {
  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
  session.updatedAt = new Date().toISOString();
  fs.writeFileSync(
    sessionPath(storageDir, session.ownerId, session.communityId),
    JSON.stringify(session, null, 2) + '\n'
  );
}

function generateProfile(session) {
  const a = session.answers;
  return {
    communityName: a.communityName || '',
    description: a.description || '',
    audience: a.audience || '',
    tone: a.tone || '',
    topics: (a.topics || '').split(',').map(t => t.trim()).filter(Boolean),
    rules: a.rules || '',
    linksEvents: a.linksEvents === 'none' ? [] : (a.linksEvents || '').split('\n').map(s => s.trim()).filter(Boolean),
    registrationFields: (a.registrationFields || '').split(',').map(s => s.trim()).filter(Boolean),
    whatsappNumber: a.whatsappNumber || '',
    generatedAt: new Date().toISOString(),
    version: session.version,
  };
}

function buildReviewPrompt(session) {
  const p = generateProfile(session);
  return [
    `Here's a summary of your community setup:`,
    `Name: ${p.communityName}`,
    `About: ${p.description}`,
    `Audience: ${p.audience}`,
    `Tone: ${p.tone}`,
    `Topics: ${p.topics.join(', ')}`,
    `Rules: ${p.rules}`,
    `Links/Events: ${p.linksEvents.join(', ') || 'none'}`,
    `Registration fields: ${p.registrationFields.join(', ')}`,
    `WhatsApp number: ${p.whatsappNumber}`,
    ``,
    `Reply YES to submit for admin review, or type a field name to revise it (e.g. "tone").`,
  ].join('\n');
}

/**
 * Process one user message and return {session, reply, done}.
 * Mutates session in place and returns it.
 */
function advance(session, userMessage) {
  const msg = (userMessage || '').trim();
  const currentStateName = session.state;
  const currentState = STATES[currentStateName];

  if (!currentState || TERMINAL_STATES.has(currentStateName)) {
    return { session, reply: currentState ? currentState.prompt : "Onboarding is already complete.", done: true };
  }

  // review state: check for YES or field revision request
  if (currentStateName === 'review') {
    if (msg.toLowerCase() === 'yes') {
      session.state = currentState.next;
      const next = STATES[session.state];
      return { session, reply: next.prompt, done: true };
    }
    // check if user wants to revise a field
    const fieldKey = Object.entries(STATES).find(
      ([, s]) => s.field && s.field.toLowerCase() === msg.toLowerCase()
    );
    if (fieldKey) {
      const [targetState, targetDef] = fieldKey;
      session.state = targetState;
      session.revising = true;
      return { session, reply: targetDef.prompt, done: false };
    }
    // treat as revision of last non-review field
    return { session, reply: buildReviewPrompt(session), done: false };
  }

  // normal state: store the answer, advance
  if (currentState.field) {
    session.answers[currentState.field] = msg;
  }

  if (session.revising) {
    delete session.revising;
    session.state = 'review';
    return { session, reply: buildReviewPrompt(session), done: false };
  }

  session.state = currentState.next;
  const nextState = STATES[session.state];

  let reply;
  if (session.state === 'review') {
    reply = buildReviewPrompt(session);
  } else {
    reply = nextState ? nextState.prompt : "Onboarding complete.";
  }

  const done = TERMINAL_STATES.has(session.state);
  return { session, reply, done };
}

function getPrompt(session) {
  if (session.state === 'review') return buildReviewPrompt(session);
  const s = STATES[session.state];
  return s ? s.prompt : null;
}

module.exports = { STATES, createSession, loadSession, saveSession, generateProfile, advance, getPrompt };
