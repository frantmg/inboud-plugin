---
name: file-communication
description: File a normalized communication and its suggested tasks into Macallan Onboarding with the file_communication MCP tool, check the payload before sending, and read the result back correctly. Use as the last step of intake, when re-filing a thread that has new replies, or when the user asks to push a prepared payload into the queue.
---

# Filing it

One tool call, `file_communication`, with the envelope from
`read-communication` and the suggestions from the extraction, matching and
routing steps. The full field contract is `reference/ingest-payload.md`.

## Check before you send

Run this list. Each of these has a specific consequence in the app, and all of
them are cheaper to fix now.

- [ ] `externalThreadId` set — without it, the next reply mints a second queue
      item instead of appending
- [ ] `occurredAt` is ISO 8601 **with an offset**, and is when the client said
      it, not when you were shown it
- [ ] participant handles are bare email addresses and E.164 phone numbers —
      this is how attribution finds the client
- [ ] every suggestion has a `sourceExcerpt` quoted from the transcript
- [ ] every **matched** suggestion's `serviceKey`/`stepKey` came from
      `get_service` in this session, both present, copied verbatim
- [ ] every **unmatched** suggestion has a `team`, spelled as the team **name**
      from `list_teams`
- [ ] no patient identifiers in any title or description
- [ ] exactly one participant with `role: "owner"`, and they are a Macallan
      person — established or confirmed, never defaulted to the token holder
- [ ] a verified `clientId` — derived from the thread or picked from the
      ClickUp folders. This plugin does not file a communication without one,
      even though the platform would accept it

## Making the call

```
file_communication({
  channel, externalThreadId, occurredAt, participants,
  subject, transcript, summary,
  clientName,                 // or clientId, or neither
  suggestions: [ { title, description, serviceKey, stepKey, team, confidence, sourceExcerpt } ]
})
```

Call it **once**. If it fails, fix what it complained about and call it again
with the same `externalThreadId` — that is safe by design.

## Reading the result

```json
{
  "communicationId": "…",
  "clientId": "…",
  "attribution": "hint" | "name" | "contact" | "unresolved",
  "threaded": true,
  "suggestions": 7,
  "matched": 5,
  "filedToProjectId": null,
  "queued": true
}
```

- **`attribution: "unresolved"`** — should not happen if you sent a verified
  `clientId`, so treat it as a signal that the id was wrong rather than
  shrugging at it. Re-establish the client with `pick-client` and re-file with
  the same thread id. Never retry with a guessed name.
- **`attribution: "hint"`** — the normal result when you passed a `clientId`
  you resolved from a ClickUp folder.
- **`threaded: true`** — this appended to an existing record rather than making
  one. Correct behaviour when you are filing a reply. Unexpected on a first
  file: it means that thread id was already known.
- **`queued: true`** — it is waiting at `/inbound` for a person.
- **`filedToProjectId` set** — the platform auto-filed it onto a project
  without queueing, which happens only when there was nothing to review and the
  client had exactly one active project. A communication carrying suggestions
  always queues, so if you filed suggestions and see an id, something is off
  worth mentioning.
- **`matched` lower than you expected** — keys that do not resolve against the
  live catalog are demoted to unmatched silently. Re-check them against
  `get_service` and re-file with the same thread id.

## What to tell the user, and what not to

Say: filed, against which client (or unresolved), how many suggestions and how
many matched, and that it is waiting at `/inbound`.

Do **not** say tasks were created, work was started, a project exists, or
anything reached ClickUp. None of that happened. Suggestions are proposals in
`task_candidates`; they become tasks when a person accepts them, and they
become ClickUp tasks when a person pushes a project summary. This plugin cannot
do either, deliberately.

## Re-filing a thread

New replies on a thread you already filed: re-file with the **same**
`externalThreadId` and the **full** thread as the transcript, with the full
suggestion list. The platform replaces the *pending* suggestions and leaves
anything already accepted or dismissed untouched, so nobody's earlier decision
is undone.

## When there is no MCP connection

The plugin ships a script that posts the same payload to
`POST /api/inbound/communication` using `MACALLAN_URL` and `INBOUND_API_TOKEN`:

```bash
node "${CLAUDE_PLUGIN_ROOT}"/scripts/file-communication.mjs payload.json
node "${CLAUDE_PLUGIN_ROOT}"/scripts/file-communication.mjs payload.json --dry-run
```

`--dry-run` validates locally and sends nothing.

It is the same schema, the same attribution and the same dedupe — but it cannot
read the catalog, so everything filed through it is unmatched and needs a team
on every suggestion. Use it only when the connector is genuinely unavailable,
and tell the user the matching is missing.
