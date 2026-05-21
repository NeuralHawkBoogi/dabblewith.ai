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
- Property discovery is blocked because the Google Analytics Admin API is disabled for the OAuth project used by the existing token.
- The previously discovered property ID `538311897` now reaches the Data API but returns `PERMISSION_DENIED`, so the OAuth user/client also needs access to the dabblewith.ai GA4 property before reports can run reliably.
- Fix options:
  1. Grant the OAuth user/client access to GA4 property `538311897`, and/or
  2. Enable Google Analytics Admin API for the OAuth project so property discovery does not depend on cached IDs.

Once access is fixed, the daily loop can pull GA reports directly.
