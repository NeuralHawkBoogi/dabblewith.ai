# Casagrand First City Fresh Seed Batch Scorecard

Date: 2026-05-29
Public page: `https://dabblewith.ai/casagrand-firstcity/fresh-seed-scorecard/`

## Why this exists

Use this after the stale-responder closeout/reset. The prior route had one qualified resident signal that went stale, so the next safe growth move is a fresh six-person warm seed batch — not a broad IT-group post.

The scorecard makes the reset measurable without storing private WhatsApp content.

## Batch mix

Send only to warm names:

1. QA/dev/student resident — one QA checklist, bug triage, coding helper, or interview/project task.
2. QA/dev/student resident — one portfolio, coding assistant, or learning workflow.
3. Excel/operations resident — one spreadsheet cleanup or weekly report task.
4. Excel/operations resident — one email, proposal, research, or office workflow.
5. Founder/freelancer/consultant resident — one sales, admin, lead research, or proposal workflow.
6. Real group-owner/admin — one repeated WhatsApp group admin pain.

Close every concrete reply with: `Can you intro one Casagrand resident who has a similar task?`

## Tracker/report command

```sh
mkdir -p private
node scripts/casagrand-campaign-report.js --write-fresh-seed-batch-template private/casagrand-fresh-seed-batch.json
node scripts/casagrand-campaign-report.js --runtime-dir /home/clawdbot/dabblewith-whatsapp/data --date 2026-05-29 --exclude-last4 2585 --manual-tracker private/casagrand-fresh-seed-batch.json
```

## Privacy rules

Track only `last4`, `segment`, `route`, `problemType`, `followUpSent`, and `nextAction`.

Never store names, full phone numbers, message bodies, screenshots, group names/member lists, message IDs, tokens, or raw webhook payloads.

## Route table

| Evidence after 24h | Next route |
| --- | --- |
| 0 concrete replies | Park broad Casagrand launch; continue only organic 1:1 discovery. |
| 1 QA/dev/student task | Run `/casagrand-firstcity/qa-walkthrough/`, then ask for one referral. |
| 1 Excel/workflow task | Run `/casagrand-firstcity/excel-walkthrough/`, then ask for one referral. |
| 1 founder/freelancer task | Build a tiny sales/admin/research sample and ask for one referral. |
| 1 group-owner/admin pain | Run `/casagrand-firstcity/bot-readiness/` or `/casagrand-firstcity/group-owner-pilot/`. |
| 3+ concrete resident signals | Move to `/casagrand-firstcity/date-lock/`; broad IT-group post becomes safer. |

## Stop rule

If the fresh seed batch also produces no concrete resident or group-owner signal, do not keep expanding DMs. Park the Casagrand launch and spend the next growth cycle on a different warm audience or community-bot lead source.
