'use strict';

const { recordLead, sanitizeId, redact } = require('./leads');

const SETUP_INTENT = /(?:setup|set up|launch|build|create|need|want|get).{0,80}(?:community\s+bot|whatsapp\s+bot|ai\s+host|similar\s+bot)|(?:community\s+bot|ai\s+host).{0,80}(?:for\s+my|for\s+our|for\s+the)/i;

function hashSuffix(value) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(String(value || 'unknown')).digest('hex').slice(0, 8);
}

function isCommunityBotSetupIntent(body = '') {
  return SETUP_INTENT.test(String(body || ''));
}

function extractAudienceSize(text) {
  const match = String(text || '').match(/(?:~|around|about|approx(?:imately)?\s*)?(\d{2,6})\s*(?:members|people|users|students|founders|residents|participants)/i);
  return match ? `${match[1]} members mentioned in WhatsApp inquiry` : 'unknown — collect during design-partner interview';
}

function extractCommunityName(text, fallback) {
  const match = String(text || '').match(/(?:for|called|named)\s+(?:my|our|the)?\s*([a-z0-9][a-z0-9 '&.-]{2,60}?)(?:\s+(?:with|that|where|for|and|,|\. |$))/i);
  if (!match) return fallback;
  return match[1].replace(/\s+/g, ' ').trim();
}

function inferUrgency(text) {
  if (/(?:asap|urgent|today|this week|launching|now)/i.test(text)) return 'immediate WhatsApp inquiry';
  if (/(?:soon|next event|this month|pilot)/i.test(text)) return 'near-term pilot inquiry';
  return 'exploratory WhatsApp inquiry';
}

function inferBudget(text) {
  if (/(?:pro|enterprise|40k|50k|custom)/i.test(text)) return 'pro or custom budget signal from WhatsApp inquiry';
  if (/(?:growth|15k|20k|14999)/i.test(text)) return 'growth budget signal from WhatsApp inquiry';
  if (/(?:starter|5k|4999|10k)/i.test(text)) return 'starter budget signal from WhatsApp inquiry';
  return 'unknown — collect willingness to pay during interview';
}

function inferPainPoints(text) {
  const points = [];
  if (/(?:faq|questions|answer)/i.test(text)) points.push('member FAQ load');
  if (/(?:registration|signup|sign up|join)/i.test(text)) points.push('registration capture');
  if (/(?:event|workshop|meetup|session)/i.test(text)) points.push('event reminders and follow-up');
  if (/(?:manual|admin|volunteer|chaos|spam)/i.test(text)) points.push('manual admin workload');
  if (!points.length) points.push('wants AI community host similar to dabblewith.ai');
  return points;
}

function leadInputFromWhatsApp(event = {}) {
  const body = String(event.body || '');
  const senderRef = event.from || event.waId || event.externalRef || 'unknown-whatsapp-sender';
  const suffix = hashSuffix(senderRef);
  const fallbackCommunity = `WhatsApp setup lead ${suffix}`;
  return {
    communityName: extractCommunityName(body, fallbackCommunity),
    ownerName: event.profileName ? redact(event.profileName) : `WhatsApp owner ${suffix}`,
    ownerId: sanitizeId(`wa-owner-${suffix}`),
    audienceSize: extractAudienceSize(body),
    whatsappUsage: 'Inbound WhatsApp setup inquiry from community-bot CTA or owner-intent path',
    painPoints: inferPainPoints(body),
    eventCadence: /(?:weekly|monthly|daily|workshop|event|session|meetup)/i.test(body)
      ? redact(body).slice(0, 180)
      : 'unknown — collect during design-partner interview',
    budgetRange: inferBudget(body),
    urgency: inferUrgency(body),
    source: event.source || 'WhatsApp community-bot setup intent',
    landingPage: event.landingPage || '/community-bot/',
    campaign: event.campaign || 'community-bot-whatsapp-cta',
    externalRef: `wa:${suffix}`,
    segment: event.segment,
    notes: `Captured from WhatsApp intent; sanitized excerpt: ${redact(body).slice(0, 220)}`,
  };
}

function recordWhatsAppLeadIntent(storageDir, event = {}) {
  if (!isCommunityBotSetupIntent(event.body || '')) {
    return { recorded: false, reason: 'no_setup_intent' };
  }
  const lead = recordLead(storageDir, leadInputFromWhatsApp(event));
  return { recorded: true, lead };
}

module.exports = {
  isCommunityBotSetupIntent,
  leadInputFromWhatsApp,
  recordWhatsAppLeadIntent,
};
