# Ticket: Dabblewith.ai Community Bot Platform

Status: open
Created: 2026-05-19
Owner: Boogi / dabblewith.ai

## Goal
Turn the current dabblewith.ai WhatsApp community bot into a productized platform offering: any community owner can onboard a WhatsApp community number and get a human-like AI community host that gathers community details, engages members, captures registrations/signals, and reports performance.

## Product Concept
Offer “setup a similar community bot” from the dabblewith.ai community site.

A new community should be onboarded through WhatsApp itself:
1. Community owner messages the onboarding bot.
2. Bot asks for community name, purpose, tone, target members, topics, events, links, rules, admin contact, and escalation preferences.
3. Bot helps connect/verify a WhatsApp Business number.
4. Bot creates the community profile/persona.
5. Bot goes live as the community number.
6. Bot reports registrations, intents, FAQs, escalations, and engagement.

## MVP Scope
- Website CTA: “Get a community bot” / “Launch your AI community host”.
- WhatsApp-first onboarding flow.
- Community profile schema:
  - name, description, audience, goals
  - tone/persona
  - allowed topics / disallowed topics
  - FAQs / links / upcoming events
  - admin handoff contact
  - registration fields to collect
- Number onboarding:
  - support a WhatsApp Business phone number per community
  - store WABA/phone-number IDs and token references securely
  - webhook routing by `phone_number_id`
- Bot runtime:
  - LLM-backed human-like responder
  - per-user conversation memory
  - community-specific knowledge/persona
  - registration capture and intent classification
  - admin escalation when needed
- Admin/reporting:
  - hourly/daily summaries
  - registrations and member signals
  - unanswered questions / knowledge gaps
  - delivery failures and webhook health

## Non-goals for MVP
- Full no-code dashboard before WhatsApp onboarding works.
- Payments/subscriptions until one pilot community validates value.
- Public multi-tenant self-serve without safety/rate-limit controls.

## Architecture Notes
Current pilot:
- Webhook service: `/home/clawdbot/dabblewith-whatsapp`
- Service: `dabblewith-whatsapp.service`
- Public webhook: `https://dabblewith-wa.cl-infra.lexan.health/webhook`
- Website: `/home/clawdbot/dabblewith-ai`
- Current community phone: `919566112518`
- Current bot agent: `dabblebot`

Needed platformization:
- Replace single `.env` community config with DB-backed `communities` table keyed by `phone_number_id`.
- Route each inbound message to the correct community profile/persona.
- Store conversations, registrations, outbound replies, status events, and errors per community.
- Keep tokens/secrets as references, not plaintext in logs.

## Acceptance Criteria
- A new community owner can start onboarding entirely via WhatsApp.
- Bot can collect enough info to generate a usable community persona/profile.
- A configured WhatsApp number can receive inbound messages and reply in that community’s voice.
- Registrations/signals are captured with clear structured data.
- Admin gets reports without raw secrets or unnecessary full phone numbers.
- Website CTA points to the onboarding flow.

## Related strategy and build tickets
- `docs/market-analysis/community-bot-market-and-cost-analysis.md`
- `tickets/MARKET-VALIDATION-COMMUNITY-BOT.md`
- `tickets/PRICING-BILLING-MODEL-COMMUNITY-BOT.md`
- `tickets/MODEL-ROUTER-COST-CONTROLS.md`
- `tickets/SLM-CONTINUOUS-REBUILD-PIPELINE.md`
- `tickets/COMMUNITY-GPU-SWARM-RD.md`
- `tickets/WHATSAPP-FIRST-ONBOARDING-STATE-MACHINE.md`

## Runtime hardening progress (2026-05-19)

### WhatsApp runtime synthetic-send guard
- Runtime repo modified: `/home/clawdbot/dabblewith-whatsapp/server.js`.
- Added pre-Graph recipient normalization and synthetic test dry-run guard.
- Default flag: `DABBLE_DRY_RUN_SYNTHETIC_SENDS=true`.
- Prevents malformed/synthetic test sends like placeholder numbers ending `0000`/`0001` from hitting Meta Graph while leaving real recipients unchanged.
- Smoke test added: `/home/clawdbot/dabblewith-whatsapp/synthetic-send-smoke-test.js`.
- Docs: `docs/whatsapp-runtime-synthetic-send-guard.md`.

