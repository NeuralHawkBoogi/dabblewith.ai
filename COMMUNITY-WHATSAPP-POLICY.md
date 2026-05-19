# dabblewith.ai WhatsApp Access Policy

## Goal
The dedicated dabblewith.ai WhatsApp number should be useful to everyone, but operationally safe.

It has two modes:

1. **Community mode** — available to normal members
2. **Admin mode** — available only to Boogi (`+919566112518`)

## Community mode: allowed for members
Members may use the dedicated WhatsApp number to:

- Register interest in dabblewith.ai
- Ask what the community is about
- Ask for upcoming sessions
- Vote/signal interest for a session topic
- Request session reminders
- Ask for links to public resources, blog posts, recaps, and playbooks
- Share topic ideas or practical AI problems they want covered
- Ask FAQs about joining, format, cost/free status, location/online format, and community rules

Community members should **not** get access to private files, server state, exec commands, infrastructure, personal memory, private Neosapien data, private WhatsApp chats, or admin-only decisions.

## Admin mode: Boogi only
Only Boogi (`+919566112518`) may trigger privileged operations, including:

- Running exec/tool commands
- Updating site files or deployment state
- Creating/changing cron jobs
- Changing WhatsApp/channel config
- Reading private workspace files or memory
- Managing member exports/admin reports
- Sending broadcasts to members
- Approving public announcements
- Closing/opening operational tickets

## Command gating rule
Before any privileged action, the assistant must check the inbound sender E.164.

- If sender is `+919566112518`: admin command may proceed if otherwise safe.
- If sender is anyone else: refuse privileged action and offer a safe public alternative.

Example refusal:

> I can help with community info, registration, sessions, and public resources. Admin/server actions are restricted to the community owner.

## Recommended OpenClaw channel shape when dedicated number is ready
Use a separate WhatsApp account id, e.g. `dabblewith`.

High-level behavior:

```json5
{
  channels: {
    whatsapp: {
      accounts: {
        dabblewith: {
          enabled: true,
          dmPolicy: "open",
          allowFrom: ["*"],
          groupPolicy: "allowlist",
          groupAllowFrom: ["+919566112518"],
          groups: {
            "*": { requireMention: true }
          }
        }
      }
    }
  }
}
```

Important: Open public DMs only after the runtime prompt/agent policy clearly gates tools by sender.

## Public intake fields
When someone registers, capture:

- Name
- WhatsApp number
- City/timezone
- Role/background
- AI skill level
- Interests/topics
- Preferred session format
- Consent to receive reminders
- Source/referral if available

## Data minimization
Store only what is needed for community operations. Do not expose member data publicly. Aggregate signals for public pages.

## Safe public commands
Suggested commands:

- `join` — register interest
- `sessions` — list upcoming/proposed sessions
- `vote <topic>` — signal interest
- `topics` — show topic queue
- `blog` — send latest blog/playbook links
- `help` — explain available commands

## Admin-only commands
Suggested commands:

- `admin refresh site`
- `admin publish blog`
- `admin broadcast <message>`
- `admin close ticket <id>`
- `admin run <approved operation>`

Admin commands should never be executed for non-Boogi senders.
