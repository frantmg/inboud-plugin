# Macallan Intake

A Claude plugin that turns something a client said — an email thread, a text
message conversation, a Fathom call, a phone call — into a reviewable **inbound
communication with suggested tasks** inside [Macallan Onboarding], grouped by
the team that would do the work.

A person then opens `/inbound`, accepts what is real, and starts or extends a
project from it. That review is the point of the whole thing.

A signed **Statement of Work** takes the other route: `sow` reads it and builds
the **draft project** it describes, with every task staged and routed to its
team, for a person to review and push.

## What it does

```
email / SMS / Fathom link / phone call
        │
        ├─ read it            normalize into one envelope: channel, thread id,
        │                     time, participants, transcript, summary
        ├─ load the catalog   live services, tickets, teams, categories
        ├─ extract the work   one item per unit of work, each quoting the
        │                     words it came from
        ├─ match              (serviceKey, stepKey) where a ticket covers it
        ├─ route              a team on everything that stayed unmatched
        ├─ brief creative     Creative work in the fixed creative brief format
        ├─ ask what's missing the client, the owner, and when a phone call was
        └─ file it            one file_communication call
                                    │
                              waiting at /inbound
```

And from an SOW:

```
signed SOW (PDF / Word / text)
        │
        ├─ read it            header, deliverables per phase, timeline,
        │                     budgets, exclusions, client responsibilities
        ├─ client + owner     from the ClickUp folders; the owner is asked
        ├─ work items         one per deliverable a single team owns
        ├─ match + route      catalog ticket where one covers it, team otherwise
        ├─ map team lists     every team used has a list in the client's folder
        └─ build the draft    create_project → set_project_scope →
                              answer_brief_question → create_task → update
                                    │
                              summary screen, for a person to push
```

## What it deliberately cannot do

**A conversation or a ticket ends at `/inbound`. An SOW ends at a draft
project.** Neither reaches ClickUp.

- **It cannot create work from a conversation.** Suggestions land in
  `task_candidates` as proposals, and a person accepts them. Only a signed SOW
  stages tasks directly, because the client has already agreed to them.
- **Only `sow` creates a project, and only as a draft.** `comms` and `ticket`
  never call `create_project`, `set_project_scope` or `create_task`. A project
  for a conversation is built from the queue, which sweeps the filed
  suggestions onto it.
- **It cannot reach ClickUp.** Tasks get there when somebody pushes a project
  summary in the app. No tool in the connector pushes.
- **It cannot invent a client.** A client is its ClickUp folder. Every flow
  establishes a verified client — derived from the conversation where it can
  be, picked from the ClickUp folders where it cannot.
- **It does not edit the catalog.** Adding a ticket changes every future brief
  for every client. It reports what is missing instead.

## Install

```bash
/plugin marketplace add frantmg/inboud-plugin
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
/intake:sow       …attach or paste a signed SOW
/intake:catalog   …show the live services, tickets and teams
```

`comms` mines a whole conversation and derives the client from what is in it.
`ticket` files one known job and takes its client from the ClickUp folders
rather than from typed text. `sow` builds the draft project a signed SOW describes.
All three need a **client** and an **owner**, and those are what they stop and
ask you for, only when not already known. Beyond that: `comms` asks when a phone
call happened, `ticket` may ask once about missing creative specifics, and `sow`
asks which ClickUp list a team uses when it cannot tell by name. Everything else is derived, and none of them waits
for a "file this?" at the end. The review it would be asking for is the queue,
or the project's summary screen.

**Every Creative task** is written in one fixed brief format (Objective, Specs,
Resource, Deliverables, Acceptance, Handoff), whichever skill wrote it. Gaps are
marked `_Not captured_`, never guessed.

Or just paste the content and say what you want — the skills describe their own
triggers, so "file this call" and "what work does this email imply" both land
in the right place.

## What is in here

```
skills/
  comms/                 the conversation pipeline, the hard rules, the report
  ticket/                one known job; client + title + description required
  sow/                   a signed SOW → a draft project with staged tasks
  creative-brief/        the fixed format every Creative task is written in
  pick-client/           the ClickUp-folder client picker, shared by both
  read-communication/    email, SMS, Fathom, phone → one envelope; the dedupe key
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
  sow-worked-example.md  one signed SOW, end to end
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
