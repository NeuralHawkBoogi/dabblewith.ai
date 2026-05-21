# Ticket: Casagrand First City Growth Campaign

Status: open
Priority: P0
Created: 2026-05-20

## Goal
Use Casagrand First City as the first warm local growth wedge for dabblewith.ai, leveraging the IT opportunities WhatsApp group (~600 members) and clubhouse event venue.

## Build scope
- Add a Casagrand-specific source tag and interest tags to WhatsApp bot intake.
- Create a landing/event page for a free clubhouse session.
- Prepare WhatsApp announcement and poll copy.
- Track inbound users, use cases, poll responses, registrations, and event attendance.
- Produce post-event recap and case-study templates.

## Strategy doc
- `docs/growth/casagrand-firstcity-community-growth-plan.md`

## Acceptance criteria
- Bot can identify Casagrand-sourced users who self-declare or enter via a Casagrand CTA.
- First WhatsApp announcement copy is ready to forward.
- First clubhouse event page/draft exists.
- Campaign report shows users, intents, event interest, and top requested AI topics.
- Campaign report redacts phone numbers except last 4 digits and never includes raw tokens or full webhook payloads.
- Post-event recap template is ready before the event.

## Progress log
- 2026-05-20: Added public campaign/event landing page at `/casagrand-firstcity/` with WhatsApp source-tag CTA, forwardable launch post, poll copy, session agenda, and community-helper demo positioning. Added page to sitemap.
- 2026-05-20: Added `scripts/casagrand-campaign-report.js` and smoke coverage to turn WhatsApp JSONL logs into a privacy-safe campaign report with unique users, intents, topic clusters, delivery/status counts, recent redacted signals, and a concrete next action.
- 2026-05-20: Added `/casagrand-firstcity/rsvp/` event registration funnel plus `docs/growth/casagrand-firstcity-event-registration-kit.md` with WhatsApp RSVP/reminder copy, fields, go/no-go thresholds, and report-driven topic decision rules.
- 2026-05-20: Added `docs/growth/casagrand-firstcity-post-event-loop-kit.md` with WhatsApp recap copy, office-hours invite, community-bot design-partner CTA, anonymized blog/case-study template, decision rules, loop metrics, and privacy guardrails.
- 2026-05-20: Added `docs/growth/casagrand-firstcity-first-10-testers-sprint-kit.md` to convert warm access into 10 direct tester conversations before the larger IT-group post, with source-tag openers, DM copy, follow-up nudge, poll, tracking fields, and report-driven event-topic decision rules.
- 2026-05-20: Added `/casagrand-firstcity/testers/` private first-10 tester page with track-specific WhatsApp source-tag CTAs, forwardable 1:1 DM copy, go/no-go rules, and linked it from the main Casagrand pilot page and sitemap.
- 2026-05-20: Enhanced `scripts/casagrand-campaign-report.js` to classify Casagrand RSVP/source tags and first-10 tester tracks (`career`, `workflow`, `founder`, `student`, `community_bot`) from WhatsApp text, render tag/track counts in the privacy-safe report, and keep recent signals redacted/hash-only.
- 2026-05-21: Added `docs/growth/casagrand-firstcity-clubhouse-host-kit.md` with facilitator script, 90-minute run of show, QR/CTA links, live-demo prompts by topic cluster, onsite metric sheet, same-day recap draft, and community-bot design-partner qualification questions.
- 2026-05-21: Added `/casagrand-firstcity/community-bot/` local design-partner intake page with source-tagged WhatsApp CTA, warm admin invite copy, fit criteria, validation questions, privacy guardrails, and linked it from the Casagrand pilot page and sitemap.
- 2026-05-21: Added `/casagrand-firstcity/flyer/` — a printable/forwardable clubhouse noticeboard flyer with non-salesy value prop, audience, what to bring/leave with, RSVP + `Casagrand flyer` source-tagged WhatsApp CTAs, mini WhatsApp share copy, an unofficial-software/no-sensitive-data privacy note, and `@media print` styling. Linked it from the main Casagrand pilot page (nav + hero), sitemap, and growth-plan kits list.
- 2026-05-21: Added `docs/growth/casagrand-firstcity-admin-permission-pack.md` with WhatsApp-ready admin/group permission asks, clubhouse/noticeboard approval copy, one-post launch copy, data/privacy answers, no/partial-approval fallbacks, approval checklist, and 24-hour evidence/reporting steps.
