# One SOW, end to end

SOW `REDEFINEUT-MG.10.26`: *Mountain Orthopaedics & Spine Rebrand and Patient
Growth Program*, for Redefine Health Utah LLC. Signed 8 Oct 2026.

The catalog keys below are the ones the live catalog held when this was
written. **They are illustrative.** A real run copies every key from
`get_service` in that session.

## 1. The outline

| | |
| --- | --- |
| Client entity | Redefine Health Utah LLC |
| Practice | Mountain Orthopaedics & Spine (renamed from Mountain Orthopaedics), Bountiful, Layton and Ogden |
| Project | Mountain Orthopaedics & Spine Rebrand and Patient Growth Program (64 chars, fits) |
| Dates | Effective date left blank; both parties signed 10/8/2026, so `briefDate: 2026-10-08` |
| Phase 1 (Month 1, one-time) | §2.1 brand, §2.2 website, §2.3 print, §2.4 PR, §2.5 marketing onboarding. Two revision rounds per creative deliverable. |
| Phase 2 (Month 2 on) | §3.1 search, §3.2 social, §3.3 ZocDoc, §3.4 tracking and reporting |
| Media budgets (monthly, client-paid) | Google $4,000 · Meta $2,400 · ZocDoc $1,000 |
| Excluded | §4.1 production day ($15,000 + travel, optional) · §4.2 hourly work ($225/h, needs an estimate approved first) |
| Pass-through | Press-release wire package, $2,000 to $5,000, chosen by the client |
| Timeline | Oct: agreement, onboarding and rebrand · Nov: launch · mid-Dec: first results · Jan: ROI review |
| Client responsibilities (§7) | Admin access to Google Ads, Meta, ZocDoc, GBP, website and domain; a staff contact; approvals within 5 business days; surgeons available, and clinical content reviewed; trade-name, payer, credentialing, EOB and signage updates |

`dueDate` is **null**. "November" is a month, not a day.

## 2. Client and owner

`list_clickup_folders` is queried with both "Mountain Orthopaedics" and
"Redefine Health". One folder matches → say which, and use it. Two match, or
none → ask. The owner was not named, so it is asked.

## 5–6. Work items, matched and routed

| # | Item | SOW | Team | How it is staged |
| --- | --- | --- | --- | --- |
| 1 | Logo update: primary and endorsed versions | §2.1 | Creative | `create_task` (creative brief) |
| 2 | Brand standards guide and final logo files | §2.1 | Creative | `create_task` (creative brief) |
| 3 | Website rebrand to the new name and brand | §2.2 | Creative | `create_task` (creative brief); `web.website-scope` fits but is Creative |
| 4 | Build the spine pages on the website | §2.2 | Creative | `create_task` (creative brief) |
| 5 | Stationery templates: business card, letterhead, envelope | §2.3 | Creative | `create_task` (creative brief) |
| 6 | Practice brochure | §2.3 | Creative | `create_task` (creative brief) |
| 7 | Spine services flyer | §2.3 | Creative | `create_task` (creative brief) |
| 8 | Google Ads campaigns: build, then manage | §2.5, §3.1 | Marketing | scope `paid` → `google-search-ads-gbp` |
| 9 | Meta campaigns: build, then manage | §2.5, §3.2 | Marketing | scope `paid` → `meta-facebook-instagram` |
| 10 | Ongoing on-page and technical SEO | §3.1 | Marketing | scope `content` → `copywriting-blog-seo` |
| 11 | Organic social content | §3.2 | Marketing | scope `content` → `organic-social` |
| 12 | Surgeon-led social and ad creative | §3.2 | Marketing | scope `video` → `ad-creative-video` (the ticket's team is Marketing) |
| 13 | Write the 5 to 10 spine pages, optimized for search and AEO | §2.2 | Marketing | `create_task`; sits beside `copywriting-blog-seo`, which item 10 holds |
| 14 | Google Business Profiles and local listings: rename, then local SEO | §2.5, §3.1 | Marketing | `create_task` |
| 15 | AEO (AI search) optimization | §3.1 | Marketing | `create_task` |
| 16 | ZocDoc: build, then manage scheduling and sponsored results | §2.5, §3.3 | Marketing | `create_task` |
| 17 | Announcement press release: write and coordinate distribution | §2.4 | Marketing | `create_task` |
| 18 | Call, missed-call, form and conversion tracking: set up, then run | §2.5, §3.4 | Technology | `create_task`; `ghl.lead-tracking-pipeline` is close, but scoping GHL Space Build brings in three tickets the SOW does not buy |
| 19 | Monthly lead, call and booking report by channel and location | §3.4 | Technology | `create_task`; routing is a guess (the SOW files it under tracking) |
| 20 | Staff training on lead handling and reporting | §2.5 | Operations | `create_task` |

These decisions follow the SOW rules in the skill:

- **Build plus manage is one item** (8, 9, 14, 16, 18). The SOW lists each
  twice, once in setup and once in ongoing services.
- **One ticket absorbs one item.** `copywriting-blog-seo` takes ongoing SEO
  (10), because its questions (monthly volume, keywords) are about recurring
  work. The one-time spine-page writing (13) becomes its own Marketing task
  beside it.
- **A bullet two teams would split is split.** The spine pages are writing (13,
  Marketing) and building (4, Creative).
- **Not items:** the client's trade-name, payer and EOB updates (theirs, under
  §7), the production day and hourly work (optional), and the wire package cost
  (pass-through, recorded as a dependency on 17).

Scope: `paid`, `content`, `video`, plus `blockers`, which is always on.
`video.testimonials-educational-social` comes in with `video` and is not in the
SOW, so it goes on the **skip on the brief screen** list.

## 7. Two descriptions

**Item 1, Creative** (title `Logo update`; ClickUp shows `Creative: Logo update`):

```markdown
**Objective:**
Introduce the Mountain Orthopaedics & Spine name, the new name for the long-established Mountain Orthopaedics brand, reflecting its spine surgery services.

**Specs:**
* Requirements: A primary logo, and a version carrying the endorsement line "a division of Redefine Health Utah" for the website, patient statements and EOBs
* Size: N/A
* Fonts: _Not captured_
* Legal: Endorsement line exactly as written: "a division of Redefine Health Utah"

**Resource:**
* Assets needed: The current Mountain Orthopaedics logo and source files

**Deliverables:**
* Primary and endorsed logo versions, in print and digital formats

**Acceptance:**
* Client approval, within up to two rounds of revisions

**Handoff:** To Creative (brand standards) and Dev (website)
* Package: Final logo files in print and digital formats
```

**Item 16, Marketing** (title `ZocDoc: build, then manage scheduling and sponsored results`):

```markdown
Build the ZocDoc campaigns for Bountiful, Layton and Ogden ready for the November launch, then manage online scheduling and sponsored results monthly.

**Scope (SOW §2.5, §3.3):** ZocDoc campaigns built and ready for launch; management of ZocDoc online scheduling and sponsored results.
**Cadence:** Built in Phase 1, managed monthly from Month 2
**Budget:** $1,000/month media, paid by the client directly to ZocDoc
**Depends on:** Admin access to the practice's ZocDoc account (SOW §7)

> "Booking: Management of ZocDoc online scheduling and sponsored results." (SOW §3.3)
```

## 9. Brief answers

Only what the SOW states:

| Question | Answer |
| --- | --- |
| `paid.google-search-ads-gbp.budget` | $4,000/month (client-paid media) |
| `paid.google-search-ads-gbp.geo` | Bountiful, Layton and Ogden, Utah |
| `paid.google-search-ads-gbp.locs` | 3 |
| `paid.meta-facebook-instagram.budget` | $2,400/month (client-paid media) |
| `paid.meta-facebook-instagram.geo` | Bountiful, Layton and Ogden, Utah |
| `paid.google-search-ads-gbp.cad`, `paid.meta-facebook-instagram.cad` | Monthly (§3.4 reporting is monthly) |
| `blockers.open-items-blockers.items` | the §7 responsibilities, the wire package choice, and that surgeon footage depends on the practice or the optional production day |

Everything else (conversion events, competitors, keyword focus, access status)
is unanswered, and it is reported as a gap.

## 10. What the report leaves open

- Creative gaps: Fonts on 1, Size on 5–7 and others, read from the staged
  descriptions.
- No launch day: the SOW says November.
- Skip on the brief screen: `video.testimonials-educational-social`.
- Not in scope: production day, hourly work.
- The SOW link field on the project, to be set in the app.
