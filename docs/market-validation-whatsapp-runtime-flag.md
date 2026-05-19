# WhatsApp Runtime Market-Validation Capture Flag

Date: 2026-05-19
Status: prepared, disabled by default
Runtime repo: `/home/clawdbot/dabblewith-whatsapp`

## Purpose

Capture structured design-partner leads when WhatsApp users ask for a similar community bot, without changing normal production reply behavior or sending any broadcasts.

This supports `tickets/MARKET-VALIDATION-COMMUNITY-BOT.md` by turning inbound setup intent into privacy-safe lead records for validation interviews.

## Runtime flags

```bash
DABBLE_MARKET_VALIDATION_ENABLED=false
DABBLE_MARKET_VALIDATION_DIR=/home/clawdbot/dabblewith-whatsapp/data/market-validation-leads
DABBLE_MARKET_VALIDATION_INTAKE_PATH=/home/clawdbot/dabblewith-ai/market-validation/whatsapp-intake.js
```

Default is `false`, so current WhatsApp behavior is unchanged until explicitly enabled.

## Behavior when enabled

For each inbound text message, the runtime calls `recordWhatsAppLeadIntent()` after normal signal logging and billing pass-through metering.

A lead is recorded only when the message matches owner/setup intent such as:

- “setup a similar community bot”
- “need a WhatsApp bot for my community”
- “want an AI host for our group”

Captured fields include sanitized community/owner identifiers, inferred audience size, pain points, event cadence, budget signal, urgency, source attribution, and hashed external references.

## Privacy/safety

- Raw phone numbers are not stored in lead records.
- Raw emails and token-looking strings are redacted by the intake module.
- Runtime writes only a small `market-validation-events.jsonl` event with lead id, score, qualification status, and source.
- No outbound sends are triggered by this capture path.
- No production behavior changes while the flag is off.

## Validation

```bash
cd /home/clawdbot/dabblewith-whatsapp
node --check server.js
node market-validation-runtime-smoke-test.js

cd /home/clawdbot/dabblewith-ai
node market-validation/smoke-test.js
node market-validation/whatsapp-intake-smoke-test.js
git diff --check
```

## Next step

Enable only after Boogi approves lead capture in the live WhatsApp runtime. Once enabled and real leads arrive, generate the admin validation report from `market-validation/leads.js` and schedule an export/report cron if useful.
