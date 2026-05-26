# Casagrand First City Date Lock Kit

Date: 2026-05-26

## Purpose

Use `/casagrand-firstcity/date-lock/` only after the first-responder referral sprint produces enough evidence to justify a public date/topic ask.

This prevents the campaign from jumping from one QA/coding signal into a broad ~600-member IT-group post too early.

## Entry criteria

Open the date-lock kit when at least one of these is true:

- 3+ privacy-safe learner signals are logged from the referral sprint.
- 2 learner signals plus 1 group-owner/admin signal are logged.
- The first responder supplied a concrete workflow sample and at least two referred neighbors replied.

If the campaign still has fewer than 3 total resident signals, keep using `/casagrand-firstcity/referral-sprint/` and 1:1 warm intros.

## What the page contains

- Last4-safe signal summary copy.
- Topic/date poll copy for the IT group or private warm thread.
- Clubhouse/admin slot ask.
- Locked-date announcement copy.
- Go/no-go thresholds for date poll, clubhouse ask, first session, and bot-readiness routing.

## Privacy rules

Do not include:

- full phone numbers
- resident names unless publicly volunteered for the announcement
- raw WhatsApp messages/screenshots
- employer or customer details
- credentials, tokens, URLs with private params
- private documents or screenshots

Allowed evidence:

- aggregate resident count
- topic buckets
- slot vote counts
- last4-only internal tracker rows
- group-owner/admin count without naming the person publicly

## Decision thresholds

- `<3` total real resident signals: continue 1:1 referrals.
- `3+` learner signals: open date/topic poll.
- `5+` poll votes: ask for clubhouse/common-space slot.
- `8+` RSVPs: lock the first free session.
- `1+` group-owner/admin signal: run `/casagrand-firstcity/bot-readiness/` separately from the learner event.

## Measurement

Recommended command after date-poll or locked-date movement:

```bash
node scripts/casagrand-campaign-report.js --date 2026-05-26 --exclude-last4 2585 --manual-tracker data/casagrand-referral-sprint-tracker.json
```

Keep the tracker local/private and last4-only.
