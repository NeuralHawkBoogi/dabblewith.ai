# Casagrand First City Operator Brief

Date: 2026-05-27
Asset: `https://dabblewith.ai/casagrand-firstcity/operator-brief/`
Companion: `https://dabblewith.ai/casagrand-firstcity/recovery-tracker-wizard/` — fills the last4-only recovery batch tracker after sending the stale-nudge + five warm DMs.

## Purpose

This is the one-screen operating brief for the current Casagrand campaign state. It prevents the campaign from drifting between many kits by translating the latest privacy-safe report into one immediate route.

## Current report state

- One real Casagrand resident signal remains after owner/test exclusion.
- Detected topic: QA/coding/student-project interest.
- Latest signal age in the 2026-05-27 report: 52 hours.
- No referral-sprint or narrow-discovery tracker evidence is logged yet.
- Decision: do not broad-post to the full IT opportunities group yet.

## Action

1. If not already sent, send the one-time no-reply nudge from `/casagrand-firstcity/no-reply-nudge/`.
2. Run `/casagrand-firstcity/narrow-discovery/` with exactly five warm DMs: two QA/dev/student, two Excel/workflow, and one group-owner/admin.
3. Track only last4, segment, route, problem type, follow-up status, and next action.
4. Rerun the report after 24 hours using the private tracker.

## Commands

```bash
mkdir -p private
node scripts/casagrand-campaign-report.js --write-narrow-discovery-template private/casagrand-narrow-discovery.json
node scripts/casagrand-campaign-report.js --runtime-dir /home/clawdbot/dabblewith-whatsapp/data --date 2026-05-27 --exclude-last4 2585 --manual-tracker private/casagrand-narrow-discovery.json
```

## Routing thresholds

- QA/dev/student problem -> QA walkthrough.
- Excel/workflow problem -> Excel walkthrough.
- One referral -> referral sprint.
- One group-owner signal -> bot-readiness audit.
- Three total resident signals -> date-lock kit.
- Zero replies after 24 hours -> rewrite or ask for one different warm intro, not a broad post.

## Privacy rules

Do not store or publish names, raw WhatsApp text, screenshots, resumes, spreadsheets, tickets, credentials, message IDs, tokens, or full phone numbers. Reports remain aggregate and last4-only.
