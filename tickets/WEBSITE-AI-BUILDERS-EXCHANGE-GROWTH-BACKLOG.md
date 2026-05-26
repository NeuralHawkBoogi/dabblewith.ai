# Ticket Backlog: Dabblewith.ai AI Builder's Exchange Website Growth

Status: open
Created: 2026-05-26
Owner: Boogi / dabblewith.ai
Source strategy: `docs/growth/audience-acquisition-community-strategy.md`

## Goal
Convert the Dabblewith.ai website from a static/community-bot landing site into an **AI Builder's Exchange**: a workflow discovery, peer experimentation, and community-powered content hub that compounds traffic, retention, and commercial intent.

## North-star outcomes
- Visitors understand Dabblewith.ai as a practical AI workflow/community platform within 5 seconds.
- Community-created workflows become indexable SEO assets.
- Every acquisition channel is trackable via UTM/source/intent.
- Website routes drive measurable actions: community-bot setup, newsletter signup, workflow consumption, workflow submission, and event/challenge participation.
- Growth is judged by retained members and workflow usage, not vanity traffic.

## Execution phases

### Phase 0 — Measurement and positioning foundation
Ship first. Without this, growth experiments will be untraceable.

#### WEB-GROWTH-T01 — Reposition homepage around AI Builder's Exchange
Priority: P0
Status: todo
Dependencies: []

**Problem**
The current site does not yet clearly communicate the strategic pivot: Dabblewith.ai as a workflow exchange and builder community rather than a generic AI community/site.

**Scope**
- Rewrite homepage hero around: “Discover, fork, and share practical AI workflows.”
- Add audience-specific pathways:
  - Founders/operators
  - Creators/writers
  - Researchers/academics
  - Healthcare/business ops teams
  - No-code/automation builders
- Add primary CTAs:
  - Explore workflows
  - Submit a workflow
  - Join newsletter
  - Launch a community bot
- Add trust copy around safe experimentation, privacy, and human-led AI use.

**Acceptance criteria**
- Homepage has clear AI Builder's Exchange positioning.
- Above-the-fold CTA links exist for workflow discovery, workflow submission, newsletter, and community bot.
- Copy avoids corporate jargon and uses concrete practical language.
- Page still builds and appears in sitemap.

**Validation**
- Static build/generation passes.
- HTML contains the new primary CTAs.
- Sitemap includes homepage and new routes where applicable.

---

#### WEB-GROWTH-T02 — Add source/intent tracking and UTM discipline
Priority: P0
Status: todo
Dependencies: []

**Problem**
Recent GA checks show marketplace/social traffic collapses into Direct/Unassigned, making it hard to know what worked.

**Scope**
- Create a UTM link convention doc for marketplace, WhatsApp, Substack, Indie Hackers, X, and partner newsletters.
- Add website handling for `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and `intent` query parameters.
- Persist source/intent in local/session storage for CTA clicks where privacy-safe.
- Include source/intent fields in community-bot onboarding links/forms where available.
- Add a simple script or test ensuring key CTAs can preserve UTM parameters.

**Acceptance criteria**
- Documented UTM naming convention exists.
- Website CTAs preserve or attach source/intent where appropriate.
- Community-bot CTA can pass source/intent into onboarding.
- No phone numbers, secrets, or PII are stored in analytics fields.

**Validation**
- JS/HTML smoke test verifies UTM preservation.
- GA event naming remains stable.

---

#### WEB-GROWTH-T03 — Add conversion event taxonomy for GA
Priority: P0
Status: todo
Dependencies: [WEB-GROWTH-T02]

**Problem**
GA shows page views and generic CTA clicks, but not enough intent-specific conversion events.

**Scope**
Define and instrument events:
- `workflow_view`
- `workflow_submit_start`
- `workflow_submit_complete`
- `newsletter_signup_click`
- `community_bot_setup_click`
- `challenge_join_click`
- `partner_interest_click`
- `build_public_metrics_view`

Each event should include safe metadata only:
- page path
- CTA id
- audience segment
- source/medium/campaign if available
- workflow category if non-sensitive

**Acceptance criteria**
- Event taxonomy documented.
- Core CTAs emit named events.
- No PII or raw message content is sent to GA.
- Existing GA still loads correctly.

**Validation**
- Static smoke test confirms event calls exist.
- Manual browser or script smoke verifies no syntax errors.

---

### Phase 1 — Workflow Exchange MVP
Make the website capable of hosting workflow assets that compound through SEO.

#### WEB-GROWTH-T04 — Create Workflow Exchange information architecture
Priority: P0
Status: todo
Dependencies: [WEB-GROWTH-T01]

**Scope**
- Add `/workflows/` index route.
- Add workflow category pages:
  - Founder/operator workflows
  - Creator/writer workflows
  - Research/academic workflows
  - Healthcare/business ops workflows
  - No-code automation workflows
- Add individual workflow page template.
- Define workflow frontmatter/data schema:
  - title
  - slug
  - audience
  - problem
  - outcome
  - tools used
  - time required
  - difficulty
  - steps
  - example output
  - privacy notes
  - fork/remix ideas
  - CTA

**Acceptance criteria**
- `/workflows/` exists and lists at least 5 seed workflow placeholders or real workflows.
- Individual workflow pages render from structured data/frontmatter.
- Category filters or category routes work.
- Workflow pages are included in sitemap.

**Validation**
- Static generation passes.
- Sitemap includes workflow index and pages.
- No workflow example contains real private data.

---

#### WEB-GROWTH-T05 — Seed first 10 practical AI workflow pages
Priority: P0
Status: todo
Dependencies: [WEB-GROWTH-T04]

**Scope**
Create 10 high-intent seed workflows as mini-tutorials, not feature lists. Suggested initial set:
1. AI workshop intake template for teams
2. WhatsApp community onboarding bot workflow
3. Founder weekly metrics build-in-public workflow
4. AI meeting notes to action tracker workflow
5. Research paper summarization workflow with human review
6. Healthcare ops call triage workflow with safety caveats
7. Creator content repurposing workflow
8. No-code lead qualification workflow
9. Customer support FAQ gap-mining workflow
10. AI tool evaluation scorecard workflow

Each workflow must include:
- exact user problem/query
- step-by-step process
- tools used
- output example
- constraints and human review notes
- CTA to newsletter/community/workflow submission

**Acceptance criteria**
- 10 workflow pages are published.
- Each workflow targets a searchable long-tail query.
- Each workflow has internal links to related workflows/blog/community bot.
- No real PII/customer data.

**Validation**
- Content generation script passes.
- Link/sitemap assertions pass.

---

#### WEB-GROWTH-T06 — Add structured schema for workflows and tutorials
Priority: P0
Status: todo
Dependencies: [WEB-GROWTH-T04]

**Scope**
- Add JSON-LD schema to workflow pages.
- Use appropriate schema types: `HowTo`, `FAQPage`, `CreativeWork`, `SoftwareApplication`, or `LearningResource` depending on page.
- Add schema validation script for required fields.
- Ensure schema contains no PII/secrets/raw private content.

**Acceptance criteria**
- Workflow pages include valid JSON-LD.
- Required fields are validated in CI/local smoke.
- Schema supports long-tail search discoverability.

**Validation**
- Schema validation script passes.
- Static HTML contains JSON-LD for sample workflow page.

---

#### WEB-GROWTH-T07 — Add workflow submission intake MVP
Priority: P1
Status: todo
Dependencies: [WEB-GROWTH-T04, WEB-GROWTH-T02]

**Scope**
- Add `/submit-workflow/` page.
- Provide a simple submission form or WhatsApp-first submission CTA.
- Collect:
  - workflow title
  - intended audience
  - problem solved
  - steps/tools
  - example output
  - publish permission
  - contact method
- Store submissions safely as static pending records, email/WhatsApp handoff, or server endpoint depending current site architecture.

**Acceptance criteria**
- Visitor can start workflow submission.
- Source/UTM/intent captured safely.
- Submission path has spam/privacy warning.
- No public auto-publish without review.

**Validation**
- Form/CTA smoke passes.
- Submission copy clearly says human review before publishing.

---

### Phase 2 — Newsletter and build-in-public engine
Build owned audience and trust loops.

#### WEB-GROWTH-T08 — Create newsletter landing page and Substack operating system
Priority: P0
Status: todo
Dependencies: [WEB-GROWTH-T01, WEB-GROWTH-T02]

**Scope**
- Add `/newsletter/` landing page.
- Position newsletter around practical AI workflows, not generic AI news.
- Include the 3-2-1 cadence:
  - 3 high-value workflow/framework posts
  - 2 engagement/community posts
  - 1 soft promotion
- Add sample issue outline.
- Add partner/issue-swap CTA.
- Add tracking for signup clicks.

**Acceptance criteria**
- Newsletter page exists and is linked from homepage/nav/footer.
- Clear promise: weekly practical AI workflows and experiments.
- Signup CTA is trackable.
- Partner/issue-swap interest CTA exists.

**Validation**
- Static generation and sitemap pass.
- GA event taxonomy includes newsletter CTA.

---

#### WEB-GROWTH-T09 — Create build-in-public metrics page/template
Priority: P0
Status: todo
Dependencies: [WEB-GROWTH-T03]

**Scope**
- Add `/build-in-public/` page.
- Publish a weekly metrics template:
  - traffic
  - active users/community members
  - workflow views
  - workflow submissions
  - CTA clicks
  - community-bot setup requests
  - experiments run
  - failed experiments
  - lessons learned
- Add copy explaining honest progress and $0 MRR updates if true.

**Acceptance criteria**
- Page exists with current baseline metrics placeholder or latest available GA snapshot.
- Template can be reused weekly.
- Links to newsletter and workflow submission.

**Validation**
- Static generation passes.
- No private analytics secrets exposed.

---

#### WEB-GROWTH-T10 — Create partner collaboration/issue-swap CRM ticket
Priority: P1
Status: todo
Dependencies: [WEB-GROWTH-T08]

**Scope**
- Create a lightweight partner shortlist document/table.
- Fields:
  - publication/person
  - audience fit
  - size estimate
  - contact channel
  - engagement notes
  - proposed collaboration
  - status
- Add website CTA/page section for issue swaps and Substack Live conversations.
- Define outreach copy templates.

**Acceptance criteria**
- Partner CRM doc exists with at least 15 target slots and 5 initial suggested categories.
- Website has partner collaboration CTA.
- Outreach templates are saved.

**Validation**
- Manual doc review.

---

### Phase 3 — Community cold-start and retention loops
Make new users see value immediately.

#### WEB-GROWTH-T11 — Design no-blank-feed onboarding path
Priority: P0
Status: todo
Dependencies: [WEB-GROWTH-T04]

**Scope**
- Add onboarding route or homepage module that asks users what they want to do:
  - Learn practical AI
  - Build workflows
  - Automate community
  - Explore AI for my profession
  - Join a challenge
- Route each answer to relevant workflows, newsletter, community bot, or challenge.
- Create seed subgroup/category recommendations.

**Acceptance criteria**
- New visitor can self-select intent and get a useful next page.
- No blank/community-empty experience.
- Source/intent is tracked safely.

**Validation**
- Route/link smoke passes.
- Intent CTA events exist.

---

#### WEB-GROWTH-T12 — Launch 4-week AI workflow challenge page
Priority: P1
Status: todo
Dependencies: [WEB-GROWTH-T04, WEB-GROWTH-T08]

**Scope**
- Add `/challenges/` page and first challenge landing page.
- Challenge concept: “Build one practical AI workflow in public over 4 weeks.”
- Include schedule, participation rules, weekly prompts, submission CTA, newsletter signup.
- Highlight future member submissions.

**Acceptance criteria**
- Challenge page exists with clear joining instructions.
- Workflow submission and newsletter CTAs are included.
- Copy reinforces safe experimentation and human review.

**Validation**
- Static generation and sitemap pass.

---

#### WEB-GROWTH-T13 — Create safe-harbor AI community policy page
Priority: P0
Status: todo
Dependencies: []

**Scope**
- Add `/community-policy/` or update existing policy page.
- Cover:
  - constructive AI debate
  - no ideological ambushes
  - respect for creators/artists/writers
  - privacy and data ownership
  - no harassment
  - human oversight for AI moderation
  - bias/provenance/data-security principles

**Acceptance criteria**
- Public policy page exists.
- Linked from footer/community pages.
- Tone is protective but not preachy.

**Validation**
- Static generation passes.
- Footer/link smoke passes.

---

### Phase 4 — AI community intelligence
Turn behavior into retention signals without over-automation.

#### WEB-GROWTH-T14 — Define community intelligence event model
Priority: P1
Status: todo
Dependencies: [WEB-GROWTH-T03, WEB-GROWTH-T04]

**Scope**
Create a privacy-safe event model for:
- workflow viewed
- workflow saved/copied
- workflow submitted
- CTA clicked
- challenge joined
- newsletter clicked
- community-bot setup clicked
- returning visitor
- interest category selected

Include rules for what must never be tracked:
- raw phone numbers
- raw message text
- secrets/tokens
- health/financial/personal sensitive content unless explicitly anonymized and necessary

**Acceptance criteria**
- Event model doc exists.
- Events map to GA/Matomo/future community intelligence layer.
- Privacy guardrails are explicit.

**Validation**
- Manual review; event names match implementation where available.

---

#### WEB-GROWTH-T15 — Add lightweight churn/retention dashboard spec
Priority: P2
Status: todo
Dependencies: [WEB-GROWTH-T14]

**Scope**
- Define dashboard metrics:
  - 7/14/30-day return visits
  - workflow views per visitor
  - CTA-to-signup conversion
  - community-bot setup funnel
  - newsletter signup funnel
  - challenge participation
- Define churn-risk heuristics for future logged-in/community users.
- Keep it as a spec if user accounts are not ready.

**Acceptance criteria**
- Dashboard spec exists.
- Metrics map to current/future event model.
- Clear distinction between analytics and automated action.

**Validation**
- Manual review.

---

### Phase 5 — Social and launch execution assets
Operationalize the go-to-market plan.

#### WEB-GROWTH-T16 — Create Reply Guy and build-in-public content kit
Priority: P1
Status: todo
Dependencies: [WEB-GROWTH-T09]

**Scope**
- Create templates for high-value replies on X/Indie Hackers.
- Create weekly progress thread format.
- Create launch DM template for 20-50 early engaged followers.
- Include rules: no self-promo in replies; lead with specific value.

**Acceptance criteria**
- Content kit doc exists.
- Includes at least 10 reply patterns, 1 weekly thread template, 2 DM templates.
- Includes vanity-metric warning and target-buyer fit checklist.

**Validation**
- Manual review.

---

#### WEB-GROWTH-T17 — Create launch readiness checklist for new website features
Priority: P1
Status: todo
Dependencies: [WEB-GROWTH-T02, WEB-GROWTH-T03]

**Scope**
- Checklist for launching workflow pages/challenges/newsletter:
  - UTM links created
  - GA events verified
  - sitemap updated
  - screenshot/social cards ready
  - 20-50 early people identified
  - launch timing chosen
  - follow-up post scheduled
  - metrics review time scheduled

**Acceptance criteria**
- Launch checklist exists.
- Used by at least one upcoming feature launch.

**Validation**
- Manual review.

---

## Recommended immediate sprint

1. `WEB-GROWTH-T01` — homepage repositioning
2. `WEB-GROWTH-T02` — UTM/source tracking
3. `WEB-GROWTH-T03` — conversion event taxonomy
4. `WEB-GROWTH-T04` — workflow exchange IA
5. `WEB-GROWTH-T05` — first 10 workflow pages
6. `WEB-GROWTH-T06` — workflow schema
7. `WEB-GROWTH-T08` — newsletter landing page
8. `WEB-GROWTH-T09` — build-in-public metrics page
9. `WEB-GROWTH-T13` — community policy

## Notes
- This backlog is website-first. Runtime/community-bot platformization remains in `tickets/COMMUNITY-BOT-PLATFORM.md` and related runtime tickets.
- Every public claim should be grounded in real examples or framed as an experiment.
- Do not publish fake community activity. Seed content is fine; fake users/testimonials are not.
- Prefer small visible launches over hidden platform rewrites.
