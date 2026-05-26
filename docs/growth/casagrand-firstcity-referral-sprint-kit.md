# Casagrand First City — First Responder Referral Sprint Kit

Date: 2026-05-25
Public page: `https://dabblewith.ai/casagrand-firstcity/referral-sprint/`

## Why this exists

The live Casagrand report currently shows one real resident signal after owner/test exclusion: QA/coding/student-project/event interest. One signal is not enough to justify a broad post in the ~600-member IT group, but it is enough to start a narrow proof-backed referral loop.

This kit converts the first responder into 2–3 additional privacy-safe resident signals before any broad IT-group post.

## Operator sequence

1. Thank the first responder and ask for one anonymized QA/coding workflow sample.
2. Ask for exactly one warm referral to another Casagrand QA/dev/student/practical-AI resident.
3. Send the referred neighbor the proof-led warm intro copy, not a generic launch post.
4. If the referral is a group owner/admin, send the bot-readiness audit; otherwise keep the learner/event path separate.
5. Track only last4, route, segment, topic vote, slot vote, community-bot probe, and next action.

## 24-hour thresholds

- 0 referrals in 24h: continue the narrow 5-DM sprint.
- 1 referral plus a workflow sample: run the QA mini-demo path.
- 3 total QA/dev/student signals: run the topic/date poll.
- 1 group-owner/admin referral: send the bot-readiness audit.
- 5+ total resident signals: prepare clubhouse slot and admin permission path.

## Copy blocks

Use the public page copy buttons for:

- first-responder thank-you/workflow-sample ask
- one-referral ask
- referred-neighbor warm intro
- last4-only tracker row
- community-bot readiness probe for group-owner/admin referrals only

## Privacy guardrails

- Redact phone numbers except last four digits.
- Do not store raw WhatsApp messages, raw webhook payloads, screenshots, company data, credentials, or tokens.
- Do not imply this is official Casagrand association software.
- Treat community-bot interest as design-partner validation until a human approves any external commitment.

## Report routing update — 2026-05-25 20:15 UTC

The privacy-safe campaign report now routes `single_responder_conversion` directly to this referral sprint when only 1–2 concrete residents exist. The report copy includes:

- workflow-sample ask
- slot/topic vote ask
- one-referral ask
- referral sprint link
- community-bot gate for group-owner/admin referrals only
- last4-only tracker note using `route=first_responder_referral_sprint`

## Tracker/reporting update — 2026-05-25 22:15 UTC

The campaign report now recognizes the referral sprint evidence path end to end:

- WhatsApp text containing `Casagrand referral`, `Casagrand referral sprint`, or `first_responder_referral_sprint` is tagged as `casagrand_referral_sprint`.
- Manual tracker rows may use `segment=qa_dev_student`, `segment=group_owner`, or `segment=other` without being rejected.
- Manual tracker rows may use `route=first_responder_referral_sprint`; these count as concrete referral signals while still storing only last4 and short privacy-safe notes.
- If two referral-sprint rows are logged, the manual report next action is to continue the warm-intro path and open the date/topic poll once three total resident signals are captured.

## Report section — 2026-05-26

When the manual tracker is supplied with any `route=first_responder_referral_sprint` rows, the privacy-safe campaign report now renders a copy-ready **`Referral sprint follow-up`** section built only from sanitized tracker rows and aggregate counts (no raw phones/messages/tokens):

- Referral-sprint rows logged, total referrals, and whether any `group_owner` segment is present.
- Recommended next steps:
  - If total referrals >= 2: send the referred-neighbor warm intro from `/casagrand-firstcity/referral-sprint/` and open `/casagrand-firstcity/date-poll/` once 3 total resident signals are logged.
  - If total referrals < 2: keep running the sprint; 2 referrals are needed before opening the date/topic poll.
  - If any `group_owner` segment is present: route that referral to `/casagrand-firstcity/bot-readiness/` for the community-bot design-partner path.
- Last4-only row bullets (`segment · ****last4 · problem · follow_up · next`) so the operator can act without opening another kit.

The section is omitted entirely when the tracker has no referral-sprint rows, and rows whose `last4` is not exactly four digits are rejected before rendering.

## Referral-sprint tracker template — 2026-05-26 02:15 UTC

The report CLI can now generate a dedicated privacy-safe starter JSON for the first-responder referral sprint:

```bash
node scripts/casagrand-campaign-report.js \
  --write-referral-sprint-template /tmp/casagrand-referral-sprint-tracker.json
```

Use this when the first responder gives 1–3 warm intros. It creates three last4-only rows:

- two `qa_dev_student` referral rows for QA/dev/student/practical-AI neighbors
- one `group_owner` referral row for a WhatsApp group owner/admin, routed to bot readiness only when applicable
- all rows default to `route=first_responder_referral_sprint`, so the existing report renders the **Referral sprint follow-up** section immediately after Boogi fills the last4/problem/next-action fields

Keep the generated file local/private; commit docs and code only, not filled tracker data.
