# Casagrand First City Reply Router Kit

Date: 2026-05-24

Use this after the current 5-DM low-signal reboot sprint. The goal is to stop replies from becoming ad-hoc WhatsApp chat and instead route each response into one measurable growth/product-validation path.

Public/mobile kit: `https://dabblewith.ai/casagrand-firstcity/reply-router/`

## Route every reply into one primary bucket

1. **Event attendee** — resident shares a career, workflow, coding, student, founder, or productivity problem and may attend a practical AI session.
2. **Referral source** — resident knows one more person who has the problem.
3. **Group owner/admin** — person manages a WhatsApp group, club, class, resident initiative, or repeated announcements/registrations/FAQs.
4. **No fit/objection** — person says the angle is unclear, not useful, too broad, too busy, or wrong topic.

## Follow-up rule

- Interested attendee → ask for one specific topic vote/date preference.
- Referral source → ask for one intro or forward the first-10 tester link.
- Group owner/admin → send bot-readiness audit, then book a design-partner call only if pain is concrete.
- No fit/objection → ask which angle would make it useful; use replies to rewrite positioning before any broad group post.

## Privacy-safe logging fields

Do not paste raw private messages, full phone numbers, tokens, or sensitive resident details into repo files or public docs.

```text
Casagrand reply log
- Segment:
- Phone last4 only:
- Route: attendee / referral / group_owner / no_fit
- Concrete problem in 8 words:
- Follow-up sent:
- Next action/date:
```

## 24-hour decision thresholds

- 0 replies → rewrite hook before another batch.
- 1 weak reply → ask one sharper multiple-choice follow-up.
- 2+ concrete use cases → send 5 more DMs.
- 3+ topic votes → create/use date poll and prepare a small session.
- 2+ group-owner pains → book design-partner calls for Get a Community Bot.
- 10+ interested residents → lock clubhouse slot and post broader launch message.

## Report command

```bash
node scripts/casagrand-campaign-report.js --runtime-dir /home/clawdbot/dabblewith-whatsapp/data --output-dir reports/casagrand-firstcity --exclude-last4 2585 --date 2026-05-24
```
