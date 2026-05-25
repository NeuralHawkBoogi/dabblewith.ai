# Casagrand First City 5-DM Manual Tracker

Date: 2026-05-24
Status: ready to use

## Why this exists

The current Casagrand route depends on five private DMs before any broad IT-group post. Some replies may happen directly in Boogi's WhatsApp chat and may not enter the dabblewith.ai bot logs. This tracker lets the campaign report include those manual outcomes without storing raw private messages or full phone numbers.

## Privacy rule

Only store:

- sprint start/rerun due timestamps
- segment
- phone last4 only
- route
- concrete problem in 8 words or fewer
- whether follow-up was sent
- next action

Never store full phone numbers, raw WhatsApp messages, resident names, message IDs, webhook payloads, access tokens, or private screenshots.

## Tracker JSON template

Generate a starter file instead of hand-copying structure:

```bash
node scripts/casagrand-campaign-report.js \
  --write-manual-tracker-template reports/casagrand-firstcity/manual-5dm-2026-05-25.json
```

The command writes privacy-safe sprint metadata plus exactly five rows: 2 career, 2 workflow, and 1 admin. It uses `last4` placeholders only and never includes full phone numbers, raw messages, resident names, or message IDs. Fill `sprintStartedAt` and `reportRerunDueAt` in ISO format after the five DMs are sent so the report can show whether the 24-hour rerun is due.

Starter shape:

```json
{
  "meta": {
    "sprintStartedAt": "",
    "reportRerunDueAt": "",
    "notes": "Fill timestamps in ISO format after the 5 DMs are sent. Store only privacy-safe notes."
  },
  "rows": [
    {
      "segment": "career",
      "last4": "0001",
      "route": "no_reply",
      "problem": "",
      "followUpSent": false,
      "nextAction": ""
    },
    {
      "segment": "career",
      "last4": "0002",
      "route": "no_reply",
      "problem": "",
      "followUpSent": false,
      "nextAction": ""
    },
    {
      "segment": "workflow",
      "last4": "0003",
      "route": "no_reply",
      "problem": "",
      "followUpSent": false,
      "nextAction": ""
    },
    {
      "segment": "workflow",
      "last4": "0004",
      "route": "no_reply",
      "problem": "",
      "followUpSent": false,
      "nextAction": ""
    },
    {
      "segment": "admin",
      "last4": "0005",
      "route": "no_reply",
      "problem": "",
      "followUpSent": false,
      "nextAction": ""
    }
  ]
}
```

Allowed `segment` values:

- `career`
- `workflow`
- `admin`
- `founder`
- `student`
- `community_bot`
- `unknown`

Allowed `route` values:

- `no_reply`
- `problem`
- `referral`
- `topic_vote`
- `admin_pain`
- `bot_readiness`
- `design_call`
- `no_fit`

## Report command

```bash
node scripts/casagrand-campaign-report.js \
  --runtime-dir /home/clawdbot/dabblewith-whatsapp/data \
  --output-dir reports/casagrand-firstcity \
  --date 2026-05-25 \
  --exclude-last4 2585 \
  --manual-tracker reports/casagrand-firstcity/manual-5dm-2026-05-25.json
```

## Decision mapping

When a manual tracker is supplied, the report adds a `Manual 5-DM tracker outcomes` section, shows the sprint start/rerun-due timestamps when present, marks the rerun as `due now` or `not due yet`, and lets manual evidence override the bottom next action:

- `0` concrete replies → rewrite the hook before another batch.
- `1` concrete reply → ask one sharper follow-up and one referral.
- `2+` concrete replies → send five more narrow DMs using the winning language.
- `3+` topic votes → open the date/topic poll and prepare a small session.
- `2+` admin pains / bot-readiness signals, or `1+` design call → prioritize Get a Community Bot validation calls.

## 24-hour rerun discipline

After sending the five private DMs, fill:

- `meta.sprintStartedAt` with the send timestamp.
- `meta.reportRerunDueAt` with exactly 24 hours later.

The campaign report will then render the due status in the manual tracker section. This prevents the campaign from drifting into more asset creation when the next real growth action is to rerun the report from actual replies.
