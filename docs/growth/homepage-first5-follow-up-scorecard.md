# Homepage first-5 follow-up scorecard

Date: 2026-05-24
Owner: dabblewith.ai growth autopilot
Related: `docs/growth/homepage-first5-response-loop.md`, `docs/growth/homepage-first5-builder-session-kit.md`, `docs/growth/homepage-outreach-2026-05-24-report.md`

## Why this exists

The first warm homepage-forward batch reached WhatsApp and produced 2/5 meaningful responders. A later privacy-safe read through 2026-05-24T10:15:00Z still shows 2/5 responders, so the next growth move is not broader traffic. The move is to convert one of the two active signals into a booked builder session or community-bot validation call.

Public/operator artifact: `https://dabblewith.ai/homepage-outreach/follow-up-scorecard/`

## Operating rule

Do not send a bigger batch until one of these happens:

- one responder sends a concrete workflow sample and agrees to a 20-minute builder session;
- one responder identifies as a WhatsApp group owner/admin and agrees to a readiness/design-partner call;
- 24 hours pass with no booking, in which case rewrite the next forward around a narrower promise.

## Privacy-safe follow-up fields

Track only:

- redacted responder id: `wa_••••1234`
- stage: workflow requested / sample received / slot proposed / booked / parked
- theme: agentic workflows, developer workflow, AI learning, community bot, other
- workflow sample: yes/no
- stack/tool preference: captured/not captured
- preferred format: live, WhatsApp walkthrough, hands-on demo, unknown
- community-owner signal: yes/no
- next action

Never store raw WhatsApp payloads, message IDs, tokens, full phone numbers, or unnecessary display names in growth reports.

## Copy block

```text
Quick follow-up — I’m keeping this small before inviting more people.

Send me one real workflow you want to automate or improve:
- current tool/stack,
- input you start with,
- output you want,
- what usually breaks.

If it’s concrete, I’ll use it for a 20-minute builder mini-session / walkthrough. If you also run a WhatsApp group, tell me that separately — I’m validating a lightweight community AI host too.
```

## Decision thresholds

- **One session booked:** use the anonymized workflow title as proof for the next 3–5 warm DMs.
- **Community-owner signal:** route to `/community-bot/` readiness/design-partner validation before any broad learner invite.
- **No booking in 24 hours:** rewrite the forward around one narrow promise, likely “build a safe CLI/file-system memory agent,” and test 3–5 more warm contacts.
