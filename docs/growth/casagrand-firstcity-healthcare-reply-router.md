# Casagrand First City Healthcare Reply Router

Date: 2026-05-31
Route: `healthcare_reply_router`
Public asset: `https://dabblewith.ai/casagrand-firstcity/healthcare-reply-router/`

## Purpose

Handle replies to the one-time healthcare nudge without creating PHI/privacy risk or drifting into free consulting. This is the post-reply operating layer for the current doctor/pathologist Casagrand signal.

## Use when

- A healthcare/admin resident replies to `/healthcare-nudge/`.
- The reply may be a generic workflow sample, slot vote, referral, group-owner/admin signal, or no-reply outcome.
- Boogi needs one safe next step before any broad IT-group post.

## Privacy boundary

Allowed to track:

- last4 only
- segment: `healthcare_workflow`
- outcome enum
- generic task type enum
- slot vote enum
- referral count
- next action enum

Never store or forward:

- raw WhatsApp text
- full phone numbers
- names
- message IDs
- screenshots
- patient names, reports, lab values, prescriptions, IDs, clinic/customer details
- tokens/secrets

If an unsafe PHI-like sample arrives, do not copy it into any repo/report. Reply with the boundary and ask for a generic/fake version.

## Copy blocks

The public page includes copy-ready responses for:

1. safe task shared
2. slot-only reply
3. referral offer
4. safe/unsafe example explanation

## Last4-only tracker schema

```text
meta.route=healthcare_reply_router
row.last4=8787
row.segment=healthcare_workflow
row.outcome=sample_shared/slot_vote/referral/group_owner/no_reply/unsafe_phi_attempt
row.taskType=report_formatting/patient_instruction_draft/appointment_followup/inventory_admin/learning_digest/other/unknown
row.slotVote=weekend_morning/weekend_evening/weekday_evening/unknown
row.referralCount=0
row.nextAction=healthcare_sample/referral_sprint/date_lock/bot_readiness/narrow_discovery/stop_do_not_store
```

## Routing rules

- `sample_shared` -> use `/casagrand-firstcity/healthcare-workflow-sample/` and build a fake/scrubbed demo.
- `referral` -> use `/casagrand-firstcity/referral-sprint/` and log referred-neighbor outcomes last4-only.
- `group_owner` -> use `/casagrand-firstcity/bot-readiness/` or `/casagrand-firstcity/group-owner-pilot/` only when they actually own/admin a WhatsApp group.
- `slot_vote` -> count as lightweight interest; ask for one safe task or one healthcare/admin referral before date-lock.
- `no_reply` -> stop nudging and return to `/casagrand-firstcity/narrow-discovery/`.
- `unsafe_phi_attempt` -> do not store/transform; send the safe-data boundary and ask for a generic/fake sample.

## Growth gate

Do not broad-post to the IT opportunities group from one healthcare reply. Escalate only after either:

- 3+ concrete resident signals across the campaign, or
- one real group-owner/admin signal that validates the Get a Community Bot path.
