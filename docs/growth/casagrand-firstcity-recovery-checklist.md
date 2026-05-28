# Casagrand First City Recovery Checklist

Date: 2026-05-28

## Purpose

A mobile execution checklist for the current stale-responder recovery batch. It keeps the send sequence visible while Boogi manually sends the one-time stale nudge and warm narrow-discovery DMs.

Public page: `https://dabblewith.ai/casagrand-firstcity/recovery-checklist/`

## What it adds

- Local-only browser checkboxes for the recovery send sequence.
- Copy-ready internal tracker/report command for `private/casagrand-recovery-batch.json`.
- A compact send order that matches the generated recovery operator brief.
- 24-hour routing thresholds back to QA walkthrough, Excel walkthrough, referral sprint, bot readiness, date lock, or continued narrow discovery.

## Privacy rules

- Checkbox state is stored only in the browser via `localStorage`; it is not a source of truth.
- The actual private tracker remains last4-only.
- Do not store resident names, full phone numbers, raw WhatsApp text, screenshots, files, message IDs, tokens, or webhook payloads.

## Operator flow

1. Generate the private recovery batch tracker.
2. Send the stale-responder nudge once.
3. Ask one trusted resident for a warm intro.
4. Send two QA/dev/student DMs.
5. Send two Excel/workflow DMs.
6. Send one group-owner/admin DM only when the person actually manages a group.
7. Fill last4-only tracker outcomes.
8. Rerun the privacy-safe report after 24 hours.

## Companion asset

- Recovery reply kit: `https://dabblewith.ai/casagrand-firstcity/recovery-reply-kit/` for copy-ready response handling after a QA/dev, Excel/workflow, referral, group-owner, or no-reply outcome.
- Recovery decision board: `https://dabblewith.ai/casagrand-firstcity/recovery-decision-board/` for choosing the next route after the 24-hour privacy-safe report.
