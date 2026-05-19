# WhatsApp Owner Onboarding Runtime Flag

Date: 2026-05-19
Ticket: `tickets/WHATSAPP-FIRST-ONBOARDING-STATE-MACHINE.md`
Runtime repo: `/home/clawdbot/dabblewith-whatsapp`

## What changed

The WhatsApp runtime has been prepared to route prospective community-owner messages into the onboarding state machine from this repo, but only behind an opt-in feature flag.

Runtime flags:

- `DABBLE_OWNER_ONBOARDING_ENABLED=false` by default.
- `DABBLE_OWNER_ONBOARDING_DIR` defaults to `<runtime DATA_DIR>/owner-onboarding`.
- `DABBLE_OWNER_ONBOARDING_COMMUNITY_ID` defaults to `owner-community-bot`.
- `DABBLE_ONBOARDING_ADAPTER_PATH` defaults to `/home/clawdbot/dabblewith-ai/onboarding/whatsapp-adapter.js`.

When enabled, the runtime routes text messages containing owner-intent phrases such as `community bot`, `setup bot`, `bot for my community`, `start onboarding`, or `get a bot` into `onboarding/whatsapp-adapter.js`. Existing onboarding sessions continue to resume based on the sender hash and community id.

## Backwards compatibility

- Production behavior remains unchanged while `DABBLE_OWNER_ONBOARDING_ENABLED` is unset or `false`.
- The normal dabblewith.ai community host path still handles all regular community messages.
- The runtime does not persist raw sender phone numbers in onboarding sessions; it uses the adapter's hashed owner id and masked phone suffix.
- The adapter only returns reply text; the runtime continues to use its existing WhatsApp outbound path and logs `mode: owner_onboarding_state_machine` for routed replies.

## Validation

Validated locally without enabling production onboarding:

```bash
cd /home/clawdbot/dabblewith-whatsapp
node --check server.js
# .env check showed DABBLE_OWNER_ONBOARDING_ENABLED is disabled/absent
curl -fsS http://127.0.0.1:8122/healthz
```

Service restart could not be performed from the cron runner because systemd restart requires interactive authentication in this session. The current running service remains healthy on the pre-restart code path.

## Activation checklist

Before turning this on for real testers:

1. Restart `dabblewith-whatsapp.service` from an authorized shell.
2. Verify `/healthz` includes `owner_onboarding_enabled:false` and `owner_onboarding_available:false|true` as expected.
3. Set `DABBLE_OWNER_ONBOARDING_ENABLED=true` only after deciding which community-owner number or trigger phrases should enter onboarding.
4. Send one controlled test message from Boogi's phone with a trigger phrase such as `I want a community bot`.
5. Confirm outbound log records `mode: owner_onboarding_state_machine` and onboarding JSON contains only hashed/masked owner identity.
