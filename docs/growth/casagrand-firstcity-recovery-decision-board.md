# Casagrand First City Recovery Decision Board

Date: 2026-05-28

## Purpose

A mobile decision board for the stale-responder recovery batch. It turns private last4-only recovery outcomes into the next safe campaign route without improvising or broad-posting too early.

Public page: `https://dabblewith.ai/casagrand-firstcity/recovery-decision-board/`

## What it adds

- One-screen decision table for QA/dev, Excel/workflow, referral, group-owner, date-lock, and no-reply outcomes.
- Copyable 24-hour report command using `private/casagrand-recovery-batch.json`.
- Copyable operator note that summarizes escalation rules.
- Explicit broad-post gate: wait for 3+ concrete resident signals or a real group-owner design-partner signal before moving to the IT-group-wide post.
- Minimum scorecard for escalation: 3+ resident signals, 2+ referrals, 1+ walkthrough-ready sample, or 1 group-owner lead for the community-bot path.

## Privacy rules

- Store only last4, segment, problemType, outcome, nextAction, and short sanitized notes.
- Do not store names, full phone numbers, raw WhatsApp text, screenshots, message IDs, tokens, company files, or real spreadsheet data.
- Ask for fake/anonymized samples only.

## Operator flow

1. Execute the recovery send sheet/checklist.
2. Use the reply kit for any incoming responses.
3. Fill `private/casagrand-recovery-batch.json` with last4-only outcomes.
4. Run the privacy-safe report after 24 hours.
5. Open the decision board and choose exactly one route:
   - QA/dev sample or slot → QA walkthrough.
   - Excel/workflow sample or slot → Excel walkthrough.
   - Warm intro/referral → referral sprint.
   - Group-owner/admin signal → bot-readiness audit.
   - 3+ concrete resident signals → date-lock/topic poll.
   - No positive outcomes → continue narrow discovery and do not chase the same contacts.

## Companion assets

- Recovery checklist: `https://dabblewith.ai/casagrand-firstcity/recovery-checklist/`
- Recovery reply kit: `https://dabblewith.ai/casagrand-firstcity/recovery-reply-kit/`
- Recovery tracker wizard: `https://dabblewith.ai/casagrand-firstcity/recovery-tracker-wizard/`
