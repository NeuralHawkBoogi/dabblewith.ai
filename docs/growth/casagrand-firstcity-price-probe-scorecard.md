# Casagrand Price Probe Scorecard

Date: 2026-05-28

## Purpose

A private interpretation layer for the Casagrand community-bot price probe. It turns a group-owner/admin willingness-to-pay reply into one safe next action: design-partner call, bounded 7-day pilot, objection follow-up, or park.

Public page: `https://dabblewith.ai/casagrand-firstcity/price-probe-scorecard/`

## When to use it

Use after a real group-owner/admin has answered the private price probe from `casagrand-firstcity/community-bot-price-probe/`. Do not use it as public pricing approval.

## Decision rules

- High pain + weekly/daily cadence + yes willingness-to-pay → book design-partner call.
- High pain + maybe willingness-to-pay + clear owner access → run a bounded 7-day pilot and measure questions handled, RSVPs/interests, admin summary usefulness, and admin time saved.
- Medium pain + maybe/no willingness-to-pay → ask one objection follow-up before continuing.
- 500+ member group + yes willingness-to-pay → require an admin approval path before any live test.
- Low pain + no willingness-to-pay → park; do not custom-build for free.

## Privacy and packaging rules

- Keep only last4, audience band, cadence, pain level, willingness band, price band, route, and sanitized short notes.
- Do not store group names, member lists, screenshots, raw WhatsApp text, full phone numbers, message IDs, or tokens.
- Treat bands as market-validation evidence, not official public pricing.
- Do not announce pricing publicly until Boogi approves packaging.

## Companion loop

```sh
mkdir -p private
node scripts/casagrand-campaign-report.js --write-group-owner-pilot-template private/casagrand-group-owner-pilot.json
node scripts/casagrand-campaign-report.js --date 2026-05-28 --exclude-last4 2585 --manual-tracker private/casagrand-group-owner-pilot.json
```
