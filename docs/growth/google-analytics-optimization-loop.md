# Google Analytics optimization loop

Status: active automation configured on 2026-05-20; OAuth token refresh fixed on 2026-05-21.

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

## OAuth/token status
- Fixed on 2026-05-21: `/oauth/callback/` now exchanges Google OAuth codes server-side and stores the refresh token outside git.
- Report pulls should set `DABBLE_GA_PROPERTY_ID=538311897` and can use the default repo-local token path.
- Google Analytics Data API pulls are verified working for property `538311897`.
