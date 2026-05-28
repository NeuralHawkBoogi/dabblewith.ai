# Casagrand Community Bot Price Probe

Date: 2026-05-28

## Purpose

A private, copy-ready price-probe card for validating willingness to pay for the Get a Community Bot product after a real Casagrand group-owner/admin signal.

Public page: `https://dabblewith.ai/casagrand-firstcity/community-bot-price-probe/`

## When to use it

Use only after the group owner/admin has confirmed at least one real pain point:

- repeated member questions
- event or RSVP collection
- member onboarding
- reminders/follow-ups
- daily or weekly admin summaries

Do not use it as a cold public pricing announcement.

## What it adds

- Soft willingness-to-pay probe with `no / maybe / yes` answer choices.
- Package probe for starter monthly vs setup + monthly plan validation.
- Last4-only tracker row that aligns with the group-owner pilot report fields.
- Route rules for `bot_readiness`, `design_partner_call`, or `park`.

## Privacy and sales rules

- Do not store group names, member lists, raw WhatsApp text, screenshots, full phone numbers, message IDs, or tokens.
- Ask for willingness bands, not public price approval.
- Treat pricing as validation evidence until Boogi approves official public pricing.
- Park low-pain/no-budget groups instead of offering custom free work.

## Companion loop

Generate the private tracker with:

```sh
mkdir -p private
node scripts/casagrand-campaign-report.js --write-group-owner-pilot-template private/casagrand-group-owner-pilot.json
node scripts/casagrand-campaign-report.js --date 2026-05-28 --exclude-last4 2585 --manual-tracker private/casagrand-group-owner-pilot.json
```
