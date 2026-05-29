# Casagrand Recovery Operator Brief — 2026-05-29

Generated: 2026-05-29T00:20:04.444Z

## Current state
- Unique resident signals: 1
- Campaign signals: 1
- Owner/test signals excluded: 1
- Cadence: single_responder_stale_24h (90h since latest signal)
- Next action: Use /casagrand-firstcity/no-reply-nudge/ once for the first responder, ask for one tiny sample/slot/referral signal, then continue narrow discovery if there is still no reply; do not broad-post yet.

## One-sitting send queue
1. Send the one-time stale-responder nudge to last4 8372.
2. Ask one trusted resident for a warm intro.
3. Send two QA/dev/student DMs.
4. Send two Excel/office-workflow DMs.
5. Send one group-owner/admin DM only to someone who actually manages a WhatsApp group.
6. Fill only last4 + segment + problemType + outcome in the private tracker.

## Copy-ready stale nudge
Quick nudge — if useful, send me one tiny QA/coding or Excel task you repeat. I will turn it into a small AI-by-doing sample. If now is not the right time, just reply with: weekend morning / weekend evening / weekday evening, or intro me to one Casagrand resident who may want this.

## Tracker commands
```sh
mkdir -p private
node scripts/casagrand-campaign-report.js --write-recovery-batch-template private/casagrand-recovery-batch.json
node scripts/casagrand-campaign-report.js --runtime-dir /home/clawdbot/dabblewith-whatsapp/data --date 2026-05-29 --exclude-last4 2585 --manual-tracker private/casagrand-recovery-batch.json
```

## Route after 24h
- Sample/problem reply -> use /casagrand-firstcity/qa-walkthrough/ or /casagrand-firstcity/excel-walkthrough/.
- One referral -> use /casagrand-firstcity/referral-sprint/.
- Group-owner/admin signal -> use /casagrand-firstcity/bot-readiness/.
- Three total resident signals -> use /casagrand-firstcity/date-lock/.
- No reply/no new signal -> continue narrow discovery; do not broad-post yet.

Privacy: last4-only reporting; do not store raw WhatsApp text, names, screenshots, full phone numbers, message IDs, or tokens.
