---
name: creative-brief
description: The fixed brief format every Creative task carries - Objective, Specs, Resource, Deliverables, Acceptance, Handoff - and how to fill it without inventing specifics. Use whenever this plugin writes the title or description of work routed to the Creative team - a suggestion filed by comms or ticket, or a task staged on a project by sow - and whenever asked what a creative brief should contain.
---

# The creative brief

Every piece of work this plugin routes to **Creative** is written in one fixed
format, so that a designer picking it up in ClickUp reads the same six sections
in the same order on every task, for every client. A freeform description is
never acceptable for Creative work, however small the ask.

This applies wherever the plugin writes Creative work:

| Where | What carries the brief |
| --- | --- |
| `comms` | the `description` of a suggestion whose team is Creative |
| `ticket` | the `description` of the one suggestion, when it is Creative's |
| `sow` | the `description` passed to `create_task` for every Creative task |

A *matched* suggestion takes its team from the catalog ticket. If that team is
Creative, the brief format applies to it too.

## The format

Keep the headers exactly as written: bold, with the colon inside the bold.
Fill in the bullets.

```markdown
**Objective:**
[What is it for + the goal — e.g. "Drive signups for [promo], target [X]% conversion, live by [date]"]

**Specs:**
* Requirements: [...]
* Size: [...]
* Fonts: [...]
* Legal: [...]

**Resource:**
* Assets needed: [...]

**Deliverables:**
* [What is expected at the end]

**Acceptance:**
* [What is needed for approval]

**Handoff:** To [dev/ops/etc.]
* Package: [...]
```

**Never drop a section or a bullet.** When a line does not apply to this piece
of work, write `N/A`. When it applies but nobody has said what it is yet, write
`_Not captured_`. That is the app's own marker for a gap (an unanswered brief
question pushes the same way). The two mean different things to the designer:
`N/A` means "ignore this", and `_Not captured_` means "ask before you start".

## Filling it without inventing anything

Fill each line from what the source actually says: the client's words, the
SOW's text, or the user's instruction. A few things you can reasonably infer
from the deliverable itself:

- **Handoff** for something that ends up on the website → `To Dev`; for print
  → `To print vendor` (or `To client` when printing is out of scope); for ad
  creative → `To Marketing`.
- **Deliverables** for a print piece → print-ready PDF plus editable source
  files, when the source says "print-ready".
- **Legal** for a healthcare practice → `Clinical claims reviewed by the
  practice before publication`, when the source says the client reviews
  clinical content (an SOW usually does).

Anything concrete that you cannot know, you must not make up. That covers
conversion targets, exact sizes, fonts, legal wording, quantities, and what
"approved" means for this client. Those lines are `_Not captured_`. A
plausible-looking spec that nobody asked for gets built, and then rebuilt.

**Whether to ask** depends on the skill you are in, and that skill's question
budget wins:

- `comms` and `sow` do **not** ask about creative specifics. They write
  `_Not captured_` and list the gaps in the report, grouped by task, so the
  reviewer can fill them in before pushing.
- `ticket` writes one task for a person who is right there. When more than two
  of Objective, Size or Acceptance would be `_Not captured_`, one round of
  questions is fine: ask them together in a single message, then file.

## The title

The app prefixes every task's title with its team when it pushes to ClickUp.
So a Creative task's ClickUp name is `Creative: <title>` without you adding it.

**Write the title bare**: `Spine services flyer`, not `Creative: Spine
services flyer`. A title written with the prefix lands in ClickUp as
`Creative: Creative: Spine services flyer`.

Beyond that, the usual title rules hold (see `extract-work`): imperative or
noun-phrase, specific, readable on its own in a list of forty, and never a
patient's name.

## Where it lands

The task goes in the **Creative list inside the client's own ClickUp folder**,
because the team decides the list and the client's mapping records which one.
Nothing here picks a list by hand, and nothing is ever filed into a generic or
shared Creative space. If Creative has no list mapped for this client,
`map_team_lists` is the fix (see `ticket` or `sow`).

## Example

A flyer from an SOW line reading "One (1) spine services flyer for patients and
referring providers. Design and print-ready files are included. Printing costs
are not included. Up to two (2) rounds of revisions.":

```markdown
**Objective:**
Introduce the practice's spine surgery services to patients and referring providers under the new Mountain Orthopaedics & Spine brand.

**Specs:**
* Requirements: One flyer, for patients and referring providers; follows the new brand standards
* Size: _Not captured_
* Fonts: Per the new brand guide
* Legal: Clinical content reviewed by the practice before publication

**Resource:**
* Assets needed: Final logo files and brand guide; spine services copy; surgeon and facility imagery if used

**Deliverables:**
* Print-ready file and editable source file

**Acceptance:**
* Client approval, within up to two rounds of revisions

**Handoff:** To client
* Package: Print-ready PDF plus source files (printing is not included)
```

The title is `Spine services flyer`, and the report lists `Size` as a gap.
