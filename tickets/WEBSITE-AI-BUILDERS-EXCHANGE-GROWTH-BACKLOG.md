# Dabblewith.ai Website Growth Backlog — Epics + Tickets

Status: phase-1 done / phase-2 open
Created: 2026-05-26
Owner: Boogi / dabblewith.ai
Source strategy: `docs/growth/audience-acquisition-community-strategy.md`

## Product goal
Transform the Dabblewith.ai website from a mostly static/community-bot landing site into an **AI Builder's Exchange**: a workflow discovery, peer experimentation, and community-powered content hub that compounds traffic, trust, retention, and commercial intent.

## North-star outcomes
- Visitors understand the platform promise within 5 seconds: discover, fork, and share practical AI workflows.
- Community-created workflows become indexable SEO assets.
- Every acquisition channel is trackable via UTM/source/intent.
- Website routes drive measurable actions: community-bot setup, newsletter signup, workflow consumption, workflow submission, and challenge participation.
- Growth is judged by retained members and workflow usage, not vanity traffic.

## Epic roadmap

| Epic | Name | Goal | Priority | Status |
|---|---|---|---|---|
| EPIC-WG-00 | Measurement & Positioning Foundation | Make the site clear and measurable before scaling traffic. | P0 | done |
| EPIC-WG-01 | Workflow Exchange MVP | Publish workflow assets that compound through SEO and community sharing. | P0 | done |
| EPIC-WG-02 | Newsletter & Build-in-Public Engine | Build an owned audience and transparent trust loop. | P0 | done |
| EPIC-WG-03 | Community Cold-Start & Retention | Ensure new visitors see useful paths, not an empty community. | P0/P1 | done |
| EPIC-WG-04 | AI Community Intelligence | Define privacy-safe signals for retention and personalization. | P1/P2 | done |
| EPIC-WG-05 | Social & Launch Execution Assets | Operationalize reply-guy, launch, and collaboration tactics. | P1 | done |

---

# EPIC-WG-00 — Measurement & Positioning Foundation

Priority: P0
Status: done

## Goal
Ship the minimum positioning and analytics foundation required before doing serious acquisition. Without this, growth experiments will be untraceable and visitors will not understand the new AI Builder's Exchange direction.

## Success criteria
- Homepage clearly positions Dabblewith.ai as a practical AI workflow/community platform.
- Main CTAs exist and are measurable.
- UTM/source/intent tracking is documented and wired into CTA flows.
- GA event taxonomy distinguishes real commercial/community intent from generic clicks.

## Tickets

### WEB-GROWTH-T01 — Reposition homepage around AI Builder's Exchange
Priority: P0
Status: done
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

**Evidence**
- Homepage hero now positions Dabblewith.ai as an AI Builder's Exchange: "Discover, fork, and share practical AI workflows."
- Added above-the-fold CTAs for Explore workflows, Submit a workflow, Join newsletter, and Launch a community bot.
- Added audience pathways for founders/operators, creators/writers, researchers/academics, healthcare/business ops teams, and no-code/automation builders.
- Added workflow, submission, newsletter, and community-bot sections without creating new workflow routes.
- Validation: `git diff --check`, `node --check scripts/web/dabblewith-tracking.js`, static grep smoke for CTA/event coverage.

---

### WEB-GROWTH-T02 — Add source/intent tracking and UTM discipline
Priority: P0
Status: done
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

**Evidence**
- Added `docs/growth/utm-link-conventions.md` with source/medium/campaign/content/intent rules and channel templates.
- Added `scripts/web/dabblewith-tracking.js` to capture attribution in `sessionStorage`, decorate internal/WhatsApp CTA links, and avoid PII capture.
- Wired tracking script into `index.html`.
- Removed raw `link_url` from the existing generic CTA analytics payload; only safe `link_host` is emitted.
- Follow-up hardening: replaced the legacy `/community-bot/` inline click tracker with the shared privacy-safe tracker and added named CTA metadata to WhatsApp setup links.
- Added `scripts/site-smoke-test.js` to verify local HTML references, JSON-LD parsing, required metadata, and the `/community-bot/` privacy guard.
- Validation: `node --check scripts/web/dabblewith-tracking.js`; static grep confirms tracked params and CTA attributes exist.

---

### WEB-GROWTH-T03 — Add conversion event taxonomy for GA
Priority: P0
Status: done
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

**Evidence**
- Added `docs/growth/ga-conversion-event-taxonomy.md` with event definitions, allowed metadata, and GA conversion recommendations.
- Instrumented homepage CTAs with `data-event`, `data-cta`, `data-audience`, and safe workflow metadata where applicable.
- Allowlisted events in `scripts/web/dabblewith-tracking.js`: `workflow_view`, `workflow_explore_click`, `workflow_submit_start`, `workflow_submit_complete`, `newsletter_signup_click`, `community_bot_setup_click`, `challenge_join_click`, `partner_interest_click`, `build_public_metrics_view`, `audience_segment_click`, `lead_intent_click`.
- Follow-up hardening: `/community-bot/` WhatsApp setup CTAs now emit `community_bot_setup_click` through the shared tracker, which also emits privacy-safe `lead_intent_click` without raw URLs or message bodies.
- Validation: `node --check scripts/web/dabblewith-tracking.js`; static grep confirms core event names are present.

---

### WEB-GROWTH-T18 — Harden privacy-safe analytics across public surfaces
Priority: P0
Status: done
Dependencies: [WEB-GROWTH-T02, WEB-GROWTH-T03]

**Problem**
Older generated/static pages still used legacy inline GA listeners that emitted raw `link_url`, which can leak WhatsApp numbers, prefilled message text, or unnecessary full URLs into analytics.

**Scope**
- Replace legacy inline CTA trackers on generated blog/community OS pages with `/scripts/web/dabblewith-tracking.js`.
- Harden public static pages so GA-enabled pages use the shared privacy-safe tracker.
- Keep copy-button analytics scoped to safe selector IDs, not raw URLs or copied text.
- Add smoke coverage to prevent any public HTML from emitting `link_url`.

**Acceptance criteria**
- No public HTML file contains `link_url`.
- GA-enabled pages include the shared privacy-safe tracker.
- Blog/autopilot/session generators do not reintroduce raw URL tracking.
- Site smoke test fails on future raw `link_url` regressions.

**Validation**
- `node scripts/site-smoke-test.js` passes.
- `grep -R "link_url" -n *.html */index.html */*/index.html` shows no public HTML regressions.

**Evidence**
- Updated `scripts/generate-blog.js` and `scripts/generate-community-os.js` to use the shared privacy-safe tracker instead of inline raw URL click listeners.
- Regenerated blog, autopilot, and session pages.
- Hardened existing public static pages to include `/scripts/web/dabblewith-tracking.js` where GA is present and removed legacy raw URL click listeners.
- Updated `scripts/site-smoke-test.js` to fail if any HTML contains `link_url` or if a GA-enabled page lacks the shared tracker.

---

# EPIC-WG-01 — Workflow Exchange MVP

Priority: P0
Status: done

## Goal
Make the website capable of hosting workflow assets that compound through search, sharing, and community contribution.

## Success criteria
- `/workflows/` exists as a clear product surface.
- At least 10 practical workflow mini-tutorials are published.
- Workflow pages are structured, internally linked, and schema-rich.
- Visitors can begin submitting a workflow for human review.

## Tickets

### WEB-GROWTH-T04 — Create Workflow Exchange information architecture
Priority: P0
Status: done
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
  - title, slug, audience, problem, outcome, tools used, time required, difficulty, steps, example output, privacy notes, fork/remix ideas, CTA.

**Acceptance criteria**
- `/workflows/` exists and lists at least 5 seed workflow placeholders or real workflows.
- Individual workflow pages render from structured data/frontmatter.
- Category filters or category routes work.
- Workflow pages are included in sitemap.

**Validation**
- Static generation passes.
- Sitemap includes workflow index and pages.
- No workflow example contains real private data.

**Evidence**
- Added `data/workflows.json` as the structured workflow source with category and workflow fields for title, slug, audience segment, problem, outcome, tools, time, difficulty, steps, example output, human-review gate, privacy notes, fork ideas, related workflows, and CTA.
- Added `scripts/generate-workflows.js` to render `/workflows/`, five category routes, and individual workflow pages from the structured source.
- Homepage audience cards now deep-link to workflow category pages, and generated workflow routes are included in sitemap through `scripts/generate-blog.js`.
- Validation: `node --check scripts/generate-workflows.js`; `node scripts/generate-workflows.js --check`; static smoke checks for route, category, and sitemap presence.


---

### WEB-GROWTH-T05 — Seed first 10 practical AI workflow pages
Priority: P0
Status: done
Dependencies: [WEB-GROWTH-T04]

**Scope**
Create 10 high-intent seed workflows as mini-tutorials, not feature lists:
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

Each workflow must include exact user problem/query, step-by-step process, tools used, output example, constraints/human-review notes, and CTA.

**Acceptance criteria**
- 10 workflow pages are published.
- Each workflow targets a searchable long-tail query.
- Each workflow has internal links to related workflows/blog/community bot.
- No real PII/customer data.

**Validation**
- Content generation script passes.
- Link/sitemap assertions pass.

**Evidence**
- Published 10 seed workflow mini-tutorials covering the required topics: workshop intake, WhatsApp community onboarding bot, founder weekly metrics, meeting notes to action tracker, research paper summarization, healthcare ops call triage, creator repurposing, no-code lead qualification, FAQ gap mining, and AI tool evaluation scorecard.
- Each workflow includes a searchable query/problem, step-by-step process, tools, example output, human-review notes, privacy notes, fork ideas, related workflows, and CTA.
- Validation: workflow generator check plus static smoke confirming 10 workflow pages, internal related links, and sitemap entries.


---

### WEB-GROWTH-T06 — Add structured schema for workflows and tutorials
Priority: P0
Status: done
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

**Evidence**
- Workflow index/category pages include `ItemList` JSON-LD; individual workflow pages include `HowTo` and `LearningResource` JSON-LD generated from safe workflow metadata.
- Schema uses only public workflow content from `data/workflows.json`; no private user data, tokens, raw messages, or secrets.
- Validation: static smoke parsed JSON-LD blocks from sample workflow pages and verified `HowTo`/`LearningResource` types and required fields.


---

### WEB-GROWTH-T07 — Add workflow submission intake MVP
Priority: P1
Status: done
Dependencies: [WEB-GROWTH-T04, WEB-GROWTH-T02]

**Scope**
- Add `/submit-workflow/` page.
- Provide a simple submission form or WhatsApp-first submission CTA.
- Collect workflow title, audience, problem solved, steps/tools, example output, publish permission, and contact method.
- Store submissions safely as static pending records, email/WhatsApp handoff, or server endpoint depending current site architecture.

**Acceptance criteria**
- Visitor can start workflow submission.
- Source/UTM/intent captured safely.
- Submission path has spam/privacy warning.
- No public auto-publish without review.

**Validation**
- Form/CTA smoke passes.
- Submission copy clearly says human review before publishing.

**Evidence**
- Added `/submit-workflow/` with WhatsApp-first submission intake, required fields, publish-permission guidance, privacy warnings, and explicit human-review-before-publishing copy.
- Submission CTAs use `workflow_submit_start` and preserve safe UTM/intent parameters via the site tracking layer.
- Validation: static smoke confirmed route, CTA event, privacy copy, and human-review language.


---

# EPIC-WG-02 — Newsletter & Build-in-Public Engine

Priority: P0
Status: done

## Goal
Create an owned audience channel and transparent operating rhythm that converts casual visitors into repeat followers, subscribers, and collaborators.

## Success criteria
- Newsletter page exists with a practical workflow promise.
- Build-in-public metrics page exists and can be updated weekly.
- Partner collaboration pipeline exists for issue swaps and Substack Live.

## Tickets

### WEB-GROWTH-T08 — Create newsletter landing page and Substack operating system
Priority: P0
Status: done
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

**Evidence**
- Added `/newsletter/` landing page positioned around weekly practical AI workflows, not generic AI news.
- Includes 3-2-1 operating cadence, sample issue structure, signup CTA, and partner/issue-swap CTA.
- Validation: static smoke confirmed route, `newsletter_signup_click`, `partner_interest_click`, and sitemap entry.


---

### WEB-GROWTH-T09 — Create build-in-public metrics page/template
Priority: P0
Status: done
Dependencies: [WEB-GROWTH-T03]

**Scope**
- Add `/build-in-public/` page.
- Publish a weekly metrics template:
  - traffic, active users/community members, workflow views, workflow submissions, CTA clicks, community-bot setup requests, experiments run, failed experiments, lessons learned.
- Add copy explaining honest progress and $0 MRR updates if true.

**Acceptance criteria**
- Page exists with current baseline metrics placeholder or latest available GA snapshot.
- Template can be reused weekly.
- Links to newsletter and workflow submission.

**Validation**
- Static generation passes.
- No private analytics secrets exposed.

**Evidence**
- Added `/build-in-public/` with weekly metrics template for traffic, returning visitors, workflow views, submissions, CTA clicks, community-bot requests, experiments, failed experiments, lessons, and honest `$0 MRR` support when true.
- Links to workflow submission and newsletter routes.
- Validation: static smoke confirmed route, reusable metric fields, no exposed analytics secrets, and sitemap entry.


---

### WEB-GROWTH-T10 — Create partner collaboration/issue-swap CRM
Priority: P1
Status: done
Dependencies: [WEB-GROWTH-T08]

**Scope**
- Create a lightweight partner shortlist document/table.
- Fields: publication/person, audience fit, size estimate, contact channel, engagement notes, proposed collaboration, status.
- Add website CTA/page section for issue swaps and Substack Live conversations.
- Define outreach copy templates.

**Acceptance criteria**
- Partner CRM doc exists with at least 15 target slots and 5 initial suggested categories.
- Website has partner collaboration CTA.
- Outreach templates are saved.

**Validation**
- Manual doc review.

**Evidence**
- Added `docs/growth/partner-collaboration-crm.md` with target slots, audience-fit fields, collaboration types, statuses, and outreach templates for issue swaps/Substack Live.
- Newsletter page includes a partner collaboration CTA using `partner_interest_click`.
- Validation: manual/static review confirmed CRM fields and CTA route.


---

# EPIC-WG-03 — Community Cold-Start & Retention

Priority: P0/P1
Status: done

## Goal
Avoid the empty-restaurant problem by giving visitors immediate, relevant paths and a clear safe-harbor community culture.

## Success criteria
- New visitors can self-select intent and get useful next steps.
- Challenge infrastructure exists for early community participation.
- Community policy makes Dabblewith.ai safe for AI-curious builders, creators, and professionals.

## Tickets

### WEB-GROWTH-T11 — Design no-blank-feed onboarding path
Priority: P0
Status: done
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

**Evidence**
- Added `/start/` no-blank-feed onboarding route with self-selection paths for learning practical AI, building workflows, automating a community, exploring AI by profession, and joining a challenge.
- Each path routes to relevant workflow categories, newsletter, community-bot, or challenge pages with safe intent/source tracking.
- Validation: static smoke confirmed route links and safe CTA/event attributes.


---

### WEB-GROWTH-T12 — Launch 4-week AI workflow challenge page
Priority: P1
Status: done
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

**Evidence**
- Added `/challenges/` and `/challenges/build-in-public-4-weeks/` for the 4-week practical AI workflow challenge.
- Includes schedule, participation rules, weekly prompts, submission CTA, newsletter CTA, and safe experimentation/human-review framing.
- Validation: static smoke confirmed both routes, `challenge_join_click`, workflow submission/newsletter CTAs, and sitemap entries.


---

### WEB-GROWTH-T13 — Create safe-harbor AI community policy page
Priority: P0
Status: done
Dependencies: []

**Scope**
- Add `/community-policy/` or update existing policy page.
- Cover constructive AI debate, no ideological ambushes, respect for creators/artists/writers, privacy/data ownership, no harassment, human oversight for AI moderation, and bias/provenance/data-security principles.

**Acceptance criteria**
- Public policy page exists.
- Linked from footer/community pages.
- Tone is protective but not preachy.

**Validation**
- Static generation passes.
- Footer/link smoke passes.

**Evidence**
- Added `/community-policy/` with safe-harbor rules for constructive AI debate, creator respect, privacy/data ownership, no harassment, human oversight, provenance, bias, and data-security principles.
- Linked from homepage/footer and generated workflow footers.
- Validation: static smoke confirmed route, footer link, and protective non-preachy policy coverage.


---

# EPIC-WG-04 — AI Community Intelligence

Priority: P1/P2
Status: done

## Goal
Define a privacy-safe signal layer for retention, personalization, and future AI-assisted community management without over-automation.

## Success criteria
- Community intelligence events are documented and privacy-safe.
- Retention/churn dashboard spec exists for future implementation.
- Human review remains explicit for any AI-driven moderation or recommendations.

## Tickets

### WEB-GROWTH-T14 — Define community intelligence event model
Priority: P1
Status: done
Dependencies: [WEB-GROWTH-T03, WEB-GROWTH-T04]

**Scope**
Create a privacy-safe event model for workflow viewed/saved/submitted, CTA clicked, challenge joined, newsletter clicked, community-bot setup clicked, returning visitor, and interest category selected.

Also define never-track rules:
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

**Evidence**
- Added `docs/growth/community-intelligence-event-model.md` defining privacy-safe events for workflow views, saves/submissions, CTA clicks, challenge joins, newsletter clicks, community-bot setup clicks, returning visitors, and interest-category selection.
- Explicit never-track rules cover raw phones, raw message text, secrets/tokens, and sensitive personal/health/financial content.
- Validation: manual/static review confirmed event names align with current tracking taxonomy where implemented.


---

### WEB-GROWTH-T15 — Add lightweight churn/retention dashboard spec
Priority: P2
Status: done
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

**Evidence**
- Added `docs/growth/churn-retention-dashboard-spec.md` defining 7/14/30-day return visits, workflow views per visitor, CTA-to-signup conversion, community-bot funnel, newsletter funnel, and challenge participation metrics.
- Spec distinguishes analytics from automated action and keeps human review explicit for future recommendations.
- Validation: manual/static review confirmed mappings to the event model and privacy guardrails.


---

# EPIC-WG-05 — Social & Launch Execution Assets

Priority: P1
Status: done

## Goal
Turn the analysis into repeatable go-to-market operating assets for X, Indie Hackers, newsletter swaps, partner launches, and feature launches.

## Success criteria
- Reply-guy and build-in-public templates exist.
- Feature launch checklist ensures tracking and follow-up.
- Launches optimize for target-user intent, not social vanity metrics.

## Tickets

### WEB-GROWTH-T16 — Create Reply Guy and build-in-public content kit
Priority: P1
Status: done
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

**Evidence**
- Added `docs/growth/reply-guy-and-build-in-public-content-kit.md` with high-value X/Indie Hackers reply patterns, weekly progress thread template, early-follower DM templates, vanity-metric warning, and target-buyer-fit checklist.
- `/build-in-public/` links the template into the transparent growth loop.
- Validation: manual/static review confirmed required templates and no fake activity claims.


---

### WEB-GROWTH-T17 — Create launch readiness checklist for new website features
Priority: P1
Status: done
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

**Evidence**
- Added `docs/growth/launch-readiness-checklist.md` covering UTM links, GA events, sitemap, screenshots/social assets, early-person shortlist, launch timing, follow-up post, and metrics review.
- Used against this website-feature batch by validating workflow/newsletter/challenge/community-policy route coverage, CTA events, and sitemap inclusion before commit.
- Validation: `git diff --check`, node syntax checks, generator checks, and static route/schema/sitemap smoke.


---

## Phase 1 completion summary

Phase 1 website epics `EPIC-WG-00` through `EPIC-WG-05` are complete: positioning, workflow exchange, newsletter/build-in-public, cold-start routing, privacy-safe intelligence specs, launch assets, and analytics hardening are shipped.

## Recommended next sprint

1. ✅ `WEB-GROWTH-T19` — downloadable workflow templates / copyable worksheets for the top 5 workflows.
2. ✅ `WEB-GROWTH-T20` — first newsletter issue as a web archive linked from `/newsletter/`.
3. ✅ `WEB-GROWTH-T21` — lightweight `/experiments/` page showing what is live, testing, and next.
4. ✅ `WEB-GROWTH-T22` — social preview images for homepage, workflow index, community bot, newsletter issue, templates, and experiments.


# EPIC-WG-06 — Phase 2 Activation Surfaces

Priority: P0/P1
Status: done

## Goal
Convert the Phase 1 website from readable surfaces into reusable assets: worksheets visitors can copy, archive issues they can share, and a public roadmap that explains what is live versus experimental.

## Tickets

### WEB-GROWTH-T19 — Add downloadable workflow templates / copyable worksheets
Priority: P0
Status: done
Dependencies: [WEB-GROWTH-T04, WEB-GROWTH-T05]

**Scope**
- Add `/templates/` index route.
- Generate copyable worksheet pages for the top 5 workflows.
- Generate downloadable Markdown worksheets.
- Include human-review gates, privacy notes, first-run notes, and publish/share decisions.

**Acceptance criteria**
- `/templates/` lists at least 5 worksheets.
- Each worksheet links back to the source workflow.
- Each worksheet has a downloadable Markdown file.
- No worksheet contains real private data.

**Validation**
- `node scripts/generate-phase2.js --check` passes.
- `node scripts/site-smoke-test.js` passes.
- Sitemap includes template routes.

**Evidence**
- Added `scripts/generate-phase2.js` to generate `/templates/`, five worksheet pages, and five `.md` worksheet downloads from `data/workflows.json`.
- Generated worksheets for workshop intake, WhatsApp community onboarding bot, founder weekly metrics, meeting notes action tracker, and research paper summarization.
- Worksheets include the job, safe input, workflow draft, human review gate, privacy/never-automate notes, first-run notes, and publish/share decision.

---

### WEB-GROWTH-T20 — Publish first newsletter issue as a web archive
Priority: P0
Status: done
Dependencies: [WEB-GROWTH-T08, WEB-GROWTH-T19]

**Scope**
- Add `/newsletter/issue-001/` as the first public archive issue.
- Link to it from `/newsletter/`.
- Include workflow/template links and an honest experiment update.

**Acceptance criteria**
- Issue route is indexable and in sitemap.
- Newsletter landing page links to the archive.
- Issue includes clear CTAs to subscribe and use worksheets.
- Claims remain framed as experiments; no fake traction.

**Validation**
- Static route smoke passes.
- Sitemap includes `/newsletter/issue-001/`.

**Evidence**
- Added `/newsletter/issue-001/` with the 3-2-1 issue format: three workflows, two community asks, and one honest experiment update.
- Added CTAs from the newsletter landing page to issue #001.
- Issue links to relevant templates/workflows and states MRR as $0 rather than implying revenue.

---

### WEB-GROWTH-T21 — Add public roadmap / experiments page
Priority: P1
Status: done
Dependencies: [WEB-GROWTH-T09, WEB-GROWTH-T18]

**Scope**
- Add `/experiments/` showing live, testing, and next surfaces.
- Explain decision rule for what moves forward.
- Reaffirm no fake traction / no synthetic testimonials.

**Acceptance criteria**
- Page exists and is linked in generated nav/footer surfaces.
- Page distinguishes live, testing, and next work.
- Page includes a clear anti-fake-traction policy.

**Validation**
- Static route smoke passes.
- Sitemap includes `/experiments/`.

**Evidence**
- Added `/experiments/` with live Workflow Exchange, templates, newsletter archive, community-bot lead capture test, and social preview card work.
- Added decision rule: prioritize replies, worksheet copies, workflow submissions, and community-bot setup conversations over vanity traffic.
- Generated Phase 2 nav/footer surfaces link to `/experiments/`.

---

### WEB-GROWTH-T22 — Create social preview images for launch surfaces
Priority: P1
Status: done
Dependencies: [WEB-GROWTH-T17]

**Scope**
- Create OG/social preview images for homepage, workflow index, community bot, newsletter issue, templates, and experiments.
- Wire page-specific `og:image` metadata.
- Validate image dimensions and live fetch.

**Acceptance criteria**
- At least 6 share images exist.
- Key public pages reference page-specific images.
- Images avoid AI-art weirdness and stay readable at social-card size.

**Validation**
- SVG dimensions check: all six cards are `1200x630`.
- `node scripts/generate-og-images.js --check` passes.
- `node scripts/site-smoke-test.js` validates `og:image`/`twitter:image` local references.
- Live metadata smoke confirms each launch surface references its page-specific card.

**Evidence**
- Added deterministic generator `scripts/generate-og-images.js`.
- Generated six branded SVG social preview cards under `media/og/`: homepage, workflow exchange, community bot, newsletter issue #001, templates, and experiments.
- Wired page-specific `og:image` and `twitter:image` metadata into static pages and generated workflow/Phase 2 surfaces.
- Extended site smoke test to fail on missing or broken social preview metadata.

---

## Phase 2 completion summary

Phase 2 activation surfaces are complete: workflow worksheets, first newsletter archive, experiments board, and page-specific social preview cards are shipped and validated.

## Recommended next sprint

1. ✅ `WEB-GROWTH-T23` — lightweight conversion dashboard/export for privacy-safe events: workflow views, worksheet downloads, newsletter clicks, community-bot setup clicks, and workflow submissions.
2. ✅ `WEB-GROWTH-T24` — second newsletter issue from actual shipped experiments and archive index cards.
3. ✅ `WEB-GROWTH-T25` — workflow submission moderation queue/spec so community contributions can become public pages safely.

# EPIC-WG-07 — Measurement Operating Loop

Priority: P0/P1
Status: done

## Goal
Turn the public website from tracked pages into a weekly operating system: clear KPIs, privacy-safe exports, and decision rules for what to promote, improve, or archive.

## Tickets

### WEB-GROWTH-T23 — Add lightweight conversion dashboard/export
Priority: P0
Status: done
Dependencies: [WEB-GROWTH-T18, WEB-GROWTH-T22]

**Scope**
- Add `/metrics/` public dashboard page.
- Generate a privacy-safe event inventory from public HTML CTA metadata.
- Add a CSV export template for weekly GA/manual aggregation.
- Keep the export schema free of PII, raw links, message bodies, phone numbers, and email addresses.

**Acceptance criteria**
- `/metrics/` explains KPI map, event taxonomy, export fields, and weekly operating loop.
- `data/conversion-events.json` lists event names, CTA IDs, page paths, audience segments, and workflow categories only.
- `data/conversion-dashboard-template.csv` provides a manual aggregation template.
- Site smoke covers the new dashboard and local references.

**Validation**
- `node scripts/generate-metrics.js --check` passes.
- `node scripts/site-smoke-test.js` passes.
- `python3 -m json.tool data/conversion-events.json` passes.
- `grep` confirms no raw `link_url` tracking in public HTML.

**Evidence**
- Added deterministic generator `scripts/generate-metrics.js`.
- Generated `/metrics/`, `data/conversion-events.json`, and `data/conversion-dashboard-template.csv`.
- Added `/metrics/` to sitemap and linked it from `/experiments/`.
- Inventory currently discovers 554 CTA/event definitions across public HTML and flags zero unapproved event names.
- Dashboard reinforces aggregated-only export rules: no WhatsApp text, email addresses, phone numbers, raw URLs, user IDs, IPs, or device identifiers.

---


### WEB-GROWTH-T24 — Publish newsletter issue #002 and archive cards
Priority: P1
Status: done
Dependencies: [WEB-GROWTH-T20, WEB-GROWTH-T23]

**Scope**
- Add `/newsletter/issue-002/` using actual shipped experiments.
- Add archive cards to `/newsletter/` for issue #001, issue #002, and the measurement loop.
- Keep traction claims honest; state MRR as `$0` when true.

**Acceptance criteria**
- Issue #002 is public, indexable, and in sitemap.
- Newsletter landing page links to both public archive issues.
- Issue #002 references shipped surfaces: templates, metrics, moderation, and measurement rules.
- No fake user counts, testimonials, or revenue claims.

**Validation**
- `node scripts/site-smoke-test.js` passes.
- Live smoke confirms `/newsletter/issue-002/` and newsletter archive cards.

**Evidence**
- Added `/newsletter/issue-002/` with the 3-2-1 format: templates, privacy-safe metrics, moderation path, community ask, and honest experiment update.
- Updated `/newsletter/` with archive cards for issue #001, issue #002, and the metrics operating loop.
- Added issue #002 to sitemap.

---

### WEB-GROWTH-T25 — Add workflow submission moderation queue/spec
Priority: P1
Status: done
Dependencies: [WEB-GROWTH-T23]

**Scope**
- Add public moderation/spec page for submitted workflows.
- Add a queue CSV template for internal review.
- Link moderation process from `/submit-workflow/`.
- Define hard-reject rules, redaction rules, contributor approval, and publish conditions.

**Acceptance criteria**
- `/submit-workflow/moderation/` explains intake, redaction, safety review, editorial draft, contributor approval, and publish/measure stages.
- `data/workflow-moderation-queue-template.csv` exists and contains no real submitter data.
- Submission page links to the moderation process.
- The moderation spec explicitly forbids auto-publish.

**Validation**
- `node scripts/site-smoke-test.js` passes.
- `grep` confirms no raw private destinations in generated moderation data.
- Live smoke confirms moderation page and CSV template.

**Evidence**
- Added `/submit-workflow/moderation/` with staged moderation process and hard-reject rules.
- Added `data/workflow-moderation-queue-template.csv` with sample-only fields.
- Updated `/submit-workflow/` to link the moderation process.
- Added moderation route to sitemap.

---

## Epic completion summary

`EPIC-WG-07` is complete: the site now has a privacy-safe conversion dashboard/export, newsletter issue #002/archive cards, and a submission moderation queue/spec that closes the measurement operating loop.

## EPIC-WG-08 — Community contribution engine

Priority: P1
Status: in progress

## Goal
Turn the website from a static seed-content library into a repeatable contribution loop: submitted workflows can be reviewed, approved, published, mentioned in newsletter issues, and measured without leaking private data or inventing fake community activity.

## Success criteria
- Newsletter archive scales from structured data instead of hand-editing the landing page every issue.
- Moderation data can be checked for blocked words and PII-like patterns before any publish step.
- Approved workflow submissions have a deterministic path into generated workflow pages, templates, and newsletter mentions.
- Contributor approval remains explicit; no auto-publish.

### WEB-GROWTH-T26 — Add newsletter issue archive generation
Priority: P1
Status: done
Dependencies: [WEB-GROWTH-T24]

**Scope**
- Add structured newsletter issue data.
- Add a generator for `/newsletter/` and `/newsletter/<issue>/` pages.
- Update sitemap generation to read issue routes from data instead of hardcoding every issue.
- Add smoke coverage so every issue data row has a generated page and archive link.

**Acceptance criteria**
- `data/newsletter-issues.json` is the source of truth for public archive issue cards and pages.
- `scripts/generate-newsletter.js` regenerates the archive landing page plus issue pages.
- `scripts/generate-blog.js` includes newsletter issue sitemap URLs dynamically.
- Site smoke fails if an issue has no generated page, archive link, valid slug/date, or contains phone-like raw identifiers.

**Validation**
- `node scripts/generate-newsletter.js` passes.
- `node scripts/site-smoke-test.js` passes.
- `node scripts/generate-blog.js` keeps issue pages in sitemap.

**Evidence**
- Added `data/newsletter-issues.json` with issue #001 and #002 metadata/content.
- Added `scripts/generate-newsletter.js`; regenerated `/newsletter/`, `/newsletter/issue-001/`, and `/newsletter/issue-002/`.
- Updated sitemap generation to map newsletter issues from data.
- Added newsletter data/page/archive privacy checks to `scripts/site-smoke-test.js`.

## Recommended next epic

1. Continue `EPIC-WG-08` with `WEB-GROWTH-T27` — moderation smoke checks for blocked words/PII-like patterns in generated workflow submissions.
2. Add a contributor approval record template that can connect moderated submissions to newsletter mentions and workflow pages.
3. Add a generated contributed-workflow preview page that remains `noindex` until approval.


## Notes
- This backlog is website-first. Runtime/community-bot platformization remains in `tickets/COMMUNITY-BOT-PLATFORM.md` and related runtime tickets.
- Every public claim should be grounded in real examples or framed as an experiment.
- Do not publish fake community activity. Seed content is fine; fake users/testimonials are not.
- Prefer small visible launches over hidden platform rewrites.
