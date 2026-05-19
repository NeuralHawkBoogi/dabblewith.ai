# dabblewith.ai SEO Blog Strategy

## Goal
Build topical authority for **hands-on AI learning**, **AI workshops**, **agent workflows**, and **human-guided AI operations**. The blog should attract founders, operators, students, builders, and professionals who want practical AI confidence, not generic AI news.

## Publishing cadence
- Publish 1 article daily.
- Keep each article practical, evergreen, and artifact-oriented.
- Avoid thin news commentary. Prefer guides, playbooks, templates, examples, checklists, and teardown-style posts.

## Primary keyword clusters
1. **Hands-on AI learning**
   - hands-on AI community
   - learn AI by doing
   - practical AI demos
   - AI workshops for beginners

2. **AI agent workflows**
   - agent workflows for founders
   - AI workflow automation
   - AI operating system for startups
   - AI agents for business operations

3. **Human-guided AI operations**
   - human in the loop AI
   - human review AI workflows
   - AI-operated community
   - AI quality control workflow

4. **AI workshops and community**
   - practical AI workshops
   - AI meetup ideas
   - AI community learning
   - AI workshop templates

5. **Use-case playbooks**
   - AI for sales research
   - AI for meeting notes
   - AI for content repurposing
   - AI for customer research
   - AI for founder productivity

## Article format
Every article should include:
- Clear SEO title under ~60 characters when possible
- Meta description under ~155 characters
- One specific long-tail keyword target
- Practical intro
- 4-6 useful sections
- Examples, checklist, or workflow steps
- Human-review/safety note where relevant
- Soft CTA back to dabblewith.ai community

## Internal linking rules
- Link back to `/blog/` from every article.
- Link to the homepage `/` naturally.
- When there are related posts, add 2-3 internal links.

## Quality bar
Do not publish generic AI fluff. A good post should help someone run a better AI workflow today.

## Current implementation
- Source data: `data/blog-posts.json`
- Generator: `scripts/generate-blog.js`
- Daily publisher: `scripts/publish-daily-blog.js`
- Output: static `/blog/` pages and `sitemap.xml`
- Cron: OpenClaw job `dabblewith.ai daily SEO blog publisher` at 08:15 IST daily
