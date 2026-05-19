# WhatsApp Runtime Model Router Flag

The dabblewith.ai WhatsApp runtime can record model-router decisions and enforce budget/safety guardrails before calling the LLM agent.

Runtime repo: `/home/clawdbot/dabblewith-whatsapp`  
Site/platform repo: `/home/clawdbot/dabblewith-ai`

## Flags

Add these to the WhatsApp runtime environment when ready:

```bash
DABBLE_MODEL_ROUTER_ENABLED=false
DABBLE_MODEL_ROUTER_PATH=/home/clawdbot/dabblewith-ai/model-router/usage-store.js
DABBLE_MODEL_ROUTER_USAGE_DIR=/home/clawdbot/dabblewith-whatsapp/data/model-router-usage
DABBLE_MODEL_ROUTER_PLAN=starter
DABBLE_MODEL_ROUTER_PROVIDER=openai
```

`DABBLE_MODEL_ROUTER_ENABLED=false` preserves existing production behavior. When set to `true`, the runtime:

1. Classifies the incoming community message.
2. Records sanitized routing metadata and usage counters per community.
3. Enforces budget/safety degraded replies before the LLM agent call.
4. Adds sanitized router metadata to outbound logs.

The router stores token/cost estimates, task class, model tier, budget status, prompt-cache metadata, summary hashes, and context hashes. It must not store raw WhatsApp messages, raw full phone numbers, access tokens, or prompts.

## Validation

From `/home/clawdbot/dabblewith-whatsapp`:

```bash
node --check server.js
node model-router-runtime-smoke-test.js
curl -fsS http://127.0.0.1:8122/healthz
```

The public `/healthz` response exposes:

- `model_router_enabled`
- `model_router_available`

Do not enable the flag in production until one live tester validates reply quality and logs are inspected for leakage.
