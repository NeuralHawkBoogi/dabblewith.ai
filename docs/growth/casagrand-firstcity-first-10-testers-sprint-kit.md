# Casagrand First City: First 10 Testers Sprint Kit

Date: 2026-05-20
Campaign: Casagrand First City local growth wedge

## Purpose

Convert the warm Casagrand WhatsApp access into the first 10 real residents testing the dabblewith.ai bot and shaping the clubhouse/event agenda.

This sprint is intentionally small. The goal is not to blast the 600-member IT group first; it is to get 10 useful conversations, check reply quality, collect concrete use cases, and then post the stronger community invite with proof.

## Sprint hypothesis

If 10 Casagrand residents message the bot with a specific work/career/learning problem, dabblewith.ai can identify the strongest first event theme and produce credible local proof for the bigger IT-group post.

## Target segment

Start with people likely to reply thoughtfully:

- IT professionals who already use WhatsApp actively
- founders/freelancers in the community
- students or job seekers who want AI/project help
- resident volunteers curious about a community helper bot

Avoid starting with association/admin claims. Keep this as a resident-led practical AI circle until there is explicit approval.

## 48-hour goal

- 10 unique human testers
- 7+ testers answer at least one follow-up question
- 5+ concrete use cases collected
- 3+ event topic votes or preferred slots
- 2+ people willing to attend/help with a clubhouse intro session

## Source tags to ask testers to use

Ask testers to start with one of these short openers. This helps the report classify intent even before deeper source tagging exists in runtime.

1. `Casagrand career help`
2. `Casagrand workflow help`
3. `Casagrand founder help`
4. `Casagrand student help`
5. `Casagrand community bot demo`

Bot/reporting should treat any message containing `Casagrand` as campaign-sourced.

## DM invite copy for first 10 testers

Use this for direct, known contacts — not a broadcast.

```text
Hey — I’m testing a practical AI builders circle for Casagrand residents through dabblewith.ai.

Can you help me test the WhatsApp bot once?

Message this number with one line starting with any of these:
- Casagrand career help
- Casagrand workflow help
- Casagrand founder help
- Casagrand student help
- Casagrand community bot demo

Then tell it one real thing you’d like AI help with — job search, office work, coding, business, studying, or a resident/community use case.

Bot link: https://wa.me/919566112518

I’m using the responses to pick the first free clubhouse AI session topic.
```

## Follow-up nudge if they only say “hi”

```text
Thanks — one small request: send the bot a real use case so I can tune the first session.

Example: “Casagrand workflow help — I want to automate weekly status reports”
or “Casagrand career help — I want AI help preparing for interviews.”
```

## Bigger IT-group post after 10 testers

Post only after at least 5 useful use cases are collected.

```text
Hi everyone — I tested this with a few Casagrand residents and there seems to be interest in a practical AI builders circle here.

The idea: no theory, no hype. We’ll use AI for real needs — job search, interview prep, office workflows, coding assistants, founder/freelancer work, student projects, and maybe even a resident helper bot demo.

If you’re interested, message the dabblewith.ai WhatsApp bot with one line:
“Casagrand + what you want AI help with”

Example:
- Casagrand career help — interview prep
- Casagrand workflow help — automate reports
- Casagrand founder help — sales/lead research
- Casagrand student help — project ideas

Bot link: https://wa.me/919566112518

If enough people respond, I’ll host a free intro/build-along session at the clubhouse.
```

## Poll to run after the group post

```text
What should the first Casagrand AI by Doing session focus on?

1. AI for job search/interviews
2. AI for office productivity/workflows
3. Build your first AI agent/workflow
4. AI for founders/freelancers
5. AI for students/projects
6. Resident/community helper bot demo
```

## What to check in the campaign report

Use `node scripts/casagrand-campaign-report.js` after the first tester batch.

Decision rules:

- If career/job signals dominate: event title = **AI for Job Search + Interview Prep: Build Your Personal Career Assistant**
- If workflow/productivity dominates: event title = **AI by Doing: Automate One Repetitive Work Task**
- If founders/freelancers dominate: event title = **Build Your First AI Sales/Admin Assistant**
- If mixed but strong interest: event title = **AI by Doing: Build Your First Practical AI Workflow**
- If fewer than 5 useful use cases: do not post event date yet; run another direct tester pass

## Tester tracking sheet fields

Use this structure in a spreadsheet or notes file. Do not store full phone numbers in shared reports.

| Field | Example |
| --- | --- |
| Tester label | T01 |
| Source | direct / IT group / resident referral |
| Segment | career / workflow / founder / student / community |
| Use case | interview prep, report automation, lead research |
| Bot reply quality | good / generic / wrong / needs follow-up |
| Event interest | yes / maybe / no |
| Preferred slot | Sat AM / Sat PM / Sun AM / weekday evening |
| Notes | short, non-sensitive |

## Success metric for this sprint

This sprint is successful when Boogi can confidently say:

> “I have real Casagrand residents asking for specific AI help, and the first clubhouse topic is based on their demand — not my guess.”

## Privacy and tone guardrails

- Do not publish resident names, phone numbers, or raw WhatsApp exports.
- Redact phone numbers except last 4 digits in any report.
- Do not imply this is an official Casagrand/association initiative.
- Do not overpromise that the bot can solve everything; position it as a practical intake and learning assistant.
- Keep the tone local, useful, and low-pressure.
