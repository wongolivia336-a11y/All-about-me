# Image Relevance Audit

## Decision

**Use the supplied mono-color artwork for representative covers. Do not present it as documentary evidence.** The ZIP README describes conceptual artwork and asks that project pages retain real links and evidence. The illustrations are visually coherent with Four Hearts’ subdued editorial palette, and their subjects match the named projects more closely than the old cover associations.

## Confirmed old associations

Several modern project IDs were displaying page thumbnails from older, unrelated portfolio work: ReMap rehabilitation pages (`thumb-03`, `thumb-04`, `thumb-07`, `thumb-08`) and WeaveCo community pages (`thumb-09`, `thumb-10`). This made the artwork look incomplete or misleading even when the image itself loaded successfully. Film shelf had no public cover.

## New mapping

| Project | New visual | Rationale | Evidence treatment |
|---|---|---|---|
| BioAZ Agent Workbench | Microscope, specimen and lab tools | Research / DMPK workflow metaphor | Marked conceptual; actual prototype and GitHub links remain primary |
| KNOCK KNOCK | Open doorway and light | Presence / invitation metaphor | Marked conceptual; real project link remains |
| 一封侨批，抵达之后 | Tied letters | Correspondence and archive | Marked conceptual; real project link remains |
| meow gallery | Cat on a cushion | Matches cat / pause experiment | Marked conceptual; real project link remains |
| Film shelf / 片单 | Film strip | Matches the personal cinema list | Marked conceptual; prototype status remains visible |
| 镜子的两面 | Two profiles in a mirror | Matches project title and visual inquiry | Marked conceptual; research link remains |
| Healther | Daily-care / health imagery | Matches personal health tool | Marked conceptual; GitHub link remains |

The package’s standalone Four Hearts mark was intentionally not used as a project cover; it would duplicate the functional Heartwheel identity. No project claim, metric, outcome or user quote was inferred from an illustration.

## Browser evidence

All 14 wide/detail PNG paths returned HTTP 200 with non-zero bodies and `image/png`. The selected project detail screenshot confirms the landscape image keeps a 1.6 ratio and displays “Conceptual artwork · not a project screenshot or result.” See `evidence/after-final/navigation-report.json`.
