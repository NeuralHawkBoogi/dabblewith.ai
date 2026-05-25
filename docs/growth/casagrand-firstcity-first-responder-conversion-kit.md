# Casagrand First Responder Conversion Kit

Date: 2026-05-25
Page: `https://dabblewith.ai/casagrand-firstcity/first-responder/`

## Why this exists

The 2026-05-25 privacy-safe Casagrand report now shows one real resident signal after owner/test exclusion: a QA engineer interested in coding/student-project/event learning. That is useful, but it is not enough evidence for a broad 600-member WhatsApp post or a clubhouse date.

This kit converts the first real RSVP into richer validation before scaling:

- one QA-specific workflow sample
- one topic vote
- one slot vote
- two warm referrals
- one community-bot/group-owner probe

## Operator rule

Reply 1:1 first. Do not broadcast again yet.

Use the QA-specific follow-up copy from the page and ask for one anonymized work problem. If the resident replies with a concrete QA/coding workflow, shape the first mini-demo around that use case.

## Copy sequence

1. QA-specific confirmation and workflow-sample ask
2. Two-resident referral ask
3. Slot/topic vote ask
4. Community-bot design-partner probe
5. Last-four-only tracker note

## 24-hour thresholds

- 0 replies to follow-up: continue the existing 5-DM sprint and revise the hook.
- 1 concrete workflow sample: prepare a small QA/coding workflow mini-demo.
- 2+ referrals: send warm DMs to the referred residents before any broad group post.
- 3+ topic/slot votes: open the date poll and start shaping event title.
- 2+ community-bot/group-owner leads: book design-partner calls.

## Privacy guardrails

- Store only phone last four, segment, route, problem category, follow-up state, and next action.
- Do not store full phone numbers, raw WhatsApp text, display names, message IDs, tokens, or screenshots in repo.
- If creating a report, use `scripts/casagrand-campaign-report.js` with `--exclude-last4 2585` and share aggregate counts only.

## Report command

```bash
node scripts/casagrand-campaign-report.js \
  --runtime-dir /home/clawdbot/dabblewith-whatsapp/data \
  --output-dir reports/casagrand-firstcity \
  --date 2026-05-25 \
  --exclude-last4 2585
```
