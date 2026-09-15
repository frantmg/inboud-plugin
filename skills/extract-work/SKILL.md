---
name: extract-work
description: Read a client transcript, email thread or text conversation and produce the list of work items it implies - one item per unit of work a single team can own, each with a verbatim source excerpt, a title, a description and a confidence. Use during intake after the communication is normalized and before matching to services.
---

# Extracting the work

You are producing **proposals a person will review in a queue**, not a plan.
That changes the calibration in both directions: a suggestion the reviewer
drops costs one click, and a real ask you missed is a promise the client
watched somebody make and nobody kept.

## What counts as a work item

A thing **Macallan** will do, that a **single team** can own end to end, that
somebody could start on.

Include:

- an explicit request — "can you redo the intake form"
- a commitment someone from Macallan made on the call — "we'll get the spine
  campaign live before October"
- a change to something already running — "move the newsletter to fortnightly"
- a blocker Macallan has to chase — "we still need EHR credentials from you"
  is work for whoever chases it

Exclude:

- scheduling and logistics about the meeting itself
- work that was discussed and explicitly deferred or declined
- anything already done and merely reported on
- pricing and contract negotiation, unless it produces a deliverable
- the client's own internal to-dos that nobody at Macallan touches

## One item per unit of work

"Rebuild the site and run ads for the new location" is two items: one Creative,
one Marketing. One ticket becomes one ClickUp task, so an item that two teams
would have to split is an item that will be split later, badly, by somebody
with less context than you have now.

Equally: an ask restated four times across a 45-minute call is **one** item.
Merge, do not count mentions.

A useful sanity check — a 45-minute discovery call usually yields between
three and twelve items. Thirty means you are splitting sub-tasks out of tasks.
One means you skimmed.

## Every item carries the words it came from

`sourceExcerpt` is the client's own words, verbatim, one or two sentences, cut
from the transcript. It is what the reviewer checks the suggestion against, and
it is the difference between a queue somebody trusts and a queue somebody
rubber-stamps.

**If you cannot quote it, you inferred it.** Either drop the item, or keep it
with a low confidence and a description that says plainly what is inferred and
what needs confirming.

## Writing the item

**Title** — imperative, specific, under about 80 characters, and readable on
its own in a list of forty. "Rebuild the practice website on the new brand",
not "Website". No team prefix; the push adds one. No patient names, ever.

**Description** — what was asked, the constraints, the deadline in the words it
was given ("before the October open house"), named assets and people, and
anything the reviewer needs to decide whether this is real. Quote dates and
numbers exactly. Do not paste the transcript back — the transcript is already
attached to the communication.

**Confidence** — a number between 0 and 1, and it should mean something:

| | |
| --- | --- |
| `0.9`–`1.0` | explicit, unambiguous, with a clear owner |
| `0.6`–`0.85` | clearly implied, or explicit but vague on scope |
| `0.3`–`0.55` | inferred; file it, and say in the description what needs confirming |
| below `0.3` | do not file it — mention it to the user instead |

## Ambiguity is filed, not resolved

You are not on the call and you cannot ask. When an ask is real but its scope
is unclear, propose it and put the question in the description: *"They asked
for 'the whole website thing' — scoped here as a rebuild; confirm whether
hosting migration is included."* The reviewer has the context you do not.

What you must never do is smooth it over. A confident-sounding suggestion built
on a guess is the failure mode this queue was designed to catch, and the
cheapest way to produce it is to write the description as if you knew.

## PHI

Client conversations in this system are healthcare conversations. Titles and
descriptions render on screen to the whole organization. Never carry a patient
name, a date of birth, a case detail or a medical record number out of the
transcript and into an item — describe the work, not the patient. The
transcript keeps what was said; the task does not need it.
