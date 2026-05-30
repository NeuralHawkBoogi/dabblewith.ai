# Casagrand First City — Healthcare Nudge Kit

Date: 2026-05-30
Page: `https://dabblewith.ai/casagrand-firstcity/healthcare-nudge/`

## Why this exists

The latest live Casagrand campaign report shows a doctor/pathologist signal that is 24h+ stale. The right move is not a broad IT-group post or a multi-message chase. It is one privacy-safe healthcare/admin nudge, then a clean route based on reply/no-reply.

## Use this when

- The healthcare responder has not shared a fake/scrubbed sample yet.
- No referral-sprint evidence exists for the healthcare signal.
- The live report still shows fewer than 3 concrete resident signals.

## Send rule

Send the healthcare nudge once. If there is no reply after 24 hours, stop chasing this responder and continue narrow discovery.

## Privacy and safety rules

- Use fake or fully scrubbed examples only.
- Do not collect patient names, lab values, reports, prescriptions, screenshots, IDs, phone numbers, clinic/customer details, credentials, PHI, or raw WhatsApp text.
- Do not provide diagnosis, treatment advice, clinical decision support, or medical-accuracy claims.
- Track only last4, route, broad segment, sample/slot/referral fields, and next action.

## Copy blocks

The page contains copy-ready blocks for:

1. One-time healthcare admin workflow nudge.
2. Slot-only fallback if the resident is interested but not ready to share a sample.
3. Referral fallback for another healthcare/admin resident.
4. Last4-only tracker row with `route=healthcare_nudge`.

## Decision thresholds after 24 hours

- Sample shared → use `/casagrand-firstcity/healthcare-workflow-sample/`.
- One referral → use `/casagrand-firstcity/referral-sprint/`.
- Group-owner/admin signal → use `/casagrand-firstcity/bot-readiness/`.
- Three total resident signals → use `/casagrand-firstcity/date-lock/`.
- No reply → continue `/casagrand-firstcity/narrow-discovery/`; do not send a second healthcare nudge.

## Measurement

Suggested last4-only row:

```text
last4=8787
route=healthcare_nudge
segment=healthcare_workflow
nudgeSent=yes
sampleShared=yes/no
slotVote=weekend_morning/weekend_evening/weekday_evening/unknown
referralCount=0
taskType=report_formatting/patient_instruction_draft/appointment_followup/inventory_admin/learning_digest/other/unknown
nextAction=healthcare_sample/referral_sprint/date_lock/bot_readiness/narrow_discovery
```
