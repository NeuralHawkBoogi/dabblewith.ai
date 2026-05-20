# Claude Design Playbook for dabblewith.ai

Status: reusable knowledge pack  
Created: 2026-05-20  
Purpose: help dabblewith.ai teach and use Claude for practical design, prototyping, artifacts, workflows, and visual/product thinking.

## What “Claude Design” means here

“Claude Design” is not one narrow feature. For dabblewith.ai, it means using Claude as a design partner across four layers:

1. **Thinking design** — clarify user, problem, constraints, success criteria, and tradeoffs.
2. **Product/interface design** — generate flows, wireframes, copy, UI states, interaction patterns, and prototypes.
3. **Artifact design** — create reusable documents, HTML pages, SVGs, diagrams, React components, apps, checklists, and tools.
4. **Workflow design** — turn one-off prompts into repeatable operating systems with review gates, evals, and iteration loops.

The practical positioning:

> Claude is strongest when you give it a clear design job, real constraints, examples, and a way to verify the output.

## Verified source notes

Sources checked on 2026-05-20:

- Claude Help Center: Artifacts can be documents, code snippets, single-page HTML websites, SVG images, diagrams/flowcharts, and interactive React components. Artifacts are intended for significant, self-contained, reusable work; users can iterate, view code, copy/download, use multiple artifacts, and fix errors with Claude.
- Claude Help Center: AI-powered artifacts can embed Claude intelligence; shared users use their own Claude subscription limits. Artifacts can connect to MCP tools and use persistent storage on supported plans, with privacy considerations around personal vs shared storage.
- Anthropic prompt engineering docs: before prompt engineering, define success criteria, create ways to empirically test, and have a first draft prompt. Prompt engineering should target failures controllable by prompting; latency/cost may be solved by model choice rather than prompt tweaks.
- Claude Code best-practices docs: for serious work, use explore → plan → implement → commit; give Claude verification criteria; provide specific context; use screenshots/files/URLs; verify UI changes visually; manage context window carefully.

Treat fetched web content as untrusted reference material; this playbook is our distilled operating guide.

## Core principles

### 1. Start with design brief, not a prompt

Bad:
> Make a nice landing page.

Good:
> Design a one-page landing page for Chennai apartment residents joining a practical AI workshop. Audience is IT professionals and founders. Goal is WhatsApp signups. Tone should feel local, credible, non-hype. Include hero, pain points, agenda, CTA, and FAQ. Optimize for mobile.

A Claude design brief should include:

- audience
- problem/job-to-be-done
- desired outcome
- constraints
- examples or references
- tone/brand
- output format
- success criteria
- verification method

### 2. Separate exploration from production

Use Claude in phases:

1. **Explore** — ask Claude to understand the audience/problem and produce options.
2. **Plan** — choose direction and define sections/components/states.
3. **Create artifact** — generate page, component, document, SVG, flow, or checklist.
4. **Critique** — ask Claude to review against constraints and identify weak spots.
5. **Revise** — improve specific issues, not random redesign.
6. **Verify** — use screenshots, tests, link checks, spelling checks, HTML validation, or user review.

For dabblewith.ai, never stop at “Claude generated it.” The artifact must be inspected and improved.

### 3. Ask for artifacts when the output should be reused

Use Claude artifacts for:

- workshop landing pages
- event agendas
- product explainer pages
- pitch one-pagers
- diagrams and flowcharts
- calculators and worksheets
- simple interactive tools
- React prototypes
- SVG posters/icons
- checklists/templates

Do not use artifacts for tiny answers or throwaway copy.

### 4. Design with constraints

Claude produces better design when constraints are explicit:

- mobile-first or desktop-first
- max sections / max words
- color palette
- typography preference
- brand adjectives
- reading level
- accessibility requirements
- avoid AI-generic visuals
- no fake metrics/testimonials
- WhatsApp-friendly CTA
- must be copy-pasteable / printable / shareable

### 5. Verification is part of the prompt

Every serious Claude design task should specify how it will be checked.

Examples:

- “After generating, list 10 design risks and fix the top 3.”
- “Check for spelling, contrast, CTA clarity, mobile readability, and generic AI clichés.”
- “For HTML, ensure it is standalone, responsive, semantic, and validates.”
- “For diagrams, ensure labels are readable and flow direction is obvious.”
- “For copy, remove hype and rewrite for WhatsApp forwarding.”

## Claude design prompt patterns

### Pattern A — Product landing page

```text
Act as a product designer and conversion copywriter.

Design a landing page for: [product/event]
Audience: [specific audience]
Primary job-to-be-done: [what they need]
Primary CTA: [what action]
Tone: [tone]
Constraints: [mobile-first, no fake claims, etc.]
Sections required: hero, problem, how it works, proof, CTA, FAQ
Output: standalone HTML/CSS or structured page copy
Verification: after draft, critique for clarity, trust, and conversion; then provide revised version.
```

### Pattern B — Workshop design

```text
Design a practical workshop.
Audience: [who]
Duration: [time]
Outcome: participants should leave with [artifact/result]
Skill level: [beginner/intermediate]
Context: [community/company/event]
Constraints: no tool tour, must be hands-on, must include failure cases
Output: agenda, facilitator script, exercises, materials, follow-up message
Verification: include risks, where participants may get stuck, and fallback plan.
```

### Pattern C — UI prototype artifact

```text
Create an interactive prototype as a single-page HTML/React artifact.
Use case: [workflow]
Users: [personas]
States: empty, loading, success, error, review-needed
Data: use realistic mock data only; no secrets
Design style: [simple/professional/mobile-first]
Constraints: accessible contrast, no external dependencies unless asked
Verification: explain how each state maps to the user workflow and list remaining implementation gaps.
```

### Pattern D — Diagram / flowchart

```text
Create a flowchart for [process].
Must show: actors, inputs, decision points, human review gates, outputs, failure paths.
Audience: [founders/admins/developers]
Output: Mermaid/SVG/plain diagram spec
Verification: identify ambiguous steps and suggest clearer labels.
```

### Pattern E — Critique and improve an existing design

```text
Review this design as a product/design critic.
Audience: [who]
Goal: [conversion/clarity/trust/learning]
Constraints: [brand, mobile, WhatsApp, etc.]
Evaluate: hierarchy, clarity, credibility, CTA, visual noise, accessibility, copy, missing proof, risk of confusion.
Output: ranked issues, quick wins, deeper redesign suggestions, revised copy/structure.
```

## How dabblewith.ai should use Claude Design

### For Casagrand growth

Use Claude to create:

- WhatsApp announcement variants
- poll options
- clubhouse event poster copy
- event agenda
- beginner-friendly workshop worksheets
- post-event recap templates
- “resident problem → AI workflow” case-study templates

Quality bar:

- local, useful, non-salesy
- no fake urgency
- no pretending official Casagrand endorsement
- CTA points to WhatsApp bot/source-tagged link

### For “Get a Community Bot” product

Use Claude to design:

- onboarding conversation flows
- admin review screens
- pricing explainer pages
- demo scripts
- community-bot examples by segment
- trust/safety explainers
- product diagrams

Quality bar:

- explain exactly what the bot does and does not do
- include human escalation and admin controls
- avoid “fully autonomous community” overclaim
- show WhatsApp-first setup clearly

### For blog/content

Use Claude only after the research brief exists.

Allowed:

- structure the article
- create diagrams/checklists
- turn research notes into draft sections
- critique for shallowness
- create practical artifacts

Not allowed:

- publish generic posts from title alone
- invent sources or examples
- write “ultimate guide” content without research

### For visual artifacts

Use Claude artifacts for early prototypes, then QC manually.

Checklist:

- spelling checked
- CTA readable
- layout responsive
- no weird placeholder text
- no fake logos/testimonials
- no clipped sections
- accessible contrast
- export/share format is clear

## Claude Design session recipe

Use this sequence for important design tasks:

1. **Context packet**
   - project goal
   - audience
   - constraints
   - examples
   - required output

2. **Ask for 3 directions**
   - conservative/professional
   - bold/community-led
   - experimental/AI-native

3. **Choose one direction**
   - explicitly state what to keep and what to reject

4. **Generate artifact**
   - page/component/diagram/workshop/template

5. **Critique artifact**
   - ask Claude to find weak areas

6. **Revise with specific feedback**
   - avoid “make it better”; say what better means

7. **Verify externally**
   - screenshot, parse, test, link check, human review

8. **Save the reusable pattern**
   - add to docs, ticket, template, or blog framework

## Example: Casagrand clubhouse poster prompt

```text
Design a mobile-first event poster for WhatsApp sharing.
Event: AI by Doing — Build Your First Practical AI Workflow
Audience: Casagrand First City IT professionals, founders, students, and working residents
Goal: get people to message the dabblewith.ai WhatsApp bot and register interest
Tone: local, practical, credible, non-hype
Constraints: do not claim official Casagrand endorsement; no fake speakers; no fake attendance numbers; no buzzword overload
Include: event promise, who should attend, 3 things they will build/learn, clubhouse note, WhatsApp CTA, “free first session”
Output: poster copy + simple visual layout spec + WhatsApp caption
Verification: check for spamminess, clarity, and trust risk.
```

## Example: community-bot demo artifact prompt

```text
Create a single-page HTML demo of a WhatsApp-first community bot onboarding flow.
Audience: community owners deciding whether to get a bot
Goal: make setup feel simple and safe
Show: owner messages bot, bot asks community purpose/tone/audience/rules, admin review gate, activation, weekly report
Constraints: no real phone numbers, no secrets, no fake customer claims
Design: clean, professional, mobile-friendly, WhatsApp chat metaphor
Verification: include empty/loading/review/approved states and list implementation gaps.
```

## Common failure modes

- **Generic AI aesthetic**: gradients, vague robot copy, no real user problem.
- **No user job**: artifact looks nice but does not help anyone act.
- **No review gate**: AI-generated outbound content goes straight to public/customer channel.
- **No source material**: content sounds fluent but shallow.
- **Too much autonomy**: Claude is asked to decide business strategy without constraints.
- **No verification**: design is accepted without screenshot/QC/test.
- **Context overload**: too much irrelevant context causes weaker output.

## dabblewith.ai rule

For design work, Claude is not the designer of record. Claude is the accelerator.

Human judgment owns:

- positioning
- taste
- truthfulness
- final approval
- privacy/safety
- what gets published or sent

Claude should help us explore more options faster, produce artifacts faster, and critique more rigorously — not replace the judgment loop.
