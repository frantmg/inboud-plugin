# Building a project

**This plugin never creates one.** Everything it does ends at `/inbound`.

That is not a limitation to apologise for or route around. It is the line that
makes the whole thing safe to point at a client's transcripts: the widest thing
a leaked token, a bad prompt or a confidently wrong reading can produce is a row
somebody still has to accept.

## What the plugin does with a project

Names it. Nothing else.

| | |
| --- | --- |
| Create a project | **No.** `create_project` is not called, ever. |
| Set a project's scope | **No.** `set_project_scope` is not called. |
| Stage a task on a project | **No.** `create_task` is not called. |
| Create a ClickUp task | **No.** Nothing in the connector can, by design. |
| File a communication or a ticket into the queue | **Yes.** This is the whole job. |

If the user asks for a project, the answer is the queue — said plainly, once,
without hedging. Not "I can't", but "that is built at `/inbound`, and here is
why that is better".

## Why the queue is genuinely the right place

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

Never tell a user work has been created, a project exists, or anything is in
ClickUp. None of it is true of anything this plugin did.
