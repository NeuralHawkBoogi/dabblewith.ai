# Casagrand First City — Healthcare/Admin Micro-Session Kit

Date: 2026-05-31
Asset: `https://dabblewith.ai/casagrand-firstcity/healthcare-micro-session/`

## Why this exists

The latest Casagrand signal is a doctor/pathologist resident. The campaign now has healthcare-safe sample, one-time nudge, and reply-router assets; this kit converts any positive reply, slot vote, or referral into a tiny 30-minute private session before any broad IT-group post.

## When to use

Use this only if one of these happens:

- the healthcare responder shares a safe generic admin/reporting task
- the responder votes for a slot but has not shared a task yet
- the responder gives one healthcare/admin referral
- a healthcare/admin resident asks what a practical session would look like

Do not use it as a cold group post. The broad IT-group post remains gated until there are 3+ concrete resident signals or a real group-owner/admin validation signal.

## Privacy boundaries

Allowed:

- generic workflow descriptions
- fake/scrubbed examples
- last4-only tracker rows
- aggregate counts and route outcomes

Never collect or store:

- patient names, reports, lab values, prescriptions, IDs, screenshots
- clinic/customer details or confidential business data
- raw WhatsApp message text
- full phone numbers, message IDs, tokens, or webhook payloads
- clinical advice or diagnosis decisions

## Copy blocks

### Private invite

```text
I’m testing a tiny 30-minute “AI for healthcare/admin workflows” session for Casagrand residents.

It will be practical, not theoretical: bring one generic non-clinical task like report formatting, appointment follow-up, inventory/admin summary, patient-instruction draft template, or learning digest. We will use fake/scrubbed data only — no patient details, reports, screenshots, prescriptions, IDs, clinic/customer data, or medical advice.

Would you prefer weekend morning, weekend evening, or weekday evening?
```

### Referral ask

```text
If this is useful, can you intro one Casagrand resident in healthcare, diagnostics, clinic/lab admin, insurance/admin, reporting, or operations?

Best fit: someone with a repetitive admin/reporting workflow who is comfortable using fake/scrubbed data for a small demo. I’m validating privately with 2–3 residents before posting anything broadly.
```

## 30-minute run of show

1. 0–5 min: privacy boundary — fake/scrubbed data only, no PHI, no medical advice.
2. 5–10 min: pick one generic healthcare/admin workflow.
3. 10–22 min: live-build a reusable AI prompt/checklist/workflow sample.
4. 22–27 min: adapt it to each attendee’s generic task.
5. 27–30 min: capture slot/topic/referral signal and ask whether a WhatsApp group/admin bot would help their group.

## Tracker row

```text
meta.route=healthcare_micro_session
row.last4=8787
row.segment=healthcare_workflow
row.taskType=report_formatting/appointment_followup/inventory_admin/patient_instruction_draft/learning_digest/other/unknown
row.slotVote=weekend_morning/weekend_evening/weekday_evening/unknown
row.fakeSampleReady=yes/no/unknown
row.referralCount=0
row.groupOwnerSignal=yes/no/unknown
row.outcome=invite_sent/slot_voted/sample_ready/referral_given/attended/no_reply/unsafe_phi_attempt
row.nextAction=healthcare_workflow_sample/referral_sprint/date_lock/bot_readiness/narrow_discovery/stop_do_not_store
```

## Decision thresholds

- `sample_ready` → use `/casagrand-firstcity/healthcare-workflow-sample/`.
- `referral_given` → use `/casagrand-firstcity/referral-sprint/`.
- 3 total concrete residents → use `/casagrand-firstcity/date-lock/`.
- `groupOwnerSignal=yes` → use `/casagrand-firstcity/bot-readiness/` or `/group-owner-pilot/`.
- `no_reply` → stop chasing this signal and continue `/narrow-discovery/`.
- `unsafe_phi_attempt` → do not copy/store/transform; send safe-data boundary and route to `stop_do_not_store`.
