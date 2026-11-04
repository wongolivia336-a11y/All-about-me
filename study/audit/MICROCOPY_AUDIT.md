# Microcopy Audit

## Confirmed changes

- Removed the three hero facts (“AI products”, “Interaction design”, “Human-centred systems”): the role line and intro already communicate these points, and the list pushed the main interaction lower.
- Removed redundant permanent Heartwheel instructions and a second decorative “FOUR DIRECTIONS / 01–04” label. The four theme buttons and four labelled tiles already show the action and count.
- Removed generic internal placeholder copy from Project Detail. The page now displays actual library fields and actual links only.
- Added a plain provenance caption to conceptual artwork so it cannot be mistaken for project UI or results.

## Retained

- “See selected work” is the direct, content-first path for visitors who do not want to explore the wheel.
- “Overview · 4 themes”, the theme names, tile titles and “View all” remain sufficient orientation without instructional badges.
- Project status remains visible; Film shelf continues to read as a prototype.
- Room controls use explicit accessible names even where their visual treatment is iconographic.

## Remaining copy review

The Room’s `src/data/content.ts` includes explicit placeholder content, including “书名占位一 / 二 / 三” and a note that poster images are placeholders. These are honest in code but are not suitable finished portfolio copy. They were not rewritten because the user-provided image package contains no real reading list or poster archive. See [REMAINING-ISSUES.md](REMAINING-ISSUES.md).
