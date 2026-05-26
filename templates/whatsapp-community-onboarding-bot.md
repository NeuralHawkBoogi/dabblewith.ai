# WhatsApp community onboarding bot workflow worksheet

Source workflow: https://dabblewith.ai/workflows/whatsapp-community-onboarding-bot/

## 1. The real job
- Who is this for?
- What recurring task are we improving?
- What does a good output look like?

## 2. Safe input
- What sample input can we use?
- What must be redacted first?
- What data must never enter an external AI tool?

## 3. Workflow draft
Problem: Every new community member asks the same 5 questions and you answer them at 11pm.

Outcome: New members get a consistent welcome, a clear path to the next event, and your phone stays calm.

Tools today:
- WhatsApp Business or community bot
- Pinned community FAQ
- Spreadsheet for unanswered questions

Steps:
1. Write the 5 questions you actually answer most weeks — exact phrasings, not paraphrases.
2. Write canonical answers in the community's voice. Each answer must say what the human admin will do next.
3. Configure the bot to respond only to message patterns you've reviewed. New patterns escalate to the human.
4. Run a dry-run week where the bot proposes replies to the human admin before sending.
5. Go live with a clearly stated 'I'm the community AI host, an admin will jump in if needed' opener.

## 4. Human review gate
Human admin must approve every new response pattern for the first 14 days. AI never decides who joins, who leaves, or moderation actions.

Reviewer:
Approval rule:
Escalation rule:

## 5. Privacy / never automate
Do not log raw member messages with phone numbers attached. Store only event types and counts. Never send member content to a third-party LLM without redaction.

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
