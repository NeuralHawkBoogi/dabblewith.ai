# WhatsApp Runtime Billing Meter Flag

Runtime repo: `/home/clawdbot/dabblewith-whatsapp`

## Flag

`DABBLE_BILLING_METER_ENABLED=false` by default.

When enabled, the WhatsApp runtime loads `/home/clawdbot/dabblewith-ai/billing/meter.js` and writes monthly ledgers under `DATA_DIR/billing-ledgers` unless `DABBLE_BILLING_METER_DIR` overrides it.

Related env vars:

- `DABBLE_BILLING_METER_ENABLED` — opt-in billing metering switch.
- `DABBLE_BILLING_METER_DIR` — ledger storage directory.
- `DABBLE_BILLING_METER_PATH` — override path to the meter module.
- `DABBLE_BILLING_PLAN` — plan id for the runtime community, default `starter`.

## Metered records

- Inbound WhatsApp text events are recorded as `whatsapp_pass_through`, `billable=false`, `direction=inbound`.
- Outbound community bot replies are recorded as `ai_conversation`, `billable=true`, `direction=outbound`.
- Owner onboarding replies are recorded as `onboarding_workflow`, `billable=false`, `direction=outbound` until a reviewed activation flow is defined.

The meter stores sanitized community ids, hashed external references, router task/model metadata, token estimates, and INR cost estimates. It does not store raw WhatsApp message text, raw phone numbers, or access tokens.

## Backwards compatibility

The flag is disabled by default. With the flag off, production WhatsApp behavior and reply paths are unchanged.

`/healthz` exposes:

- `billing_meter_enabled`
- `billing_meter_available`

## Validation

```bash
cd /home/clawdbot/dabblewith-whatsapp
node --check server.js
node billing-runtime-smoke-test.js
curl -fsS http://127.0.0.1:8122/healthz

cd /home/clawdbot/dabblewith-ai
node billing/smoke-test.js
node billing/report-smoke-test.js
git diff --check
```

Note: activating the flag in production should be a separate authorized runtime change, ideally after checking the first ledger output on a synthetic inbound/outbound test.
