# Casagrand First City — Healthcare Workflow Sample Kit

Date: 2026-05-30
Page: `https://dabblewith.ai/casagrand-firstcity/healthcare-workflow-sample/`

## Why this exists

The latest live Casagrand signal includes a healthcare professional/pathologist. The existing QA and Excel proof assets are useful, but this resident needs a safer, profession-aware follow-up that does not collect patient data or drift into medical advice.

This kit converts that signal into a tiny, privacy-safe AI-by-Doing sample and one referral ask.

## Use this before broad-posting

Use this in private/narrow follow-up only. Do not post broadly in the IT group until there are at least 3 privacy-safe resident signals, or 2 healthcare/admin workflow signals plus a clear slot/topic vote.

## Privacy and safety rules

- Use fake or fully scrubbed examples only.
- Do not collect patient names, lab values, reports, prescriptions, phone numbers, screenshots, IDs, clinic/customer details, PHI, credentials, or raw WhatsApp text.
- Do not provide diagnosis, treatment advice, clinical decision support, or claims about medical accuracy.
- Position the demo as admin/productivity support with human review required.
- Track only last4, route, broad segment, task type, slot vote, referral count, and next action.

## Copy blocks

The page contains copy-ready blocks for:

1. Tiny fake/scrubbed healthcare admin sample request.
2. 20-minute demo invite.
3. One-referral ask for healthcare/clinic/lab/admin residents.
4. Last4-only tracker note with `route=healthcare_workflow_sample`.

## Safe sample menu

- Lab/report formatting checklist using fake values.
- Generic patient-instruction draft for human review, with no medical advice.
- Appointment/admin follow-up tracker.
- Inventory/admin summary.
- Public-article learning digest with source links and caveats.

## Decision thresholds

- 1 healthcare task shared → run a 20-minute demo.
- 1 demo completed → ask one healthcare/admin/reporting referral.
- 2 healthcare/admin workflow signals → consider a small private micro-session.
- 3 total resident signals → use `/casagrand-firstcity/date-lock/`.
- 1 group/admin owner signal → use `/casagrand-firstcity/bot-readiness/`.

## Measurement

Suggested last4-only row:

```text
last4=____
route=healthcare_workflow_sample
segment=healthcare_workflow
sampleShared=yes/no
demoInviteSent=yes/no
demoBooked=yes/no
taskType=report_formatting/patient_instruction_draft/appointment_followup/inventory_admin/learning_digest/other
slotVote=weekend_morning/weekend_evening/weekday_evening/unknown
referralAsked=yes/no
referralCount=0
nextAction=demo/referral_sprint/date_lock/bot_readiness/continue_narrow_discovery
```
