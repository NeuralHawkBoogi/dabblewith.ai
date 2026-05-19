# WhatsApp Runtime Synthetic Send Guard

Runtime repo: `/home/clawdbot/dabblewith-whatsapp`

The WhatsApp runtime now has a pre-Graph send guard to avoid wasting real Meta API calls on malformed or synthetic test recipients.

## Behavior

`sendWhatsAppText(to, text)` now:

1. Normalizes recipients to digits only.
2. Rejects invalid WhatsApp recipient shapes before Graph API calls.
3. Dry-runs synthetic test recipients ending in `0000` or `0001` by default.
4. Sends real recipients unchanged, using normalized digits.

## Flag

```bash
DABBLE_DRY_RUN_SYNTHETIC_SENDS=true
```

Default is true. Set to `false` only if intentionally testing those recipient numbers against Meta Graph.

## Validation

From `/home/clawdbot/dabblewith-whatsapp`:

```bash
node --check server.js
node synthetic-send-smoke-test.js
curl -fsS http://127.0.0.1:8122/healthz
```

After authorized service restart, `/healthz` should include `dry_run_synthetic_sends`.
