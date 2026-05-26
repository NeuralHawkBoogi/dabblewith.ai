# Casagrand First City QA Test Plan Sample Kit

Date: 2026-05-26  
Status: active  
Page: `https://dabblewith.ai/casagrand-firstcity/qa-test-plan-sample/`

## Purpose

Turn the first Casagrand QA/coding responder into a proof-led conversation before asking for referrals or posting broadly. The asset gives Boogi a forwardable, anonymized feature-note-to-test-plan sample and four copy blocks:

1. sample request
2. 20-minute walkthrough invite
3. one-referral ask
4. last4-only tracker note

## When to use

Use this after the report is in `single_responder_conversion` and the first responder has QA/coding/student-project interest.

Do **not** use it as a broad public post. It is a 1:1 proof asset for the first responder and their warm referrals.

## Privacy rules

- Use fake, scrubbed, or anonymized feature notes only.
- Do not collect or store company names, customer data, screenshots, credentials, ticket IDs, production logs, raw WhatsApp text, tokens, or full phone numbers.
- Track only last4, segment, route, sample/walkthrough/referral state, topic vote, slot vote, and next action.

## Copy blocks

### Sample request

```text
Can you share one anonymized QA example I can turn into a tiny AI-by-Doing sample?

Good examples:
- feature note → test cases
- bug report → regression checklist
- API/UI flow → edge cases
- student project → QA checklist

Please remove company names, customer data, screenshots, credentials, ticket IDs, and anything confidential. A plain 4–6 line fake/scrubbed example is enough.
```

### 20-minute walkthrough invite

```text
I made a small feature-note → test-plan sample from an anonymized example.

If useful, we can do a 20-minute walkthrough:
1. turn your scrubbed note into test cases
2. mark assumptions and missing product questions
3. create a reusable regression checklist
4. decide if this should be the first Casagrand AI-by-Doing topic

No confidential company/customer data needed. Are you free this week?
```

### One-referral ask

```text
If this QA workflow is useful, can you intro or forward it to one Casagrand resident who is into QA, coding, or student projects?

I’m trying to validate with 2–3 real residents before posting broadly in the IT group.

They can reply with:
“Casagrand referral — I want help with QA/coding workflow.”

Referral sprint page:
https://dabblewith.ai/casagrand-firstcity/referral-sprint/
```

### Last4-only tracker note

```text
QA test-plan sample tracker — last4 only

last4=____
route=qa_test_plan_sample
segment=qa_dev_student
sampleShared=yes/no
walkthroughInviteSent=yes/no
walkthroughBooked=yes/no
topicVote=qa_workflow/coding_assistant/student_project/other
slotVote=weekend_morning/weekend_evening/weekday_evening/unknown
referralAsked=yes/no
referralCount=0
nextAction=walkthrough/referral_sprint/date_lock/bot_readiness/continue_5dm
```

## Metrics and thresholds

- 1 sample received → book the 20-minute walkthrough.
- 1 walkthrough completed → ask for one QA/dev/student referral.
- 2 referrals logged → run the referral-sprint report path.
- 3 total QA/dev/student signals → open `/casagrand-firstcity/date-lock/`.
- 1 group-owner/admin signal → route separately to `/casagrand-firstcity/bot-readiness/`.
- No sample or referral after 24–48h → continue the narrow 5-DM route; do not broad-post yet.

## Next action

Send the sample request to the first QA/coding responder, then log only the last4 tracker fields. Once 2–3 total signals exist, switch from proof asset to date-lock flow.
