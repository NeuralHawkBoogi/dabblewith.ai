# Casagrand First City Fresh Seed DM Pack

Date: 2026-05-29
Route: post-closeout six-person fresh seed batch
Public page: `/casagrand-firstcity/fresh-seed-dm-pack/`

## Purpose

After the stale first-responder closeout, Boogi needs copy that can be sent from mobile to six warm Casagrand contacts without drifting into a broad IT-group announcement. This pack provides segment-specific DMs for:

- two QA/dev/student residents
- two Excel/office-workflow residents
- one founder/freelancer/consultant resident
- one real WhatsApp group-owner/admin

The goal is one concrete task or pain per person, not generic interest.

## Operating rules

- Send one narrow DM per person; do not chase immediately.
- Ask for fake/sanitized examples only.
- Do not store raw message bodies, names, full phone numbers, group names, screenshots, message IDs, tokens, or webhook payloads.
- Log outcomes only through the fresh seed scorecard tracker with last4 and route-safe fields.
- Keep broad IT-group posting gated until there are 3+ concrete resident signals or one real group-owner/admin validation signal.

## Next action after replies

- QA/dev/student task → `/casagrand-firstcity/qa-walkthrough/`
- Excel/workflow task → `/casagrand-firstcity/excel-walkthrough/`
- Founder/freelancer task → create a tiny sales/admin/research proof sample, then ask for one resident intro.
- Group-owner/admin pain → `/casagrand-firstcity/bot-readiness/` or `/casagrand-firstcity/group-owner-pilot/`
- 3+ concrete resident signals → `/casagrand-firstcity/date-lock/`

## Measurement

Use the scorecard commands:

```bash
mkdir -p private
node scripts/casagrand-campaign-report.js --write-fresh-seed-batch-template private/casagrand-fresh-seed-batch.json
node scripts/casagrand-campaign-report.js --runtime-dir /home/clawdbot/dabblewith-whatsapp/data --date 2026-05-29 --exclude-last4 2585 --manual-tracker private/casagrand-fresh-seed-batch.json
```
