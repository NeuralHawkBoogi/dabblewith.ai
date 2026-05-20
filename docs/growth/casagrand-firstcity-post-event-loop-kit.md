# Casagrand First City Post-Event + Office-Hours Loop Kit

Date: 2026-05-20  
Campaign: Casagrand First City → dabblewith.ai local growth wedge  
Use after: first RSVP wave or first clubhouse/online session

## Purpose

Turn one Casagrand event into a repeatable growth loop:

1. Capture what residents actually wanted to solve.
2. Share a concise, useful recap back into WhatsApp.
3. Invite the next small action: office hours, build sprint, or community-bot design partner chat.
4. Convert strong use cases into dabblewith.ai content, demos, and “Get a Community Bot” validation.

The loop should feel like a helpful resident-led initiative, not a marketing campaign.

## 30-minute post-event workflow

Do this within 24 hours of the session.

1. Export/report signals:
   - Run `node scripts/casagrand-campaign-report.js --date YYYY-MM-DD`.
   - Note top topic cluster, number of unique residents, concrete problems, and community-bot/business leads.
2. Create recap:
   - Pick 3 practical takeaways.
   - Pick 2–3 anonymized resident use cases.
   - Pick 1 next session theme based on actual demand.
3. Share one WhatsApp recap:
   - Keep it short.
   - No attendee names, phone numbers, or apartment details.
   - Include one clear CTA.
4. Create next session:
   - If demand is broad: run 45-minute online office hours.
   - If 15+ people want the same topic: run a focused clubhouse build-along.
   - If 2+ people ask for WhatsApp/community bots: run a separate design-partner call.

## WhatsApp recap template

```text
Thanks to everyone who joined / showed interest in the Casagrand “AI by Doing” session.

Quick recap:
• Top interests: [topic 1], [topic 2], [topic 3]
• Practical problems residents want to solve: [example 1], [example 2]
• Next session theme I’m considering: [theme]

I’ll keep this practical — bring one real work/study/business problem and we’ll try to turn it into an AI workflow.

If you want to join the next office-hours/build session, RSVP here:
https://dabblewith.ai/casagrand-firstcity/rsvp/
```

## Office-hours invite template

```text
I’m doing a small Casagrand AI office-hours session this week.

Format: 45 minutes, practical only.
Bring one real problem — resume/interview prep, office productivity, coding help, founder tools, student projects, or WhatsApp/community automation.

I’ll pick 3 problems and solve them live using AI workflows.

RSVP and share your problem here:
https://dabblewith.ai/casagrand-firstcity/rsvp/
```

## Community-bot design-partner CTA

Use only when someone shows owner/admin/business/community-builder intent.

```text
Separate from the AI learning sessions: I’m also validating a “Get a Community Bot” product for WhatsApp communities.

If you run a residents group, business community, coaching group, alumni group, or customer/support group and want an AI host/helper for FAQs, registrations, reminders, and member questions, message the bot with:

“Community bot for [your community name]”

I’m looking for a few design partners before making this self-serve.
```

## Blog / case-study recap template

Use after the first real session. Keep it anonymized and useful.

```markdown
# What Casagrand Residents Wanted to Build with AI

## Context
A practical AI-by-doing session for Casagrand First City residents.

## What people cared about
- [Topic cluster 1]
- [Topic cluster 2]
- [Topic cluster 3]

## Three real workflows residents asked for
1. [Problem] → [AI workflow idea] → [next step]
2. [Problem] → [AI workflow idea] → [next step]
3. [Problem] → [AI workflow idea] → [next step]

## What we learned
- [Learning about demand]
- [Learning about format/timing]
- [Learning about community-bot/customer potential]

## Next session
[Theme, RSVP link, what to bring]
```

## Decision rules for the next move

Use the campaign report plus RSVP text to choose one path:

- **Career/job-search majority:** next session = “AI for Resume, Interviews, and Career Growth”.
- **Office/productivity majority:** next session = “Automate Your Workday with AI”.
- **Coding/founder majority:** next session = “Build Your First AI Agent/Workflow”.
- **Student majority:** next session = “Build a Useful AI Project This Weekend”.
- **Community-bot/admin leads:** schedule 2–3 design-partner interviews before building more features.
- **Weak demand (<10 concrete responses):** run one online office-hours pilot instead of a clubhouse event.

## Metrics to append to the campaign ticket after each loop

```markdown
### Loop N — YYYY-MM-DD
- Format: WhatsApp recap / online office hours / clubhouse event / design-partner calls
- Unique campaign users:
- RSVPs:
- Concrete use cases:
- Top topic cluster:
- Community-bot leads:
- Best resident problem to demo:
- Next action:
```

## Privacy rules

- Never publish full phone numbers, raw webhook payloads, exact apartment/tower details, or private resident names.
- Redact all phone numbers except last 4 digits in internal reports.
- Ask permission before using a resident quote, screenshot, photo, or named case study.
- Position resident-helper/community-bot demos as unofficial prototypes unless formally approved.
