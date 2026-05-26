# Casagrand First City Excel Walkthrough Kit

Date: 2026-05-26
Asset: `https://dabblewith.ai/casagrand-firstcity/excel-walkthrough/`

## Why this exists

The current Casagrand signal is still too small for a broad IT-group post, but the office-workflow/Excel angle is concrete enough to run a tiny proof walkthrough. This kit turns the Excel cleanup sample into a bounded 20-minute conversion call without drifting into free consulting.

## Operating rule

Run this only with fake or scrubbed spreadsheet rows. Do not accept or store:

- phone numbers, emails, IDs, screenshots, or raw WhatsApp messages
- employer/customer/resident names
- payroll, bank, invoice, medical, legal, or association-private data
- full spreadsheets from real work systems

If the responder sends sensitive data, stop and ask for 5-10 fake rows that preserve only the shape of the problem.

## 20-minute flow

1. **0-3 min — privacy check**
   Confirm the sample is fake/scrubbed and safe to discuss.
2. **3-8 min — clean rows**
   Standardize dates, names, status labels, and amounts.
3. **8-12 min — detect issues**
   Flag duplicates, missing values, and inconsistent labels.
4. **12-16 min — create output**
   Produce a summary plus human review questions.
5. **16-20 min — collect growth evidence**
   Ask for usefulness, topic vote, slot vote, and one referral.

## Copy blocks

Use the page copy buttons for:

- opening script
- agenda
- closing ask
- last4-only scorecard

## Decision thresholds

- Demo completed and useful -> ask for one referral.
- 2 office-workflow referrals -> run `/casagrand-firstcity/referral-sprint/`.
- 3 Excel/workflow signals -> use `/casagrand-firstcity/date-lock/` to run a topic/date poll.
- Group/admin reporting owner -> route to `/casagrand-firstcity/bot-readiness/`.
- No sample or no reply -> continue narrow discovery; do not broad-post yet.

## Tracker note

```text
last4=____
route=excel_walkthrough
segment=office_workflow
privacyChecked=yes/no
sampleType=fake/scrubbed/not_shared
demoCompleted=yes/no
usefulness=high/medium/low
workflowPain=excel_cleanup/reporting_automation/duplicate_detection/student_project/other
topicVote=____
slotVote=weekend_morning/weekend_evening/weekday_evening/unknown
referralAsked=yes/no
referralCount=0
nextAction=referral_sprint/date_lock/bot_readiness/office_hours/continue_narrow_discovery
```

## Next action for Boogi

If the Excel sample gets any reply, run the walkthrough once and log only the last4 scorecard. If there is still no reply, do not post broadly; keep using narrow discovery or the no-reply nudge route.
