---
name: pick-client
description: Establish which client something belongs to by picking its ClickUp folder, and turn that folder into a verified client id. Use whenever a client has to be identified - before filing a ticket, before filing a communication whose client could not be derived, or when the user names a practice and you need the real record behind it.
---

# Picking the client

**A client is its ClickUp folder.** That is the identity the whole integration
turns on: the push resolves lists through it, attribution reads it, and the
client's name is ClickUp's, never ours.

So there is exactly one way to name a client here — pick a folder. There is no
free-text client anywhere in the app, and there must not be one here. The rule
exists because it was once broken: two paths could mint a client row from typed
text, and a live database ended up holding twelve clients against three
folders, including "asdf", "Test" and "Dummy client". An automated caller is
the one most likely to do that again, at speed.

## The procedure

```
list_clickup_folders               -> every folder in the Macallan Clients space
list_clickup_folders(query: "…")   -> narrow it when a name was already given
```

- **A name was given.** Query the folders and **confirm the match** rather than
  assuming it. "Coastal Spine" may be "Coastal Spine & Pain Institute", and
  there may be two folders that both look right.
- **Several match.** Show them and ask. Never take the first.
- **Exactly one matches, unambiguously.** Say which one you are using; you do
  not need a round trip for an exact hit.
- **Nothing matches.** That practice is not a client yet. Say so, and say the
  fix: **the folder is added in ClickUp first.** Do not create anything, and do
  not fall back to the typed name.
- **No name was given.** List the folders and ask.

A folder with no client record behind it reads exactly like one that has one.
That is deliberate — whether we hold a row is our business, not the user's.

## Turning a folder into a client id

```
create_client({ clickupFolderId })   -> { clientId, name, created }
```

Despite the name it resolves as often as it creates: the same folder twice
updates one record rather than making a second. It **cannot set a name** — the
folder's name in ClickUp is authoritative, always. It can record the details
ClickUp does not know (track, EHR, contacts) if you happen to have them, but
never invent those to fill the call.

Pass the `clientId` it returns. That is a verified attribution rather than a
hint, which is the whole point of having asked.

## Do not work around it

If the user insists on a client with no folder, the answer is still no — say
what is missing and where it is fixed. Creating a client from a name is the
exact failure this rule was written to prevent, and it is not improved by being
asked for politely.
