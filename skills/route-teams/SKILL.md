---
name: route-teams
description: Put the right internal team on every unmatched work item, using the live teams from list_teams, and understand why matched items take their team from the ticket instead. Use during intake after matching, or whenever asked which team owns a piece of work.
---

# Routing work to teams

A team is where work actually goes: it decides which list inside the client's
ClickUp folder the task is created in. Every task that will ever exist needs
one.

## Two rules, and one of them is absolute

**Matched item → the ticket's team wins.** Leave `team` out entirely on a
matched suggestion; the platform overrides it with the ticket's team anyway.
Team is a property of the ticket, not the service, precisely so that one
client's Brand Kit can be Creative's work and another's Marketing's.

**Unmatched item → `team` is required.** This is the absolute one. An unmatched
suggestion with no team **blocks the entire tray** for the person clearing the
queue — the button disables and the row is outlined until somebody gives it a
team or removes it. Nothing you can do later fixes that as cheaply as getting
it right now. Never file an unmatched suggestion without a team.

## Use the team NAME, not the key

`file_communication` takes the team **name**, as `tasks.team` stores it —
`"Creative"`, not `"creative"`. (`create_ticket` takes a `teamKey` instead;
they are different fields on different tools. Check which one you are filling.)

Take names from `list_teams` in this session. Teams are editable rows: an
organization can rename them, archive them, or add ones that have never existed
anywhere else. An archived team cannot take new work.

## How to decide

Route on **what the deliverable is**, not on who mentioned it and not on the
service's category. Team and category are different axes: a category groups
services on the scope screen, and nothing routes off it.

In a default Macallan organization the four teams divide roughly like this —
confirm against `list_teams`, and treat this as a starting heuristic, not a
mapping table:

| Team | Owns |
| --- | --- |
| **Creative** | design and build of artefacts — brand, logos, print collateral, website build and visual work |
| **Marketing** | campaigns and distribution — paid ads, email cadence, content, video as a channel |
| **Technology** | systems and plumbing — GHL/CRM, automations, integrations, tracking, ClickUp builds |
| **Operations** | patient engagement, scheduling, the call centre, blockers, and anything with no better home |

Two known oddities in that default seed, deliberately preserved: website work
sits with **Creative** rather than Technology, and ClickUp space builds sit
with **Technology**. Follow the live data, not intuition.

## When you genuinely cannot tell

Route to the catch-all (Operations in the default org) and say so in the
description: *"Routing is a guess — this could be Technology if it means the
booking widget rather than the page."* A wrong team is one drag in the queue.
A missing team is a blocked tray.

Never leave `team` null on an unmatched item because you are unsure. Unsure is
what the description is for.

## Grouping for the user

Report the plan grouped by team, in the order `list_teams` returned them. That
is how the queue's tray and the eventual push both read, so the user is looking
at the same shape they are about to see in the app — and it makes an obviously
wrong routing decision jump out before it is filed rather than after.
