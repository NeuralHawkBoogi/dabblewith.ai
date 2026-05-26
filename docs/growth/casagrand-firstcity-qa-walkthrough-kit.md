# Casagrand First City QA Walkthrough Kit

Date: 2026-05-26
Route: first-responder QA/coding conversion
Public page: `https://dabblewith.ai/casagrand-firstcity/qa-walkthrough/`

## Purpose

Convert the first real QA/coding resident signal into a measurable proof conversation before any broad IT-group post.

This kit sits between:

- `/casagrand-firstcity/qa-test-plan-sample/` — proof asset/sample request
- `/casagrand-firstcity/referral-sprint/` — one-referral loop
- `/casagrand-firstcity/date-lock/` — next step after 3+ resident signals

## 20-minute run of show

1. **Privacy check — 2 min**
   - Confirm no employer names, customer data, screenshots, credentials, production logs, ticket IDs, or full phone/email values.
   - Switch to the synthetic sample if the resident example is sensitive.
2. **Task framing — 3 min**
   - What QA/coding task repeats?
   - What output would be useful enough to reuse?
3. **Build live — 8 min**
   - Assumptions
   - Happy paths
   - Negative cases
   - Edge cases
   - Regression checklist
4. **Human review — 4 min**
   - What is useful?
   - What is wrong?
   - What is missing?
   - What would be risky in real QA work?
5. **Referral close — 3 min**
   - Ask for topic vote.
   - Ask for slot vote.
   - Ask for exactly one QA/dev/student resident referral.

## Copy-ready closing ask

```text
This is exactly the kind of practical “AI by Doing” workflow I want to test with Casagrand residents.

Two quick asks:
1. Which topic should the first small session focus on: QA test plans, coding assistants, student projects, or office workflows?
2. Can you intro one Casagrand resident in QA/dev/student projects who would find this useful?

I am collecting 2–3 real signals before any broad IT-group post.
```

## Last4-only scorecard

```text
last4=____
route=qa_walkthrough
segment=qa_dev_student
privacyCheckPassed=yes/no
sampleType=synthetic/anonymized/resident_supplied
workflowBuilt=yes/no
residentRatedUseful=yes/no/unknown
topicVote=qa_test_plan/coding_assistant/student_project/office_workflow/other
slotVote=weekend_morning/weekend_evening/weekday_evening/unknown
referralAsked=yes/no
referralPromised=yes/no
groupOwnerSignal=yes/no
nextAction=referral_sprint/date_lock/bot_readiness/continue_narrow_dms
```

## Decision thresholds

- Useful walkthrough + referral promised → run `/casagrand-firstcity/referral-sprint/`.
- 3 total QA/dev/student resident signals → open `/casagrand-firstcity/date-lock/` and ask for topic/date poll.
- Any group-owner/admin signal → route that person only to `/casagrand-firstcity/bot-readiness/`.
- Sensitive sample → discard it and use the synthetic sample; do not store raw content.

## Privacy rules

Do not store or report raw WhatsApp messages, company names, customer details, screenshots, credentials, production logs, ticket IDs, tokens, full phone numbers, email addresses, or full webhook payloads. Use last4-only manual tracker fields.
