# Dabblewith.ai Launch Readiness Checklist

Status: active
Owner: Boogi / dabblewith.ai
Related tickets: `WEB-GROWTH-T17`
Pairs with: `docs/growth/utm-link-conventions.md`, `docs/growth/ga-conversion-event-taxonomy.md`, `docs/growth/reply-guy-and-build-in-public-content-kit.md`
Last updated: 2026-05-26

## Goal

Before any new workflow page, category, challenge, newsletter issue, or feature goes live, walk this checklist. The goal is **not** to slow launches; it's to make sure each launch is measurable, recoverable, and ready for the people we'll point at it.

A launch that nobody can find, that has broken tracking, that 404s a link, or that ships before we have anyone to send to is a worse outcome than not launching.

## Checklist

### 1. Positioning &amp; copy

- [ ] One sentence above the fold that states what the page is for.
- [ ] No corporate jargon. The first paragraph passes the "would a friend read this" test.
- [ ] Each CTA states what happens next ("send WhatsApp", "subscribe by email", "see workflow").
- [ ] Trust copy where appropriate: safe-by-default, human review, what we won't automate.

### 2. Routes &amp; structure

- [ ] Final URL chosen and stable. `/workflows/<slug>/`, `/challenges/<slug>/`, etc.
- [ ] Canonical URL set in `<link rel="canonical">`.
- [ ] Nav + footer updated with the new route (where appropriate).
- [ ] No duplicate IDs on the page.
- [ ] Page renders on mobile widths down to 360px.
- [ ] Internal links from at least 2 existing relevant pages (workflows / homepage / category index / blog).

### 3. UTM links

- [ ] Channel-specific UTM links created per `docs/growth/utm-link-conventions.md`.
- [ ] Lowercase, hyphenated values only.
- [ ] No PII in UTM fields (no emails, phone numbers, names, raw messages).
- [ ] Intent value picked from the allow-list.
- [ ] Saved into a launch-link table for the post-launch review.

### 4. GA events

- [ ] Every primary CTA has `data-cta`, `data-event` (from the allowlist), and where relevant `data-audience` and `data-workflow-category`.
- [ ] Event names match `docs/growth/ga-conversion-event-taxonomy.md`.
- [ ] No new event names introduced without updating the taxonomy doc and the `ALLOWED_EVENTS` map in `scripts/web/dabblewith-tracking.js`.
- [ ] Smoke check: open the page in a browser with GA debug on and confirm the named event fires on click.

### 5. Schema / SEO

- [ ] JSON-LD added for the right schema type (`HowTo`, `LearningResource`, `Event`, `WebPage`, etc.).
- [ ] Schema contains no PII or raw private content.
- [ ] `<title>`, `<meta description>`, OpenGraph, Twitter card all match the page's actual purpose.
- [ ] Robots meta: `index, follow` (unless intentionally private).
- [ ] Sitemap entry added (`sitemap.xml`).

### 6. Privacy

- [ ] No real customer/community member data on the page.
- [ ] No phone numbers, emails, or names in analytics or schema.
- [ ] Any example outputs are sanitized.
- [ ] If the page handles regulated data (health, financial, minors, legal), an explicit caveat box is present.

### 7. Assets

- [ ] Screenshot or social card ready (1200×630 minimum) — even if it's text-on-brand.
- [ ] OG image URL set and reachable.
- [ ] Any external link checked (no 404, no broken redirect, no preview leaking sensitive details).

### 8. People

- [ ] 20-50 early engaged people identified for the manual launch DM template (`reply-guy-and-build-in-public-content-kit.md`).
- [ ] At least 3 partner targets from `partner-collaboration-crm.md` lined up for soft-share.
- [ ] If the launch needs participants (challenge), at least 5 named people we'd ask to start week 1.

### 9. Timing

- [ ] Launch day and time chosen (avoid major industry conflict days where possible).
- [ ] Follow-up post / DM scheduled for 48 hours later.
- [ ] Metrics review block on the calendar 7 days post-launch.

### 10. Rollback &amp; recovery

- [ ] If the launch needs to be reverted, the rollback steps are written down (e.g., remove sitemap entry, redirect to canonical, revert HTML).
- [ ] Person responsible if something goes wrong: named, contactable.

## Post-launch (within 7 days)

- [ ] Confirm tracked events fired (workflow_view / newsletter_signup_click / etc.).
- [ ] Compare visitors-by-source to expected (per UTM tagging plan).
- [ ] Review which reply patterns / DMs actually returned target-buyer engagement.
- [ ] Note 1 thing to do differently next launch.

## What blocks a launch

Any "no" on these blocks the launch:

- [ ] PII would be exposed.
- [ ] A safety-critical workflow would auto-publish without human review.
- [ ] The page makes a claim (about users, partners, revenue) that isn't grounded in fact.
- [ ] Tracking is broken and we cannot tell if the launch did anything.
- [ ] We have no one to send to and no plan to find anyone.

## Used by

This checklist was applied to:

- 2026-05-26 — Workflow Exchange MVP (`/workflows/`, 10 seed workflow pages, `/submit-workflow/`, `/newsletter/`, `/build-in-public/`, `/challenges/`, `/community-policy/`, `/start/`).
