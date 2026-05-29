# Casagrand First City Recovery Closeout Kit

Date: 2026-05-29
Public page: `https://dabblewith.ai/casagrand-firstcity/recovery-closeout/`

## Why this exists

The live privacy-safe campaign report still shows one qualified Casagrand resident signal after owner/test exclusion, but the signal is now ~90 hours stale and there is no recovery/referral tracker evidence. Repeating the same follow-up risks looking like chasing. A broad IT-group post is still too early because there are not yet three concrete resident signals or a qualified group-owner/admin signal.

The closeout kit gives Boogi a clean way to:

1. Close the stale first-responder loop once without pressure.
2. Restart discovery with a fresh six-person warm seed batch.
3. Track only privacy-safe last4 outcome rows using the dedicated fresh-seed tracker.
4. Route any reply to QA walkthrough, Excel walkthrough, founder workflow sample, referral sprint, date lock, bot readiness, or group-owner pilot.

## Operating rule

Use this kit when either condition is true:

- the first responder is 72h+ stale with no sample, referral, topic vote, or group-owner intro; or
- the recovery batch has been sent and the 24-hour report shows no concrete replies.

Do not use it to repeatedly chase the same person. It is a one-time closeout plus fresh seed batch reset.

## Copy-ready closeout message

```text
Quick closeout on this — I am parking the Casagrand AI-by-doing pilot unless there is a concrete task people want solved.

If useful, reply with just one line:
1) a QA/coding task,
2) an Excel/office workflow,
3) a job/interview prep need, or
4) a WhatsApp group admin pain.

No pressure if not relevant. I am only collecting practical use cases, not adding anyone to a spam group.
```

## Fresh six-person seed batch

Send only to warm names, not a public group:

1. QA/dev/student resident — ask for one test-case, bug-triage, or coding assistant task.
2. QA/dev/student resident — ask for one portfolio, interview, or coding workflow.
3. Excel/operations resident — ask for one spreadsheet cleanup or report task.
4. Excel/operations resident — ask for one email, proposal, or research task.
5. Founder/freelancer/consultant resident — ask for one sales, admin, or research workflow.
6. Real group-owner/admin — ask for one repetitive WhatsApp group admin pain.

Close every positive reply with:

```text
Can you intro one Casagrand resident who has a similar task?
```

## Tracker/report command

Use the public scorecard at `https://dabblewith.ai/casagrand-firstcity/fresh-seed-scorecard/` while filling this tracker.

```sh
mkdir -p private
node scripts/casagrand-campaign-report.js --write-fresh-seed-batch-template private/casagrand-fresh-seed-batch.json
node scripts/casagrand-campaign-report.js --runtime-dir /home/clawdbot/dabblewith-whatsapp/data --date 2026-05-29 --exclude-last4 2585 --manual-tracker private/casagrand-fresh-seed-batch.json
```

## Privacy rules

Track only:

- last4
- segment
- problemType
- outcome
- nextAction

Never store:

- full phone numbers
- names
- message bodies
- screenshots
- group names/member lists
- message IDs
- tokens
- raw webhook payloads

## Route after the seed batch

| Evidence after 24h | Next route |
| --- | --- |
| 0 replies or only polite interest | Park broad Casagrand launch; continue organic 1:1 discovery only. |
| 1 QA/dev or Excel task | Run the matching QA or Excel walkthrough and ask for one referral. |
| 2+ similar workflow tasks | Create a micro-demo proof asset, then invite a 20-minute walkthrough. |
| 3+ concrete resident signals | Move to date poll/date lock; broad IT-group post becomes safer. |
| 1 real group-owner/admin pain | Move to bot readiness or group-owner pilot; price probe only privately after qualification. |

## Growth principle

This is a stop-loss and reset kit. It protects trust in the Casagrand community while keeping the Get a Community Bot validation path alive through actual group-owner pain signals, not speculative public pricing or broad announcements.
