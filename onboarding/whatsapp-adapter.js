'use strict';

const crypto = require('crypto');
const { createSession, loadSession, saveSession, advance, getPrompt } = require('./state-machine');

function normalizePhone(value) {
  return String(value || '').replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
}

function maskPhone(value) {
  const digits = normalizePhone(value).replace(/\D/g, '');
  if (!digits) return 'unknown';
  return `****${digits.slice(-4)}`;
}

function ownerIdFromPhone(value) {
  const normalized = normalizePhone(value);
  if (!normalized) throw new Error('WhatsApp sender phone is required');
  return `wa_${crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 24)}`;
}

function sanitizeCommunityId(value) {
  return String(value || 'primary')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'primary';
}

/**
 * Route one WhatsApp inbound message into the onboarding state machine.
 *
 * This adapter intentionally does not send WhatsApp messages itself. Runtime
 * webhooks can call it, then pass `reply` to their existing outbound path behind
 * a feature flag. Raw phone numbers are never persisted; sessions are keyed by
 * a stable hash and keep only a masked sender for admin/debug views.
 */
function handleInboundMessage(storageDir, inbound) {
  const from = inbound && inbound.from;
  const body = inbound && inbound.body;
  const ownerId = inbound && inbound.ownerId ? inbound.ownerId : ownerIdFromPhone(from);
  const communityId = sanitizeCommunityId(inbound && inbound.communityId);

  let session = loadSession(storageDir, ownerId, communityId);
  const isNew = !session;

  if (!session) {
    session = createSession(ownerId, communityId);
    session.source = 'whatsapp';
    session.owner = { maskedPhone: maskPhone(from) };
    saveSession(storageDir, session);

    return {
      ownerId,
      communityId,
      reply: getPrompt(session),
      done: false,
      state: session.state,
      isNew,
    };
  }

  const result = advance(session, body || '');
  saveSession(storageDir, result.session);

  return {
    ownerId,
    communityId,
    reply: result.reply,
    done: result.done,
    state: result.session.state,
    isNew,
  };
}

module.exports = {
  handleInboundMessage,
  normalizePhone,
  maskPhone,
  ownerIdFromPhone,
  sanitizeCommunityId,
};
