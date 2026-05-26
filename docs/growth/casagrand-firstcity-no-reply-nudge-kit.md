# Casagrand First-Responder No-Reply Nudge Kit

Date: 2026-05-26
Route: `first_responder_no_reply_nudge`

## Why this exists

The privacy-safe campaign report still shows one concrete QA/coding resident signal after owner/test exclusion, but no measured referral-sprint outcome. This kit keeps the signal warm without making a broad IT-group post too early.

## Use when

- 24h+ has passed since the first responder/sample/referral ask.
- No workflow sample, referral, or slot vote has been logged yet.
- The campaign is still below 3 total resident signals.

## Operator action

Open `/casagrand-firstcity/no-reply-nudge/` and send exactly one lightweight nudge. Ask for the easiest of:

1. one anonymized QA/coding task,
2. one slot/topic vote, or
3. one warm intro.

Do not chase repeatedly. If there is no reply after another 12-24h, continue narrow discovery with another warm resident instead of posting broadly.

## Tracker row

```text
last4=____
route=first_responder_no_reply_nudge
segment=qa_dev_student
nudgeSentAt=YYYY-MM-DD
replyAfterNudge=yes/no/unknown
replyType=sample/topic_vote/slot_vote/referral/group_owner/no_reply
sampleReceived=yes/no
referralPromised=yes/no
topicVote=qa_test_plan/coding_assistant/student_project/office_workflow/unknown
slotVote=weekend_morning/weekend_evening/weekday_evening/unknown
nextAction=qa_walkthrough/referral_sprint/date_lock/bot_readiness/continue_narrow_dms
```

## Decision rules

- Sample received → run `/casagrand-firstcity/qa-walkthrough/`.
- Referral promised → run `/casagrand-firstcity/referral-sprint/`.
- Slot/topic vote only → log the vote, then ask for a sample later.
- Group-owner/admin signal → use `/casagrand-firstcity/bot-readiness/`.
- No reply after 24h → continue narrow 5-DM/referral discovery; do not broad-post yet.
- Three total resident signals → move to `/casagrand-firstcity/date-lock/`.

## Privacy guardrails

Only log last4 and aggregate route fields. Do not store raw WhatsApp message text, full phone numbers, company/customer names, screenshots, ticket IDs, production logs, credentials, tokens, or webhook payloads.
