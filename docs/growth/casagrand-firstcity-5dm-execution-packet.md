# Casagrand First City 5-DM Execution Packet

Date: 2026-05-24
Status: ready to execute
Public/operator page: `https://dabblewith.ai/casagrand-firstcity/5dm-execution/`

## Why this exists

The privacy-safe campaign report for 2026-05-24 still shows:

- 0 Casagrand campaign signals
- 0 unique residents/users
- 1 owner/test campaign-like signal excluded via `--exclude-last4 2585`
- launch decision: `first10_tester_dms`

So the campaign should not spend the 600-member IT group post yet. The immediate growth action is a narrow five-message sprint that creates evidence before scale.

## Send mix

Send exactly five private DMs:

1. Career/job-search resident
2. Career/job-search resident
3. Workflow/productivity resident
4. Workflow/productivity resident
5. WhatsApp group owner/admin or resident likely to know one

## Success signals

Count only concrete evidence:

- a specific career, workflow, coding, student, founder, or community-admin problem
- a resident willing to vote on topic/date
- a referral or group-owner intro
- a WhatsApp group-owner pain that can route to bot readiness or a design-partner call

Do not count polite encouragement as demand.

## Privacy-safe tracker fields

- segment
- phone last4 only
- route: no reply / problem / referral / topic vote / admin pain / bot readiness / design call
- concrete problem in 8 words or fewer
- follow-up sent
- next action/date

Never store full phone numbers, raw WhatsApp messages, private resident details, tokens, message IDs, or webhook payloads in public docs.

## 24-hour decision rule

Run:

```bash
node scripts/casagrand-campaign-report.js --runtime-dir /home/clawdbot/dabblewith-whatsapp/data --output-dir reports/casagrand-firstcity --date 2026-05-25 --exclude-last4 2585
```

Then choose one:

- 0 concrete replies → rewrite hook before broad post
- 1–2 concrete problems → send 5 more narrow DMs
- 3+ topic votes → open date/topic poll
- 2+ admin pains → book bot-readiness/design-partner calls
- 10+ interested residents → lock clubhouse intro

## Copy location

Use the page copy buttons for:

- execution brief
- career DM
- workflow DM
- group-owner/admin DM
- referral ask
- privacy-safe tracker
