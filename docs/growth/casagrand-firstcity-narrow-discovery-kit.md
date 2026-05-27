# Casagrand First City Narrow Discovery Kit

Date: 2026-05-27
Asset: `https://dabblewith.ai/casagrand-firstcity/narrow-discovery/`

## When to use

Use this after the first-responder follow-up or no-reply nudge has not produced a workflow sample, referral, topic vote, or group-owner signal.

The aim is to keep discovery warm and precise without posting broadly into the Casagrand IT group too early.

## Send mix

Run exactly five narrow asks, then wait 24 hours:

1. Two QA/dev/student peers.
2. Two Excel or office-workflow peers.
3. One WhatsApp group-owner/admin/community operator.

Start with a warm intro ask where possible. Do not ask for lists, private files, screenshots, customer data, credentials, or raw work artifacts.

## Copy blocks

The public page contains copy buttons for:

- warm intro ask
- QA/dev/student DM
- Excel/workflow DM
- group-owner bot-readiness DM
- last4-only tracker row
- 24-hour report command

## Private tracker fields

Keep tracker files outside public pages and commit only aggregate/docs when needed.

Allowed row shape:

```json
{
  "last4": "____",
  "segment": "qa_dev_student | excel_workflow | group_owner | other",
  "route": "narrow_discovery",
  "problemType": "qa_checklist | coding_helper | student_project | excel_cleanup | office_workflow | bot_readiness | no_reply",
  "followUpSent": true,
  "nextAction": "qa_walkthrough | excel_walkthrough | referral_sprint | bot_readiness | date_lock | continue_narrow_discovery"
}
```

Privacy rules:

- last4 only
- no raw WhatsApp messages
- no names unless already public and necessary
- no screenshots, spreadsheets, tickets, logs, credentials, tokens, or customer data
- no full phone numbers in reports

## Thresholds

- One QA/dev/student sample -> run `/casagrand-firstcity/qa-walkthrough/`.
- One Excel/workflow sample -> run `/casagrand-firstcity/excel-walkthrough/`.
- One warm referral -> run `/casagrand-firstcity/referral-sprint/`.
- One group-owner/admin signal -> run `/casagrand-firstcity/bot-readiness/`.
- Three total resident signals -> use `/casagrand-firstcity/date-lock/`.
- Zero replies after 24h -> rewrite the opener or ask for one different warm intro; do not broad-post yet.

## Report command

```bash
node scripts/casagrand-campaign-report.js --runtime-dir /home/clawdbot/dabblewith-whatsapp/data --date 2026-05-27 --exclude-last4 2585
```

If using a private tracker:

```bash
node scripts/casagrand-campaign-report.js --runtime-dir /home/clawdbot/dabblewith-whatsapp/data --date 2026-05-27 --exclude-last4 2585 --manual-tracker private/casagrand-narrow-discovery.json
```

## Why this matters

The live campaign is still validated by one real resident signal, but one stale responder is not enough evidence for a broad IT-group launch. This kit keeps the campaign moving through warm, measurable asks while protecting resident trust.
