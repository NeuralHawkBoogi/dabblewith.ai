# Dabblewith.ai UTM + Intent Link Conventions

Status: active
Owner: Boogi / dabblewith.ai
Related tickets: `WEB-GROWTH-T02`

## Goal

Make every external growth experiment traceable without storing or sending private user data.

Use these fields on inbound links:

- `utm_source` — where the visitor came from.
- `utm_medium` — channel type.
- `utm_campaign` — specific campaign or launch.
- `utm_content` — creative/placement variant.
- `intent` — expected visitor intent, using a safe short label.

Never place phone numbers, emails, names, message bodies, raw community text, tokens, or customer data in UTM or intent fields.

## Naming rules

- Lowercase only.
- Use hyphens for multi-word values.
- Keep values short and human-readable.
- Prefer durable campaign names over one-off jokes.
- Do not encode PII, audience member identity, or raw chat content.

## Source and medium map

| Channel | `utm_source` | `utm_medium` | Example campaign |
|---|---|---|---|
| WhatsApp community/admin share | `whatsapp` | `community` | `ai-builders-exchange-launch` |
| X / Twitter | `x` | `social` | `workflow-exchange-v1` |
| Indie Hackers | `indie-hackers` | `community` | `workflow-exchange-v1` |
| Substack / newsletter | `substack` | `newsletter` | `weekly-workflows` |
| Partner newsletter | partner slug, e.g. `partner-neuralhawk` | `partner-newsletter` | `issue-swap-ai-workflows` |
| Marketplace/profile listing | marketplace slug | `marketplace` | `community-bot-offering` |
| Direct manual campaign | `direct` | `manual` | campaign name |

## Intent values

Use one of these unless a new growth experiment needs a new label:

- `explore-workflows`
- `submit-workflow`
- `join-newsletter`
- `launch-community-bot`
- `partner-interest`
- `challenge-interest`
- `build-in-public`

## Link templates

Homepage / exchange launch:

```text
https://dabblewith.ai/?utm_source=x&utm_medium=social&utm_campaign=workflow-exchange-v1&utm_content=launch-post-01&intent=explore-workflows
```

Newsletter signup push:

```text
https://dabblewith.ai/#newsletter?utm_source=substack&utm_medium=newsletter&utm_campaign=weekly-workflows&utm_content=footer-cta&intent=join-newsletter
```

Community bot campaign:

```text
https://dabblewith.ai/community-bot/?utm_source=partner-neuralhawk&utm_medium=partner-newsletter&utm_campaign=community-bot-offering&utm_content=issue-01&intent=launch-community-bot
```

Workflow submission call:

```text
https://dabblewith.ai/#submit?utm_source=whatsapp&utm_medium=community&utm_campaign=workflow-exchange-v1&utm_content=admin-share&intent=submit-workflow
```

## Website handling

`scripts/web/dabblewith-tracking.js` captures `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, and `intent` from the first page hit, stores them in `sessionStorage`, decorates internal CTA links plus the configured WhatsApp bot link, and emits named GA events with safe metadata only.

Stored and emitted metadata must remain limited to source/medium/campaign/content/intent, page path, CTA id, audience segment, link host, and non-sensitive workflow category.
