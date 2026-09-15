# A worked example

A Fathom call, end to end. Abbreviated, but every step is real.

## 1. What arrived

> Can you file this? https://fathom.video/share/8f2c1d9e — Coastal Spine call
> from this morning.

## 2. Read it

Fetched the share page; transcript and summary were on it. Envelope:

```
channel:          "fathom"
externalThreadId: "fathom:8f2c1d9e"
occurredAt:       "2026-09-12T14:05:00-04:00"   # call start, with the offset
subject:          "Coastal Spine & Pain — Q4 planning"
participants:     Dr. Elena Ruiz <eruiz@coastalspine.com> (client)
                  Marta Feld <mfeld@coastalspine.com> (client)
                  Sam Okafor <sam@macallangroup.com> (internal)
clientName:       "Coastal Spine & Pain"
```

## 3. Load the catalog

`list_teams` → Creative, Marketing, Technology, Operations.
`list_services` → twelve services. Shortlisted on the asks: `web`, `paid`,
`email`, `ghl`, `print`, `brand`. `get_service` on each.

## 4. Extract

Six items. One of them, in full:

```
title:         Rebuild the practice website on the new brand
description:   Full rebuild on the brand refreshed in August. Live before the
               October open house. Hosting migration not discussed — confirm.
confidence:    0.95
sourceExcerpt: "the site still looks like the old practice — can we get it
               rebuilt before the open house in October?"
```

Dropped: "we should grab lunch when you're down here" (not work), "the new
signage went up last week" (already done, no Macallan action), "we might look
at a podcast next year" (explicitly deferred).

Merged: the website came up four times across forty minutes. One item.

## 5. Match

| Item | Outcome |
| --- | --- |
| Rebuild the website | `web` / `website-build` |
| Design the intake one-pager | `print` / `collateral` |
| Launch the spine paid campaign | `paid` / `campaign-setup` |
| Newsletter to fortnightly | `email` / `cadence` |
| Wire the intake form into GHL | `ghl` / `forms` |
| Track booking conversions | **unmatched** — nothing in the catalog covers attribution reporting |

The logo refresh mentioned in passing was *not* matched to `brand` /
`brand-kit`: they have a brand kit already and this was one lockup for signage.
Filed unmatched to Creative, with that reasoning in the description.

## 6. Route

Matched items take their ticket's team — nothing to do. The two unmatched ones:

```
Track booking conversions  → team: "Technology"
Refresh the logo lockup    → team: "Creative"
```

Both spelled as the team **name**, from `list_teams`.

## 7. Show, then file

Printed the plan grouped by team, got one "yes", called `file_communication`
once.

```json
{
  "communicationId": "0a1b…",
  "clientId": "9c4d…",
  "attribution": "contact",
  "threaded": false,
  "suggestions": 7,
  "matched": 5,
  "filedToProjectId": null,
  "queued": true
}
```

Attribution came through on the participant email, not the name — worth
knowing, because it means the client record's `contact_email` is current.

## 8. Report

> Filed against **Coastal Spine & Pain** (matched on Dr. Ruiz's email).
> 7 suggested tasks, 5 matched to services, across Creative (3), Marketing (2)
> and Technology (2). It is waiting at `/inbound`.
>
> Nothing is work yet — no tasks, no project, nothing in ClickUp. Someone
> accepts what is real in the queue and starts the project from there.
>
> One thing worth a look: nothing in the catalog covers campaign attribution
> reporting, and it has come up on two calls now.

## The next day

A reply lands on the thread. Re-filed with the **same** `externalThreadId` and
the whole thread — the record appended, the pending suggestions were replaced,
and the two somebody had already accepted overnight were left alone.
