---
name: comms
description: Turn a whole client conversation into a filed inbound with suggested tasks. Use when the user pastes an email or email thread, a text message conversation, a Fathom share link or a call transcript from a healthcare client, or says anything like "file this call", "what work does this email imply", "put this in the queue", "make tasks from this". Runs the whole pipeline - read, extract, match to services, route to teams, file - and hands the result to a person to accept in Macallan Onboarding. For one known piece of work with no conversation behind it, use the `ticket` skill instead.
---

# A client conversation

One job: a conversation with a client arrives here — an email thread, a run of
texts, a recorded call — and a reviewable **inbound communication with
suggested tasks, grouped by team** ends up in Macallan Onboarding. A person then opens `/inbound`, accepts what is real, and starts or
extends a project from it.

## What this is not allowed to do

Three rules hold no matter what the user asks for. They are the reason the
platform trusts anything filed this way.

1. **Everything ends at `/inbound`.** Every route through this plugin finishes
   as a filed communication with suggested tasks, waiting for a person. There
   is no other destination.
2. **Nothing filed here is work.** Suggestions land in `task_candidates` and
   stay proposals until a person accepts one in the queue. Never tell the user
   tasks were created.
3. **Nothing reaches ClickUp, and no project is created.** `create_project`,
   `set_project_scope` and `create_task` are never called, and nothing in the
   connector can reach ClickUp at all. Tasks appear in a client's folder when
   somebody reviews a project summary in the app and presses push.
4. **A client is its ClickUp folder.** Never invent a client. The platform
   will accept an unattributed communication and let a person resolve it in the
   queue — **this plugin does not.** Every communication filed from here has a
   verified client on it, because the person who has the conversation in front
   of them can answer in one line what the queue would otherwise puzzle over
   later.

## What it must have before it can be filed

| | |
| --- | --- |
| **Client** | **Required.** Derived from the conversation where possible, asked for where not. |
| **Type** | **Required.** `email`, `fathom`, `sms` or `call`. |
| **Owner** | **Required.** The Macallan person accountable for it. Carried as a participant with `role: "owner"`. |

**The client and the owner are the only two questions this skill may ask**, and
only when the answer is not already in front of it. The type is read off the
shape of the input, never asked.

**Deriving the client is still the first attempt** — a thread carries a name,
an address or a number, and `list_clients` turns any of those into a record
without troubling the user. What has changed is the fallback: where attribution
comes up empty, **ask** rather than filing it unresolved. Use the `pick-client`
skill; it lists the ClickUp folders and resolves the chosen one to a verified
`clientId`.

`call` is not one of the platform's four channels — see `read-communication`
for how it is filed.

## The pipeline

Run these in order. Each step has its own skill with the detail; load it when
you get there rather than guessing.

| Step | Skill | Produces |
| --- | --- | --- |
| 1. Normalize the input | `read-communication` | channel, externalThreadId, occurredAt, participants, subject, transcript, summary |
| 2. Load the catalog | `service-catalog` | live services, tickets, teams, categories |
| 3. Extract the work | `extract-work` | a list of work items, each with a verbatim source excerpt |
| 4. Match to the catalog | `match-services` | serviceKey/stepKey on the items that are catalog work |
| 5. Route the rest | `route-teams` | a team name on every unmatched item |
| 6. File it | `file-communication` | one `file_communication` call, and what came back |
| 7. Report | this skill | the grouped plan, as the record of what went in |

Steps 2 and 1 are independent — load the catalog while you are still reading
the transcript if it saves a round trip. Everything else is sequential:
matching needs the catalog, routing needs to know what stayed unmatched.

## Ask only what is missing, then file

Two questions, and each one only when the answer is not already there:

| | |
| --- | --- |
| **The client** | Derive it first — a name, an address or a number in the thread, through `list_clients`. Ask with `pick-client` only where that comes up empty. |
| **The owner** | Named by the user already? Use it. Exactly one Macallan participant on the thread? Propose them in one line and take the yes. Several, or none? Ask. |

**Nothing else stops, and there is no "file this?" at the end.** The type comes
from the shape of the input, the matches come from the catalog, the teams come
from `list_teams` — none of those is a question, and none of them is improved
by asking.

The reason filing needs no permission of its own is that **filing is not
deciding**. Everything lands as a *pending* suggestion; a person accepts, edits
or dismisses each one at `/inbound`, and re-filing the same thread replaces
exactly those pending rows while leaving accepted and dismissed ones alone. The
review is the queue. A prompt in the terminal only moves it somewhere nobody
keeps a record of.

What still stops you is missing **evidence**, not missing permission: a Fathom
link that will not open is a stop — ask for the transcript — and a practice
with no ClickUp folder is a stop, because it is not a client yet.

## Reporting back

Print what was filed, grouped by team — that is how the queue's tray and the
eventual push both read it:

```
Fathom call - Coastal Spine & Pain - 12 Sep 2026
Client: Coastal Spine & Pain (matched on participant email)
Owner:  Sam Okafor
7 suggested tasks across 3 teams

Creative (3)
  - Rebuild the practice website on the new brand       web.website-build
  - Design the new patient intake one-pager             print.collateral
  - Refresh the logo lockup for signage                 unmatched

Marketing (2)
  - Launch the spine paid campaign for Q4               paid.campaign-setup
  - Set the monthly newsletter cadence to bi-weekly     email.cadence

Technology (2)
  - Wire the new intake form into GHL                   ghl.forms
  - Track booking conversions from the spine campaign   unmatched

Filed. Waiting at /inbound — nothing is work until somebody accepts it.
```

Then say four things and stop:

- the communication is filed, and against which client — named as ClickUp
  names it, and how the client was established (derived from the thread, or
  picked);
- how many suggestions, how many matched to the catalog;
- whether it queued at `/inbound` or was auto-filed onto a project (the
  platform auto-files only a communication with nothing to review and exactly
  one active project — a call proposing work always queues);
- what has **not** happened: no tasks, no ClickUp, no project.

## Things that go wrong, and what to do

**A Fathom link that will not open.** Do not guess at the contents. Ask for the
transcript — Fathom's "Copy transcript" — and carry on. See
`read-communication`.

**A reply to a thread you already filed.** File it again with the *same*
`externalThreadId` and the full thread. The platform appends rather than
duplicating, and replaces the pending suggestions while leaving anything
already accepted or dismissed alone. That is the correct move, not a problem.

**An unmatched suggestion you cannot route.** It still needs a team — an
unmatched suggestion with no team blocks the whole tray for the person
clearing the queue. Route it to the catch-all team (Operations in the default
org) and say in its description that the routing is a guess.

**A service that clearly should exist and does not.** Say so to the user. Do
not create it, and do not add a ticket to an existing service to force a match:
the catalog is shared by every future brief, and that is somebody's decision on
`/services` with the existing ones in front of them.

**No MCP connection configured.** `${CLAUDE_PLUGIN_ROOT}/scripts/file-communication.mjs`
posts the same payload over `POST /api/inbound/communication` with
`INBOUND_API_TOKEN`.
It cannot read the catalog, so everything it files is unmatched — use it only
when the connector is genuinely unavailable, and say that the matching is
missing.

## Building a project around it

**This plugin never creates one.** If the user asks, the answer is the queue:
"New project…" on the item at `/inbound` sweeps every pending suggestion onto
the project it creates, and there is no MCP tool here that accepts a candidate,
so a project made from this side would come out empty with the work stranded
behind it.

What a person needs when they build it: a verified client, **at least one
ticket**, the services any matched tickets belong to, and an **owner, always
asked**. `reference/building-a-project.md` has the reasoning and the rest.

## One known job, with no conversation behind it

That is the `ticket` skill, not this one. It asks which client every time and
picks it from the ClickUp folders, because a dictated ticket carries none of
the evidence — a name, an address, a number — that attribution derives from
here.

## PHI

These transcripts are healthcare client conversations. Do not copy transcript
text, patient identifiers or contact details into anything outside the payload:
not into commit messages, not into filenames, not into a summary you print to
a terminal that is being logged, not into a scratch file you leave behind.
Suggestion titles and descriptions are rendered on screen to the whole
organization — they describe the work, never the patient.
