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
node scripts/casagrand-campaign-report.js --write-recovery-batch-template private/casagrand-recovery-batch.json
node scripts/casagrand-campaign-report.js --runtime-dir /home/clawdbot/dabblewith-whatsapp/data --date 2026-05-27 --exclude-last4 2585 --manual-tracker private/casagrand-recovery-batch.json
```

Use the combined recovery-batch tracker when the operator sends the full current sequence in one sitting: stale-responder nudge, warm-intro ask, two QA/dev DMs, two Excel/workflow DMs, and one group-owner/admin DM. It avoids juggling separate no-reply and narrow-discovery files while keeping all outcomes last4-only.

## Report alignment

The live campaign report's `Stale responder recovery kit` now points to this combined recovery-batch tracker first. Use the separate no-reply or narrow-discovery trackers only when those steps are sent on different days.

When `--manual-tracker private/casagrand-recovery-batch.json` is supplied, the report now renders a dedicated `Recovery batch follow-up` section. It counts stale-responder rows, warm-intro rows, QA/dev signals, Excel/workflow signals, referrals, and group-owner/admin rows, then recommends the exact next page: QA walkthrough, Excel walkthrough, referral sprint, bot-readiness, date-lock, or continued narrow discovery.

## Routing thresholds

- QA/dev/student problem -> `/casagrand-firstcity/qa-walkthrough/`
- Excel/workflow problem -> `/casagrand-firstcity/excel-walkthrough/`
- One referral -> `/casagrand-firstcity/referral-sprint/`
- Group-owner signal -> `/casagrand-firstcity/bot-readiness/`
- Three total resident signals -> `/casagrand-firstcity/date-lock/`
- No new signal -> continue narrow discovery; do not broad-post yet.
