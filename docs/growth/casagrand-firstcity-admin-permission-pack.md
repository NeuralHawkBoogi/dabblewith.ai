# Casagrand First City Admin Permission Pack

Date: 2026-05-21  
Campaign: Casagrand First City → dabblewith.ai local growth wedge  
Use before: posting in the IT opportunities group, putting up clubhouse flyers, or asking for a clubhouse slot

## Purpose

Make it easy for Boogi to ask group/admin stakeholders for permission without sounding like a startup promotion.

The ask should be narrow:

1. permission to post one practical AI invite in the IT opportunities WhatsApp group,
2. permission to collect interest/RSVPs through the dabblewith.ai WhatsApp bot,
3. optional permission to place one clubhouse notice/flyer,
4. optional permission to book a free resident-led intro session if demand is strong.

Do not imply this is an official Casagrand, builder, or residents' association initiative unless formally approved.

## 30-second verbal pitch

```text
I’m trying a small resident-led practical AI learning circle for Casagrand residents.

It’s not a paid class and not an official association activity. The idea is to help residents bring one real work, career, study, or business problem and learn how to turn it into a useful AI workflow.

Can I post one invite in the IT opportunities group to collect interest? If there is enough response, I’ll request a clubhouse slot for a free intro/build-along session.

I’ll keep the post non-promotional, avoid spam, and won’t collect sensitive resident data.
```

## WhatsApp permission ask to IT group/admin

```text
Hi [Name] — I’m starting a small resident-led “AI by Doing” circle for Casagrand residents.

The purpose is practical learning: residents can bring one real work/career/study/business problem and learn how to use AI tools to solve it. It will be free for the first session and non-promotional.

Can I post one invite in the IT opportunities group to collect interest through a dabblewith.ai WhatsApp bot?

Guardrails:
• one post only, plus one optional reminder after 24 hours if needed
• no sensitive data collection
• no apartment/tower details in reports
• phone numbers redacted in internal reporting
• not positioned as an official Casagrand/association activity unless approved
• if response is weak, I won’t push for a clubhouse event

If enough residents respond, I’ll come back with a simple clubhouse-session request.
```

## Clubhouse / noticeboard permission ask

```text
Hi [Name] — the practical AI interest post got enough responses to justify a small free resident-led intro session.

Can I request permission to:
1. place one A4 notice/flyer at the clubhouse/noticeboard, and
2. host a 90-minute free session at the clubhouse, subject to the available slot?

Tentative title: AI by Doing — Build Your First Practical AI Workflow
Audience: Casagrand residents, especially IT professionals, students, founders/freelancers, and working professionals
Format: bring one real problem; we demo practical AI workflows live
Expected size: [expected RSVPs]
No fee, no vendor pitch, no sensitive resident data collection.

I’ll share the final copy/flyer before posting it.
```

## One-post launch copy after permission

Use this only after admin/group permission is clear.

```text
Hi everyone — I’m testing a small practical AI builders circle for Casagrand residents.

The idea is simple: no theory, no hype. Bring one real thing you want help with — job search, interview prep, office workflows, coding, founder/freelancer work, student projects, or even WhatsApp/community bots.

If enough people are interested, I’ll host a free intro/build-along session at the clubhouse.

To help pick the first topic, message the dabblewith.ai WhatsApp bot with one line:
“Casagrand + what you want AI help with”

Examples:
• Casagrand career help — interview prep
• Casagrand workflow help — automate weekly reports
• Casagrand founder help — lead research
• Casagrand student help — project ideas
• Casagrand community bot demo — helper for a group/community

Bot link: https://wa.me/919566112518
```

## If admin asks “what is dabblewith.ai?”

```text
dabblewith.ai is my practical AI learning/community project. The goal is to help people learn by building useful workflows, not by watching theory.

For Casagrand, I’m using it as a lightweight way to collect resident interests, pick a useful first session topic, and test whether a WhatsApp AI helper can support communities with FAQs, RSVPs, reminders, and summaries.
```

## If admin asks “what data will be collected?”

```text
Only lightweight interest signals: what topic someone wants help with, whether they want to attend, and broad category like career/workflow/student/founder/community bot.

I will not ask for sensitive personal data, apartment/tower details, payment information, or official resident records. Internal reports redact phone numbers except the last 4 digits and do not expose raw webhook payloads or tokens.
```

## If admin says no to group post

Do not argue. Use a smaller route:

```text
No problem — I’ll keep it to direct known contacts first and won’t post in the group.

If we get enough genuine interest through resident referrals, I can share a small summary and ask again later.
```

Next action: run the first-10 tester sprint through direct contacts before asking again.

## If admin says yes but no clubhouse yet

Use the WhatsApp-only validation path:

1. Post the one invite.
2. Run the campaign report after 24 hours.
3. If 25+ residents or 15+ concrete use cases show up, ask for clubhouse slot with evidence.
4. If fewer than 10 concrete responses, run online office hours first.

## Approval checklist

Before posting anywhere, confirm:

- [ ] Admin/group permission received for one post.
- [ ] Post copy reviewed for non-promotional tone.
- [ ] Bot CTA uses Casagrand source language.
- [ ] No sensitive data requested.
- [ ] Follow-up reminder limited to one message after 24 hours.
- [ ] Clubhouse/flyer permission is separate from group-post permission.

## Evidence to bring back after 24 hours

Run:

```bash
node scripts/casagrand-campaign-report.js --runtime-dir /home/clawdbot/dabblewith-whatsapp/data --date YYYY-MM-DD
```

Summarize only privacy-safe metrics:

- unique Casagrand respondents,
- top requested topic clusters,
- number of concrete use cases,
- RSVP/event interest count,
- community-bot/design-partner leads,
- recommended next action.
