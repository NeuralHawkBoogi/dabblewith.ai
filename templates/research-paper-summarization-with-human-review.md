# Research paper summarization workflow with human review worksheet

Source workflow: https://dabblewith.ai/workflows/research-paper-summarization-with-human-review/

## 1. The real job
- Who is this for?
- What recurring task are we improving?
- What does a good output look like?

## 2. Safe input
- What sample input can we use?
- What must be redacted first?
- What data must never enter an external AI tool?

## 3. Workflow draft
Problem: You need to triage 30 papers a week but can't read them all, and AI summaries hallucinate citations.

Outcome: You get a 5-line summary, claim-level citations, and a 'should I read it' verdict in 4 minutes per paper — with hallucinated claims caught before they enter your notes.

Tools today:
- PDF reader
- An LLM with citation handling
- Plain reference manager
- Your own notebook

Steps:
1. Define the 5 fields: claim, method, sample size, result, your relevance note.
2. Feed the paper to the LLM only after stripping sensitive subject data (where applicable).
3. Ask the LLM to extract claims with quoted source spans, not paraphrases.
4. Spot-check at least 3 claims against the paper itself. If any fails, discard the summary.
5. Save only verified claims into your notes — never the raw LLM output.

## 4. Human review gate
Reviewer must verify each claim's source span before saving. LLM may not assign novelty, citation count, or topical importance.

Reviewer:
Approval rule:
Escalation rule:

## 5. Privacy / never automate
Do not feed unpublished, embargoed, or human-subjects data to a third-party LLM. Use a local model or redact.

Never automate:
- 
- 
- 

## 6. First run notes
What worked:
What failed:
What changed after review:

## 7. Publish / share decision
Can this be published? yes / no
What must be removed before publishing?
Attribution / backlink preference:
