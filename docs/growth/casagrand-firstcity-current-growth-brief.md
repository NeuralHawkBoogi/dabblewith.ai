# Casagrand First City Current Stale-Responder Brief

Date: 2026-05-28
Artifact: `/casagrand-firstcity/current-brief/`

## Current evidence

The live privacy-safe campaign report for 2026-05-28, run with owner/test exclusion, currently shows:

- 1 qualified Casagrand resident signal after owner/test exclusion
- 1 unique resident/user
- latest qualified signal timestamp: 2026-05-25T05:34:39.095Z
- signal age at the latest run: 88h
- detected topic cluster: `coding_assistant` with `student_projects` / `event_interest` context
- 0 community-bot signals
- no recovery-batch, referral-sprint, or no-reply tracker evidence supplied yet

This means the active route is **stale-responder recovery**, not the zero-signal 5-DM route and not a broad IT-group post.

## Action

Run one narrow recovery pass:

1. Send one gentle nudge to the stale first responder (last4 only: `8372`).
2. Send 2 QA/dev/student warm DMs.
3. Send 2 office-workflow / Excel automation warm DMs.
4. Send 1 group-owner/admin DM only if the person actually manages a WhatsApp/community group.
5. Ask each reply for one referral or group-owner intro.
6. Store only last4 + segment + problem type + outcome in a private recovery tracker.
7. Rerun the privacy-safe report after 24 hours.

## Measurement command

```bash
mkdir -p private
node scripts/casagrand-campaign-report.js --write-recovery-batch-template private/casagrand-recovery-batch.json
node scripts/casagrand-campaign-report.js --date 2026-05-28 --exclude-last4 2585 --manual-tracker private/casagrand-recovery-batch.json
```

## Route thresholds

- No recovery replies / no concrete problems: continue narrow discovery or ask Boogi for warmer names; still no broad post.
- QA/dev sample reply: use `/casagrand-firstcity/qa-walkthrough/`.
- Excel/workflow sample reply: use `/casagrand-firstcity/excel-walkthrough/`.
- One referral: use `/casagrand-firstcity/referral-sprint/`.
- 3+ concrete resident signals: move to date poll or date lock; broad post becomes safer.
- 1 real group-owner/admin pain signal: move to bot readiness or group-owner pilot validation.
- Price/WTP reply from group owner: use price probe scorecard; do not publish pricing yet.

## Privacy guardrails

Do not store names, full phone numbers, raw WhatsApp text, screenshots, group names, message IDs, webhook payloads, or tokens in the repo. Reports must keep phone references last4-only.
