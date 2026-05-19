# Ticket: WhatsApp-First Onboarding State Machine

Status: in-progress
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

## Progress (2026-05-19)

### Implemented — slice 1: core state machine + smoke test

**Files added:**
- `onboarding/state-machine.js` — dependency-free CommonJS module
  - 11-state machine: start → community_basics → audience → tone → topics → rules → links_events → registration_fields → whatsapp_number → review → pending_admin
  - `createSession(ownerId, communityId)` — initialise a fresh session
  - `loadSession(storageDir, ownerId, communityId)` — resume from disk
  - `saveSession(storageDir, session)` — persist JSON to disk
  - `advance(session, userMessage)` — returns `{session, reply, done}`; handles review confirmation and field-revision by name
  - `generateProfile(session)` — structured community profile object from collected answers
  - `getPrompt(session)` — current bot prompt without advancing state
- `onboarding/smoke-test.js` — scripted full-flow CLI test; exits 1 on any assertion failure

### Next steps
- [ ] Wire `advance()` into WhatsApp webhook handler (Twilio/Cloud API layer, separate ticket)
- [ ] Add `admin-gate.js`: list pending sessions, approve/reject, write `activatedAt` to session file
- [ ] Version community profile on each revision (keep history array)
- [ ] Add `revise` command in review state that lets owner jump back to any named field by alias
- [ ] Integration test with real WhatsApp sandbox number
