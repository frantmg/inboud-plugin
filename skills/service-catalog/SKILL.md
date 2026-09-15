---
name: service-catalog
description: Load the live Macallan service catalog over MCP - services, their tickets, the questions on each ticket, teams and categories - and understand the shapes it returns. Use before matching any work to a service, when the user asks what Macallan sells, what a service contains, or which teams exist.
---

# The service catalog

The catalog is in Postgres and edited in the app. It is **not** in this plugin
and not in your training data. Every key you use has to come back from a tool
call in this session.

## What the nouns mean

- A **service** is a bundle Macallan sells to a client — "Video Production",
  "Brand Kit". It has a key, a category and a description.
- A **ticket** is one unit of work inside a service, and **one ticket becomes
  one ClickUp task**. It has its own key, and it carries the **team**.
- A **question** is what the brief asks about a ticket. You do not answer
  questions during intake; you only need to know they exist, because a task's
  ClickUp description is built from them and an unanswered one renders as
  `_Not captured_`.
- A **team** owns work and decides which list inside the client's ClickUp
  folder a task lands in. Teams are the routing unit.
- A **category** is a presentation grouping on the scope screen. **Nothing
  routes off a category.** Use it to shortlist services, never to pick a team.

The pair that matters to you is `(serviceKey, stepKey)`. That is what makes a
suggested task *matched* to the catalog.

## Loading it

```
list_teams          -> every team's key and name (you need the NAME later)
list_categories     -> presentation groupings, for shortlisting
list_services       -> every service, its category, its teams, ticketCount
get_service(key)    -> that service's tickets, each with serviceKey + stepKey + team
```

`list_services` alone is not enough to match anything — it gives you services,
and a match needs a ticket. Shortlist from `list_services` by category and
name, then call `get_service` for each candidate. Catalogs of this size (a
dozen services) are cheap to pull in full; if you are matching more than three
or four asks, just fetch all of them and keep the result for the rest of the
session.

## Reading what comes back

`get_service` returns, per ticket:

```json
{
  "serviceKey": "web",
  "stepKey": "website-build",
  "name": "Website Build",
  "description": "...",
  "team": { "key": "creative", "name": "Creative" },
  "questions": [
    { "key": "pages", "label": "Pages required", "type": "checks", "answerable": true },
    { "key": null,   "label": "Access & setup", "type": "sub",    "answerable": false }
  ]
}
```

- `serviceKey` and `stepKey` are spelled out on the ticket so you never have to
  assemble them. **Copy them verbatim.** Keys are immutable by design and
  answers hang off them; a key you slugified yourself is a key that matches
  nothing.
- `team` is on the **ticket**, not the service. A service can span teams —
  "Video Production" is sold as marketing and every ticket in it is Creative's
  work — which is why `list_services` shows a service's teams as a list.
- `alwaysIncluded` on a service means it goes into every project's scope
  whether anyone picks it or not.
- A question with `answerable: false` is a section heading. It has no key and
  takes no answer.
- Archived services and tickets do not appear. If the user insists a service
  exists and it is not here, it was archived — say so rather than matching to
  something else.
- `seeded: false` on `list_services` means the database is serving the v1
  fallback catalog rather than the edited one. Worth mentioning to the user;
  it usually means a migration has not been pushed.

## What you must not do to the catalog

`create_ticket` exists and needs the `catalog` scope. **Do not call it during
intake.** A ticket added to a service is inherited by every future brief for
every client — it is not confined to the call you are reading. If a call
genuinely reveals a missing ticket, say so and let somebody add it on
`/services/<serviceKey>` with the existing ones in front of them.

There is no tool here that creates a service, edits a question, archives, or
renames anything, and that is deliberate.
