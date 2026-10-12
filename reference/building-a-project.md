# Building a project

**Two routes, and they end in different places.**

| Input | Skill | Ends at |
| --- | --- | --- |
| a conversation (email, text, Fathom, phone) | `comms` | `/inbound`, as suggestions |
| one known job | `ticket` | `/inbound`, as one suggestion |
| a signed SOW | `sow` | a **draft project**, with staged tasks |

A conversation implies work somebody has to confirm, so it goes through the
queue. An SOW *is* the confirmation: the client signed for exactly that list.
So `sow` is the one skill that builds a project, and it still stops at a staged
draft that a person pushes.

## What each route may do

| | `comms` / `ticket` | `sow` |
| --- | --- | --- |
| Create a project | **No.** | **Yes**, as a draft |
| Set a project's scope | **No.** | **Yes**, for non-Creative matched services |
| Answer brief questions | **No.** | **Yes**, only with what the SOW states |
| Stage a task on a project | **No.** | **Yes**, for Creative and unmatched work |
| Map a team to a ClickUp list | Offered | When a task needs it |
| File a communication or ticket into the queue | **Yes.** This is the whole job. | No |
| Create a ClickUp task | **No.** Nothing in the connector can, by design. | **No.** |

If a user asks `comms` or `ticket` for a project, the answer is the queue,
said plainly and once, without hedging. Not "I can't", but "that is built at
`/inbound`, and here is why that is better".

## Why the queue is the right place for a conversation

**It sweeps the work onto the project.** Choosing "New project…" on an item at
`/inbound` accepts every pending suggestion onto the new project, files the
communication against it, and takes the item out of the queue — because that is
what "make a project from this" means there.

There is no MCP tool that accepts a candidate. So a project created from here
would come out **empty**, with the suggestions you just filed still sitting in
the queue needing to be placed on a project that now already exists. More
steps, and easier to get wrong.

**It answers the questions at the moment they matter.** A team with no ClickUp
list mapped for this client stops the tray and opens the mapper right there,
name-matched, as a confirm. Sending somebody to another screen to fix that is
how an item sits for a week.

## What a project needs, when a person makes one

Worth knowing so you can tell them whether what you filed is enough:

| | |
| --- | --- |
| **Client** | verified, from a ClickUp folder. Already true of anything you filed. |
| **Tickets** | at least one. A project with no work on it is a row nobody opens. |
| **Services** | the services any matched tickets belong to, brought into scope. A project of purely one-off work has none. |
| **Owner** | required, and **always asked**. Never inferred from who was on the call, never defaulted to whoever holds the token. |

If what you filed has no tickets on it at all, say so: filing a call against a
project is still a complete decision, but a *new* project built around nothing
is not.

## And then still not ClickUp

Even after a person builds the project, its tasks are **staged**. They reach the
client's ClickUp folder when somebody reviews the summary screen and presses
push — one batch a person looked at, rather than a stream of things that
already happened.

Never tell a user work has been created or that anything is in ClickUp. For
`comms` and `ticket`, no project exists either. For `sow`, a *draft* project
exists with *staged* tasks, and that is exactly how to describe it.
