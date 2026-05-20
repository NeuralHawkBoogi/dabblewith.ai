# dabblewith.ai Blog Writing Framework

Status: required for all new posts  
Owner: dabblewith.ai strategy + growth builder  
Created: 2026-05-20

## Why this exists

The blog should not be a daily generic AI-content machine. Shallow posts damage trust. dabblewith.ai is trying to become a practical, credible AI community; the blog must feel like it comes from people actually building, testing, hosting, and learning.

Every post must now start with a research brief and pass a quality gate before publication.

## Publishing principle

Publish fewer posts, but make every post useful enough that a founder, resident, student, or operator can do something concrete after reading it.

A good dabblewith.ai post should include:

- a specific audience
- a sharp thesis
- research from credible sources
- examples from real workflows or community operations
- a practical playbook/checklist/template
- tradeoffs and failure modes
- clear next action for the reader

## Required workflow

### 1. Pick a real reader and job-to-be-done

Before writing, define:

- Reader: who exactly is this for?
- Situation: what are they trying to do?
- Pain: what is confusing, expensive, slow, or risky?
- Desired outcome: what can they do after reading?
- Why dabblewith.ai has permission to write this.

Bad:
> founders should use AI agents

Good:
> first-time SaaS founders with no ops team need a repeatable workflow to turn raw customer calls into sales follow-ups, product insights, and weekly decisions.

### 2. Write a research brief before the article

Every serious post needs a brief containing:

- thesis
- reader/job-to-be-done
- search intent / distribution angle
- 5–8 credible sources or field inputs
- 3–5 non-obvious insights
- 2–3 examples or mini case studies
- risks / counterarguments
- practical artifact to include

Source mix target:

- at least 2 primary sources: vendor docs, research papers, official reports, product docs, pricing pages, standards, benchmark docs
- at least 1 practitioner source: founder/operator post, engineering blog, real case study, community example
- at least 1 opposing/critical angle
- at least 1 dabblewith.ai-specific source: WhatsApp signals, event notes, Casagrand campaign data, builder logs, internal experiment, or community use case

If web research is unavailable, the post must be marked `draft` or `research_pending`, not published.

### 3. Convert research into a point of view

Do not summarize sources mechanically. The post needs a stance.

Examples:

- “AI workshops fail when they optimize for tool demos instead of reusable artifacts.”
- “Founders should design agent workflows around review gates, not autonomy.”
- “Community bots need billing limits from day one because unlimited chat breaks margins.”
- “For local communities, WhatsApp is not a channel; it is the product surface.”

### 4. Use the article structure

Default structure:

1. **Problem / context** — why this matters now
2. **What people usually get wrong** — shallow assumptions to reject
3. **Research-backed insight** — what sources and real usage suggest
4. **Practical framework** — steps, table, decision tree, checklist, or template
5. **Worked example** — apply it to a real scenario
6. **Risks / tradeoffs** — what can fail and how to handle it
7. **How dabblewith.ai is applying it** — connect to community/product work
8. **Next action** — what reader should do now

### 5. Evidence standards

A post should not make broad claims without support.

Required:

- cite source names inline, even if not using formal footnotes
- date-sensitive claims must include checked date or version
- pricing/vendor claims must mention that prices can change
- numerical claims need source or label as estimate
- examples must be concrete: named workflow, input, output, decision, metric

Forbidden patterns:

- “AI is transforming everything” without specifics
- generic listicles with no original angle
- paragraphs that could fit any AI brand
- fake case studies
- unsourced statistics
- “ultimate guide” style without depth

### 6. Practical artifact requirement

Every post must include at least one artifact:

- checklist
- template
- prompt/workflow skeleton
- decision matrix
- evaluation rubric
- implementation plan
- worksheet
- cost model
- event agenda
- measurement dashboard

If there is no artifact, the post is probably not useful enough.

### 7. Quality rubric

Score each post before publishing. Minimum publish score: **80/100**.

| Area | Points | What good looks like |
|---|---:|---|
| Specific reader + problem | 10 | reader, situation, pain, outcome are clear |
| Original thesis | 10 | has a real stance, not generic advice |
| Research depth | 20 | 5+ credible sources/inputs, primary sources included |
| Practical usefulness | 20 | reader can apply a framework/artifact immediately |
| Examples/cases | 10 | includes concrete workflow or scenario |
| Tradeoffs/risks | 10 | explains failure modes, cost, privacy, quality risks |
| dabblewith.ai relevance | 10 | connects to actual community/product work |
| Writing quality | 10 | crisp, non-fluffy, structured, readable |

Automatic fail:

- no research brief
- no practical artifact
- no concrete example
- no risk/tradeoff section
- fewer than 900 words for an article claiming to be a guide
- source/pricing claims without source/date

### 8. Metadata schema for future posts

New blog entries should include these fields in `data/blog-posts.json` or a future MD/JSON format:

```json
{
  "status": "draft|research_pending|ready_for_review|published",
  "qualityScore": 0,
  "researchBrief": {
    "reader": "",
    "jobToBeDone": "",
    "thesis": "",
    "searchIntent": "",
    "sources": [
      { "title": "", "url": "", "type": "primary|practitioner|critical|internal", "checkedAt": "YYYY-MM-DD", "notes": "" }
    ],
    "insights": [],
    "examples": [],
    "risks": [],
    "artifact": ""
  }
}
```

### 9. Editorial calendar rule

The cron/builder should not publish a blog just because a date arrived.

Allowed actions:

- create research brief
- gather sources
- draft but keep unpublished
- improve old shallow post
- publish only if it passes the framework

Reporting should say:

- research done
- source count
- quality score
- artifact created
- published or held back with reason

## Immediate application

The existing shallow queued/published posts should be treated as raw outlines, not finished articles. Each must be rewritten through this framework before being used for serious distribution.
