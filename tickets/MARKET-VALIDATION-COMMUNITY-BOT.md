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

### Next steps
- [ ] Wire `/community-bot/` WhatsApp CTA and runtime owner-intent path to create lead records when users ask for a similar bot.
- [ ] Add admin report cron/export once real design-partner leads arrive.
- [ ] Run 10 interviews and record segment findings before building heavy self-serve infrastructure.
