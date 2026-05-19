# Ticket: Continuous SLM Rebuild Pipeline for Community Bots

Status: open
Priority: P1
Created: 2026-05-19

## Goal
Reduce inference cost and improve community-specific tone by continuously rebuilding small language models/adapters from approved conversation data.

## Build scope
- Build conversation dataset export with privacy redaction.
- Add label schema: good reply, bad reply, should escalate, missing knowledge, registration extracted, unsafe.
- Generate eval set per community and shared base eval set across communities.
- Generate synthetic variants for community tone, FAQs, onboarding flows, and event prompts.
- Train/fine-tune LoRA/adapters for selected open SLM base models.
- Run eval gate before promotion.
- Deploy SLM only for approved low-risk intents.
- Fall back to stronger model when confidence is low.

## Acceptance criteria
- Dataset export contains no raw secrets and redacts phone numbers.
- At least one community-specific adapter can be trained and evaluated offline.
- Eval gate blocks regressions before deployment.
- Runtime router can route eligible tasks to SLM tier.
- Cost per eligible conversation is measured before/after SLM rollout.
