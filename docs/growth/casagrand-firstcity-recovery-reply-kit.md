# Casagrand First City Recovery Reply Kit

Date: 2026-05-28

## Purpose

A mobile reply-handling kit for the stale-responder recovery batch. After Boogi sends the one-time stale nudge and warm narrow-discovery DMs, this page provides copy-ready responses that route each reply into the next measurable growth step without improvising or broad-posting too early.

Public page: `https://dabblewith.ai/casagrand-firstcity/recovery-reply-kit/`

## What it adds

- Copy-ready reply for QA/dev/student task samples, routing to `/casagrand-firstcity/qa-walkthrough/`.
- Copy-ready reply for Excel/office-workflow samples, routing to `/casagrand-firstcity/excel-walkthrough/`.
- Copy-ready one-referral intro ask, routing to `/casagrand-firstcity/referral-sprint/`.
- Copy-ready group-owner/admin readiness probe, routing to `/casagrand-firstcity/bot-readiness/`.
- No-reply handling note so the first responder is not chased repeatedly.
- Tracker outcome mapping for the private last4-only `stale_responder_recovery_batch` tracker.

## Privacy rules

- Do not ask for or store names, full phone numbers, raw WhatsApp text, screenshots, message IDs, tokens, real spreadsheets, or company data.
- Ask for fake/anonymized task samples only.
- Record only last4, segment, problemType, outcome, nextAction, and a short sanitized note in `private/casagrand-recovery-batch.json`.

## Operator flow

1. Send the recovery batch using the send sheet/checklist.
2. When a reply arrives, pick exactly one route: QA walkthrough, Excel walkthrough, referral sprint, bot readiness, or no-reply/continue narrow discovery.
3. Copy the matching reply block.
4. Update the private last4-only tracker.
5. Rerun the privacy-safe report after 24 hours.
