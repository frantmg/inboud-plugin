# Macallan Intake

A Claude plugin that turns something a client said — an email thread, a text
message conversation, a Fathom call — into a reviewable **inbound communication
with suggested tasks** inside [Macallan Onboarding], grouped by the team that
would do the work.

A person then opens `/inbound`, accepts what is real, and starts or extends a
project from it. That review is the point of the whole thing.

## What it does

```
email / SMS / Fathom link
        │
        ├─ read it            normalize into one envelope: channel, thread id,
        │                     time, participants, transcript, summary
        ├─ load the catalog   live services, tickets, teams, categories
        ├─ extract the work   one item per unit of work, each quoting the
        │                     words it came from
        ├─ match              (serviceKey, stepKey) where a ticket covers it
        ├─ route              a team on everything that stayed unmatched
        ├─ show the plan      grouped by team, one confirmation
        └─ file it            one file_communication call
                                    │
                              waiting at /inbound
```

## What it deliberately cannot do

**Everything it does ends at `/inbound`.** There is no other destination.

- **It cannot create work.** Suggestions land in `task_candidates` as
  proposals. A person accepts them.
- **It cannot create a project.** `create_project`, `set_project_scope` and
  `create_task` are never called. A project is built from the queue, which
  sweeps the filed suggestions onto it — something this plugin could not do
  even if it made one.
- **It cannot reach ClickUp.** Tasks get there when somebody pushes a project
  summary in the app. No tool in the connector pushes.
- **It cannot invent a client.** A client is its ClickUp folder. Every flow
  establishes a verified client — derived from the conversation where it can
  be, picked from the ClickUp folders where it cannot.
- **It does not edit the catalog.** Adding a ticket changes every future brief
  for every client. It reports what is missing instead.

## Install

```bash
/plugin marketplace add <owner>/macallan-intake-plugin
/plugin install intake@macallan
```

You will be asked for one thing: the **MCP connection URL**.

Get it from **Configuration → Integrations** in Macallan Onboarding. Create a
connection with the **read** and **write** scopes and copy the URL it shows —
`https://<your-app>/api/connector/<token>`. The token is shown **once**; it is
hashed the moment it is stored and there is no second showing.

Configuring it by hand instead:

```bash
claude mcp add --transport http macallan-onboarding https://<your-app>/api/connector/<token>
```

Revoking is one click on the same screen, and takes effect on the next call —
the connector is stateless and re-authenticates every request.

## Use it

```
/intake:comms     …then paste the email, the messages, or a Fathom link
/intake:ticket    …one piece of work you already know about
/intake:catalog   …show the live services, tickets and teams
```

`comms` mines a whole conversation and derives the client from what is in it.
`ticket` files one known job and **always asks which client**, picking it from
the ClickUp folders rather than from typed text. Both require a **client**, an
**owner**, and — for a ticket — a title and a description. Both end at
`/inbound`.

Or just paste the content and say what you want — the skills describe their own
triggers, so "file this call" and "what work does this email imply" both land
in the right place.

## What is in here

```
skills/
  comms/                 the conversation pipeline, the hard rules, the report
  ticket/                one known job; client + title + description required
  pick-client/           the ClickUp-folder client picker, shared by both
  read-communication/    email, SMS, Fathom → one envelope; the dedupe key
  service-catalog/       loading the live catalog; what the shapes mean
  extract-work/          what counts as work, and what a good item looks like
  match-services/        when a ticket covers an ask, and when to leave it alone
  route-teams/           team on the ticket, team name on the suggestion
  file-communication/    the preflight, the call, reading the result
commands/
  catalog.md             thin alias; the skills own everything else
reference/
  ingest-payload.md      the field-by-field contract, both doors
  building-a-project.md  what a project needs, and why the queue builds it
  platform-model.md      the platform's rules, and why they exist
  worked-example.md      one Fathom call, end to end
  example-payload.json
scripts/
  file-communication.mjs fallback over POST /api/inbound/communication
```

There are no agents and no hooks. The work is one sequential pipeline over a
single conversation's context — a subagent would only put the transcript
somewhere the matching step cannot see it.

## The fallback path

If the MCP connector is unavailable, a prepared payload can go over the ingest
route directly:

```bash
MACALLAN_URL=https://app.example.com INBOUND_API_TOKEN=… \
  node scripts/file-communication.mjs payload.json

node scripts/file-communication.mjs payload.json --dry-run   # validate locally
```

Same schema, same attribution, same dedupe — but no catalog, so everything
filed this way is unmatched and every suggestion needs its own team.

## PHI

These are healthcare client conversations. Transcripts are retained
indefinitely and are the most sensitive column in the schema. Nothing from a
transcript belongs in a log, a commit message, a filename, an analytics payload
or a third-party request — and a suggestion's title and description describe
the work, never the patient.

[Macallan Onboarding]: #
