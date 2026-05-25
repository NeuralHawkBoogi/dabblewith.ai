# Casagrand First City Manual Tracker Console

Date: 2026-05-25
URL: `https://dabblewith.ai/casagrand-firstcity/manual-tracker/`

## Purpose

The current Casagrand route is still the narrow five-DM sprint before any broad IT-group post. Some replies may happen in Boogi's private WhatsApp context rather than through the dabblewith.ai bot, so the campaign needs a safe way to convert private DM outcomes into aggregate evidence.

This console is the operator layer for that:

- generate a five-row private JSON tracker
- log only last-four-safe outcomes
- preserve the 24-hour rerun timing
- rerun the campaign report with `--manual-tracker`
- decide the next growth move from thresholds, not vibes

## Use when

- the five DMs have been sent or are about to be sent
- replies are private and not visible in `community-signals.jsonl`
- the campaign report still shows low/no resident signals
- Boogi needs a clean next action before posting to the 600-member IT group

## Privacy-safe fields

Allowed:

- segment: `career`, `workflow`, `admin`, `founder`, `student`, `community_bot`, `unknown`
- last4 only
- route: `no_reply`, `problem`, `referral`, `topic_vote`, `admin_pain`, `bot_readiness`, `design_call`, `no_fit`
- short problem phrase, preferably eight words or fewer
- follow-up sent boolean
- next action

Never store:

- full phone numbers
- names
- raw WhatsApp messages
- private resident details
- message IDs
- tokens or webhook payloads

## Commands

Generate starter:

```bash
node scripts/casagrand-campaign-report.js   --write-manual-tracker-template reports/casagrand-firstcity/casagrand-5dm-manual-tracker-2026-05-25.private.json   --date 2026-05-25
```

Rerun report with private tracker after 24 hours:

```bash
node scripts/casagrand-campaign-report.js   --runtime-dir /home/clawdbot/dabblewith-whatsapp/data   --output-dir reports/casagrand-firstcity   --date 2026-05-25   --exclude-last4 2585   --manual-tracker reports/casagrand-firstcity/casagrand-5dm-manual-tracker-2026-05-25.private.json
```

## Decision thresholds

- 0 concrete replies → rewrite hook before broad post
- 1–2 concrete problems → send five more narrow DMs
- 3+ topic votes or referrals → open date/topic poll
- 2+ admin pains → book bot-readiness/design-partner calls
- 10+ interested residents → lock clubhouse intro

## Commit/storage rule

The filled tracker is private operational evidence. Do not commit it unless Boogi explicitly asks for a sanitized artifact. Commit public pages, docs, and aggregate reports only.
