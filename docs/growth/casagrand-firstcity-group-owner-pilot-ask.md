# Casagrand First City Group-Owner Pilot Ask

Date: 2026-05-28

Public page: `https://dabblewith.ai/casagrand-firstcity/group-owner-pilot/`

## Purpose

Convert a real Casagrand WhatsApp group-owner/admin signal into a bounded Get a Community Bot validation pilot without broad-posting, overselling, or starting custom services work.

Use this only after one of these appears in recovery/referral/narrow-discovery evidence:

- WhatsApp group owner/admin says they are curious about an AI host.
- Resident association / event / learning / business group organizer asks how the bot would work.
- Referral explicitly points to a community admin.

## What the asset adds

- Copy-ready 10-minute readiness check ask.
- 7-day pilot framing: one group, limited FAQs/use case, daily summaries, explicit success metrics.
- Qualification scorecard for last4-only tracking.
- Copyable private tracker/report command via `--write-group-owner-pilot-template` so pilot evidence flows into the campaign report without raw chats or group names.
- Route rules for design-partner call, readiness audit, or park/no-build.
- Product validation guardrail: capture pain, urgency, willingness-to-pay, and objections before building heavier self-serve infra.

## Operator flow

1. Confirm this is a real group-owner/admin signal; do not send cold.
2. Send the pilot ask from the page.
3. If they agree, run `/casagrand-firstcity/bot-readiness/` first.
4. Fill the scorecard with last4-only evidence.
5. Create/update the private tracker:
   ```sh
   mkdir -p private
   node scripts/casagrand-campaign-report.js --write-group-owner-pilot-template private/casagrand-group-owner-pilot.json
   node scripts/casagrand-campaign-report.js --date YYYY-MM-DD --exclude-last4 2585 --manual-tracker private/casagrand-group-owner-pilot.json
   ```
6. Route:
   - high pain + weekly activity → `/casagrand-firstcity/design-partner-call/`
   - medium pain or unclear budget → readiness audit + price probe
   - no repeated questions/event cadence → park
   - 500+ member group → admin approval path before any live test
6. Add qualified design-partner evidence to the market-validation report path; do not store raw WhatsApp messages, names, full phone numbers, screenshots, or tokens.

## Success metrics for the 7-day pilot

- Questions handled or deflected.
- RSVPs/interests captured.
- Admin time saved or escalations summarized.
- Owner willingness-to-pay after proof.
- Clear objection if they would not continue.

## Privacy rules

Store only last4, group type/problem type, audience-size band, pain level, cadence, pilot fit, willingness-to-pay band, price range, and next action. Do not store private group content, group names, member data, screenshots, raw WhatsApp text, full phone numbers, or message IDs during validation.
