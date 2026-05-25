# Casagrand First City QA Workflow Demo Kit

Date: 2026-05-25
Artifact: `https://dabblewith.ai/casagrand-firstcity/qa-workflow-demo/`

## Context

The first real Casagrand resident signal after owner/test exclusion is a QA/coding/student-project/event-interest responder. The campaign is still below the threshold for a broad IT-group post, so the next growth move is to convert this first signal into a concrete workflow sample, a mini-demo, and two warm referrals.

## Goal

Turn one QA/coding signal into:

- one anonymized QA workflow sample
- one 20-minute mini-demo or walkthrough
- two QA/dev/student referrals
- one topic/slot vote
- optional community-bot intro if the responder knows a group/admin with repeated questions

## Operator sequence

1. Send the QA sample ask from the page.
2. Capture only privacy-safe metadata: last4, segment, sample type, topic vote, slot vote, referral context.
3. Use the demo prompt to turn the anonymized sample into test cases, edge cases, risks, and a regression checklist.
4. Offer a 20-minute walkthrough.
5. Ask for two referrals after the walkthrough, not before value is shown.
6. Rerun the Casagrand privacy-safe report after 24 hours.

## Demo shape

**Title:** AI by Doing for QA: Feature Note to Test Plan

**20-minute outline:**

- 3 min: clarify the anonymized feature note and assumptions
- 5 min: AI-generated happy path, negative path, edge cases
- 5 min: human QA review — remove weak cases, add risks, identify missing product details
- 5 min: convert into a reusable regression checklist
- 2 min: ask for topic/slot vote and two referrals

## Decision thresholds

- 0 reply to sample ask: continue the 5-DM sprint before any broad post.
- 1 sample received: prepare the mini-demo and ask for a slot.
- 1 mini-demo completed: ask for 2 referrals and a short testimonial-style learning note.
- 3+ QA/dev/student signals: run a topic poll around QA/coding/student projects.
- 5+ total resident signals: prepare the clubhouse slot and broader launch post.
- 2+ group-owner/community-bot signals: route to `/casagrand-firstcity/design-partner-call/`.

## Privacy guardrails

- Do not store raw WhatsApp text, full phone numbers, screenshots, company/client names, credentials, customer data, or webhook payloads.
- Ask the responder to anonymize the sample before sending.
- Reports must redact phone numbers except last four digits.
- Keep the demo framed as educational and unofficial unless a community/admin explicitly approves broader use.

## Measurement

Use the normal campaign report after updating any manual tracker notes:

```bash
node scripts/casagrand-campaign-report.js \
  --runtime-dir /home/clawdbot/dabblewith-whatsapp/data \
  --output-dir reports/casagrand-firstcity \
  --date 2026-05-25 \
  --exclude-last4 2585
```
