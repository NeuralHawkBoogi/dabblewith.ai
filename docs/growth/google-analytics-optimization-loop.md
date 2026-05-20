# Google Analytics optimization loop

Status: active automation configured on 2026-05-20.

## Cadence
- Daily at 10:00 IST via OpenClaw cron: `dabblewith.ai daily GA growth optimizer`.

## What the loop does
1. Pull last-7-day Google Analytics data.
2. Review top pages, channels, engagement, CTA clicks, and conversion/lead events.
3. Pick one safe, high-leverage site improvement.
4. Validate, commit, push, and report concise outcome.

## Current implementation
- Report script: `scripts/google-analytics-report.js`.
- Requires Google Analytics OAuth token/client paths via environment variables.
- Optional but recommended: set `DABBLE_GA_PROPERTY_ID` to avoid relying on the Google Analytics Admin API for property discovery.

## First improvement shipped
- Added `cta_click` GA event tracking across site CTAs, WhatsApp links, RSVP links, join links, and community-bot links.
- This makes the next analytics pass more useful because traffic can be connected to intent, not only pageviews.

## Known blocker
- Property discovery is currently blocked because the Google Analytics Admin API is disabled for the OAuth project used by the existing token.
- Fix options:
  1. Provide the GA4 numeric property ID for `G-7473LZQGX2`, or
  2. Enable Google Analytics Admin API for the OAuth project.

Once either is done, the daily loop can pull GA reports directly.
