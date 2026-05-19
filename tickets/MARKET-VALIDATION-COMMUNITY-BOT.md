# Ticket: Market Validation for “Get a Community Bot”

Status: in-progress
Priority: P0
Created: 2026-05-19

## Goal
Validate demand, willingness to pay, and usage patterns for the dabblewith.ai community bot platform before building heavy self-serve infrastructure.

## Build scope
- Create a design-partner intake flow from `/community-bot/` WhatsApp CTA.
- Capture structured lead fields: community name, owner, audience size, WhatsApp usage, pain points, event cadence, budget range, urgency.
- Add admin report summarizing inbound “setup similar bot” leads.
- Run 10 design-partner interviews and record findings.
- Build bottom-up demand model using real usage estimates.

## Acceptance criteria
- At least 10 qualified community-owner leads are logged.
- Each lead has structured fields and source attribution.
- A validation report ranks segments by willingness to pay and urgency.
- Decision made: continue, pivot segment, or pause.

## Progress (2026-05-19)

### Implemented — slice 1: lead intake + validation report foundation

**Files added:**
- `market-validation/leads.js`
  - Captures structured design-partner lead fields: community name, owner, audience size, WhatsApp usage, pain points, event cadence, budget range, urgency, source attribution, and optional segment/notes.
  - Persists privacy-safe JSON lead records with sanitized community/owner ids and hashed external refs; raw phone numbers, emails, and token-like secrets are redacted.
  - Scores leads by urgency, budget signal, and pain intensity; infers lightweight segments and ranks them for willingness-to-pay validation.
  - Exports Markdown/JSON validation reports with qualified-lead count, remaining interviews needed toward the 10-lead gate, ranked segments, and top sanitized leads.
- `market-validation/smoke-test.js`
  - Covers required-field validation, persistence, qualification scoring, segment ranking, report export, and no raw phone/email/secret leakage.

**Test commands:**
```bash
node market-validation/smoke-test.js
git diff --check
```

### Implemented — slice 2: WhatsApp CTA/setup-intent lead adapter

**Files added:**
- `market-validation/whatsapp-intake.js`
  - Detects WhatsApp owner-intent messages such as “setup a similar community bot” or “need an AI host for my community”.
  - Converts CTA/runtime inbound events into structured lead inputs for `market-validation/leads.js` with inferred audience size, pain points, budget signal, urgency, source attribution, and segment hints.
  - Stores only hashed/sanitized external references; raw phone numbers, emails, and token-like strings are not persisted.
- `market-validation/whatsapp-intake-smoke-test.js`
  - Covers setup-intent detection, non-lead message skipping, structured lead creation from a WhatsApp CTA message, qualification scoring, validation report inclusion, and no raw phone/email/secret leakage.

**Test commands:**
```bash
node market-validation/smoke-test.js
node market-validation/whatsapp-intake-smoke-test.js
git diff --check
```

### Implemented — slice 3: WhatsApp runtime lead-capture feature flag prepared

**Runtime repo modified:** `/home/clawdbot/dabblewith-whatsapp/server.js`

- Added disabled-by-default `DABBLE_MARKET_VALIDATION_ENABLED=false` flag.
- Runtime loads `/home/clawdbot/dabblewith-ai/market-validation/whatsapp-intake.js` only when the flag is enabled.
- Inbound WhatsApp text messages with owner/setup intent can create structured, privacy-safe design-partner lead records.
- Capture runs after normal signal logging and does not send any outbound messages or broadcasts.
- `/healthz` now reports market-validation flag/availability.
- Added runtime smoke test: `/home/clawdbot/dabblewith-whatsapp/market-validation-runtime-smoke-test.js`.
- Added docs: `docs/market-validation-whatsapp-runtime-flag.md`.

**Validation commands:**
```bash
cd /home/clawdbot/dabblewith-whatsapp
node --check server.js
node market-validation-runtime-smoke-test.js

cd /home/clawdbot/dabblewith-ai
node market-validation/smoke-test.js
node market-validation/whatsapp-intake-smoke-test.js
git diff --check
```

### Next steps
- [x] Add a WhatsApp CTA/setup-intent adapter that can create lead records when users ask for a similar bot.
- [x] Wire the adapter into the runtime owner-intent path behind a disabled-by-default flag or explicit local-only capture mode.
- [ ] Add admin report cron/export once real design-partner leads arrive.
- [ ] Run 10 interviews and record segment findings before building heavy self-serve infrastructure.
