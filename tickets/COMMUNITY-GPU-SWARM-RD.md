# Ticket: Community GPU / Mac Unified Memory Swarm R&D

Status: open
Priority: P2
Created: 2026-05-19

## Goal
Explore a Petals-like private compute swarm where trusted community members contribute GPU/Mac unified memory capacity to reduce centralized token spend and make dabblewith.ai more self-sufficient.

## Build scope
- Research Petals/private swarm setup and alternatives.
- Build lab with 2–5 trusted machines only.
- Benchmark Apple Silicon unified memory boxes: latency, tokens/sec, uptime, thermal behavior, network reliability.
- Route only non-sensitive async jobs first: summaries, synthetic data generation, evals, embeddings if safe.
- Design safety boundary: no private member data on untrusted nodes, sandboxing, allowlist, audit logs.
- Design internal credit accounting for contributed compute.

## Non-goals
- Do not launch public token economy in MVP.
- Do not send private community/member conversations to public swarms.
- Do not make financial claims about tokens/earnings.

## Acceptance criteria
- Private swarm proof of concept runs one model/task end-to-end.
- Benchmark report compares cloud API cost/latency vs local swarm.
- Security review documents what data can and cannot be routed to shared compute.
- Router has experimental backend flag for community_compute.
