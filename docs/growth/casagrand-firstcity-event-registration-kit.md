# Casagrand First City Event Registration Kit

Date: 2026-05-20  
Campaign: Casagrand First City → dabblewith.ai local growth wedge  
Live RSVP page: `https://dabblewith.ai/casagrand-firstcity/rsvp/`

## Purpose

Convert the first WhatsApp interest wave into structured RSVPs before Boogi commits to a clubhouse session.

The funnel should answer four questions quickly:

1. Who wants to attend?
2. What do they want to build or learn?
3. Which session slot works?
4. Is there enough demand to run the first free clubhouse session?

## RSVP fields collected through WhatsApp

Ask residents to send:

- Name
- Role/background
- Interest area: job search, office productivity, coding assistant, founder tools, student projects, WhatsApp/community bot, or other
- One real problem they want solved live
- Preferred slot: weekend morning, weekend evening, or weekday evening
- Whether they can bring a laptop

Keep it lightweight. Do not ask for apartment/tower details unless needed for venue logistics.

## Forwardable WhatsApp copy

```text
Quick update: I’m collecting RSVPs for the free “AI by Doing” clubhouse session for Casagrand residents.

If you’re interested, message the bot with your role, preferred slot, and one AI/work problem you’d like solved live:
https://dabblewith.ai/casagrand-firstcity/rsvp/

Once we have enough responses, I’ll lock the topic and timing.
```

## 24-hour reminder copy

```text
Reminder for anyone interested in practical AI — please RSVP here so I can choose the right topic and slot:
https://dabblewith.ai/casagrand-firstcity/rsvp/

Best topics so far will decide the first clubhouse session: job search, office productivity, AI agents/workflows, founder tools, student projects, or WhatsApp/community bots.
```

## Go/no-go thresholds

Run the first clubhouse session if any of these are true:

- 25+ RSVPs
- 15+ concrete use cases submitted
- 10+ residents choose the same broad theme
- 2+ people ask about WhatsApp/community bots for their own group/business

If signals are weaker, do one online office-hours pilot first instead of booking the clubhouse.

## First report to run after posting

After 24 hours:

```bash
node scripts/casagrand-campaign-report.js --date 2026-05-21
```

Use the top requested topic cluster to choose the title and agenda.

## Suggested decision rule

- If `job_search` wins: title it “AI for Resume, Interviews, and Career Growth”.
- If `office_productivity` wins: title it “Automate Your Workday with AI”.
- If `coding_assistant` or `founder_tools` wins: title it “Build Your First AI Agent/Workflow”.
- If `community_bot` wins: include a live Casagrand resident-helper prototype demo.

## Success metrics for this stage

- RSVP conversion from WhatsApp link clicks/messages
- Unique residents/users in campaign report
- Topic cluster concentration
- Number of clear problems submitted
- Number of community-bot/business automation leads

## Next action

Post the RSVP nudge once in the IT opportunities group after the launch post has context. Do not spam repeated reminders; one reminder after 24 hours is enough.
