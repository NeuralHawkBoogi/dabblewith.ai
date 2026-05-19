# Ticket: Pricing + Billing Model for Community Bot Platform

Status: open
Priority: P0
Created: 2026-05-19

## Goal
Design a billing system that protects margins for token-heavy community conversations while staying simple for customers.

## Context
Comparable AI bot products use outcome pricing, conversation bundles, message credits, and custom enterprise usage. Dabblewith.ai should avoid unlimited low-price plans.

## Build scope
- Define billing units: AI conversation, admin report, broadcast, onboarding workflow, WhatsApp pass-through fee.
- Implement per-community usage metering.
- Add plan config: setup fee, monthly fee, included AI conversations, overage rate, WhatsApp pass-through flag.
- Add usage dashboard/report for admin.
- Add cost export: model cost, WhatsApp status/cost category, token estimates, gross margin estimate.

## Initial packaging to test
- Pilot setup: ₹15k–₹50k one-time.
- Starter: ₹4,999/mo with 500 AI conversations.
- Growth: ₹14,999/mo with 2,500 AI conversations.
- Pro: ₹39,999/mo with 10,000 AI conversations.

## Acceptance criteria
- Every inbound/outbound bot interaction maps to a billable or non-billable usage record.
- Monthly usage can be summarized per community.
- Overage estimate is available before invoice generation.
- Admin can see gross margin estimate per community.

## Progress (2026-05-19)

### Implemented — slice 1: plan config + monthly usage meter foundation

**Files added:**
- `billing/plans.js`
  - Defines the initial packaging to test: pilot, starter, growth, and pro.
  - Captures setup fee, monthly fee, included AI conversations, overage rate, WhatsApp pass-through behavior, and target gross margin.
  - Defines billing units for `ai_conversation`, `admin_report`, `broadcast`, `onboarding_workflow`, and `whatsapp_pass_through`.
- `billing/meter.js`
  - Persists per-community monthly JSON ledgers with sanitized community ids.
  - Records billable/non-billable usage events, model cost, WhatsApp cost category, platform cost, model tier/task metadata, and hashed external references only.
  - Summarizes monthly usage, overage, recurring revenue, WhatsApp pass-through estimate, gross margin INR/% and margin status.
- `billing/smoke-test.js`
  - Covers plan config, billable/non-billable mapping, monthly summary, overage estimate, gross margin estimate, WhatsApp/model cost export, and no raw phone/secret leakage.

**Test commands:**
```bash
node billing/smoke-test.js
git diff --check
```

### Implemented — slice 2: admin-readable monthly usage report/export

**Files added:**
- `billing/report.js`
  - Loads per-community monthly ledgers from `billing/meter.js` storage.
  - Produces a portfolio summary and per-community summaries with plan, included conversations, overage estimate, revenue, model/WhatsApp/platform costs, gross margin, margin status, and recent metered events.
  - Supports Markdown and JSON export via CLI: `node billing/report.js <storageDir> <YYYY-MM> <output.md|output.json>`.
  - Keeps report output privacy-safe: only sanitized community ids and hashed external refs are emitted; raw WhatsApp text, phone numbers, and token-like strings are excluded.
- `billing/report-smoke-test.js`
  - Covers multi-community report generation, Markdown/JSON export, revenue/cost/margin aggregation, recent sanitized event inclusion, and no raw phone/secret/external-text leakage.

**Test commands:**
```bash
node billing/smoke-test.js
node billing/report-smoke-test.js
git diff --check
```

### Next steps
- [ ] Wire runtime inbound/outbound events into `billing/meter.js` behind a disabled-by-default feature flag.
- [x] Add an admin-readable monthly usage export/report.
- [ ] Reconcile WhatsApp conversation category pricing against live Meta billing export before invoicing.
