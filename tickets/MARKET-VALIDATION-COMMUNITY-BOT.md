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

### Implemented — slice 4: local admin report/export runner

**Files added:**
- `market-validation/admin-report.js`
  - Generates privacy-safe Markdown and JSON admin reports from lead storage.
  - Defaults to the runtime lead directory (`DABBLE_MARKET_VALIDATION_DIR` or `/home/clawdbot/dabblewith-whatsapp/data/market-validation-leads`) and writes dated exports under `reports/market-validation/`.
  - Adds an admin next-action summary for the 10-qualified-lead decision gate without exposing raw WhatsApp text, phone numbers, emails, or token-like strings.
  - CLI: `node market-validation/admin-report.js [--storage-dir DIR] [--output-dir DIR] [--date YYYY-MM-DD]`.
- `market-validation/admin-report-smoke-test.js`
  - Covers argument parsing, report generation, Markdown/JSON outputs, empty-storage behavior, and privacy leakage checks.

**Validation commands:**
```bash
node market-validation/smoke-test.js
node market-validation/whatsapp-intake-smoke-test.js
node market-validation/admin-report-smoke-test.js
git diff --check
```

### Implemented — slice 5: interview findings tracker + 10-interview decision gate

**Files added:**
- `market-validation/interviews.js`
  - Records privacy-safe design-partner interview findings with sanitized community/lead ids and hashed external refs.
  - Captures segment, interview date, willingness-to-pay signal, urgency, pain score, expected monthly conversations, objections/findings/next step, and recommendation (`continue`, `pivot`, `pause`).
  - Summarizes qualified interview count, remaining interviews needed for the 10-interview gate, ranked segment signals, expected monthly conversation volume, and decision state.
  - Exports Markdown/JSON via CLI: `node market-validation/interviews.js report <storageDir> [output.md|output.json]`.
- `market-validation/interviews-smoke-test.js`
  - Covers required-field validation, persistence, aggregation, 10-qualified-interview gate, segment ranking, Markdown/JSON export, and no raw phone/email/secret leakage.

**Validation commands:**
```bash
node market-validation/smoke-test.js
node market-validation/whatsapp-intake-smoke-test.js
node market-validation/admin-report-smoke-test.js
node market-validation/interviews-smoke-test.js
git diff --check
```

### Implemented — slice 6: homepage warm-outreach response report

**Files added:**
- `scripts/homepage-outreach-report.js`
  - Reads WhatsApp community signal JSONL logs for a bounded outreach window.
  - Emits a privacy-safe Markdown report with target response rate, unique responders, aggregate themes, responder-stage routing, and next actions.
  - Redacts phone numbers to last four digits only and does not include raw message IDs, webhook payloads, tokens, or display names.
- `scripts/homepage-outreach-report-smoke-test.js`
  - Covers aggregate response rate, theme detection, stage routing, and privacy leakage checks.
- `docs/growth/homepage-first5-response-loop.md`
  - Converts the first 5 warm homepage-forward replies into builder-call, mini-session, qualification, or community-bot readiness routes.
- `docs/growth/homepage-outreach-2026-05-24-report.md`
  - Captures the first 5-contact outreach read: 2/5 WhatsApp responders, 29 inbound signal messages, and a next move to convert first responders into one concrete builder session/call before broadening outreach.

**Validation commands:**
```bash
node --check scripts/homepage-outreach-report.js
node scripts/homepage-outreach-report-smoke-test.js
node scripts/homepage-outreach-report.js --since 2026-05-24T05:00:00Z --until 2026-05-24T06:15:00Z --target 5 --out reports/homepage-outreach-2026-05-24.md
node --check scripts/generate-blog.js
node --check scripts/google-analytics-report.js
git diff --check
```

### Implemented — slice 7: first-5 builder-session conversion kit

**Files added:**
- `homepage-outreach/builder-session/index.html`
  - Mobile-ready copy kit for turning first-5 homepage WhatsApp responders into one builder call or focused mini-session.
  - Includes copy buttons for deeper builder-call invite, agentic workflow mini-session invite, community-bot probe, and next 3–5 warm DM forward.
  - Uses copy-click GA events and avoids exposing responder names, raw messages, full phone numbers, tokens, or webhook payloads.
- `docs/growth/homepage-first5-builder-session-kit.md`
  - Operator sequence, copy blocks, session shape, privacy-safe tracking fields, and decision thresholds.

**Validation commands:**
```bash
node --check scripts/generate-blog.js
node scripts/generate-blog.js
python3 - <<'PY'
from html.parser import HTMLParser
from pathlib import Path
HTMLParser().feed(Path('homepage-outreach/builder-session/index.html').read_text())
assert 'Build a safe CLI/file-system memory agent' in Path('homepage-outreach/builder-session/index.html').read_text()
assert 'homepage-outreach/builder-session' in Path('sitemap.xml').read_text()
PY
git diff --check
```

### Implemented — slice 8: first-5 follow-up scorecard

**Files added/updated:**
- `homepage-outreach/follow-up-scorecard/index.html`
  - Mobile-ready scorecard for converting the 2/5 warm WhatsApp responders into one booked builder mini-session or community-bot readiness call before broadening outreach.
  - Includes copy buttons for the two-touch follow-up, privacy-safe scorecard template, and booked-session confirmation.
- `docs/growth/homepage-first5-follow-up-scorecard.md`
  - Operator rule, privacy-safe tracking fields, copy block, and decision thresholds.
- `docs/growth/homepage-outreach-2026-05-24-report.md`
  - Refreshed through 2026-05-24T10:15:00Z; still 2/5 responders, so the action remains conversion before scale.

**Validation commands:**
```bash
node --check scripts/homepage-outreach-report.js
node scripts/homepage-outreach-report-smoke-test.js
node scripts/homepage-outreach-report.js --since 2026-05-24T05:00:00Z --until 2026-05-24T10:15:00Z --target 5 --out reports/homepage-outreach-2026-05-24.md
node --check scripts/generate-blog.js
node scripts/generate-blog.js
python3 - <<'PY2'
from html.parser import HTMLParser
from pathlib import Path
HTMLParser().feed(Path('homepage-outreach/follow-up-scorecard/index.html').read_text())
assert 'Book one concrete builder session before scaling outreach' in Path('homepage-outreach/follow-up-scorecard/index.html').read_text()
assert 'homepage-outreach/follow-up-scorecard' in Path('sitemap.xml').read_text()
PY2
git diff --check
```

### Implemented — slice 9: first-5 workflow-sample intake

**Files added/updated:**
- `homepage-outreach/workflow-sample-intake/index.html`
  - Mobile-ready intake kit for converting the two active warm homepage responders into one concrete workflow sample before booking a builder mini-session.
  - Includes copy buttons for the workflow-sample ask, agentic mini-session ask, and privacy-safe score note.
- `docs/growth/homepage-first5-workflow-sample-intake.md`
  - Operator rule, copy block, 24-hour thresholds, and privacy-safe tracking note.
- `docs/growth/homepage-outreach-2026-05-24-report.md`
  - Refreshed through 2026-05-24T12:15:00Z; still 2/5 responders and 29 inbound signals, so the action remains sample collection before scale.

**Validation commands:**
```bash
node --check scripts/homepage-outreach-report.js
node scripts/homepage-outreach-report-smoke-test.js
node scripts/homepage-outreach-report.js --since 2026-05-24T05:00:00Z --until 2026-05-24T12:15:00Z --target 5 --out reports/homepage-outreach-2026-05-24.md
node --check scripts/generate-blog.js
node scripts/generate-blog.js
python3 - <<'PY2'
from html.parser import HTMLParser
from pathlib import Path
HTMLParser().feed(Path('homepage-outreach/workflow-sample-intake/index.html').read_text())
assert 'Turn warm replies into one bookable workflow' in Path('homepage-outreach/workflow-sample-intake/index.html').read_text()
assert 'homepage-outreach/workflow-sample-intake' in Path('sitemap.xml').read_text()
PY2
git diff --check
```

### Implemented — slice 10: first builder-session brief

**Files added/updated:**
- `homepage-outreach/session-brief/index.html`
  - Mobile-ready session brief for turning one warm homepage responder into a 20-minute builder walkthrough.
  - Includes copy buttons for slot confirmation, run-of-show, and anonymized recap template.
  - Uses the refreshed 2026-05-24 16:15 UTC report state: 2/5 responders and 29 inbound signals, so conversion proof comes before broader outreach.
- `docs/growth/homepage-first5-session-brief.md`
  - Operator sequence, copy block, recap template, privacy guardrails, and post-session decision rules.
- `docs/growth/homepage-outreach-2026-05-24-report.md`
  - Refreshed through 2026-05-24T16:15:00Z; still 2/5 responders, reinforcing the one-session conversion gate.

**Validation commands:**
```bash
node --check scripts/homepage-outreach-report.js
node scripts/homepage-outreach-report-smoke-test.js
node scripts/homepage-outreach-report.js --since 2026-05-24T05:00:00Z --until 2026-05-24T16:15:00Z --target 5 --generated-at 2026-05-24T16:15:00Z --out docs/growth/homepage-outreach-2026-05-24-report.md
node --check scripts/generate-blog.js
node scripts/generate-blog.js
python3 - <<'PY2'
from html.parser import HTMLParser
from pathlib import Path
HTMLParser().feed(Path('homepage-outreach/session-brief/index.html').read_text())
assert 'Run one tight workflow walkthrough before scaling outreach' in Path('homepage-outreach/session-brief/index.html').read_text()
assert 'homepage-outreach/session-brief' in Path('sitemap.xml').read_text()
PY2
git diff --check
```

### Implemented — slice 11: second warm batch kit

**Files added/updated:**
- `homepage-outreach/second-batch/index.html`
  - Mobile-ready copy kit for the next 3–5 warm homepage invites using proof language from the first 2/5 responders instead of a broad blast.
  - Includes copy buttons for proof-led invite, privacy-safe tracker, group-owner/community-bot probe, and 24-hour decision rules.
- `docs/growth/homepage-second-warm-batch-kit.md`
  - Operator rule, copy blocks, tracker fields, privacy guardrails, and decision thresholds.
- `docs/growth/homepage-outreach-2026-05-24-report.md`
  - Refreshed through 2026-05-24T18:15:00Z; still 2/5 responders and 29 inbound messages, supporting a small second warm batch but not a broad post.

**Validation commands:**
```bash
node --check scripts/homepage-outreach-report.js
node scripts/homepage-outreach-report-smoke-test.js
node scripts/homepage-outreach-report.js --since 2026-05-24T05:00:00Z --until 2026-05-24T18:15:00Z --target 5 --generated-at 2026-05-24T18:15:00Z --out docs/growth/homepage-outreach-2026-05-24-report.md
node --check scripts/generate-blog.js
node scripts/generate-blog.js
python3 - <<'PY2'
from html.parser import HTMLParser
from pathlib import Path
HTMLParser().feed(Path('homepage-outreach/second-batch/index.html').read_text())
assert 'Send the next 3–5 invites with proof' in Path('homepage-outreach/second-batch/index.html').read_text()
assert 'homepage-outreach/second-batch' in Path('sitemap.xml').read_text()
PY2
git diff --check
```

### Next steps
- [x] Add a WhatsApp CTA/setup-intent adapter that can create lead records when users ask for a similar bot.
- [x] Wire the adapter into the runtime owner-intent path behind a disabled-by-default flag or explicit local-only capture mode.
- [x] Add admin report/export for inbound design-partner leads.
- [x] Add privacy-safe interview findings tracker and segment decision-gate report.
- [x] Add homepage warm-outreach response report for first 5-contact validation.
- [x] Add first-5 builder-session follow-up kit to convert warm homepage responders into one concrete builder call/mini-session and community-bot probe before broad outreach.
- [ ] Run 10 interviews and record segment findings before building heavy self-serve infrastructure.
