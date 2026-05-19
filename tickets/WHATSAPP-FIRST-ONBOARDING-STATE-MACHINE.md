# Ticket: WhatsApp-First Onboarding State Machine

Status: open
Priority: P0
Created: 2026-05-19

## Goal
Let a new community owner onboard a community bot entirely through WhatsApp.

## Build scope
- Build onboarding states: start, community basics, audience, tone, topics, rules, links/events, registration fields, admin escalation, WhatsApp number details, review, activation.
- Persist onboarding progress per owner/community.
- Allow user to revise prior answers naturally.
- Generate community profile/persona from collected answers.
- Human review gate before activation.
- Send summary back to owner for confirmation.

## Acceptance criteria
- Owner can complete onboarding without web dashboard.
- Partial onboarding can resume after interruption.
- Generated community profile is stored and versioned.
- Admin can approve/reject/edit before bot goes live.
