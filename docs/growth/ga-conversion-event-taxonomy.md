# Dabblewith.ai GA Conversion Event Taxonomy

Status: active
Owner: Boogi / dabblewith.ai
Related tickets: `WEB-GROWTH-T03`

## Goal

Track meaningful growth and commercial intent for the AI Builder's Exchange without collecting private data.

Core implementation: `scripts/web/dabblewith-tracking.js` listens for CTA clicks with `data-event` and sends allowlisted GA events through `gtag`.

## Privacy boundary

Allowed metadata:

- `page_path`
- `cta_id`
- `cta_label` truncated to 80 characters
- `audience_segment`
- `workflow_category` when non-sensitive
- `link_host`
- `lead_type` for WhatsApp/email lead-intent CTAs
- `source_event` for the originating safe CTA event
- attribution: `source`, `medium`, `campaign`, `content`, `intent`

Do not send:

- phone numbers
- emails
- names
- raw WhatsApp/message text
- form field values
- tokens/secrets
- customer/community member data
- PHI or clinical details

## Event names

| Event | Meaning | Typical trigger | Conversion type |
|---|---|---|---|
| `workflow_view` | Visitor views a workflow asset or workflow preview. | Workflow page or future workflow cards. | Engagement |
| `workflow_explore_click` | Visitor clicks to explore workflows. | Homepage/nav workflow CTA. | Engagement |
| `workflow_submit_start` | Visitor begins submitting or signalling a workflow. | Submit CTA, WhatsApp submission link, email submission link. | Community contribution |
| `workflow_submit_complete` | Workflow submission completes. | Future form/onboarding completion event. | Community contribution |
| `newsletter_signup_click` | Visitor clicks a newsletter signup CTA. | Newsletter section, footer, WhatsApp newsletter CTA. | Owned audience |
| `community_bot_setup_click` | Visitor clicks community-bot setup/onboarding CTA. | Homepage/community bot CTAs. | Commercial intent |
| `challenge_join_click` | Visitor signals interest in a session/challenge. | Session queue/challenge CTAs. | Community activation |
| `partner_interest_click` | Visitor clicks partner/newsletter swap/business interest CTA. | Partner email CTA. | Partner pipeline |
| `build_public_metrics_view` | Visitor clicks into build-in-public or metrics/status surface. | Autopilot/build-public CTA. | Trust signal |
| `audience_segment_click` | Visitor selects an audience pathway. | Founder/creator/researcher/ops/no-code cards. | Segmentation |
| `share_nudge_click` | Visitor clicks a UTM-ready share prompt. | Homepage WhatsApp/Slack share invite. | Distribution attribution |
| `lead_intent_click` | Visitor clicks a WhatsApp/email CTA that can create a real lead. Includes only safe `lead_type`, never message body/contact details. | Submit, newsletter, community-bot setup, session interest, partner-interest links. | Lead intent |

## Required CTA attributes

Every measurable CTA should include:

```html
<a data-cta="hero_explore_workflows" data-event="workflow_explore_click" href="#workflows">Explore workflows</a>
```

Optional safe attributes:

```html
data-audience="founders_operators"
data-workflow-category="community_submission"
```

## Current homepage coverage

- Hero workflow CTA → `workflow_explore_click`
- Hero submit CTA → `workflow_submit_start`
- Hero newsletter CTA → `newsletter_signup_click`
- Hero community bot CTA → `community_bot_setup_click`
- Audience cards → `audience_segment_click`
- Homepage UTM-ready share prompt → `share_nudge_click`
- Workflow section submission CTA → `workflow_submit_start`
- Newsletter CTAs → `newsletter_signup_click`
- Community bot CTAs → `community_bot_setup_click`
- Session queue CTAs → `challenge_join_click`
- Partner/email interest CTA → `partner_interest_click`
- Autopilot/status CTA → `build_public_metrics_view`

## GA setup recommendation

Mark these as conversions/key events in GA once traffic is flowing:

1. `lead_intent_click`
2. `community_bot_setup_click`
3. `workflow_submit_start`
4. `newsletter_signup_click`

Keep `audience_segment_click`, `workflow_explore_click`, `share_nudge_click`, and `source_event` as diagnostic context, not standalone conversion goals.
