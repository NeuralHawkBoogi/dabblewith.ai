# Casagrand First City recovery send sheet

Date: 2026-05-27
Route: stale first responder -> one-time nudge -> five warm narrow-discovery DMs -> 24-hour privacy-safe report.

## Why this exists

The live campaign report still shows one concrete Casagrand resident signal after owner/test exclusion, but it is stale and has no referral/manual-tracker evidence. The next useful action is not another broad IT-group post. It is a small, warm execution batch that can be sent from mobile and measured with last4-only outcomes.

Public page: `https://dabblewith.ai/casagrand-firstcity/recovery-send-sheet/`

## Send sequence

1. Send the stale responder nudge once if it has not already been sent.
2. Ask one trusted resident for a warm intro.
3. Send two QA/dev/student DMs.
4. Send two Excel/office-workflow DMs.
5. Send one group-owner/admin DM only if the person actually manages a WhatsApp group.

## Privacy rules

- Store only `last4`, `segment`, `route`, `problemType`, `followUpSent`, `nextAction`, and a short sanitized note.
- Do not store full phone numbers, names, raw WhatsApp text, screenshots, spreadsheets, credentials, message IDs, tokens, or private files.
- Use fake or anonymized examples for QA/coding/Excel demos.

## Measurement command

```bash
mkdir -p private
node scripts/casagrand-campaign-report.js --write-narrow-discovery-template private/casagrand-narrow-discovery.json
node scripts/casagrand-campaign-report.js --runtime-dir /home/clawdbot/dabblewith-whatsapp/data --date 2026-05-27 --exclude-last4 2585 --manual-tracker private/casagrand-narrow-discovery.json
```

## Routing thresholds

- QA/dev/student problem -> `/casagrand-firstcity/qa-walkthrough/`
- Excel/workflow problem -> `/casagrand-firstcity/excel-walkthrough/`
- One referral -> `/casagrand-firstcity/referral-sprint/`
- Group-owner signal -> `/casagrand-firstcity/bot-readiness/`
- Three total resident signals -> `/casagrand-firstcity/date-lock/`
- No new signal -> continue narrow discovery; do not broad-post yet.
