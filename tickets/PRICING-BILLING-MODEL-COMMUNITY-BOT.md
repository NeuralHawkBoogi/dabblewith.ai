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
