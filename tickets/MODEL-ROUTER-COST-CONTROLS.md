# Ticket: Model Router + Cost Controls

Status: open
Priority: P0
Created: 2026-05-19

## Goal
Prevent token spend from scaling linearly with conversation volume by routing each task to the cheapest model that can safely handle it.

## Build scope
- Add model router abstraction with per-task policy.
- Task classes: greeting, FAQ, registration extraction, onboarding, summary, escalation, hard reasoning, unsafe/sensitive.
- Add model tiers: local rules, SLM/local, low-cost cloud, mid-tier cloud, frontier fallback.
- Add confidence scoring and fallback policy.
- Add token budget caps per community/plan.
- Add prompt caching / static community context hash where provider supports it.
- Add conversation summarization to avoid sending full history on every turn.

## Acceptance criteria
- Routine FAQ/registration traffic does not use frontier models by default.
- Each reply log records model tier, estimated tokens, fallback reason, and cost estimate.
- A community can set daily/monthly token budgets.
- Bot degrades gracefully when budget is exceeded.
