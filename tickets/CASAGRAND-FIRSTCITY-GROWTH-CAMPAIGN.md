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
- 2026-05-21: Added `docs/growth/casagrand-firstcity-24hour-launch-brief.md` with the exact first-post launch copy, T+1/T+6/T+24 measurement schedule, report command, decision thresholds, topic-to-event title mapping, and privacy-safe evidence template.
- 2026-05-21: Enhanced `scripts/casagrand-campaign-report.js` to emit a privacy-safe launch decision card (`clubhouse_intro`, `build_sprint`, `design_partner_calls`, or `first10_tester_dms`) from aggregate campaign signals, source tags, topic clusters, and community-bot tracks. This makes the T+24 report directly actionable without exposing phone numbers, raw message IDs, tokens, or webhook payloads.

- 2026-05-21: Added `/casagrand-firstcity/date-poll/` source-tagged date/topic poll page with WhatsApp vote CTAs, forwardable poll copy, privacy guardrails, and decision thresholds for locking the clubhouse event slot. Linked it from the Casagrand pilot page, sitemap, and growth plan.
- 2026-05-21: Added `/casagrand-firstcity/launch-board/`, a mobile-ready launch board for Boogi with the exact first WhatsApp post, poll follow-up, RSVP/date/flyer/community-bot links, T+24 decision thresholds, and privacy-safe report command. Linked it from the main Casagrand page, sitemap, and growth plan.
- 2026-05-21: Improved `/casagrand-firstcity/launch-board/` with one-tap copy buttons for the first WhatsApp post, follow-up poll, first-10 tester fallback DM, and internal report command, plus copy-event GA tracking. This reduces launch friction from mobile and keeps the no-signal fallback directly executable.
- 2026-05-21: Added `/casagrand-firstcity/admin-ask/`, a mobile-ready permission kit with one-tap copy for IT group/admin approval, clubhouse slot ask, noticeboard flyer ask, objection replies, and approval checklist; linked it from the pilot page, launch board, sitemap, and growth plan.
- 2026-05-21: Improved `/casagrand-firstcity/testers/` for the no-signal route with one-tap DM/tracker copy buttons, GA copy tracking, a 10-person outreach mix (career/workflow/founder/student/community-admin), and added the tester page to sitemap so the first-10 DM sprint is executable from mobile.
- 2026-05-22: Added `/casagrand-firstcity/office-hours/`, a 45-minute repeat-loop page with source-tagged WhatsApp problem submission, one-tap office-hours invite/recap copy, community-bot qualification prompts, decision thresholds, internal report command, and links from the Casagrand pilot page, launch board, sitemap, and growth plan.
- 2026-05-22: Added `/casagrand-firstcity/champions/` plus `docs/growth/casagrand-firstcity-resident-champion-kit.md` to recruit three trusted resident champions before the broad IT-group post, collect six real use cases, seed first replies, and route group-owner referrals into the community-bot design-partner funnel.
- 2026-05-22: Added `/casagrand-firstcity/first-10-outreach/`, a mobile-ready first-10 outreach tracker for the current low-signal state, with segment-specific DM copy, response logging that redacts phone numbers except last four digits, and 24-hour thresholds for rewrite/send-more-DMs/post-poll/lock-event/book-bot-calls.
- 2026-05-22: Added `/casagrand-firstcity/rsvp-follow-up/`, a first-signal conversion kit that turns one RSVP into a personal confirmation, two-referral ask, concrete slot/topic vote, community-bot lead probe, privacy-safe mini tracker, and 24-hour thresholds; also aligned the campaign report's bottom next action with the launch decision card to avoid contradictory instructions.
- 2026-05-22: Added `/casagrand-firstcity/bot-readiness/`, a 10-minute WhatsApp group-owner readiness audit for validating the Get a Community Bot product from Casagrand leads. Added source-tag classification for `casagrand_bot_readiness`, linked it from the Casagrand pilot/launch board/sitemap/growth plan, and extended smoke coverage so readiness-audit leads count as community-bot tracks in privacy-safe reports.
- 2026-05-22: Added `/casagrand-firstcity/reboot-copy/`, a low-signal positioning rewrite kit for the current first-10 DM route, with one-tap career/workflow/community-bot DM variants, `casagrand_reboot_*` source tags, privacy guardrails, and 24-hour decision rules before another broad WhatsApp post.
