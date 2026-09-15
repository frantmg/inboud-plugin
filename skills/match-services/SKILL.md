---
name: match-services
description: Decide which extracted work items correspond to a ticket in the live service catalog and attach the serviceKey/stepKey pair, and which stay unmatched as one-off work. Use during intake after the work is extracted and the catalog is loaded, or whenever asked whether some piece of work is covered by an existing service.
---

# Matching work to the catalog

A suggestion is **matched** when it names a real `(serviceKey, stepKey)` pair —
a ticket that exists right now in the live catalog. Matching is worth getting
right because of what accepting a matched suggestion does in the app: it brings
the service into the project's scope, stages the brief scaffolding for it, and
the task is created through the ordinary catalog push with its ticket's
description and questions. An unmatched suggestion becomes a standalone manual
task instead. Both are legitimate; they are different kinds of thing.

## The test

Match when the item **is the work of that ticket for this client**, not when it
merely shares vocabulary with it. A call mentioning "video" is not
automatically the Video Production service — it might be a testimonial clip
somebody wants on the homepage, which is a website item.

Ask: if this ticket's brief questions were put to the client, would they be the
right questions for this ask? If yes, it is a match.

## Mechanics that will bite you

**Both keys or neither.** A `serviceKey` without a `stepKey` names nothing. The
ingest treats a partial pair as unmatched and silently drops both.

**A wrong key fails silently in the same way.** The ingest checks every pair
against the live catalog and demotes anything that does not resolve to
unmatched — which then has no team, because you did not give it one. So never
type a key from memory, from the v1 seed, or from another organization. Use
what `get_service` returned in this session, verbatim.

**A matched item's team is the ticket's, always.** Whatever you put in `team`
is ignored on a matched suggestion. Do not fight it, and do not try to reroute
work by leaving a real match unmatched — if the team on the ticket is wrong for
this client, say so to the user; that is a one-click change on `/services`.

**Do not enumerate a service's tickets.** When a client buys "the whole website
package", that is still one ask. File one matched suggestion for the ticket
that is the actual work; the rest of the service's tickets come into scope on
their own when somebody accepts it, marked skipped where the call never touched
them. One suggestion per thing the client asked for — never one per ticket in
the catalog.

## How to work through it

1. Shortlist by category and name from `list_services`. Categories are
   presentation only, but they are a good filter: an ask about ads lives in the
   marketing grouping.
2. `get_service` on each candidate and read the tickets — their names,
   descriptions, and the questions on them. The questions are the most
   informative part; they say what the ticket is actually for.
3. Pick the ticket whose scope covers the deliverable. Prefer the **more
   specific** of two plausible tickets.
4. Still tied, or nothing quite fits? Leave it unmatched, give it a team, and
   put the reason in the description: *"Closest is `web.website-build`, but
   this is a landing page for one campaign — filed as one-off."*

## Leave it unmatched when

- it is genuinely a one-off — a favour, an experiment, an odd request;
- a service covers the area but no ticket covers this deliverable;
- you would have to stretch a ticket's meaning to make it fit.

Unmatched is a first-class outcome, not a failure. An honestly unmatched task
with a good team goes through the queue fine. A forced match puts work under a
service the client is not buying, drags that service into the project's scope,
and reads as reviewed when it was guessed.

Never invent a key to make a match — that is the worst of the three, because it
resolves to nothing and looks deliberate.

## Do not fix the catalog to fit the call

If a call keeps revealing work that has no ticket, that is a finding worth
reporting to the user, not something to fix mid-intake. Adding a ticket changes
every future brief for every client. Say what is missing; let somebody decide
on `/services/<serviceKey>`.
