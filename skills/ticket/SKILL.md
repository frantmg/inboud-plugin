---
name: ticket
description: File one specific piece of work for a client as a single suggested task, without a conversation behind it. Use when somebody says "add a ticket for X", "the client wants a new logo", "log this task", or describes one job they already know needs doing. Takes the client from the ClickUp folders rather than from typed text, asking only when the folder is not already unambiguous. For a whole email thread, text conversation or call, use the `comms` skill instead.
---

# One ticket

Somebody already knows what the work is. There is no transcript to mine and
nothing to extract — the job is to get **one** well-formed suggested task, for
**the right client**, routed to **the right team**, into the review queue.

It still goes through the queue. A ticket logged here is a proposal like any
other: a person places it on a project at `/inbound`, or builds a project
around it. Nothing here creates a task and nothing reaches ClickUp.

## What it must have before it can be filed

| | |
| --- | --- |
| **Client** | **Required.** Always asked, always picked from a ClickUp folder. |
| **Owner** | **Required.** The Macallan person accountable for it. Carried as a participant with `role: "owner"`. |
| **Title** | Written from the ask. Never a question. |
| **Description** | Written from the user's own words. Never a question. |
| **Service** | Optional — attached when a catalog ticket genuinely covers it. |

**The client and the owner are the only questions here.** A one-line ask with
no detail still files: write the description from the user's own words, and
**say in the report that the detail is thin**. The person accepting it at
`/inbound` can see a description that barely extends its title, and can edit it
in the tray before it becomes a task — making them wait on a round trip here is
the more expensive half of that trade.

What does not change: never pad. Do not invent a constraint, a deadline or a
requester to make the field look fuller than what you were told. A thin
description honestly labelled is reviewable; a padded one is a small fiction in
a record somebody is going to act on.

## The client is always asked, and always comes from ClickUp

This is the part that separates this skill from `comms`. A conversation carries
evidence — a name, an email address, a phone number — that attribution can be
derived from. A dictated ticket carries none of it, so the client here **always
comes from a ClickUp folder and never from typed text**.

That is not always a question. The procedure is the `pick-client` skill: list
the folders, resolve the chosen one to a verified `clientId` with
`create_client`, and where the user already named a practice that matches
exactly one folder unambiguously, say which one you are using and carry on.
**Ask** when nothing was named, when several folders match, or when the match
is close rather than certain — a near-miss is the case this rule exists for,
because "Coastal Spine" and "Coastal Spine & Pain Institute" can be two
practices. A practice with no folder is not a client yet, and that is a stop,
not something to work around.

## Then the ordinary three steps

**Match** — load the catalog (`service-catalog`) and see whether a ticket
covers this ask. One suggestion, matched to one `(serviceKey, stepKey)` pair
copied verbatim, or honestly unmatched. The full rules are in `match-services`;
they do not change because the input is short. In particular: do not enumerate
a service's tickets, and never invent a key.

**Route** — matched takes the ticket's team automatically. Unmatched **must**
carry a `team`, spelled as the team **name** from `list_teams`. See
`route-teams`.

**Write it** — a title that reads on its own in a list of forty, and a
description with the constraints, the deadline and who asked. See
`extract-work` for what good looks like.

### The source excerpt, honestly

`sourceExcerpt` is meant to be the client's own words. Here there often are
none.

- The user pasted a line from the client — quote it. That is a real excerpt.
- The user is describing the work themselves — put their instruction in the
  description and say who reported it. Do not manufacture a quote and do not
  attribute a paraphrase to the client. A reviewer needs to know whether this
  came from the client's mouth or from a colleague's summary of it.

## Check where it would land

Once you know the team, check the client's mapping:

```
get_client({ clientId })   -> teamLists[], mappingComplete
```

If the routed team has no ClickUp list for this client, the person clearing the
queue will be stopped by it at the moment they accept. That is a setup step,
not a wall, and it is cheaper to answer now:

```
list_clickup_lists({ clientId })   -> the folder's lists, with a suggested team for each
map_team_lists({ clientId, mappings: [{ teamKey, clickupListId }] })
```

`list_clickup_lists` matches by name first, so this is usually a confirm rather
than a question. Offer it; do not force it. Filing works either way — the
mapping is needed at acceptance, not at filing.

Mapping a team to a list is **configuration, not work**: it records where this
client's Creative tasks would go, and creates nothing. It is the one write here
that is not a queue row, and it is allowed for that reason.

Note the field shapes differ: `map_team_lists` takes a team **key**, while the
suggestion's `team` takes the team **name**.

## Filing it

One `file_communication` call, one suggestion.

```
channel:          "note"
externalThreadId: "note:<client-slug>:<short-slug-of-the-ask>:<ISO date>"
occurredAt:       when the client asked, if known — otherwise now
subject:          the ask in a few words
transcript:       the note as given, verbatim
clientId:         from create_client
suggestions:      [ the single suggestion ]
```

`channel: "note"` is the right channel: this is something written down, not a
call, a text or an email thread. The dedupe key matters less than it does for a
thread, but give it one anyway — logging the same ticket twice by accident is
the failure it prevents.

## Building a project around it

**This plugin never creates one.** If the user asks, the answer is the queue:
"New project…" on the item at `/inbound` sweeps every pending suggestion onto
the project it creates, and there is no MCP tool here that accepts a candidate,
so a project made from this side would come out empty with the work stranded
behind it.

What a person needs when they build it: a verified client, **at least one
ticket**, the services any matched tickets belong to, and an **owner, always
asked**. `reference/building-a-project.md` has the reasoning and the rest.

## Report back

- filed against **which client**, named as ClickUp names it;
- matched to a service, or unmatched and routed to which team;
- whether the description is thin — say so plainly, and that the reviewer can
  edit it in the tray before accepting;
- whether the team has a list mapped for this client, and that the queue will
  ask if not;
- that it is waiting at `/inbound`, and that nothing is work yet — no task, no
  project, nothing in ClickUp.
