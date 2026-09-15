# How Macallan Onboarding is put together

Enough of the platform's model to file into it without breaking anything. The
rules below are not conventions — they are enforced by the schema, and the
plugin is designed around them.

## The nouns, and why they are distinct

| | what it is | where it lives |
| --- | --- | --- |
| **Communication** | something a client said — a call, a text, an email thread | `communications`, belongs to a **client** |
| **Suggested task** | a proposal. Not work, not in ClickUp | `task_candidates` |
| **Task** | work someone will do. Every row is a commitment | `tasks` |
| **Inbound item** | something that arrived unasked and still needs a decision | `inbound` |

This plugin writes a communication and its suggested tasks. It never writes a
task, and nothing it can call reaches ClickUp.

## A client is its ClickUp folder

`clients.clickup_folder_id` is the identity the whole integration turns on, and
the client's **name is ClickUp's, never ours**. There is exactly one way to
make a client: pick its folder. There is no free-text client anywhere, no
"link the folder later", and a practice with no folder is not a client yet.

The reason is not tidiness. Before that rule, two paths could mint a client row
from typed text, and one live database held twelve clients against three
folders — including "asdf", "Test" and "Dummy client". An automated caller is
exactly the one most likely to do that again, at speed.

So: this plugin supplies attribution *hints* and lets the platform verify them.
Unattributed is a normal, supported state — the queue turns into a client
picker for it.

## Nothing unverified becomes work

Model output lives in `task_candidates` until a person accepts it. Accepting is
one transaction that inserts the task and stamps the candidate, so provenance
is a join and there is nothing to drift.

Accepting a **matched** suggestion also stages the catalog scaffolding — the
service enters the project's scope with its brief state, and tickets the call
never mentioned are marked skipped. That is why one suggestion per real ask is
right, and one suggestion per ticket in a service is wrong.

## Nothing reaches ClickUp from outside the app

Tasks accepted from a communication are inserted **staged** — no
`clickup_task_id`. They reach ClickUp when a person opens the project summary
and pushes. That review is the point: a push is one batch somebody looked at,
not a stream of things that already happened.

There is no tool in the connector that pushes. The scope that used to guard one
was retired along with it.

## Team is on the ticket, and it is where work goes

One ticket becomes one ClickUp task, and its **team** decides which list inside
the client's ClickUp folder that task is created in. A service is a bundle and
its tickets can belong to different teams — "Video Production" is sold as
marketing and every ticket in it is Creative's work.

Precedence for a suggestion's team, in the app: the request's explicit choice,
then the suggestion's own team, then the ticket's. For a *matched* suggestion
coming in over the ingest, the ticket's team overrides whatever was sent.

**Team is not category.** A category is the scope screen's presentation
grouping and sits on the service. Nothing routes off it.

## Keys are immutable

`brief_answers`, `project_step_state` and `tasks` reference catalog rows by
key, and tasks hold live ClickUp ids. A changed key would orphan answers and
break the idempotency that stops a re-push duplicating work. So keys never
move: renaming a service changes its label only.

Which is why a key must be copied from `get_service`, never composed.

## The queue has two exits

An `inbound` row exists while a decision is outstanding and is **deleted** when
one is made. There is no status column and no parked state. The two exits are:
place it on a project, or dismiss it. Taking a task back off a project returns
it to the queue.

A communication can be filed against a project with **no** tasks accepted at
all — a call that produced no work still belongs somewhere, and saying so is a
complete decision.

## Retention and redaction

Transcripts are kept indefinitely, deliberately: the first extraction prompt
will be the worst one ever shipped, and a better one can re-run against the
same transcript and replace what the last one guessed — without touching
anything already accepted.

Neither the transcript nor the summary may reach analytics, error payloads or
logs. Deleting a communication means **redacting** it: the text goes, the shell
and its links stay.
