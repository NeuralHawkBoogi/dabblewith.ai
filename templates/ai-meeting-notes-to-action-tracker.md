# AI meeting notes to action tracker workflow worksheet

Source workflow: https://dabblewith.ai/workflows/ai-meeting-notes-to-action-tracker/

## 1. The real job
- Who is this for?
- What recurring task are we improving?
- What does a good output look like?

## 2. Safe input
- What sample input can we use?
- What must be redacted first?
- What data must never enter an external AI tool?

## 3. Workflow draft
Problem: Meeting recordings pile up. Decisions and owners get lost the next morning.

Outcome: Every meeting ends with a confirmed action list owned by named humans before anyone leaves the call.

Tools today:
- Transcript source you control
- Plain text editor
- An LLM with summarization
- Your team task tracker

Steps:
1. Capture the transcript locally. Strip names of anyone outside the company before sending to a third-party LLM.
2. Ask the LLM for a strict format: Decisions, Action items (owner + due), Open questions. No prose.
3. Read the list out loud at the end of the meeting and confirm each owner. Edit live.
4. Paste the confirmed list into the task tracker as separate items with owners.
5. After the meeting, archive the transcript privately or delete it per your retention rule.

## 4. Human review gate
Human owners must verbally confirm every action item. LLM cannot assign owners on its own.

Reviewer:
Approval rule:
Escalation rule:

## 5. Privacy / never automate
Never paste customer health, financial, legal, or HR content into a public LLM. Use a local model or redact first.

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
