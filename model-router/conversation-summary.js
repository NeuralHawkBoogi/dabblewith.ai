'use strict';

const crypto = require('crypto');

const DEFAULT_MAX_SUMMARY_CHARS = 1_200;
const DEFAULT_MAX_RECENT_MESSAGES = 6;

function normalizeRole(role) {
  const normalized = String(role || 'user').trim().toLowerCase();
  if (['user', 'assistant', 'bot', 'admin', 'system'].includes(normalized)) return normalized;
  return 'user';
}

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function redactSensitive(value) {
  return cleanText(value)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/\+?\d[\d\s().-]{7,}\d/g, '[phone]')
    .replace(/\b(?:sk|pk|xoxb|ghp|github_pat|EAAG|Bearer)[A-Za-z0-9_./=-]{12,}\b/g, '[secret]');
}

function normalizeMessage(message) {
  if (typeof message === 'string') return { role: 'user', text: redactSensitive(message) };
  return {
    role: normalizeRole(message && message.role),
    text: redactSensitive(message && (message.text || message.body || message.content || message.message))
  };
}

function hashText(value) {
  const text = String(value || '');
  if (!text) return null;
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

function summarizeConversation(messages = [], opts = {}) {
  const normalized = (Array.isArray(messages) ? messages : [])
    .map(normalizeMessage)
    .filter((message) => message.text);

  const maxRecentMessages = Number.isInteger(opts.maxRecentMessages) ? opts.maxRecentMessages : DEFAULT_MAX_RECENT_MESSAGES;
  const maxSummaryChars = Number.isInteger(opts.maxSummaryChars) ? opts.maxSummaryChars : DEFAULT_MAX_SUMMARY_CHARS;
  const recent = normalized.slice(-maxRecentMessages);
  const older = normalized.slice(0, Math.max(0, normalized.length - recent.length));
  const olderText = older.map((message) => `${message.role}: ${message.text}`).join(' | ');
  const olderSummary = olderText
    ? `Earlier conversation (${older.length} msgs, hash ${hashText(olderText)}): ${olderText.slice(0, maxSummaryChars)}`
    : '';
  const recentTranscript = recent.map((message) => `${message.role}: ${message.text}`).join('\n');

  return {
    messageCount: normalized.length,
    olderMessageCount: older.length,
    recentMessageCount: recent.length,
    summaryText: [olderSummary, recentTranscript].filter(Boolean).join('\nRecent messages:\n'),
    summaryHash: hashText([olderSummary, recentTranscript].filter(Boolean).join('\n')),
    truncated: olderText.length > maxSummaryChars
  };
}

function buildRoutingContext(input = {}, opts = {}) {
  const staticContext = redactSensitive(input.context || '');
  const conversationSummary = summarizeConversation(input.conversation || input.messages || [], opts);
  const parts = [];
  if (staticContext) parts.push(`Community context:\n${staticContext}`);
  if (conversationSummary.summaryText) parts.push(`Conversation summary:\n${conversationSummary.summaryText}`);

  return {
    context: parts.join('\n\n'),
    conversationSummary
  };
}

module.exports = {
  DEFAULT_MAX_SUMMARY_CHARS,
  DEFAULT_MAX_RECENT_MESSAGES,
  redactSensitive,
  summarizeConversation,
  buildRoutingContext,
  hashText
};
