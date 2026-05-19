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

### Implemented — slice 2: admin review gate

**Files added/modified:**
- `onboarding/admin-gate.js` — dependency-free CommonJS module + CLI
  - `listPending(storageDir)` — scan storage dir, return array of `{ownerId, communityId, createdAt, updatedAt, version, profile}` for all sessions in `pending_admin` state
  - `approve(storageDir, ownerId, communityId, reviewedBy)` — stamps `reviewedAt`, `reviewedBy`, `activatedAt`; transitions state to `activated`; bumps `session.version`; throws if session is not `pending_admin`
  - `reject(storageDir, ownerId, communityId, reviewedBy, rejectionReason)` — stamps `reviewedAt`, `reviewedBy`, `rejectedAt`, `rejectionReason`; transitions state to `rejected`; bumps `session.version`; throws if session is not `pending_admin`
  - CLI: `ONBOARDING_DIR=./onboarding-data node onboarding/admin-gate.js list|approve|reject …`
- `onboarding/admin-gate-smoke-test.js` — 8-step CLI smoke test (exits 1 on failure)
  - Drives two sessions to `pending_admin`; asserts `listPending` returns 2
  - Approves one, rejects one with a reason
  - Asserts `listPending` returns 0
  - Verifies persisted stamps, version bumps, guard on double-approve
  - Verifies `advance()` reports `done=true` for `activated`/`rejected` states
- `onboarding/state-machine.js` — added `activated` and `rejected` terminal states to `STATES` and `TERMINAL_STATES`

**Test commands:**
```
node onboarding/smoke-test.js           # slice 1 regression
node onboarding/admin-gate-smoke-test.js
```

### Implemented — slice 3: single-field review revision returns to summary

**Files modified:**
- `onboarding/state-machine.js`
  - When an owner types a field name at review (for example `tone`), the state machine now marks a one-answer revision.
  - After the revised answer is captured, onboarding returns directly to the generated review summary instead of forcing the owner to re-answer every later field.
- `onboarding/smoke-test.js`
  - Added a regression path that revises `tone`, asserts the session returns to `review`, and verifies the revised value is persisted before submitting for admin review.

**Test commands:**
```
node onboarding/smoke-test.js
node onboarding/admin-gate-smoke-test.js
```

### Implemented — slice 4: versioned profile history on review revisions

**Files modified:**
- `onboarding/state-machine.js`
  - New sessions now initialize `history: []`.
  - Completing a field revision from the review state now increments `session.version` and appends the latest generated profile snapshot to `session.history`.
  - Older persisted sessions without `history` continue to work; the history array is created on first revision.
- `onboarding/smoke-test.js`
  - Added assertions that a review-state tone revision bumps the session to version 2, appends one history snapshot, persists that snapshot, and keeps `generateProfile()` aligned with the latest version.

**Test commands:**
```
node onboarding/smoke-test.js
node onboarding/admin-gate-smoke-test.js
```

### Implemented — slice 5: `revise <field>` command aliases

**Files modified:**
- `onboarding/state-machine.js`
  - Added review-state revision command parsing for `revise/change/edit/update/set/fix/redo <field>`.
  - Added friendly aliases for fields, including `community name`, `about`, `members`, `voice`, `links`, `events`, `registration fields`, and `WhatsApp number`.
  - Existing exact field-key revision behavior remains backwards-compatible.
- `onboarding/smoke-test.js`
  - Updated main revision path to use `revise tone`.
  - Added focused alias regression for `change WhatsApp number` jumping back to the `whatsapp_number` state.

**Test commands:**
```
node onboarding/smoke-test.js
node onboarding/admin-gate-smoke-test.js
git diff --check
```

### Next steps
- [ ] Wire `advance()` into WhatsApp webhook handler (Twilio/Cloud API layer, separate ticket)
- [x] Version community profile on each revision (keep history array)
- [x] Add `revise` command in review state that lets owner jump back to any named field by alias
- [ ] Integration test with real WhatsApp sandbox number
