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
      item instead of appending. For Fathom it is the **numeric call id**
      (`fathom:811632934`), never the share token from the URL: the token is a
      revocable credential, and one call filed under both is two records
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
      even though the platform would accept it. This is also the last cheap
      moment to get it right: the client is not part of the dedupe key, and a
      re-file cannot move a communication whose client is already resolved —
      after this, fixing it is a person's job in the queue's client picker

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

**One failure is not a retry.** When the platform answers

```
That thread ("fathom:811632934") is already filed against Coastal Spine & Pain.
```

the thread id you sent belongs to another client's conversation, and nothing was
written. Do not re-send it without the client, do not mint a variation of the id
to slip past it, and do not file it unattributed. Say it to the user, naming the
client the platform named. Either the id was reused and this conversation needs
its own, or the attribution is genuinely in dispute — and that is a person's
call in the queue, where changing the client moves the suggestions with it.

## Reading the result

**Report from the response, never from your plan.** This is a hard rule. What
you meant to send and what the platform recorded are two different things, and
only one of them is true for whoever reads your report.

It has already failed exactly here: the plugin told a user
*"Client: Client 3 (you picked it; verified against its ClickUp folder)"* — its
own plan, printed as the outcome — while `file_communication` had returned
Client 4, which is where the communication actually went. The plan was a
sentence the model wrote; the response was what happened.

So before you say anything, read what came back:

- **`clientId` differs from the one you sent** — lead with that. Do not report
  success and mention it afterwards: the client is the first thing your report
  claims, and it was wrong.
- **`threaded: true` when you expected a new record** — say it appended to an
  existing communication rather than creating one.
- **`suggestions` and `matched`** — quote the returned numbers, not the ones you
  intended to send. Keys that no longer resolve are demoted silently, so
  `matched` is routinely lower than your plan.

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

Same thread id, **same client**. The client is not part of the dedupe key, and
the platform refuses a filing whose thread id already belongs to somebody else
rather than appending it — so a re-file under a different `clientId` writes
nothing and comes back as the error above, naming the client that owns the
thread. Filing one conversation for two clients on purpose is the exception that
puts the client in the thread id (`fathom:<call id>:<clientId>`);
`read-communication` has the rule and what it costs.

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
