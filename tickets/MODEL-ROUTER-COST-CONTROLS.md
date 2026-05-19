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
## Progress (2026-05-19)

### Implemented — slice 1: deterministic routing + budget guard foundation

**Files added:**
- `model-router/router.js` — dependency-free CommonJS router with task classification, tier policy, token/cost estimates, budget checks, context hash, structured log metadata, and budget/safety degradation.
- `model-router/smoke-test.js` — CLI smoke test covering greeting, FAQ, onboarding, hard reasoning, unsafe/sensitive guardrail, and budget-exceeded behavior.

**Test commands:**
```
node model-router/smoke-test.js
git diff --check
```

### Implemented — slice 2: persisted usage counters + routing logs

**Files added:**
- `model-router/usage-store.js` — dependency-free JSON usage store
  - Persists per-community daily/monthly token and cost counters.
  - Supports plan defaults (`free`, `starter`, `growth`) and community-level budget overrides.
  - Resets daily/monthly counters on UTC day/month rollover while preserving recent logs.
  - `routeAndRecord(storageDir, input)` combines router budget checks with durable usage accounting.
  - Routing logs store task class, model tier, token estimate, cost estimate, fallback reason, budget status, and context hash — not raw user messages or raw context.
- `model-router/usage-store-smoke-test.js` — CLI smoke test covering sanitized community IDs, persistence, no raw text leakage, daily budget degradation, day rollover, and month rollover.

**Test commands:**
```
node model-router/smoke-test.js
node model-router/usage-store-smoke-test.js
git diff --check
```

### Implemented — slice 3: rolling conversation summaries before cloud routing

**Files added/modified:**
- `model-router/conversation-summary.js` — dependency-free summary helper
  - Builds compact routing context from static community context plus recent conversation messages.
  - Keeps only the latest messages verbatim and compresses older turns into a bounded deterministic summary string.
  - Redacts emails, phone numbers, and secret-looking tokens before summaries enter routing context.
  - Emits stable summary hashes for prompt-cache/log correlation without storing raw conversation text.
- `model-router/router.js`
  - Routes against the summarized effective context when `conversation`/`messages` are provided.
  - Routing logs now include `conversationSummary` metadata: counts, summary hash, and truncation status.
- `model-router/usage-store.js`
  - Persisted routing logs now include sanitized conversation-summary metadata, not raw messages.
- `model-router/conversation-summary-smoke-test.js`
  - Covers redaction, bounded older-message summary, recent-message retention, router wiring, and effective-context hashing.

**Test commands:**
```
node model-router/smoke-test.js
node model-router/usage-store-smoke-test.js
node model-router/conversation-summary-smoke-test.js
git diff --check
```

### Next steps
- [ ] Wire router decisions into the WhatsApp runtime reply path behind a backwards-compatible feature flag.
- [x] Persist per-community daily/monthly usage counters and routing logs.
- [ ] Add provider-specific prompt-cache keys where supported.
- [x] Add rolling conversation summaries before sending context to cloud models.
