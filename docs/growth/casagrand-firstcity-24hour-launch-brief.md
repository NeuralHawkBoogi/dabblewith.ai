# Casagrand First City 24-Hour Launch Brief

Date: 2026-05-21  
Campaign: Casagrand First City practical AI builders circle  
Primary growth lever: safe first distribution + measurable WhatsApp intake

## Purpose

Use one approved WhatsApp post in the Casagrand IT opportunities group to validate demand before locking the first clubhouse event topic.

This brief is designed for the first 24 hours after Boogi gets admin/group permission. It keeps the launch non-spammy, measurable, and immediately useful for deciding whether to run the clubhouse session, a smaller tester sprint, or a community-bot design-partner conversation.

## Preconditions before posting

- Admin/group permission is obtained or the post is clearly allowed by group norms.
- The launch post uses one source-tagged entry point:
  - Preferred: `https://dabblewith.ai/casagrand-firstcity/rsvp/`
  - Direct bot fallback: `https://wa.me/919566112518?text=Casagrand%20RSVP%20-%20I%20want%20to%20attend%20AI%20by%20Doing.`
- No private resident data, association data, or sensitive work data is requested.
- Boogi is available to answer 3-5 direct follow-ups during the first few hours.
- Campaign report command is ready:

```bash
node scripts/casagrand-campaign-report.js \
  --runtime-dir /home/clawdbot/dabblewith-whatsapp/data \
  --output-dir reports/casagrand-firstcity \
  --date 2026-05-21
```

## One-post launch copy

```text
Hi everyone — I’m starting a small practical AI builders circle for Casagrand residents.

The idea is simple: no theory, no hype. We meet online/at the clubhouse and build useful AI workflows — job search, interview prep, office automation, coding assistants, founder/freelancer tools, WhatsApp bots, etc.

I’m testing this through dabblewith.ai. If you’re interested, please RSVP here and tell me what you want to build or learn:
https://dabblewith.ai/casagrand-firstcity/rsvp/

If enough people are interested, I’ll host a free intro session at the clubhouse.
```

## First 24-hour measurement schedule

### T+1 hour

Check for:
- obvious confusion in replies
- wrong expectations: paid course, official association software, job placement promise
- broken RSVP/WhatsApp CTA
- early topic skew

Action:
- If people ask “what is this?”, reply with the short clarification below.
- If the CTA is broken, switch to the direct bot fallback link.

Clarification reply:

```text
It’s a free practical AI learning/building circle for residents — not a course or job-placement group. The first session will be based on what people ask for: job search, productivity, coding, founder tools, student projects, or WhatsApp/community bots.
```

### T+6 hours

Run the campaign report and capture:
- campaign signals
- unique residents/users
- source tag counts
- requested topic clusters
- tester track counts
- recent redacted signals

Decision:
- If `uniqueUsers >= 10`: post the poll.
- If `uniqueUsers < 10` but replies are high-quality: DM 5 warm residents using the first-10 tester sprint copy.
- If no signals: ask one friendly resident/admin to sanity-check whether the post was visible or buried.

### T+24 hours

Run the campaign report again and choose one route:

| Signal | Decision | Next action |
| --- | --- | --- |
| 25+ unique users or 40+ poll votes | Run clubhouse intro | Pick top topic, propose 2 slots, prepare QR/flyer |
| 10-24 unique users | Run smaller build sprint | Invite first 10-12 residents to a focused 60-min session |
| 2+ `community_bot` signals | Run design-partner calls | Use `/casagrand-firstcity/community-bot/` and qualify group admins |
| <10 weak signals | Do not force event | Try 1:1 tester DMs and rewrite positioning |

## Topic-to-event title mapping

| Top topic cluster | First event title |
| --- | --- |
| `job_search` | AI for Job Search and Interview Prep |
| `office_productivity` | Automate Repetitive Office Work with AI |
| `coding_assistant` | Build Your First AI Agent or Coding Assistant |
| `founder_tools` | AI Workflows for Founders, Freelancers, and Consultants |
| `student_projects` | Build a Useful AI Project This Weekend |
| `community_bot` | Build a WhatsApp Helper Bot for Your Group |

## Evidence to save after 24 hours

Save only privacy-safe evidence:
- campaign report markdown/json
- poll result screenshot if manually captured
- approximate post time and group name
- redacted examples of resident asks
- chosen next action and why

Do not save:
- raw access tokens
- full phone numbers
- full webhook payloads
- private association/resident data
- sensitive workplace documents shared by residents

## 24-hour summary template

```text
Casagrand AI by Doing — 24h result

Post time:
Group/channel:
Campaign signals:
Unique residents:
Top topic cluster:
Poll votes, if any:
Community-bot leads:
Best resident asks, redacted:
Decision: [clubhouse intro / smaller sprint / design-partner calls / reposition]
Next action:
```

## Why this moves growth

The campaign should not optimize for “we posted once.” It should optimize for a clear next growth action:

1. enough demand to host the clubhouse event,
2. enough topic clarity to name the event well,
3. enough community-bot interest to validate the paid product, or
4. enough evidence that the positioning needs to change before another public post.
