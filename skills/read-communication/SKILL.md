---
name: read-communication
description: Normalize an email thread, a text message conversation, a Fathom share link or a pasted call transcript into the one envelope Macallan Onboarding ingests - channel, externalThreadId, occurredAt, participants, subject, transcript, summary. Use at the start of intake, or whenever you need to work out the dedupe key, the participants or the real time a communication happened.
---

# Reading a communication

Three input shapes, one envelope. Get this step right and everything
downstream — attribution, dedupe, the reviewer's ability to check your work —
follows. Get it wrong and a five-reply thread floods the inbox with five
items.

The envelope, in full, is in `reference/ingest-payload.md`. This skill is about
how to fill it from each kind of input.

## Type, and the one that does not map cleanly

The type is required. Four are offered; the platform's `channel` column accepts
only four values, and they are not the same four:

| You are told | `channel` | |
| --- | --- | --- |
| email | `"email"` | |
| Fathom | `"fathom"` | a recorded call with a transcript |
| SMS / text | `"sms"` | |
| call | `"note"` | **a phone call with no recording** — there is no `call` channel in the schema |

So a call somebody took notes on files as a `note`, and the subject should say
what it was: `"Phone call — Coastal Spine — 12 Sep"`. Say this in your report
rather than silently relabelling it, because the person reading the Comms
library will filter on channel and a phone call sitting under "note" is only
findable if they know that is where it went.

If unrecorded calls turn out to be common, `call` is worth adding to the
`communications.channel` enum properly — that is a migration in the app, not
something to paper over here.

## The dedupe key is the important field

`externalThreadId` is what makes a reply *append to* a record rather than mint
a new one. It is nullish in the schema and close to mandatory in practice.
Choose it so that the same conversation always produces the same string:

| Channel | `externalThreadId` |
| --- | --- |
| Email | the root message's `Message-ID`, or `References[0]` if you are looking at a reply. No header? `email:<normalized-subject>:<sorted participant handles>` |
| SMS | `sms:<client number in E.164>` — a text thread with a practice is one continuing conversation, not one per day |
| Fathom | `fathom:<call id from the URL>` |
| Call (unrecorded) | `call:<client slug>:<ISO date>` |
| Pasted note | `note:<client slug>:<ISO date>` |

Normalizing a subject means lowercasing it and stripping every leading `Re:`,
`RE:`, `Fwd:`, `FW:` and `[EXTERNAL]`. Two people replying to the same thread
must not produce two keys.

Re-filing the same key deliberately is fine and often correct: the platform
replaces the *pending* suggestions and leaves accepted or dismissed ones
alone.

## Email

- `channel: "email"`.
- `subject`: the normalized subject, without the `Re:`/`Fwd:` prefixes.
- `occurredAt`: the `Date` of the **most recent** message in what you were
  given, ISO 8601 **with an offset**. `2026-09-12T14:05:00-04:00`, never a bare
  local time and never `Z` unless it really was UTC. This is when the client
  said it, not when you were shown it.
- `participants`: every real person on `From`, `To` and `Cc`. `name` as
  written, `handle` as the bare email address, `role` as `client` or
  `internal` where you can tell. Drop list addresses, no-reply senders and
  calendar bots.
- `transcript`: the whole thread, oldest first, each message prefixed with
  sender and timestamp. Keep the quoted trail once — delete the repeated
  copies of it that each reply carries, they add tokens and nothing else.
  Strip signature blocks and legal footers.
- `summary`: two or three sentences, only if the thread is long enough that a
  reviewer would not read it.

## Text messages

- `channel: "sms"`.
- `subject`: null. A text thread has no subject; inventing one makes the
  library harder to search, not easier.
- `occurredAt`: the timestamp of the last message.
- `participants`: phone numbers in **E.164** (`+13055550147`) with names where
  known. This is the field that attributes the communication to a client when
  nobody typed a name — the platform matches handles against the client's
  `contact_phone`, so a prettified `(305) 555-0147` costs you the match.
- `transcript`: `[time] Name: message`, one per line, oldest first. Keep the
  client's own wording, including the typos — you are quoting from it later.

## Fathom calls

- `channel: "fathom"`.
- The call id is in the share URL: `fathom.video/share/<id>`,
  `fathom.video/calls/<id>`. That is your dedupe key.
- `subject`: the call title as Fathom has it.
- `occurredAt`: the call's **start** time, with the offset.
- `participants`: the attendee list with emails. Mark Macallan people
  `internal` and practice people `client`.
- `transcript`: the full transcript with speaker labels. Keep the speaker
  attribution — "who asked for this" is half of what a reviewer checks.
- `summary`: Fathom's own summary if the page has one. Otherwise write one,
  five sentences at most, and keep the share URL in it so a reviewer can open
  the call.

### Getting the transcript out

1. Try fetching the share URL. A public Fathom share page usually renders the
   transcript and the summary.
2. If it is login-gated, JavaScript-only, or comes back as a shell with no
   transcript in it, **stop and ask**. Say what you got and ask the user for
   Fathom's "Copy transcript" output, or the transcript pasted in.
3. Never reconstruct a call from the title, the attendee list or the summary
   alone. A suggestion whose `sourceExcerpt` cannot be quoted from a real
   transcript is a suggestion nobody can check, which is the one thing this
   whole review queue exists to prevent.

## Attribution — required, derived first

Every communication filed from this plugin carries a client. You still do not
*decide* it: you supply evidence, the platform verifies it, and only where that
comes up empty do you ask.

Try to derive it first, in this order:

1. `clientId`, checked against the organization. Pass it only if you actually
   looked the client up (`list_clients`); a uuid you half-remember is worse
   than nothing.
2. `clientName`, matched **exactly** and case-insensitively against the client
   record — which takes its name from the ClickUp folder. "Coastal Spine" will
   not match "Coastal Spine & Pain Institute".
3. participant handles, against the client's `contact_email` and
   `contact_phone`. This is why the handles above have to be clean.

**Where none of the three lands, ask** — the `pick-client` skill lists the
ClickUp folders and resolves the chosen one to a verified `clientId`. The
platform would happily take the communication unattributed and let somebody
sort it out in the queue; filing it that way when the person who had the
conversation is right there answering questions is just deferring a question
that is cheapest to answer now.

What does not change: never invent a client, and never create one from a typed
name. A client is its ClickUp folder, and a practice without one is not a
client yet.

## The owner

Every communication filed from here carries an **owner**: the Macallan person
accountable for what comes of it. It is required, and it is never silently
defaulted.

There is **no owner column** on `communications` or on a suggestion, and no
owner field in the ingest payload. So it travels as a participant:

```json
{ "name": "Sam Okafor", "handle": "sam@macallangroup.com", "role": "owner" }
```

`role` is free text and participants render in the app and are covered by
full-text search, so this is visible and findable rather than buried. It is a
convention, not a constraint — nothing in the database enforces it, which is
exactly why this skill has to.

How to establish it:

- **Exactly one Macallan participant on the thread** — propose them and confirm
  in one line. Do not assume silently.
- **Several, or none** — ask.
- **Never** default to whoever holds the MCP token. The owner is who is
  accountable, not who ran the tool.

The owner is one of the internal participants, so they appear once, with
`role: "owner"` rather than `role: "internal"`. Do not list them twice.

## Keep out of the envelope

Anything that is not what the client said. No internal commentary in the
transcript, no "Claude's analysis" appended to the summary, no scratch notes.
The transcript is retained indefinitely and re-read by later extraction runs;
it must stay a faithful record.
