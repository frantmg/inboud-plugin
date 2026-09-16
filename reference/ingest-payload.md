# The ingest payload

One shape, two doors: the `file_communication` MCP tool and
`POST /api/inbound/communication`. Both parse it with the same schema, so they
cannot drift.

```json
{
  "channel": "fathom",
  "externalThreadId": "fathom:8f2c1d9e",
  "occurredAt": "2026-09-12T14:05:00-04:00",
  "subject": "Coastal Spine & Pain — Q4 planning",
  "participants": [
    { "name": "Dr. Elena Ruiz", "handle": "eruiz@coastalspine.com", "role": "client" },
    { "name": "Sam Okafor",     "handle": "sam@macallangroup.com",  "role": "internal" }
  ],
  "transcript": "…full transcript with speaker labels…",
  "summary": "Q4 planning call. Website rebuild, spine campaign, intake form into GHL.",
  "clientName": "Coastal Spine & Pain",
  "suggestions": [
    {
      "title": "Rebuild the practice website on the new brand",
      "description": "Full rebuild on the brand refreshed in August. Must be live before the October open house. Hosting migration not discussed — confirm.",
      "serviceKey": "web",
      "stepKey": "website-build",
      "confidence": 0.95,
      "sourceExcerpt": "the site still looks like the old practice — can we get it rebuilt before the open house in October?"
    },
    {
      "title": "Track booking conversions from the spine campaign",
      "description": "They want to see bookings attributed to the paid spine campaign, not just form fills. No tooling named on the call.",
      "team": "Technology",
      "confidence": 0.7,
      "sourceExcerpt": "I want to know how many of those actually turned into booked appointments"
    }
  ]
}
```

## Envelope

| Field | Type | Notes |
| --- | --- | --- |
| `channel` | `"sms" \| "email" \| "fathom" \| "note"` | **Required.** |
| `externalThreadId` | string, ≤ 400 | The dedupe key, unique per organization — the client is **not** part of it. Omit it and every post mints a new record. For Fathom it is the share token from the URL (`fathom:8f2c1d9e`), never the numeric call id inside the page. |
| `occurredAt` | ISO 8601 **with offset** | When the client said it. Defaults to now, which is wrong for anything forwarded. |
| `participants` | array, ≤ 50, of `{ name, handle, role }` | `handle` is the email address or phone number, and is what attribution matches on. Exactly one carries `role: "owner"` — see below. |
| `subject` | string, ≤ 500 | Null for SMS. |
| `transcript` | string, ≤ 500 000 | The faithful record. Retained indefinitely. |
| `summary` | string, ≤ 10 000 | Optional. |
| `clientId` | uuid | A hint, verified against the organization. |
| `clientName` | string, ≤ 200 | A hint, matched exactly and case-insensitively. |
| `suggestions` | array, ≤ 100 | See below. |

## Suggestion

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string, 1–300 | **Required.** Imperative, specific, no team prefix. |
| `description` | string, ≤ 10 000 | Defaults to `""`. |
| `serviceKey` | string, ≤ 120 | With `stepKey`, makes it *matched*. Both or neither. |
| `stepKey` | string, ≤ 120 | From `get_service`, verbatim. |
| `team` | string, ≤ 120 | The team **name** from `list_teams`. Required on an unmatched suggestion; ignored on a matched one. |
| `confidence` | number 0–1 | What you actually believe. |
| `sourceExcerpt` | string, ≤ 4 000 | The client's own words. What the reviewer checks. |

## The owner, and the gap it fills

Every communication filed by this plugin carries an owner: the Macallan person
accountable for what comes of it.

**There is no owner column.** Not on `communications`, not on
`task_candidates`, and no field for it in this payload. `communications.created_by`
records the connection's creator, which is who ran the tool rather than who is
accountable, and `inbound.assignee_id` is not reachable from the ingest.

So it travels as a participant:

```json
{ "name": "Sam Okafor", "handle": "sam@macallangroup.com", "role": "owner" }
```

`role` is free text, participants render in the app, and they are covered by
the full-text index — so this is visible and findable. It is a **convention
the plugin enforces, not a constraint the database does.** Making it structural
means adding an `owner` to `ingestSchema` and a column behind it, which is a
migration in the app.

## What the platform does with it

- **Attribution** is derived and verified, in order: `clientId` (checked against
  the org) → `clientName` (exact) → participant handles against the client's
  `contact_email` / `contact_phone` → unresolved.
- **A key that names no live ticket is dropped to null**, and the suggestion
  becomes unmatched. Silently. This is the most common way a payload goes
  subtly wrong.
- **A matched suggestion inherits its ticket's team**, overriding whatever you
  sent.
- **Suggestions land in `task_candidates`** — proposals, not work. They become
  tasks when a person accepts them at `/inbound`, and reach ClickUp only when a
  person pushes a project summary.
- **Re-filing the same `externalThreadId`** appends to the record and replaces
  the *pending* suggestions. Accepted and dismissed ones are never touched.
  Dedupe is on `(organization_id, external_thread_id)` and **the client is not
  in the key**, so re-filing the same content under a different `clientId`
  appends to the record that is already there rather than making a second one.
  Filing one conversation for two clients on purpose means putting the client
  in the thread id — `fathom:<token>:<clientId>`, with the trade-off spelled
  out in `read-communication`.
- **A re-file cannot move a communication to another client.** An unresolved one
  can still be attributed by a later filing; a resolved one is fixed, and is
  corrected by a person in the queue's client picker. The first filing is the
  cheap moment to get the client right.

## Response

| Field | Meaning |
| --- | --- |
| `communicationId` | the filed record |
| `clientId` | who it was attributed to, or null |
| `attribution` | `hint` \| `name` \| `contact` \| `unresolved` |
| `threaded` | true when it appended to an existing thread |
| `suggestions` / `matched` | counts, after the platform's own validation |
| `filedToProjectId` | set only when it skipped the queue entirely |
| `queued` | true when it is waiting at `/inbound` |

The HTTP route returns the same fields plus `ok: true`, and never echoes the
transcript, the summary or any suggestion text.
