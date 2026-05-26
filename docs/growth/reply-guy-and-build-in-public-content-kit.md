# Dabblewith.ai Reply-Guy + Build-in-Public Content Kit

Status: active
Owner: Boogi / dabblewith.ai
Related tickets: `WEB-GROWTH-T16`
Pairs with: `docs/growth/audience-acquisition-community-strategy.md`, `docs/growth/utm-link-conventions.md`, `/build-in-public/`
Last updated: 2026-05-26

## Goal

Give us repeatable templates so X / Indie Hackers / Substack engagement is high-signal, target-buyer-fit, and doesn't drift into vanity engagement. The point is *one reply that earns one subscriber who returns*, not 50 replies that earn zero.

## Operating principles

1. **Lead with specific value.** No "great post!" replies. No "DM'd."
2. **No promo in replies.** Don't drop a workflow link unless asked. Mention the site only when it directly answers the question.
3. **Reply where target buyers are**, not where the algorithm is loudest. Founders, creators, researchers, healthcare ops, no-code builders — that's the filter.
4. **Reply with examples, not abstractions.** A concrete sanitized workflow detail beats any clever line.
5. **One reply, then exit.** Don't farm threads.
6. **Mention failures honestly.** Replies that share what didn't work build trust faster than replies that show off.
7. **Track only at the link level.** Use UTM tags (`utm_source=x`, etc.) so we can see if reply-guy is actually returning traffic; never store the conversation, the handle, or any DMs.

## Vanity-metric warning

These numbers do *not* count as success on their own:

- Reply likes
- Reply views
- Follower growth from random posts
- "Notable" accounts engaging

These numbers count:

- Newsletter signups from `utm_source=x` / `utm_source=indie-hackers`
- Workflow submissions or community-bot setup clicks from those sources
- Conversations that lead to a partner CRM entry
- Repeat visits in the 14-day window (see retention spec)

If the vanity numbers go up and the second list stays flat, the reply-guy rotation is wrong.

## Target-buyer fit checklist (before replying)

Reply to a post **only if you can check at least 2**:

- [ ] The author is in one of our audience segments (founders, creators, researchers, healthcare/business ops, no-code).
- [ ] The post raises a real problem we have a published workflow for.
- [ ] The author is the kind of person who'd actually fork a workflow, not just bookmark it.
- [ ] The thread has fewer than ~30 replies (signal-to-noise is still tractable).
- [ ] The post is less than 24 hours old.

If you can't check 2, scroll on.

## 10 reply patterns

Replace `[X]`, `[Y]`, `[/workflows/...]` etc. with the specific detail.

1. **Specific failure mode.**
> Tried [X] for [Y] last quarter. The failure mode I didn't see coming: [specific failure]. What changed it for me was [specific fix, 1 line]. Happy to share the workflow we ended up using if useful.

2. **Workflow-level question.**
> Quick one — when you do [X], do you have a human-review step before [Y]? We do, because we hit [specific issue] once. Curious what your setup looks like.

3. **Cite a sanitized example.**
> Saw a version of [X] work for a [audience type] this month — sanitized example: [1-sentence detail]. The unlock was [1-line insight].

4. **Honest disagreement.**
> I'd push back gently on [specific claim] — in [our context], the opposite happened: [example]. Could be context-dependent though. What's the setup you tested in?

5. **Offer a forkable detail.**
> One concrete thing that helped us with [X]: [single tactic, 1-line]. Not a full workflow, just the one change that moved the number.

6. **Tooling honesty.**
> We tried [tool A] for [job]; [tool B] beat it for [reason]. Vendor demos didn't catch that — only running it on real sanitized inputs did.

7. **Privacy / safety note.**
> Worth flagging if you're going to ship this: anything involving [PHI / financial / minor users / etc.] needs [specific safeguard]. Asking because we walked into that once.

8. **Pre-empt the hype.**
> Useful framing — though I'd separate [X] (which works today) from [Y] (which still doesn't, even with the new models). Mixing them is what makes AI demos collapse.

9. **Cite a worked example from the site, only when it directly answers.**
> If it helps, the full workflow we use for [exact problem] is here: [/workflows/specific-slug/] — feel free to fork. Specific bit you might want: [1-line detail].

10. **Connect two people.**
> [@person A], have you seen [@person B]'s post on [related problem]? Pretty sure you two have the same workflow with different names.

## Weekly progress thread template (X / Indie Hackers / LinkedIn)

```
Week of YYYY-MM-DD — what shipped, what didn't.

Workflow published: [1-line, no link]
Workflow submitted (community): [count or 0]
Newsletter signups: [count or "baseline"]
Community-bot setup clicks: [count or 0]
MRR: $[number, including $0]

Experiment that worked: [1-line specific]
Experiment that flopped: [1-line specific, including what we'll change]

Asking for help with: [1 concrete ask, <5 min for the reader]

Full update: dabblewith.ai/build-in-public (no UTM in the post; the page itself is the canonical record)
```

Rules for the thread:

- Same shape every week.
- Never round numbers up.
- Never skip the "experiment that flopped" line. If nothing flopped, write "nothing flopped — which probably means I didn't try anything risky."
- Skip the thread the week you don't ship. Don't fake activity.

## Launch DM template — for 20-50 early engaged followers

For one-shot launches (workflow exchange v1, challenge, newsletter). Send manually, one at a time, **only to people who've explicitly engaged with our content already**. Never bulk-DM.

```
Hi [name] — small ask. We just published [the thing] at [link]. You're one of ~30 people whose feedback I trust on [topic]. Two questions:

1. Does the first 10 seconds of the page actually explain what it is, or am I deluding myself?
2. If you were going to share it with one person, who'd that be?

No need to repost or amplify — just tell me where the framing breaks. I'll send you what we ship as we go.

Thanks,
Boogi
```

Rules:

- Send fewer than 50 of these per launch. Quality > quantity.
- Never use it as a list-buy substitute. Only people who've already engaged.
- Always answer their reply within 24 hours.
- Don't auto-DM. Ever. Even if X adds the feature.

## Second DM template — partner-warm

For people we'd consider partner CRM candidates (per `docs/growth/partner-collaboration-crm.md`):

```
Hi [name] — your post on [topic] was the most concrete take I've read this week. We're running Dabblewith.ai, a small AI Builder's Exchange — workflows with explicit human-review points and a "what we'd never automate" line. Would you be open to me writing a guest workflow for your audience, picking from [the workflows we'd publish for their readers]? Reciprocal if you have a workflow you'd ship through us. No paid placement, honest disclosure either way. Reply here if open.
```

Rules:

- Maximum twice per partner. After two tries with no response, drop it for 90 days.
- Always offer first (guest workflow) before asking (their audience).

## What we will not do

- Pre-written reply scripts dropped en masse.
- Pretending to be more users than we are (no "we" when it's just one founder).
- Automated reply bots.
- Buying lists.
- Subscriber count brags without the failure column attached.
- Disguised affiliate placements.

## Review cadence

- Weekly: review which `utm_source=x` and `utm_source=indie-hackers` clicks resulted in newsletter / submit / community-bot events.
- Monthly: prune reply patterns that haven't returned a single signup in 30 days.
- After each launch: re-evaluate the launch DM template against actual response quality.
