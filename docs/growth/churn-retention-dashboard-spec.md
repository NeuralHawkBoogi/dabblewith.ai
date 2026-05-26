# Dabblewith.ai Churn / Retention Dashboard Spec

Status: spec (not yet implemented)
Owner: Boogi / dabblewith.ai
Related tickets: `WEB-GROWTH-T15`
Pairs with: `docs/growth/community-intelligence-event-model.md`, `docs/growth/ga-conversion-event-taxonomy.md`
Last updated: 2026-05-26

## Goal

A lightweight, privacy-safe dashboard that shows whether Dabblewith.ai is building a *returning* audience — not a one-time-traffic blip — and whether the funnel from "first page view" to "useful action" is improving.

This spec deliberately lives ahead of implementation. We keep it as a spec until logged-in/community-bot-linked accounts exist; until then it runs entirely on anonymous GA cohorts.

## Distinction this dashboard must hold

The dashboard reports patterns. It never triggers an automated action against a member. AI-assisted suggestions for the human admin are fine; AI-driven actions are not. See `/community-policy/` §6.

## Metrics

### 1. Return-visit rates

For each window — 7 / 14 / 30 days — what fraction of distinct visitors return at least once?

| Metric | Formula | Source | Notes |
|---|---|---|---|
| 7d return | (distinct visitors with ≥2 sessions in 7d) / (distinct visitors with ≥1 session in 7d) | GA cohorts | Computed weekly, not real-time. |
| 14d return | same, 14d window | GA cohorts | Computed weekly. |
| 30d return | same, 30d window | GA cohorts | Computed monthly. |

### 2. Workflow engagement per visitor

| Metric | Formula | Source |
|---|---|---|
| Workflow views per session | sum(`workflow_view`) / sessions with any workflow event | GA |
| Distinct workflow categories per visitor (7d) | distinct `workflow_category` values per visitor token | GA |
| Workflow page bounce rate | bounce sessions on `/workflows/*` / total `/workflows/*` sessions | GA |

### 3. CTA-to-action funnels

#### Newsletter

`page_view` → `newsletter_signup_click` → confirmed subscription.

The confirmed subscription side lives in the email / WhatsApp provider, not in GA. The dashboard plots the *click* rate over time and pairs it with the subscriber count delta from the provider.

#### Community bot

`page_view` → `community_bot_setup_click` → reply in the operator inbox. We do not store the operator's inbound content in the dashboard; we record only that a reply was received and the source UTM tag if present.

#### Workflow submission

`workflow_submit_start` → `workflow_submit_complete`. The complete event fires when a workflow page is published. The completion-rate stat = complete / start, lagged by review time.

#### Challenge participation

`challenge_join_click` → confirmed challenge participant. Confirmation is tracked manually by the human running the challenge until logged-in accounts exist.

### 4. Pathway segmentation

For each `audience_segment` (founders_operators, creators_writers, researchers_academics, healthcare_business_ops, nocode_automation_builders, community_runners):

- 7-day visitors
- 7-day return rate
- Top 3 workflow categories viewed
- CTA-click rate on submit / newsletter / community bot

This is **cohort-level only**. Never per-individual.

### 5. Source/medium attribution

By `utm_source` + `utm_medium`:

- 7-day visitors
- 7-day return rate
- Workflow views per visitor
- Conversion to newsletter / submit / challenge / community bot

This makes the partner CRM and reply-guy kits accountable. If a channel doesn't return repeat visits, we retire it.

## Future churn-risk heuristics (logged-in / accounted users only)

These do not run today. They are documented now so the dashboard can absorb them without redesign.

| Heuristic | Definition | Action |
|---|---|---|
| Drop-off after first workflow | Visited 1 workflow, never returned in 14d. | Human-curated re-engagement email (not automatic). |
| Submission-stall | Started a submission flow (workflow_submit_start) but no completion in 21d. | Human follow-up: "anything I can help unblock?" |
| Challenge ghost | Joined a challenge, no public progress for 2 weeks. | Human DM (not automatic). |
| Negative bot signal | Community-bot setup click but no inbound reply within 7d. | Human review of the inbound channel or UTM. |

**All actions are human-initiated, including in the future.** No automated retention messaging.

## Privacy boundaries

- The dashboard never displays per-person timelines.
- Aggregations smaller than n=10 are suppressed (no "1 visitor in this cohort did X").
- IP addresses are not surfaced.
- UTM values that look like PII (contain `@`, look like phone numbers, etc.) are filtered out at ingest by the same allowlist used in `scripts/web/dabblewith-tracking.js`.
- The dashboard is internal-only. A redacted snapshot can be published on `/build-in-public/` if the operator chooses.

## Implementation notes (for a future ticket)

- Implementation can run as a weekly Node script that pulls GA via the existing pattern (`scripts/google-analytics-report.js`) and renders a static HTML page in `/build-in-public/` or `/reports/` (gitignored if it contains anything sensitive).
- Until that script exists, the operator manually fills the metric placeholders on `/build-in-public/` weekly.
- The retention/funnel section should be its own static page that links back to `/build-in-public/`.

## Open questions

- Where do we draw the line between "dashboard reports a cohort dropped off" and "we proactively message"? Default: dashboard reports, human chooses every message.
- Do we expose attribution-by-partner to the partner themselves? Default: no, unless they ask and we agree on what's shared.
