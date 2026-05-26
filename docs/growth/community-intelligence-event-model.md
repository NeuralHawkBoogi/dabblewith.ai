# Dabblewith.ai Community Intelligence Event Model

Status: active
Owner: Boogi / dabblewith.ai
Related tickets: `WEB-GROWTH-T14`
Pairs with: `docs/growth/ga-conversion-event-taxonomy.md`, `docs/growth/utm-link-conventions.md`, `scripts/web/dabblewith-tracking.js`
Last updated: 2026-05-26

## Goal

Define a single, privacy-safe event model that powers:

- Today's GA conversion funnel.
- Tomorrow's retention and personalization signals for logged-in or returning visitors.
- Future AI-assisted community management — **assisted**, never automated.

The model is deliberately narrow so we can extend it without re-architecting later.

## Design rules

1. **Events describe behaviours, not people.** No event ever attempts to identify an individual member.
2. **No PII fields ever.** Not in event names, not in metadata, not in property values, not in URL params we record.
3. **Counts and categories over content.** We capture *that* a member viewed a workflow, never *what* was inside their related private messages.
4. **Schema lives next to taxonomy.** Every event in this doc maps 1:1 to an entry in `ga-conversion-event-taxonomy.md`.
5. **Human-in-the-loop is explicit.** If an event ever feeds an automated moderation action, the action is gated by human review per `/community-policy/`.

## Event catalog

Each event uses snake_case names and the metadata fields below. Anything not listed is forbidden in the payload.

### Allowed metadata fields (across all events)

| Field | Type | Notes |
|---|---|---|
| `page_path` | string | Site path only, no query string with PII. |
| `cta_id` | string | Stable identifier set as `data-cta`. |
| `cta_label` | string | Visible link text, truncated to 80 chars. |
| `audience_segment` | enum | `founders_operators`, `creators_writers`, `researchers_academics`, `healthcare_business_ops`, `nocode_automation_builders`, `community_runners`, `builders`, `learn_practical_ai`, `newsletter_readers`. |
| `workflow_category` | enum | `founders-operators`, `creators-writers`, `research-academic`, `healthcare-ops`, `nocode-automation`, `community_submission`. |
| `link_host` | string | Hostname only. No path, no querystring. |
| `source` | string | From `utm_source` (allow-listed values only). |
| `medium` | string | From `utm_medium`. |
| `campaign` | string | From `utm_campaign`. |
| `content` | string | From `utm_content`. |
| `intent` | enum | `explore-workflows`, `submit-workflow`, `join-newsletter`, `launch-community-bot`, `partner-interest`, `challenge-interest`, `build-in-public`. |

### Events

| Event | When | Required metadata | Optional metadata |
|---|---|---|---|
| `workflow_view` | A workflow page loads or its card is meaningfully scrolled into view. | `page_path`, `workflow_category` | `cta_id`, `audience_segment`, attribution fields |
| `workflow_explore_click` | Click on any "Explore workflows" / category CTA. | `page_path`, `cta_id` | `audience_segment`, `workflow_category`, attribution |
| `workflow_submit_start` | Click any "Submit a workflow" CTA (WhatsApp/email/route). | `page_path`, `cta_id` | `workflow_category`, `audience_segment`, attribution |
| `workflow_submit_complete` | A workflow page goes from "submitted" to "published" (recorded server- or build-side). | `workflow_category` | — |
| `newsletter_signup_click` | Click any newsletter signup CTA. | `page_path`, `cta_id` | `audience_segment`, attribution |
| `community_bot_setup_click` | Click any community-bot setup/onboarding CTA. | `page_path`, `cta_id` | attribution |
| `challenge_join_click` | Click any challenge / session CTA. | `page_path`, `cta_id` | `audience_segment`, attribution |
| `partner_interest_click` | Click partner / issue-swap / collaboration CTA. | `page_path`, `cta_id` | attribution |
| `build_public_metrics_view` | Build-in-public page loaded or autopilot/status CTA clicked. | `page_path` | `cta_id`, attribution |
| `audience_segment_click` | Click on a homepage / start-page audience pathway. | `page_path`, `cta_id`, `audience_segment` | `workflow_category`, attribution |
| `intent_selected` | (Future, server-side or hashed cookie) The visitor selected an intent via `/start/` and we recorded the *category*, never the user. | `intent` | `page_path`, `audience_segment` |
| `return_visit` | (Future) A visitor's session is at least 24 hours after their previous session, derived from a privacy-safe rolling hash. | `audience_segment` | `intent` |

### What we never track

| Never | Why |
|---|---|
| Phone numbers | High-risk PII, irreversible if leaked. |
| Email addresses | PII, also enables cross-site identification. |
| Names | PII, including author/member display names in event payloads. |
| Raw message text (WhatsApp/email/chat) | Combines content sensitivity with consent issues. |
| Secrets / tokens / session IDs | Security risk if exfiltrated via analytics. |
| Health, clinical, or biometric details | Regulated (HIPAA / equivalent). |
| Financial details (account numbers, transaction amounts) | Regulated and sensitive. |
| Personal sensitive content (sexual orientation, religion, politics, immigration status, etc.) | Disproportionate harm vs. value. |
| Free-text form values | High PII surface area. |
| IP addresses beyond GA's own coarse handling | Cross-identification risk. |

## Mapping to existing GA implementation

- All allowlisted events live in `ALLOWED_EVENTS` inside `scripts/web/dabblewith-tracking.js`.
- The script reads attribution from sessionStorage (captured via UTM params) and merges it into the GA payload as `source`/`medium`/`campaign`/`content`/`intent`. No PII is read or sent.
- Generic `cta_click` events on the homepage emit only `link_host`, `link_text` (truncated), `cta_id`, and `page_path`. Raw `link_url` was removed in WEB-GROWTH-T02.

## Future-state contract

When we introduce logged-in / community-bot-linked accounts:

- Identity is referenced by an opaque, salted, *non-reversible* user token. Never by phone, email, or name.
- A separate consent layer must be in place before any per-user event is recorded. Default is opt-in, not opt-out.
- Aggregated cohort metrics (e.g., "founders_operators 14-day return rate") may be computed from these events. Individual user timelines may not be exposed in any UI without explicit user consent.
- Any AI-assisted personalization or moderation suggestion that is based on these events must surface its reasoning to a human reviewer and must require a human action to take effect (per `/community-policy/` §6).

## Review cadence

- Re-read this doc at the start of every new growth experiment.
- If a proposed experiment requires a field not listed here, raise a new ticket (`WEB-GROWTH-T1x-PROPOSAL-…`) and update this doc before instrumenting.
- Audit GA event payloads quarterly to confirm no out-of-allowlist fields are reaching the property.
