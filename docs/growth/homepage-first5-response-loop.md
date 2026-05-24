# Homepage first-5 response loop

Date: 2026-05-24
Owner: dabblewith.ai growth autopilot
Related: homepage Direct/WhatsApp CTA, warm 5-contact outreach, community-bot validation

## Why this exists

Boogi sent the dabblewith.ai homepage WhatsApp-forward message to 5 known contacts. Early replies prove whether a forwarded homepage link can turn warm traffic into usable builder/community-bot signals.

This loop turns the first replies into the next action without waiting for a broad Casagrand post.

## Current operating rule

Do not optimize for raw traffic yet. Optimize for **reply quality**:

1. Did the person reach WhatsApp from the homepage?
2. Did they share role + workflow/problem?
3. Can we route them into a concrete session, builder call, or community-bot owner interview?
4. Did they give language we can reuse in the next invite?

## Privacy-safe report command

```bash
node scripts/homepage-outreach-report.js \
  --since 2026-05-24T05:00:00Z \
  --target 5 \
  --out reports/homepage-outreach-2026-05-24.md
```

The report must only include aggregate counts and redacted last-four responder IDs. Do not include raw WhatsApp payloads, message IDs, tokens, or full phone numbers.

## Routing rules for first replies

### A. Builder / deeper discussion signal

Route to a 20-minute builder call.

Copy:

> Nice — this is exactly the kind of builder signal I’m looking for.
> Can you send me one real workflow you want to automate or improve? If it is concrete enough, I’ll use it to shape a 20-minute builder discussion / mini-demo.

Track as:

- stage: builder discussion requested
- next action: collect one workflow sample
- conversion goal: one design-partner-style builder call

### B. Agentic workflow / developer signal

Route to a practical mini-session.

Copy:

> Got it. I’m seeing interest around agentic workflows and dev productivity.
> Would a focused mini-session like “build a safe CLI/file-system memory agent” be useful? Reply with your preferred stack and one sample task.

Track as:

- stage: learning format captured
- topic: agentic workflows / developer workflow
- conversion goal: first focused session topic

### C. General learning / tutor signal

Ask one narrowing question.

Copy:

> Perfect. To route you properly, send one line with:
> 1) your role, 2) one workflow/problem you want AI help with, and 3) whether you prefer live sessions, WhatsApp learning, or hands-on demos.

Track as:

- stage: needs qualification
- conversion goal: role + workflow + format captured

### D. Community or group-owner signal

Route to the community-bot readiness path.

Copy:

> If you run or help manage a WhatsApp group, I’m also validating a lightweight AI host for communities — FAQs, registrations, summaries, and reports.
> Want to do a 10-minute readiness check for your group?

Track as:

- stage: community-bot lead
- next action: readiness check or design-partner call
- conversion goal: first community-bot validation interview

## Next outreach decision thresholds

After 24 hours from a 5-contact batch:

- **0–1 meaningful replies:** rewrite the forward message around one concrete promise; do not post broadly.
- **2–3 meaningful replies:** run one focused follow-up with those responders and send 3–5 more warm DMs.
- **4–5 meaningful replies:** pick the strongest topic, draft the first mini-session, and use that as proof before a wider Casagrand IT-group post.
- **Any group-owner lead:** prioritize community-bot readiness/design-partner call because it validates the paid product wedge.

## Recommended next move from the 2026-05-24 first batch

Early signals show the homepage → WhatsApp route works for at least 2 of 5 warm contacts. The next move is to convert those replies into one concrete builder session/call before broadening outreach.

Use the tracked evidence artifact at `docs/growth/homepage-outreach-2026-05-24-report.md`; the same command can regenerate the ignored local runtime report at `reports/homepage-outreach-2026-05-24.md`.
