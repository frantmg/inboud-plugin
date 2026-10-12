---
name: sow
description: Read a signed Statement of Work and build the draft project it describes in Macallan Onboarding - every service it sells, broken into tasks routed to the right teams, matched to the live catalog where a ticket covers the work, with the brief answered from what the SOW states. Use when the user shares an SOW (PDF, Word document or pasted text), or says anything like "set up the project from this SOW", "what does this SOW commit us to", "build the project for this contract". Stops at a staged draft; a person reviews the summary in the app and pushes it to ClickUp.
---

# A Statement of Work

One job: a signed SOW arrives, and a **draft project** ends up in Macallan
Onboarding with every piece of work the SOW commits Macallan to. Each piece is
a task routed to the team that will do it, with the brief answered as far as
the SOW answers it. A person then opens the project's summary, fills the gaps,
and pushes it to ClickUp.

**This is the one route through this plugin that builds a project.** `comms`
and `ticket` end at `/inbound`, because a conversation implies work that
somebody has to confirm. An SOW is different: it is the confirmation. The
client signed for exactly this list, so it goes straight onto a project rather
than through the queue.

## What this is not allowed to do

1. **Nothing reaches ClickUp.** `create_project`, `set_project_scope`,
   `answer_brief_question` and `create_task` all write rows in the app and
   stop. Tasks are **staged**. They reach the client's ClickUp folder when a
   person reviews the summary screen and presses push. No tool here pushes.
   Never say tasks were created in ClickUp.
2. **A client is its ClickUp folder.** Never invent one, and never create one
   from the name typed on the SOW. Use `pick-client`.
3. **Only what was signed.** A task exists because the SOW commits Macallan to
   it. Optional services, hourly work "billed on request" and anything that
   needs the client's further written approval are **not** tasks. They are
   listed in the project update and the report, and become work when somebody
   says they were approved.
4. **No invented specifics.** Every fact on a task or in a brief answer is
   one the SOW states. What it does not state is `_Not captured_`, not a
   guess.
5. **The catalog is not edited.** A deliverable no ticket covers becomes an
   unmatched task. It does not become a new ticket.

## What it asks

**The client and the owner, and nothing else**, each only when not already
known:

| | |
| --- | --- |
| **The client** | An SOW names a legal entity ("Redefine Health Utah LLC") and usually a practice ("Mountain Orthopaedics & Spine"). Query the ClickUp folders with both through `pick-client`. Exactly one unambiguous folder: say which, and carry on. Otherwise ask. |
| **The owner** | The Macallan person accountable for the project. Named by the user? Use it. Otherwise **ask**. Never infer it from who signed the SOW, and never default it to whoever holds the token. |

Ask whichever are missing together, in one message. There is no "create
this?" at the end. The summary screen in the app is the review: it shows every
staged task, grouped by team, before anything is pushed.

What still stops you is missing **evidence**: an SOW you cannot read, or a
practice with no ClickUp folder (it is not a client yet).

## The pipeline

| Step | How | Produces |
| --- | --- | --- |
| 1. Read the SOW | below | the SOW's outline: header, deliverables, timeline, budgets, exclusions |
| 2. Establish the client | `pick-client` | a verified `clientId` |
| 3. Check for an existing project | `list_projects({ clientId })` | a go, or a stop |
| 4. Load the catalog | `service-catalog` | services, tickets, questions, teams |
| 5. Break it into work items | below, with `extract-work`'s rules | one item per deliverable a single team owns |
| 6. Match and route | `match-services`, `route-teams`, the SOW rules below | a ticket or a team on every item |
| 7. Write the descriptions | `creative-brief` for Creative, below for the rest | a description per task |
| 8. Map the teams' lists | `get_client`, `list_clickup_lists`, `map_team_lists` | every team used has a list for this client |
| 9. Build the draft | the calls below, in order | a project with scope, answers and staged tasks |
| 10. Report | from `get_project`, below | what was staged, and what is still open |

Steps 1, 2 and 4 are independent, so run them together if that saves a round
trip.

## 1. Reading the SOW

A PDF is read directly. For a Word document, convert it to text first
(`textutil -convert txt` on a Mac, `pandoc` elsewhere) or ask for the PDF.
Pasted text is fine as it is. If the file will not open, or comes back as a
scanned image with no text, **stop and ask** for a readable copy. Never
reconstruct an SOW from its title or file name.

Pull out this outline, keeping the SOW's own section numbers so every task can
cite where it came from:

- **Header**: SOW number, project name, the client entity, the practice and its
  locations, effective date, signature dates.
- **Deliverables**, per phase. One-time (onboarding, setup, rebrand) and
  ongoing (monthly management) are both work, and the difference goes in the
  description.
- **Constraints** written against deliverables: revision rounds, "print-ready
  files included, printing not included", quantities, ranges ("five (5) to ten
  (10) pages").
- **Timeline**: what is due when, in the SOW's words.
- **Budgets the work runs on**: monthly media budget per channel. These answer
  brief questions. Agency fees are not task content. They go in the project
  update, not on any task.
- **Third-party and pass-through costs**: a dependency on a task (for example,
  "the client selects the wire package"), never a task of their own.
- **Optional and out-of-scope services**: excluded, listed (rule 3).
- **Client responsibilities**: access, approvals, a staff contact, clinical
  review. These are what blocks handoff, and they answer Open Items & Blockers.

## 3. Never build the same SOW twice

`create_task` is not idempotent: run this twice and every task exists twice.
Before writing anything, list the client's projects. If one already carries
this SOW's project name, or its update mentions this SOW number, **stop**.
Say which project it is and ask whether to add to it or leave it. Adding to it
is `set_project_scope` plus `create_task` for the items it is missing, never a
second project.

If a run fails partway through, **do not start over.** `get_project` on the
project you created, see what is already there, and do only the rest.

## 5. One work item per deliverable

The `extract-work` rules hold: one item per unit of work a single team can own
end to end, and every item cites its source. In an SOW the source is the
clause, so `sourceExcerpt` is the SOW's own sentence, quoted, with its section
number.

What is specific to an SOW:

- **Each bullet in a scope section is usually one item.** Split a bullet that
  two teams would split. "Spine pages written and optimized for search" is
  writing (Marketing) and building pages on the site (Creative).
- **Build plus manage is one item.** "Google Ads campaigns built" in Phase 1 and
  "Google Ads: build, launch and manage" in Phase 2 are the same channel, owned
  by the same team. One task, and its description says it starts as a build
  and continues monthly.
- **Several locations are one item**, with the locations listed. Not one task
  per location.
- **The same service sold twice is one item.** A tracking section in setup and
  again in ongoing services is one Technology task.
- **Client responsibilities are not items.** They are blockers.
- **Excluded work is not an item** (rule 3).

## 6. Matching and routing, SOW-specific

Use `match-services` for the test (would this ticket's brief questions be the
right questions for this deliverable?) and `route-teams` for unmatched work.
Then these rules, which only apply here:

**Creative work is always staged with `create_task`, never brought in through
scope.** A catalog ticket brought in by `set_project_scope` pushes with a
description the app builds from its brief questions. That cannot carry the
creative brief format, and every Creative task must (see `creative-brief`). So
an item whose team is Creative, matched or not, becomes a `create_task` with
`teamKey` for Creative. Its service is **not** added to scope for it.

**Non-Creative matched work goes through scope.** `set_project_scope` with the
service, then `answer_brief_question` for what the SOW answers. The catalog
ticket is the task, and its push carries the brief.

**One ticket absorbs one item.** A ticket becomes one task. When two SOW
deliverables both fit the same ticket, give the ticket the one it is built for.
The other becomes its own unmatched task for the same team, with a description
saying which ticket it sits beside.

**Scope brings in every ticket of the service.** Tickets the SOW does not cover
come along anyway, and would push as tasks full of `_Not captured_`. There is no
tool here to skip one. List them in the report as **"skip on the brief
screen"**. If a service would bring in more uncovered tickets than covered
ones, leave its item unmatched instead and say why in the description.

## 7. Descriptions

**Creative**: the `creative-brief` format, exactly. The title is written bare:
the push adds `Creative: `.

**Everything else**: plain Markdown, in this order:

```markdown
[One or two sentences: what Macallan does, for which locations, and when]

**Scope (SOW §2.5):** [the commitment, constraints and quantities in the SOW's words]
**Cadence:** One-time, Phase 1 · or · Ongoing from Month 2 · or · Built in Phase 1, managed monthly from Month 2
**Budget:** [the monthly media budget, where one is stated]
**Depends on:** [the client responsibility or third-party choice this waits on]

> "[The SOW clause, verbatim]" (SOW §2.5)
```

Leave out a line that does not apply. Never put agency fees on a task. Titles
are bare too, because every team has a push prefix (Marketing, Tech,
Others...).

## 8. Every team needs a list before tasks can be staged

`create_task` refuses a team with no ClickUp list mapped for this client. So
before building, check the mapping:

```
get_client({ clientId })            -> teamLists[], mappingComplete
list_clickup_lists({ clientId })    -> the folder's lists, each with a suggested team
map_team_lists({ clientId, mappings: [{ teamKey, clickupListId }] })
```

Where `list_clickup_lists` suggests one list for a team by name, map it and
say so in the report. Mapping is configuration, not work. Where a team has
no list, or several plausible ones, ask. It is the one question allowed
beyond the client and the owner, because without the answer the task cannot be
staged at all.

## 9. Building the draft

In this order, because each step needs the one before:

```
create_project({
  clientId,
  name,          // the SOW's project name, ≤ 80 chars
  briefDate,     // the date the SOW was signed, YYYY-MM-DD
  dueDate,       // the launch date, only if the SOW gives a day; otherwise null
  ownerName | ownerUserId
})
set_project_scope({ projectId, serviceKeys })   // the non-Creative matched services
answer_brief_question(...)                       // one call per answer the SOW gives
create_task({ projectId, title, description, teamKey })   // every Creative item, every unmatched item
add_project_update({ projectId, body })          // the SOW's provenance, below
```

**Dates.** Do not invent a day. "November: Launch" is a month, so `dueDate` is
null and the update says "Launch: November 2026 (per SOW §5)". The date the SOW
was signed is the brief date. When the effective date is left blank on the
document, use the signature date and say so.

**Brief answers.** Answer only what the SOW states. Copy the key triple from
`get_service` verbatim. For a chips or select question, the value must be one
of its options, spelled exactly. When none fits, leave the question
unanswered. Typical answers an SOW gives: monthly budget, geography, number of
locations, the scope type of website work, who writes the copy.

**Open Items & Blockers** is always in scope. Answer its question with the
client responsibilities and every third-party decision the work waits on, one
line each.

**The project update** is the record of where this project came from:

```
Built from SOW <number>, signed <date> (<signatories>).
Term: <term>. Phase 1: <summary>. Ongoing from <month>: <summary>.
Timeline: <the SOW's timeline, one line per milestone>.
Not in scope unless approved: <optional services, with their fees>.
Pass-through: <third-party costs and who chooses them>.
Fees: setup <amount>; monthly <amount>; media budgets paid directly by the client.
```

The project has an SOW link field, set on the project in the app. There is no
tool here that sets it, so tell the user to add the link.

## 10. Reporting back

Read `get_project` and report **from the response, not from the plan**. Use
the same rule and the same reason as `file-communication`: what you meant to
stage and what the app recorded can differ.

```
Draft project - Mountain Orthopaedics & Spine Rebrand and Patient Growth Program
Client: Mountain Orthopaedics & Spine (ClickUp folder)
Owner:  Fran Melo · Brief date 8 Oct 2026 · Launch: November (no day in the SOW)
20 tasks across 4 teams · paid, content, video in scope (+ Open Items)

Creative (7)                      staged with the creative brief
  - Logo update                                 gaps: Size
  - Brand standards guide
  ...
Marketing (10)
  - Google Ads campaigns: build and manage      paid.google-search-ads-gbp
  - ZocDoc: build and manage                    unmatched
  ...

Skip on the brief screen: video.testimonials-educational-social (not in the SOW)
Not in scope: Video and photo production day (optional, $15,000 + travel)
Team lists: mapped Marketing -> "Marketing & Advertising" (name match)

Nothing is in ClickUp. Review the summary in the app, fill the gaps, and push.
```

Then say plainly:

- the draft exists, against which client, and with which owner;
- how many tasks were staged per team, and which services are in scope, using
  the returned counts;
- the gaps: `_Not captured_` lines on Creative briefs, unanswered brief
  questions, a missing launch day;
- tickets that came in with scope and need skipping;
- what was excluded, and why;
- what has **not** happened: nothing is in ClickUp until a person pushes.

## PHI

An SOW is commercial, not clinical, but it sits beside healthcare data. Its
fees are internal and belong in the project update only. Nothing from the SOW
goes into a commit message, a filename or a scratch file left behind.

`reference/sow-worked-example.md` walks one real SOW through every step.
